import { inject } from '@angular/core';
import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, doc, onSnapshot } from '@angular/fire/firestore';
import { User } from '../models/user.class';
import { Channel } from '../models/channel.class';
import { Conversation } from '../models/conversation.class';
import { ChannelMessage } from '../models/channelMessage.class';
import { setDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  firestore: Firestore = inject(Firestore)
 
  allUsers: Array<any> = [];
  
  userChannels: Array<any> = [];
  allChannels: Array<any> = [];
  
  userConversations: Array<any> = [];
  allConversations: Array<any> = [];


  constructor() { 
    
  }

  /*write functions */

  addUser(user: User){
    addDoc(collection(this.firestore, 'users'), user.toJSON());
  }

  addChannel(channel: Channel){
    channel.membersId.forEach(userId => {
      setDoc(doc(this.firestore, 'users/' + userId + '/channels', "CHA-" + channel.createdBy), channel.toJSON());
    });
  }

  addChannelMessage(channel: Channel, channelMessage: ChannelMessage){
    const randomNumber = Math.random()
    channel.membersId.forEach(userId => {
      setDoc(doc(this.firestore, 'users/' + userId + '/channels/' + channelMessage.channelId + '/channelmessage', "CHA-MSG-" + randomNumber), channelMessage.toJSON());
    });
  }


  addConversation(conversationCreator: Conversation, conversationRecipient: Conversation){
    //add converstaion to creator
    setDoc(doc(this.firestore, 'users/' + conversationCreator.createdBy + '/conversations', "CoM-" + conversationCreator.createdBy), conversationCreator.toJSON());

    //add conversation to recipient
    setDoc(doc(this.firestore, 'users/' + conversationCreator.recipientId + '/conversations', "CoM-" + conversationCreator.createdBy), conversationRecipient.toJSON());
  }




  /*read functions */

  loadAllUsers(){
    onSnapshot(collection(this.firestore, 'users'), (users) => {
      users.forEach(user => {
        const userData = user.data();
        userData['id'] = user.id; 
        this.allUsers.push(userData);
      })
    })
  }


  loadUserConversations(userId: string){
    onSnapshot(collection(this.firestore, 'users/' + userId + '/conversations'), (conversations) => {
      conversations.forEach(conversation => {
        const conversationData = conversation.data();
        conversationData['id'] = conversation.id;
        this.userConversations.push(conversationData);
      })
      this.userConversations = [];
    })
  }


  loadAllConversations(){
    onSnapshot(collection(this.firestore,'users'), (users) => {
      users.forEach(user => {
        onSnapshot(collection(this.firestore, 'users/' + user.id + '/conversations'), (conversations) => {
          conversations.forEach(conversation => {
            const conversationData = conversation.data();
            conversationData['id'] = conversation.id;
            this.allConversations.push(conversationData);
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
  



  /*update functions */


  //edit Channel
  //edit Profile
}
