import { inject } from '@angular/core';
import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, doc, onSnapshot } from '@angular/fire/firestore';
import { User } from '../models/user.class';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  firestore: Firestore = inject(Firestore)
  userId: string = 'p1oEblSsradmfVeyvTu3'
  users: any = [];
  userChannels: any = [];
  userConversations: any = [];

  constructor() { 
    
  }

  addUser(user: User){
    addDoc(collection(this.firestore, 'users'), user.toJSON());
  }

  addChannel(){

  }

  addConversation(){

  }


  loadUsers(){
    onSnapshot(collection(this.firestore, 'users'), (list) => {
      list.forEach(user => {
          this.users.push(user.data())
      })
    })
  }
  

  loadChannels(){
    onSnapshot(collection(this.firestore, 'users/' + this.userId + '/channels'), (list) => {
      list.forEach(channels => {
        this.userChannels.push(channels.data())
      })
    })
  }
  

  loadConversations(){
    onSnapshot(collection(this.firestore, 'users/' + this.userId + '/conversations'), (list) => {
      list.forEach(conversations => {
        this.userConversations.push(conversations.data())
        console.log(conversations.id);
      })
    })
  }
}
