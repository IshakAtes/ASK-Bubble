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
  dataBase = inject(DatabaseService);
  userCache: User;
  wrongLogin: boolean = false;
  resetUserPw: any;
  guest: boolean = false;
  guestData: User;
  userToken: string;
  pwCache: string = '';
  private baseUrl = 'http://localhost:4200';

  activeUserChannels: Array<Channel> = [];
  activeUserConversationList: Array<Conversation> = [];
  usersFromActiveUserConversationList: Array<User> = [];
  activeUserOwnConversation: Conversation;
 
  
  activeUserObject: User;
  isWorkspaceDataLoaded: boolean = true;
  deviceWidth: number



  //TODO - hiernach suchen wenns live geht und umgestellt werden soll. 
  //Logged user mail nehmen als activeUserMail nehmen.
  activeUserMail: string = 'simon@dummy.de' //'ishakfeuer@gmail.com'  //'simon.w@gmx.net' //'simon@dummy.de' 




  constructor(private http: HttpClient, private router: Router, public database: DatabaseService) { 
    this.loadActiveUserChannels();    //muss nach dem login aufgerufen werden
    this.loadActiveUserConversations(); //muss nach dem login aufgerufen werden
  }


  changeEmail(currentMail: string, newEmail: string, newName: string, avatar: string | undefined | null): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const usersCollection = collection(this.firestore, 'users');

      onSnapshot(usersCollection, (users) => {
        users.forEach(user => {
          const userData = user.data();
  
          if (userData['email'] === currentMail) {
            const userDocRef = doc(this.firestore, "users", userData['userId']);
            updateDoc(userDocRef, {
              email: newEmail,
              name: newName,
              avatarUrl: avatar
            });
            resolve(userData);
          }
        });
      }, (error) => {
        reject(error);
      });
    });
  }



  changeUserName(newName: string, token: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const usersCollection = collection(this.firestore, 'users');

      onSnapshot(usersCollection, (users) => {
        users.forEach(async user => {
          const userData = user.data();
  
          if (userData['uid'] === token) {
            const userDocRef = doc(this.firestore, "users", userData['userId']);
            await updateDoc(userDocRef, {
              name: newName,
            });
            resolve(newName);
          }
        });
      }, (error) => {
        reject(error);
      });
    });
  }


  changeAvatar(avatar: string | undefined | null, token: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const usersCollection = collection(this.firestore, 'users');

      onSnapshot(usersCollection, (users) => {
        users.forEach(user => {
          const userData = user.data();
  
          if (userData['uid'] === token) {
            const userDocRef = doc(this.firestore, "users", userData['userId']);
            updateDoc(userDocRef, {
              avatarUrl: avatar
            });
            resolve(avatar);
          }
        });
      }, (error) => {
        reject(error);
      });
    });
  }



  createAndSaveUser() {
    this.userCache['uid'] = this.userToken;
    this.addUser(this.userCache);
    setTimeout(() => {
      this.database.getUser(this.userCache.email)
        .then(user =>{
          this.database.addConversation(this.database.createConversation(user.userId, user.userId));
          this.userToken = '';
        })
    }, 1000);
  }


  createAndSaveGuest() {
    this.guestData.uid = this.userToken;
    this.addUser(this.guestData);
    setTimeout(() => {
      this.database.getUser(this.guestData.email)
        .then(user =>{
          this.database.addConversation(this.database.createConversation(user.userId, user.userId));
          this.userToken = '';
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
            status: 'offline',
            avatarUrl: '',
            userId: '',
            uid: null,
          });
          this.userCache = newUser;
          this.pwCache = formValues.pw;
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


  addUser(user: User) {
    addDoc(collection(this.firestore, 'users'), user.toJSON())
    .then((data) => {
      console.log('User erfolgreich hinzugefügt', data);
      this.pushUserId(data.id);
    })
    .catch((error) => console.error('Fehler beim Hinzufügen des Benutzers:', error));
  }


  pushUserId(id: string) {
    const userDocRef = doc(this.firestore, "users", id);
    updateDoc(userDocRef, {
      userId: id
    });
  }


  getUser(email: string, token: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      const usersCollection = collection(this.firestore, 'users');
      this.wrongLogin = true; // Setze standardmäßig auf true, bis ein gültiger Benutzer gefunden wird
  
      onSnapshot(usersCollection, (users) => {
        users.forEach(user => {
          const userData = user.data();
  
          if (userData['email'] === email && userData['uid'] === token) {
            const activeUser = new User({
              email: userData['email'],
              name: userData['name'],
              status: userData['status'],
              avatarUrl: userData['avatarUrl'],
              userId: user.id,
              logIn: userData['logIn'],
              usedLastTwoEmojis: userData['usedLastTwoEmojis'],
              uid: userData['uid']
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


  /**
   * loads all channels for the active user
   */
  loadActiveUserChannels(){
    this.activeUserChannels = [];
    this.isWorkspaceDataLoaded = false;
    this.database.getUser(this.activeUserMail).then(user =>{
      this.activeUserObject = user;
      this.database.loadAllUserChannels(user.userId).then(userChannels => {
        this.activeUserChannels = userChannels
      });
    })
  }


  loadActiveUserConversations() {
    this.isWorkspaceDataLoaded = false;
    this.activeUserConversationList = [];
    this.usersFromActiveUserConversationList = [];
    this.database.getUser(this.activeUserMail).then(user => {
      this.database.loadAllUserConversations(user.userId)
        .then(userConversations => {
          
          const promises = userConversations.map(conversation => {
            this.activeUserConversationList.push(conversation);
            const userPromise = conversation.createdBy === user.userId
              ? this.getUserRecievedBy(conversation)
              : this.getUserCreatedBy(conversation);
  
            return userPromise.then(() => {
              this.checkOwnConversation(this.activeUserConversationList);
            }).then(() => {
              if (conversation.createdBy === this.activeUserObject.userId &&
                  conversation.recipientId === this.activeUserObject.userId) {
                  this.activeUserOwnConversation = conversation;
              }
            });
          });
          return Promise.all(promises);
        })
        .then(() => {
          
          this.database.loadSpecificUserConversation(this.activeUserObject.userId, this.activeUserOwnConversation.conversationId)
            .then((conversation => {
              this.activeUserOwnConversation = conversation
              this.isWorkspaceDataLoaded = true;
            }))
        });
    });
  }


  /**
   * searches the conversation list and looks for the own conversation with the
   * active user
   * @param conversationList conversationlist
   */
  checkOwnConversation(conversationList: Conversation[]){
    conversationList.forEach(conversation => {
      if(conversation.createdBy == this.activeUserObject.userId && conversation.recipientId == this.activeUserObject.userId){
        this.activeUserConversationList.splice(this.activeUserConversationList.indexOf(conversation), 1);
      }
    });
    this.usersFromActiveUserConversationList.forEach(user => {
      if(user.userId == this.activeUserObject.userId){
        this.usersFromActiveUserConversationList.splice(this.usersFromActiveUserConversationList.indexOf(user), 1);
      }
    })
  }
 

  /**
   * loads a user from the database based on the creator
   * of the current conversation
   * @param conversation conversationobject
   * @returns userobject
   */
  getUserCreatedBy(conversation: Conversation): Promise<User>{
    return new Promise<User>((resolve, reject) =>{
      this.database.loadUser(conversation.createdBy)
      .then(loadedUser => {
        this.usersFromActiveUserConversationList.push(loadedUser);
        resolve(loadedUser)
      },
      (error) =>{
        reject(error)
      }
    )
    })
  }


  /**
   * loads a user from the database based on the recipient
   * of the current conversation
   * @param conversation conversationobject
   * @returns userobject
  */
  getUserRecievedBy(conversation: Conversation): Promise<User>{
    return new Promise<User>((resolve, reject) =>{
      this.database.loadUser(conversation.recipientId)
      .then(loadedUser => {
        this.usersFromActiveUserConversationList.push(loadedUser);
        resolve(loadedUser)
      },
      (error) =>{
        reject(error)
      }
    )
    })
  }


  /**
   * gehts the width of the current device
   */
  getDeviceWidth(){
    this.deviceWidth = window.innerWidth;
  }


}