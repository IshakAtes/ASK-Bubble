import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, user } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { getAuth, onAuthStateChanged } from "firebase/auth";
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


  // checkUserStatus() {
  //   onAuthStateChanged(this.firebaseAuth, (user) => {
  //     if (user) {
  //       // User is signed in, see docs for a list of available properties
  //       // https://firebase.google.com/docs/reference/js/auth.user
  //       const uid = user.uid;
  //       // this.us.loggedUser['name'] = user.displayName ? user.displayName : '';
  //       console.log('authState', user);
  //       const activeUser = this.us.getUser(user.email ?? '', user.uid);
  //       console.log(activeUser);
        
  //       console.log(this.us.loggedUser);
  //       // ...
  //     } else {
  //       // User is signed out
  //       console.log('authState logged out', this.us.loggedUser, 'user variable', user);        
  //       // ...
  //     }
  //   });
  // }


  checkUserStatus() {
    onAuthStateChanged(this.firebaseAuth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        console.log('authState', user);
        this.us.getUser(user.email ?? '', user.uid).then((activeUser) => {
          console.log('activeUser:', activeUser);
          this.us.loggedUser = activeUser;
          console.log('loggedUser', this.us.loggedUser);
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