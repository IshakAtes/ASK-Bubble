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


  getUser(email: string, password: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      const activeUser = {} as User;
      const usersCollection = collection(this.firestore, 'users');
      
      onSnapshot(usersCollection, (users) => {
        let userFound = false;
        users.forEach(user => {
          const userData = user.data();
          if (userData['email'] === email && userData['password'] === password) {
            activeUser.email = userData['email'];
            activeUser.name = userData['name'];
            activeUser.password = userData['password'];
            activeUser.status = userData['status'];
            activeUser.avatarUrl = userData['avatarUrl'];
            activeUser.userId = user.id;
            userFound = true;
            resolve(activeUser);
          }
        });
        if (!userFound) {
          reject('Benutzer nicht gefunden oder falsche Anmeldedaten');
        }
      }, (error) => {
        reject(error);
      });
    });
  }


  loadAllUsers(): Promise<Array<any>>{
    return new Promise<Array<any>>((resolve, reject) =>{
      const userList = [] as Array<any>
      onSnapshot(collection(this.firestore, 'users'), (users) => {
        users.forEach(user => {
          const userData = user.data();
          userData['id'] = user.id; 
          userList.push(userData);
          resolve(userList);
        })
        }, (error) => {
          reject(error)
        })
    })
  }
}
