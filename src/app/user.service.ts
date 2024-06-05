import { Injectable, inject } from '@angular/core';
import { User } from '../models/user.class';
import { Firestore, collection, addDoc, updateDoc, doc, onSnapshot } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  firestore: Firestore = inject(Firestore)
  userCache: any;

  constructor() { }

  addUser(user: User){
    addDoc(collection(this.firestore, 'users'), user.toJSON());
  }
}
