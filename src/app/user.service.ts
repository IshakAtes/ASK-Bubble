import { Injectable, inject } from '@angular/core';
import { User } from '../models/user.class';
import { Firestore, collection, addDoc, updateDoc, doc, onSnapshot } from '@angular/fire/firestore';
import { getDocs, query, where } from "firebase/firestore";
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  loggedUser: User;
  firestore: Firestore = inject(Firestore)
  userCache: User;
  wrongLogin: boolean = false;
  resetUserPw: any;
  // mailUser: any;
  private baseUrl = 'http://localhost:4200';


  constructor(private http: HttpClient) { }


  upload(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();

    formData.append('file', file);

    const req = new HttpRequest('POST', `${this.baseUrl}/upload`, formData, {
      responseType: 'json'
    });

    return this.http.request(req);
  }

  getFiles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/files`);
  }

  
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
