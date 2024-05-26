import { inject } from '@angular/core';
import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, doc, onSnapshot } from '@angular/fire/firestore';
import { User } from '../models/user.class';
import { Channel } from '../models/channel.class';
import { Conversation } from '../models/conversation.class';
import { setDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  firestore: Firestore = inject(Firestore)
 
  users: any = [];
  
  userChannels: any = [];
  allChannels: any = [];
  
  userConversations: any = [];
  allConversations: any = [];


  constructor() { 
    
  }

  /*write functions */

  addUser(user: User){
    addDoc(collection(this.firestore, 'users'), user.toJSON());
  }

  addChannel(userId: string, channel: Channel){
    addDoc(collection(this.firestore, 'users/' + userId + '/channels'), channel.toJSON());
  }


  addConversation(createdBy: string, recipientId: string, conversationCreator: Conversation, conversationRecipient: Conversation){
    //add converstaion to creator
    setDoc(doc(this.firestore, 'users/' + createdBy + '/conversations', "CoM-" + createdBy), conversationCreator.toJSON());

    //add conversation to recipient
    setDoc(doc(this.firestore, 'users/' + recipientId + '/conversations', "CoM-" + createdBy), conversationRecipient.toJSON() )
  }


  /*read functions */

  loadAllUsers(){
    onSnapshot(collection(this.firestore, 'users'), (users) => {
      users.forEach(user => {
        const userData = user.data();
        userData['id'] = user.id; 
        this.users.push(userData);
      })
      console.log(this.users);
    })
  }

  loadAllConversations(){
    this.allConversations = [];
    onSnapshot(collection(this.firestore,'users'), (users) => {
      users.forEach(user => {
        onSnapshot(collection(this.firestore, 'users/' + user.id + '/conversations'), (conversations) => {
          conversations.forEach(conversation => {
            console.log('checking user Data from user: ' + user.id)
            const conversationData = conversation.data();
            conversationData['id'] = conversation.id;
            this.allConversations.push(conversationData);
            console.log(this.allConversations);
            //debugger;
          })
        })
      })
    })

  }


  loadAllChannels(){
    onSnapshot(collection(this.firestore,'users'), (users) => {
      users.forEach(user => {
        onSnapshot(collection(this.firestore, 'users/' + user.id + '/channels'), (channels) => {
          channels.forEach(channel => {
            const channelData = channel.data();
            channelData['id'] = channel.id;
            this.allChannels.push(channelData);
          })
        })
      })
    })
    console.log(this.allChannels);
  }
  

  loadUserChannels(userId: string){
    onSnapshot(collection(this.firestore, 'users/' + userId + '/channels'), (channels) => {
      channels.forEach(channel => {
        const channelData = channel.data();
        channelData['id'] = channel.id;
        this.userChannels.push(channelData);
      })
    })
  }
  

  loadUserConversations(userId: string){
    onSnapshot(collection(this.firestore, 'users/' + userId + '/conversations'), (conversations) => {
      conversations.forEach(conversation => {
        const conversationData = conversation.data();
        conversationData['id'] = conversation.id;
        this.userConversations.push(conversationData)
      })
    })
  }

  /*update functions */

}
