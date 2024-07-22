import { Injectable, inject, OnInit, Component } from '@angular/core';
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
import { Auth } from '@angular/fire/auth';
import { AuthService } from './shared-services/auth.service';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  loggedUser: User;
  firestore: Firestore = inject(Firestore)
  userCache: User;
  wrongLogin: boolean = false;
  resetUserPw: any;
  guest: boolean = false;
  guestData: User;
  private baseUrl = 'http://localhost:4200';

  activeUserChannels: Array<Channel> = [];
  activeUserConversationList: Array<Conversation> = [];
  usersFromActiveUserConversationList: Array<User> = [];
  activeUserOwnConversation: Conversation;
  activeUserObject: User;
  isWorkspaceDataLoaded: boolean = true;
  deviceWidth: number



  //TODO - hiernach suchen wenns live geht und umgestellt werden soll
  activeUserMail: string = 'simon@dummy.de' //'ishakfeuer@gmail.com'  //'simon.w@gmx.net' //'simon@dummy.de' 




  constructor(private http: HttpClient, private router: Router, public database: DatabaseService) { 
    this.loadActiveUserChannels();
    this.loadActiveUserConversations();
    //console.log(this.activeUserObject.userId)
    





  }



  createAndSaveUser() {
    console.log('userCache:', this.userCache);
    this.addUser(this.userCache);
    setTimeout(() => {
      this.database.getUser(this.userCache.email)
        .then(user =>{
          this.database.addConversation(this.database.createConversation(user.userId, user.userId))
        })
    }, 1000);
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
            userId: '',
            uid: '',
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
      status: "online"
    });
  }

  addUser(user: User){
    addDoc(collection(this.firestore, 'users'), user.toJSON());
  }


  getUser(email: string, password: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      const usersCollection = collection(this.firestore, 'users');
      this.wrongLogin = true; // Setze standardmäßig auf true, bis ein gültiger Benutzer gefunden wird
  
      onSnapshot(usersCollection, (users) => {
        users.forEach(user => {
          const userData = user.data();
  
          if (userData['email'] === email && userData['password'] === password) {
            const activeUser = new User({
              email: userData['email'],
              name: userData['name'],
              password: userData['password'],
              status: userData['status'],
              avatarUrl: userData['avatarUrl'],
              userId: user.id,
              logIn: userData['logIn'],
              usedLastTwoEmojis: userData['usedLastTwoEmojis']
            });
            this.wrongLogin = false; // Setze auf false, da gültiger Benutzer gefunden wurde
            resolve(activeUser);
          }
        });
        // Wenn nach Durchlauf der Benutzer keine Übereinstimmung gefunden wurde
        if (this.wrongLogin) {
          reject('User not found or wrong credentials');
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
        this.isWorkspaceDataLoaded = true;

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
              this.checkOwnConversation(conversation)
              this.getRecievedConversation(conversation);
              console.log(this.usersFromActiveUserConversationList)
            }else{
              this.checkOwnConversation(conversation)
              this.getCreatedConversation(conversation);
              console.log(this.usersFromActiveUserConversationList)
            }




          /*
          else{
            
            if(conversation.conversationNameCreator == user.userId && conversation.conversationNameRecipient == user.userId){
              this.activeUserOwnConversation = conversation;
              //splice

            }

            console.log('selected as own conversation:', this.activeUserOwnConversation);
            console.log('users from active user conversation list' ,this.usersFromActiveUserConversationList)
          }
          */
        })
        
        /*
        this.activeUserConversationList.forEach(conversation => {
          if(conversation.conversationNameCreator == user.userId && conversation.conversationNameRecipient == user.userId){
              this.activeUserOwnConversation = conversation
              console.log('selected as own conversation:', this.activeUserOwnConversation);

            }
          })
        */
        
        console.log('users from active user conversation list' ,this.usersFromActiveUserConversationList)
        console.log('new activeconversationlist' ,this.activeUserConversationList)
        console.log('selected as own conversation:', this.activeUserOwnConversation);

        
      });
    })
    this.isWorkspaceDataLoaded = true;


  }


  checkOwnConversation(conversation: Conversation){
    let conversationObject = new Conversation(conversation)
    
    if(conversation.createdBy == this.activeUserObject.userId && conversation.recipientId == this.activeUserObject.userId){
      //debugger TODO;
      this.activeUserOwnConversation = conversation
      this.activeUserConversationList.splice(this.activeUserConversationList.indexOf(conversation), 1);


    }
  }

  getCreatedConversation(conversation: Conversation){
    this.database.loadUser(conversation.createdBy)
    .then(loadedUser => {
      console.log('pushed by createdConvo', loadedUser)
      this.usersFromActiveUserConversationList.push(loadedUser);
    })
  }


  getRecievedConversation(conversation: Conversation){
    this.database.loadUser(conversation.recipientId)
    .then(loadedUser => {
      console.log('pushed by recieved', loadedUser)
      this.usersFromActiveUserConversationList.push(loadedUser);
    })
  }


  getDeviceWidth(){
    this.deviceWidth = window.innerWidth;
    console.log(this.deviceWidth);
  }


}



