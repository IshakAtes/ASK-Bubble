import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateEmail, updatePassword, user, updateProfile, sendEmailVerification } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { EmailAuthProvider, getAuth, onAuthStateChanged, UserCredential, reauthenticateWithCredential } from "firebase/auth";
import { UserService } from '../user.service';
import { User } from '../../models/user.class';
import { signInWithRedirect, getRedirectResult, signInWithPopup, GoogleAuthProvider } from "firebase/auth";



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  firebaseAuth = inject(Auth);
  us = inject(UserService);
  errorMessage: string | null = null;
  provider = new GoogleAuthProvider();
  

  constructor() {}

  async changeUserData(avatar: string | null | undefined, name: string, email: string, currentPassword: string | null) {
    const auth = this.firebaseAuth;
    const fbUser = auth.currentUser;

    if (fbUser) {
      console.log('currentUser', fbUser);
      try {
        // this.sendVerificationEmail(email);
        // Update email
        if (email !== fbUser.email) {
          await updateEmail(fbUser, email);
          await sendEmailVerification(fbUser);
          console.log('Verification email sent to', email, currentPassword);
        }
        // Update profile
        await updateProfile(fbUser, {
          displayName: name,
          photoURL: avatar ?? '../../assets/img/unUsedDefault.png'
        }).then(() => {
          // Profile updated!
          console.log('Profile updated!', fbUser);
          // Update local user object
          // Update local user object
          // let updatedUser: User = this.us.loggedUser;
          // updatedUser.name = name,
          // updatedUser.email = email,
          // updatedUser.avatarUrl =  avatar ?? '../../assets/img/unUsedDefault.png';
          // this.us.loggedUser = updatedUser;
          // console.log('Successfully updated user', this.us.loggedUser);
        }).catch((error) => {
          console.error('Error updating profile:', error);
          this.errorMessage = error.message;
        });
      } catch (error: any) {
        console.error('Error updating user:', error);
        this.errorMessage = error.message;
      }
    }
  }


  // async sendVerificationEmail(newEmail: string) {
  //   const auth = this.firebaseAuth;
  //   const currentUser = auth.currentUser;

  //   if (currentUser) {
  //     try {
  //       await updateEmail(currentUser, newEmail);
  //       await sendEmailVerification(currentUser);
  //       console.log('Verification email sent to', newEmail);
  //     } catch (error: any) {
  //       console.error('Error sending verification email:', error);
  //       this.errorMessage = error.message;
  //     }
  //   }
  // }
  

  async googleAuth() {
    console.log('google Provider', this.provider);
    this.provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    // const auth = getAuth();
    await signInWithRedirect(this.firebaseAuth, this.provider);
    await this.getToken();
  }

  getToken() {
    // const auth = getAuth();
    getRedirectResult(this.firebaseAuth)
      .then((result: any) => {
        // This gives you a Google Access Token. You can use it to access Google APIs.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        console.log('getToken', token);
        
        // The signed-in user info.
        const user = result.user;
        console.log('get GoogleUser', user);
        
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email; 
        console.log('erorr Detect', errorCode, errorMessage, email);
        
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  }
   

  register(email: string, username: string, password: string): Observable <void> {
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password
    ).then(response => updateProfile(response.user, {displayName: username}).then(() => {
        // this.us.userCache['uid'] = response.user.uid;
        this.us.userToken = response.user.uid;
        if (this.us.guest) {
          this.us.createAndSaveGuest();
        }
      })
    );
    return from(promise);
  }


  async authRegistration() {
    await this.register(this.us.userCache.email, this.us.userCache.name, this.us.pwCache)
      .subscribe({
        next: () => {
          this.us.pwCache = '';
          this.us.createAndSaveUser()
      },
      error: (err) => {
        this.errorMessage = err.code;
        console.log(this.errorMessage);
      },
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
    const promise = signOut(this.firebaseAuth);
    return from(promise);
  }



  checkUserStatus() {
    onAuthStateChanged(this.firebaseAuth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        this.us.getUser(user.email ?? '', user.uid).then((activeUser) => {
          console.log('activeUser:', activeUser);
          this.us.loggedUser = activeUser;
          // console.log('loggedUser', this.us.loggedUser);
        }).catch((error) => {
          console.error('Fehler beim Abrufen des Benutzers:', error);
        });
  
        // ...
      } else {
        // User is signed out
        console.log('authState logged out', this.us.loggedUser, 'user variable', user);
        // ...
      }
    });
  }
  


}