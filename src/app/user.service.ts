import { Injectable, inject } from '@angular/core';
import { User } from '../models/user.class';
import { Firestore, collection, addDoc, updateDoc, doc, onSnapshot } from '@angular/fire/firestore';
import { getDocs, query, where } from "firebase/firestore";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  loggedUser: User;
  firestore: Firestore = inject(Firestore)
  userCache: any;
  wrongLogin: boolean;
  // mailUser: any;

  activeUser: User;

  constructor() { }


  // findUser(email: string) {
  //   const q = query(collection(this.firestore, "users"), where("email", "==", email));
  //   const unsubscribe = onSnapshot(q, (querySnapshot) => {
  //     querySnapshot.forEach((doc) => {
  //       console.log('leer', querySnapshot.empty);
  //       if (doc == undefined) {
  //         console.log('undefined ist gut');
  //       } else {
  //         // users.push(doc.data().name);
  //         console.log('doc', doc.data());
  //       }
  //     });
  //   });
  // }

  async checkEmail(email: string): Promise<void> {
    try {
      const q = query(collection(this.firestore, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('Kein User mit der angegebenen E-Mail-Adresse gefunden');
      } else {
        querySnapshot.forEach((doc) => {
          console.log('E-Mail gefunden:', doc.data()['email']);
        });
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Dokumente:', error);
    }
  }


  userOnline(id: string) {
    const userDocRef = doc(this.firestore, "users", id);
    updateDoc(userDocRef, {
      status: "Online"
    });
  }

  addUser(user: User){
    addDoc(collection(this.firestore, 'users'), user.toJSON());
  }

  
  getUser(email: string, password: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      const activeUser = {} as User;
      const usersCollection = collection(this.firestore, 'users');
      this.wrongLogin = false;
      
      onSnapshot(usersCollection, (users) => {
        users.forEach(user => {
          const userData = user.data();
          if (userData['email'] === email && userData['password'] === password) {
            activeUser.email = userData['email'];
            activeUser.name = userData['name'];
            activeUser.password = userData['password'];
            activeUser.status = userData['status'];
            activeUser.avatarUrl = userData['avatarUrl'];
            activeUser.userId = user.id;
            resolve(activeUser);
          }
          else if(userData['email'] !== email || userData['password'] !== password) {
            this.wrongLogin = true;
          }
        });
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
