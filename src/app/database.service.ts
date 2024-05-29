import { inject } from '@angular/core';
import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, doc, onSnapshot } from '@angular/fire/firestore';
import { User } from '../models/user.class';
import { Channel } from '../models/channel.class';
import { Conversation } from '../models/conversation.class';
import { ChannelMessage } from '../models/channelMessage.class';
import { Reaction } from '../models/reactions.class';
import { ConversationMessage } from '../models/conversationMessage.class';
import { setDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  firestore: Firestore = inject(Firestore)
 

  allUsers: Array<any> = [];
  
  allChannels: Array<any> = [];
  userChannels: Array<any> = [];
  specificUserChannel: Array<any> = [];
  
  allConversations: Array<any> = [];
  userConversations: Array<any> = [];
  specificUserConversation: Array<any> = [];
  
  allChannelMessages: Array<any> = [];
  channelMessages: Array<any> = [];
  specificChannelMessage: Array<any> = [];


  constructor() { 
    
  }

  /*write functions */

  addUser(user: User){
    addDoc(collection(this.firestore, 'users'), user.toJSON());
  }


  addChannel(channel: Channel){
    channel.membersId.forEach(userId => {
      setDoc(doc(this.firestore, 'users/' + userId + '/channels', channel.channelId), channel.toJSON());
    });
    
  }

  addChannelMessage(channel: Channel, channelMessage: ChannelMessage){
    channel.membersId.forEach(userId => {
      setDoc(doc(this.firestore, 'users/' + userId + '/channels/' + channel.channelId + '/channelmessages', channelMessage.messageId), channelMessage.toJSON());
    });
  }


  addChannelMessageReaction(channel: Channel, channelMessage: ChannelMessage, reaction: Reaction){
    channel.membersId.forEach(userId => {
      setDoc(doc(this.firestore, 'users/' + userId + '/channels/' 
      + channelMessage.channelId + '/channelmessages/' + channelMessage.messageId + '/reactions', reaction.reactionId), reaction.toJSON());
    });
  }


  addConversation(conversationCreator: Conversation, conversationRecipient: Conversation){
    //add converstaion to creator
    setDoc(doc(this.firestore, 'users/' + conversationCreator.createdBy + '/conversations', "CONV-" + conversationCreator.createdBy), conversationCreator.toJSON());

    //add conversation to recipient
    setDoc(doc(this.firestore, 'users/' + conversationCreator.recipientId + '/conversations', "CONV-" + conversationCreator.createdBy), conversationRecipient.toJSON());
  }


  addConversationMessage(conversation: Conversation, conversationMessage: ConversationMessage){
    const randomNumber = Math.random()
    //add Message to creator
    setDoc(doc(this.firestore, 'users/' + conversation.createdBy + '/conversations/' + conversationMessage.conversationId + '/conversationmessages', "CONV-MSG-" + randomNumber), conversationMessage.toJSON());
    //add Message to recipient
    setDoc(doc(this.firestore, 'users/' + conversation.recipientId + '/conversations/' + conversationMessage.conversationId + '/conversationmessages', "CONV-MSG-" + randomNumber), conversationMessage.toJSON());
  }


  /*
  addConversationMessageReaction(channel: Channel, channelMessage: ChannelMessage, reaction: Reaction){
    const randomNumber = Math.random()
    channel.membersId.forEach(userId => {
      setDoc(doc(this.firestore, 'users/' + userId + '/channels/' 
      + channelMessage.channelId + '/channelmessages/' + reaction.messageId + '/reactions', "CHA-REACT-" + randomNumber), reaction.toJSON());
    });
  }
  */


  /*read functions */

  getUserId(){
    
  }


  getChannelId(){
    
  }


  getMessageId(){
    
  }


  loadAllUsers(){
    onSnapshot(collection(this.firestore, 'users'), (users) => {
      users.forEach(user => {
        const userData = user.data();
        userData['id'] = user.id; 
        this.allUsers.push(userData);
      })
    })
  }


  loadSpecificUser(){

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


  loadUserConversations(userId: string){
    onSnapshot(collection(this.firestore, 'users/' + userId + '/conversations'), (conversations) => {
      conversations.forEach(conversation => {
        const conversationData = conversation.data();
        conversationData['id'] = conversation.id;
        this.userConversations.push(conversationData);
      })
    })
  }


  loadSpecificUserConversation(userId: string, conversationId: string){
    onSnapshot(collection(this.firestore, 'users/' + userId + '/conversations'), (conversations) => {
      conversations.forEach(conversation => {
        if(conversation.id == conversationId){
          const specificConversationData = conversation.data();
          specificConversationData['id'] = conversation.id;
          this.specificUserConversation.push(specificConversationData);
        }
      })
    })
    return this.specificUserConversation;
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
  

  loadAllUserChannels(userId: string){
    onSnapshot(collection(this.firestore, 'users/' + userId + '/channels'), (channels) => {
      channels.forEach(channel => {
        const channelData = channel.data();
        channelData['id'] = channel.id;
        this.userChannels.push(channelData);
      })
    })
  }


  loadSpecificUserChannel(userId: string, channelId: string){
    onSnapshot(collection(this.firestore, 'users/' + userId + '/channels/'), (channels) => {
      channels.forEach(channel => {
        if(channel.id == channelId){
          const channelData = channel.data();
          channelData['id'] = channel.id;
          this.specificUserChannel.push(channelData);
        }
      })
    })
  }


  loadAllChannelMessages(){
    onSnapshot(collection(this.firestore,'users'), (users) => {
      users.forEach(user => {
        onSnapshot(collection(this.firestore, 'users/' + user.id + '/channels'), (channels) => {
          channels.forEach(channel => {
            onSnapshot(collection(this.firestore, 'users/' + user.id + '/channels/' + channel.id + '/channelmessages'), (messages) => {
              messages.forEach(message => {
                const messageData = message.data();
                messageData['id'] = message.id;
                this.allChannelMessages.push(messageData);
              })
            })
          })
        })
      })
    })
  }


  loadChannelMessages(userId: string, channelId: string){
    onSnapshot(collection(this.firestore, 'users/' + userId + '/channels/' + channelId + '/channelmessages'), (messages) => {
      messages.forEach(message => {
          const channelMessagesData = message.data();
          channelMessagesData['id'] = message.id;
          this.channelMessages.push(channelMessagesData);
      })
    })
  }


  async loadSpecificChannelMessage(userId: string, channelId: string, messageId: string): Promise<ChannelMessage> {
    return new Promise<ChannelMessage>((resolve, reject) =>{
      const specificMessage = {} as ChannelMessage
      onSnapshot(collection(this.firestore, 'users/' + userId + '/channels/' + channelId + '/channelmessages'), (messages) => {
        messages.forEach(message => {
          if(message.id == messageId){
              const messageData = message.data()
              specificMessage.channelId = messageData['channelId'];
              specificMessage.content = messageData['content'];
              specificMessage.createdAt = messageData['createdAt'];
              specificMessage.createdBy = messageData['createdBy'];
              specificMessage.fileUrl = messageData['fileUrl'];
              specificMessage.threadId = messageData['threadId'];
              specificMessage.messageId = messageData['messageId'];
              resolve(specificMessage);
            }
          });
        }, (error) => {
          reject(error);
        });
    });
   }


 





    

}
