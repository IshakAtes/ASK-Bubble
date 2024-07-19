import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, user } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { UserService } from '../user.service';
import { User } from '../../models/user.class';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  firebaseAuth = inject(Auth);
  us = inject(UserService)
  user$ = user(this.firebaseAuth);
  activeUser$ = new User();

  constructor() { }


  register(email: string, username: string, password: string): Observable <void> {
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password
    ).then(response => updateProfile(response.user, {displayName: username}),
    );
    this.activeUser$ = this.us.loggedUser;
    return from(promise);
  }


  login(email: string, password: string,): Observable <void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password
    ).then(() => {});
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
        // this.us.loggedUser
        console.log('authState uid', uid);
        
        // ...
      } else {
        // User is signed out
        console.log('authState logged out', this.activeUser$);
        
        // ...
      }
    });
  }

}
