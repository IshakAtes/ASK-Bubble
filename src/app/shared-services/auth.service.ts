import { Injectable, inject, signal } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateEmail, updatePassword, user, updateProfile, sendEmailVerification } from '@angular/fire/auth';
import { catchError, EMPTY, from, Observable, tap } from 'rxjs';
import { EmailAuthProvider, getAuth, onAuthStateChanged, UserCredential, reauthenticateWithCredential, AuthProvider, getAdditionalUserInfo } from "firebase/auth";
import { UserService } from '../user.service';
import { User } from '../../models/user.class';
import { signInWithRedirect, getRedirectResult, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Router } from '@angular/router';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  firebaseAuth = inject(Auth);
  us = inject(UserService);
  errorMessage: string | null = null;
  activeUser? = user(this.firebaseAuth);
  currentUserSignal = signal<User | null | undefined>(undefined);
  wrongEmail = false;
  infos: any ;
  

  constructor(private router: Router) {
    // console.log('googleInfos', this.infos);
    // console.log('observ', this.activeUser);
  }


  async changeUserData(email: string, newEmail: string, currentPassword: string | null, name: string, avatar: string | undefined | null) {
    const auth = this.firebaseAuth;
    const fbUser = auth.currentUser;
//Ist currentUser ein vordefinierter Wert?
      try {
        if (fbUser) {
          // console.log('currentUser', fbUser);
          if (newEmail !== fbUser.email && currentPassword) {
            try {
              // Reauthenticate the user with the current email and password
              const credential = EmailAuthProvider.credential(email, currentPassword ?? '');
              // console.log(credential);
              await reauthenticateWithCredential(fbUser, credential);
              await updateEmail(fbUser, newEmail);
              await sendEmailVerification(fbUser);
              await this.us.changeEmail(email, newEmail, name, avatar)
              // console.log('Verification email sent to', newEmail);
            } catch (error) {
              this.wrongEmail = true;
              // console.error('Error during reauthentication:', error);
            }
          }

          if (name !== fbUser.displayName) {
            await updateProfile(fbUser, { displayName: name });
            await this.us.changeUserName(name, fbUser.uid);
          }
          if (avatar !== fbUser.photoURL) {
            await this.us.changeAvatar(avatar, fbUser.uid);
          }
      } else {
        // console.error('Current user or password is null');
      }
      } catch (error: any) {
        // console.error('Error updating user:', error);
        this.errorMessage = error.message;
      }
  }


  async googleAuth() {
    const provider = new GoogleAuthProvider();
    // console.log('google Provider', provider);
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    await this.getToken(provider);
  }

  getToken(provider: any) {
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential: any = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        this.infos = result;
        // IdP data available using getAdditionalUserInfo(result)
        // console.log(user, token, getAdditionalUserInfo(result));
        this.handleUserAfterGoogleLogin(user);
      }).catch((error) => {
        // console.log(error);
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
      });
  }

  async handleUserAfterGoogleLogin(user: any) {
    // Check if user already exists in Firestore
    const userDoc = await this.us.getUserAfterGoogleAuth(user.email!, user.uid);

    if (!userDoc) {
        // Create new user object
        this.us.userCache = new User();
        this.us.userCache.email = user.email;
        this.us.userCache.name = user.displayName;
        this.us.userCache.avatarUrl = user.photoURL;
        this.us.userToken = user.uid
        // Save user object to Firestore
        this.us.createAndSaveUser();
        const getUserAgain = await this.us.getUserAfterGoogleAuth(user.email!, user.uid);
        this.logGoogleUser(this.us.userCache);
        // console.log('New user created in Firestore:', this.us.userCache);
    } else {
        // console.log('User already exists in Firestore:', userDoc);
        this.logGoogleUser(userDoc);
    }
}


logGoogleUser(acceptedUser: User) {
  try {
    this.us.loggedUser = acceptedUser;
    this.us.loadActiveUserChannels();
    this.us.loadActiveUserConversations();
    this.us.userOnline(this.us.loggedUser.userId);
    this.router.navigate(['/main']);
    this.us.guest = false;
    this.us.userToken = '';
  } catch (error) {
    console.error('Fehler beim Abrufen des Benutzers:', error);
  }
}


register(email: string, username: string, password: string): Observable<void> {
  const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
    .then(response => {
      return updateProfile(response.user, {
        displayName: username,
        photoURL: this.us.userCache.avatarUrl
      }).then(() => {
        this.us.userToken = response.user.uid;
        if (this.us.guest) {
          this.us.createAndSaveGuest();
        }
      });
    })
    .catch((error) => {
      console.error('Error during registration:', error);  // Loggen des Fehlers
      throw error;  // Fehler weiterleiten, um ihn in subscribe() abzufangen
    });

  return from(promise);
}

authRegistration() {
  this.register(this.us.userCache.email, this.us.userCache.name, this.us.pwCache)
    .subscribe({
      next: () => {
        this.us.pwCache = '';
        this.us.createAndSaveUser();
      },
      error: (err) => {
        console.error('Error during registration:', err);
        this.errorMessage = err.code;
      }
    });
}


  login(email: string, password: string,): Observable <void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password
    ).then((response) => {
      this.us.userToken = response.user.uid;
    });
    return from(promise);
  }

  logout(): Observable<void> {
    if(this.us.loggedUser){
      this.us.loggedUser.status = 'offline';
      this.us.userOffline(this.us.loggedUser.userId);
      const promise = signOut(this.firebaseAuth);
      return from(promise);
    }
    const promise = signOut(this.firebaseAuth);
    return from(promise);
  }

  redirectToLogin() {
    //this.us.loggedUser = new User();
    this.router.navigateByUrl('');
  }



  checkUserStatus(): boolean {
    onAuthStateChanged(this.firebaseAuth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        this.us.getUser(user.email ?? '', user.uid).then((activeUser) => {
          // console.log('activeUser:', activeUser);
          this.us.loggedUser = activeUser;
          this.us.activeUserObject = activeUser;
          return true;
        }).catch((error) => {
          // console.error('Fehler beim Abrufen des Benutzers:', error);
          this.redirectToLogin();
          return false
        });
        return false;
      } else {
        // this.logout();
        this.redirectToLogin();
        return false;
        // console.log('authState logged out', this.us.loggedUser, 'user variable', user);
      }
    });
    return false;
  }


}