import { Injectable, inject, OnInit } from '@angular/core';
import { User } from '../models/user.class';
import { Firestore, collection, addDoc, updateDoc, doc, onSnapshot } from '@angular/fire/firestore';
import { getDocs, query, where } from "firebase/firestore";
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Channel } from '../models/channel.class';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseService } from './database.service';
import { Conversation } from '../models/conversation.class';

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

  activeUserChannels: Array<Channel> = [];
  activeUserConversationList: Array<Conversation> = [];
  usersFromActiveUserConversationList: Array<User> = [];
  activeUserObject: User;
  isWorkspaceDataLoaded: boolean = true;
  deviceWidth: number

  //TODO - hiernach suchen wenns live geht und umgestellt werden soll
  activeUserMail: string = 'simon@dummy.de' 




  constructor(private http: HttpClient, private router: Router, public database: DatabaseService) { 
    this.loadActiveUserChannels();
    this.loadActiveUserConversations();
  }




  
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

  
  async checkEmail(email: string, myForm: FormGroup): Promise<void> {
    try {
      const q = query(collection(this.firestore, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty && myForm.valid) {
          const formValues = myForm.value;
          const newUser = new User({
            email: formValues.mail,
            name: formValues.name,
            password: formValues.pw,
            status: 'offline',
            avatarUrl: '',
            userId: ''
          });
          this.userCache = newUser;
          this.router.navigate(['/choosingAvatar']);
      } else {
        querySnapshot.forEach((doc) => {
          alert('Die angegebene email adresse, existiert bereits')
        });
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Dokumente:', error);
    }
  }


  changePassword(id: string, pw: string) {
    const userDocRef = doc(this.firestore, "users", id);
    updateDoc(userDocRef, {
      password: pw
    });
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




  loadActiveUserChannels(){
    this.activeUserChannels = [];
    this.isWorkspaceDataLoaded = false;
    console.log('loadActiveUserChannels triggered')
    this.database.getUser(this.activeUserMail).then(user =>{
      this.activeUserObject = user;
      this.database.loadAllUserChannels(user.userId).then(userChannels => {
        console.log('user Channels after load');
        console.log(userChannels);
        this.activeUserChannels = userChannels
      });
    })
  }


  loadActiveUserConversations(){
    this.isWorkspaceDataLoaded = false;
    this.activeUserConversationList = [];
    this.usersFromActiveUserConversationList = [];
    this.database.getUser(this.activeUserMail).then(user =>{
      this.database.loadAllUserConversations(user.userId)
      .then(userConversations => {
        this.activeUserConversationList = userConversations;
        userConversations.forEach(conversation =>{
          if(conversation.createdBy == user.userId){
            this.getRecievedConversation(conversation);
            console.log(this.usersFromActiveUserConversationList)
          }else{
            this.getCreatedConversation(conversation);
            console.log(this.usersFromActiveUserConversationList)
          }
        })
        this.isWorkspaceDataLoaded = true;
      });
    })
  }


  getCreatedConversation(conversation: Conversation){
    this.database.loadUser(conversation.createdBy)
    .then(loadedUser => {
      this.usersFromActiveUserConversationList.push(loadedUser);
    })
  }


  getRecievedConversation(conversation: Conversation){
    this.database.loadUser(conversation.recipientId)
    .then(loadedUser => {
      this.usersFromActiveUserConversationList.push(loadedUser);
    })
  }

  getDeviceWidth(){
    this.deviceWidth = window.innerWidth;
    console.log(this.deviceWidth);
  }


}



