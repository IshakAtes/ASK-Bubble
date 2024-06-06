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
  
  
  constructor() { 
    
  }

  /*create object Functions */

  createUser(email: string, name: string, password: string, status: string, avatarUrl: string): User{
    const user = {} as User
    user.email = email
    user.name = name;
    user.password = password;
    user.status = status;
    user.avatarUrl = avatarUrl;
    user.userId = '';
    return user
  }


  createChannel(createdBy: string, description: string, membersId: Array<string>, channelName: string): Channel{
    let channel = {} as Channel
    channel.createdAt = new Date();
    channel.createdBy = createdBy;
    channel.description = description;
    channel.membersId = membersId;
    channel.name = channelName;
    channel.channelId = 'CHA-' + createdBy;
    return channel
  }


  createChannelMessage(channel: Channel, content: string, createdBy: string, fileUrl?: string, threadId?: string): ChannelMessage{
    let channelMessage = {} as ChannelMessage
    const randomNumber = Math.random()
    channelMessage.channelId = channel.channelId;
    channelMessage.content = content;
    channelMessage.createdAt = new Date();
    channelMessage.createdBy = createdBy;
    channelMessage.fileUrl = fileUrl ? fileUrl : '';
    channelMessage.threadId = threadId ? threadId: '';
    channelMessage.messageId = 'CHA-MSG-' + randomNumber
    return channelMessage
  }


  createChannelMessageReaction(emoji: string, userId: string, channelMessage: ChannelMessage): Reaction{
    let reaction = {} as Reaction;
    const randomNumber = Math.random()
    reaction.emoji = emoji;
    reaction.userId = userId;
    reaction.messageId = channelMessage.messageId;
    reaction.reactionId = 'CHA-MSG-REACT-' + randomNumber;
    return reaction
  }

  createConversationCreator(createdBy: string, recipientId: string): Conversation{
    const conversationCreator = {} as Conversation;
    conversationCreator.conversationId = 'CONV-' + createdBy;
    conversationCreator.conversationName = 'Conversation with ' + recipientId;
    conversationCreator.createdBy = createdBy;
    conversationCreator.fileUrl = 'null';
    conversationCreator.recipientId = recipientId;
    return conversationCreator;
  }

  createConversationRecipient(createdBy: string, recipientId: string): Conversation{
    const conversationRecipient = {} as Conversation
    conversationRecipient.conversationId = 'CONV-' + createdBy;
    conversationRecipient.conversationName = 'Conversation with ' + createdBy;
    conversationRecipient.createdBy = createdBy;
    conversationRecipient.fileUrl = 'null';
    conversationRecipient.recipientId = recipientId;
    return conversationRecipient;
  }


  createConversationMessage(conversation: Conversation, content: string, createdBy: string, fileUrl?: string, threadId?: string): ConversationMessage{
    let conversationMessage = {} as ConversationMessage;
    const randomNumber = Math.random();
    conversationMessage.conversationId = conversation.conversationId;
    conversationMessage.content = content;
    conversationMessage.createdAt = new Date();
    conversationMessage.createdBy = createdBy;
    conversationMessage.fileUrl = fileUrl ? fileUrl : '';
    conversationMessage.threadId = threadId ? threadId: '';
    conversationMessage.messageId = 'CONV-MSG-' +  randomNumber
    return conversationMessage
  }


  createConversationMessageReaction(emoji: string, userId: string, conversationMessage: ConversationMessage): Reaction{
    let reaction = {} as Reaction;
    const randomNumber = Math.random();
    reaction.emoji = emoji;
    reaction.userId = userId;
    reaction.messageId = conversationMessage.messageId;
    reaction.reactionId = 'CONV-MSG-REACT-' + randomNumber;
    return reaction
  }

  /*create database entry functions */


  addUser(user: User){
    addDoc(collection(this.firestore, 'users'), user.toJSON());
  }


  addChannel(channel: Channel){
    channel.membersId.forEach(userId => {
      setDoc(doc(this.firestore, 'users/' + userId + '/channels', channel.channelId), channel);
    });
  }


  addChannelMessage(channel: Channel, channelMessage: ChannelMessage){
    channel.membersId.forEach(userId => {
      setDoc(doc(this.firestore, 'users/' + userId + '/channels/' + channel.channelId + '/channelmessages', channelMessage.messageId), channelMessage);
    });
  }


  addChannelMessageThread(channel: Channel, channelMessage: ChannelMessage, ){

  }


  addChannelMessageReaction(channel: Channel, channelMessage: ChannelMessage, reaction: Reaction){
    channel.membersId.forEach(userId => {
      setDoc(doc(this.firestore, 'users/' + userId + '/channels/' 
      + channel.channelId + '/channelmessages/' + channelMessage.messageId + '/reactions', reaction.reactionId), reaction);
    });
  }


  addConversation(conversationCreator: Conversation, conversationRecipient: Conversation){
    //add converstaion to creator
    setDoc(doc(this.firestore, 'users/' + conversationCreator.createdBy + '/conversations', conversationCreator.conversationId), conversationCreator.toJSON());
    //add conversation to recipient
    setDoc(doc(this.firestore, 'users/' + conversationCreator.recipientId + '/conversations', conversationCreator.conversationId), conversationRecipient.toJSON());
  }


  addConversationMessage(conversation: Conversation, conversationMessage: ConversationMessage){
    //add Message to creator
    setDoc(doc(this.firestore, 'users/' + conversation.createdBy + '/conversations/' + conversationMessage.conversationId + '/conversationmessages', conversationMessage.messageId), conversationMessage.toJSON());
    //add Message to recipient
    setDoc(doc(this.firestore, 'users/' + conversation.recipientId + '/conversations/' + conversationMessage.conversationId + '/conversationmessages', conversationMessage.messageId), conversationMessage.toJSON());
  }


  
  addConversationMessageThread(){
    
  }


  addConversationMessageReaction(conversation: Conversation, conversationMessage: ConversationMessage, reaction: Reaction){
    //add reaction to creator message
    setDoc(doc(this.firestore, 'users/' + conversation.createdBy + '/conversations/' 
    + conversation.conversationId + '/conversationmessages/' + conversationMessage.messageId + '/reactions', reaction.reactionId), reaction.toJSON());
    //add reaction to recipient message
    setDoc(doc(this.firestore, 'users/' + conversation.recipientId + '/conversations/' 
    + conversation.conversationId + '/conversationmessages/' + conversationMessage.messageId + '/reactions', reaction.reactionId), reaction.toJSON());
  }


  /*read functions */
  getUser(email: string): Promise<User>{
    return new Promise<User>((resolve, reject) =>{
      const activeUser = {} as User;
      onSnapshot(collection(this.firestore, 'users'), (users) => {
        users.forEach(user => {
          const userData = user.data();
          if(userData['email'] == email){
            activeUser.email = userData['email'] 
            activeUser.name = userData['name']
            activeUser.password = userData['password']
            activeUser.status = userData['status']
            activeUser.avatarUrl = userData['avatarUrl']
            activeUser.userId = user.id 
            resolve(activeUser);
          }
        })
        }, (error) => {
          reject(error)
        })
    })
  }


  loadUser(userId: string): Promise<User>{
    return new Promise<User>((resolve, reject) =>{
      const foundUser = {} as User;
      onSnapshot(collection(this.firestore, 'users'), (users) => {
        users.forEach(user => {
          const userData = user.data();
          if(user.id == userId){
            foundUser.email = userData['email'] 
            foundUser.name = userData['name']
            foundUser.password = userData['password']
            foundUser.status = userData['status']
            foundUser.avatarUrl = userData['avatarUrl']
            foundUser.userId = user.id 
            resolve(foundUser);
          }
        })
        }, (error) => {
          reject(error)
        })
    })
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


  loadAllChannels(): Promise<Array<Channel>> {
    return new Promise<Array<Channel>>((resolve, reject) =>{
      const channelList = [] as Array<Channel>
      onSnapshot(collection(this.firestore, 'users'), (users) => {
        users.forEach(user => {
          onSnapshot(collection(this.firestore, 'users/' + user.id + '/channels'), (channels) => {
            channels.forEach(channel => {
              const channelData = channel.data();
              const channelObject = {} as Channel;
              channelObject.createdAt = channelData['createdAt'];
              channelObject.createdBy = channelData['createdBy'];
              channelObject.description = channelData['description'];
              channelObject.membersId = channelData['membersId'];
              channelObject.name = channelData['name'];
              channelObject.channelId = channelData['channelId'];
              channelList.push(channelObject);
              resolve(channelList);
            })
          })
        })
        }, (error) => {
          reject(error)
        })
    })
  }
  

  loadAllUserChannels(userId: string): Promise<Array<Channel>>{
    return new Promise<Array<Channel>>((resolve, reject) =>{ 
      const channelList = [] as Array<Channel>
      onSnapshot(collection(this.firestore, 'users/' + userId + '/channels'), (channels) => {
        channels.forEach(channel => {
          const channelData = channel.data();
          const channelObject = {} as Channel;
          channelObject.createdAt = channelData['createdAt'];
          channelObject.createdBy = channelData['createdBy'];
          channelObject.description = channelData['description'];
          channelObject.membersId = channelData['membersId'];
          channelObject.name = channelData['name'];
          channelObject.channelId = channelData['channelId'];
          channelList.push(channelObject);
          resolve(channelList);
        })
      },(error) => {
        reject(error)
      })
    }) 
  }


  loadSpecificUserChannel(userId: string, channelId: string): Promise<Channel>{
    return new Promise<Channel>((resolve, reject) =>{ 
      const channelObject = {} as Channel
      onSnapshot(collection(this.firestore, 'users/' + userId + '/channels'), (channels) => {
        channels.forEach(channel => {
          if(channelId == channel.id){
            const channelData = channel.data();
            channelObject.createdAt = channelData['createdAt'];
            channelObject.createdBy = channelData['createdBy'];
            channelObject.description = channelData['description'];
            channelObject.membersId = channelData['membersId'];
            channelObject.name = channelData['name'];
            channelObject.channelId = channelData['channelId'];
            resolve(channelObject);
          }
        })
      },(error) => {
        reject(error)
      })
    }) 
  }


  loadAllChannelMessages(){
    return new Promise<Array<ChannelMessage>>((resolve, reject) =>{
      const messageList = [] as Array<ChannelMessage>
      onSnapshot(collection(this.firestore, 'users'), (users) => {
        users.forEach(user => {
          onSnapshot(collection(this.firestore, 'users/' + user.id + '/channels'), (channels) => {
            channels.forEach(channel => {
              onSnapshot(collection(this.firestore, 'users/' + user.id + '/channels/' + channel.id + '/channelmessages'), (messages) => {
                messages.forEach(message => {
                  const messageData = message.data();
                  const messageObject = {} as ChannelMessage;
                  messageObject.channelId = messageData['channelId'];
                  messageObject.content = messageData['content'];
                  messageObject.createdAt = messageData['createdAt'];
                  messageObject.createdBy = messageData['createdBy'];
                  messageObject.fileUrl = messageData['fileUrl'];
                  messageObject.threadId = messageData['threadId'];
                  messageObject.messageId = messageData['messageId'];
                  messageList.push(messageObject);
                  resolve(messageList);
                })
              })
            })
          })
        })
        }, (error) => {
          reject(error)
        })
    })
  }


  loadChannelMessages(userId: string, channelId: string): Promise<Array<ChannelMessage>>{
    return new Promise<Array<ChannelMessage>>((resolve, reject) =>{ 
      const messageList = [] as Array<ChannelMessage>
      onSnapshot(collection(this.firestore, 'users/' + userId + '/channels/' + channelId + '/channelmessages'), (messages) => {
        messages.forEach(message => {
          const messageData = message.data();
          const channelMessageObject = {} as ChannelMessage;
          channelMessageObject.channelId = messageData['channelId'];
          channelMessageObject.content = messageData['content'];
          channelMessageObject.createdAt = messageData['createdAt'];
          channelMessageObject.createdBy = messageData['createdBy'];
          channelMessageObject.fileUrl = messageData['fileUrl'];
          channelMessageObject.threadId = messageData['threadId'];
          channelMessageObject.messageId = messageData['messageId'];
          messageList.push(channelMessageObject);
          resolve(messageList);
        })
      },(error) => {
        reject(error)
      })
    }) 
  }


  loadSpecificChannelMessage(userId: string, channelId: string, messageId: string): Promise<ChannelMessage> {
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


   /* CONVERSATION FUNCTIONS*/
  loadAllConversations(): Promise<Array<Conversation>>{
    return new Promise<Array<Conversation>>((resolve, reject) =>{
      const conversationList = [] as Array<Conversation>
      onSnapshot(collection(this.firestore, 'users'), (users) => {
        users.forEach(user => {
          onSnapshot(collection(this.firestore, 'users/' + user.id + '/conversations'), (conversations) => {
            conversations.forEach(conversation => {
              const conversationData = conversation.data();
              const conversationObject = {} as Conversation;
              conversationObject.conversationId = conversationData['conversationId'];
              conversationObject.conversationName = conversationData['conversationName'];
              conversationObject.createdBy = conversationData['createdBy'];
              conversationObject.fileUrl = conversationData['fileUrl'];
              conversationObject.recipientId = conversationData['recipientId'];
              conversationList.push(conversationObject);
              resolve(conversationList);
            })
          })
        })
        }, (error) => {
          reject(error)
        })
    })
  }

  
  loadAllUserConversations(userId: string): Promise<Array<Conversation>>{
    return new Promise<Array<Conversation>>((resolve, reject) =>{ 
      const ConversationList = [] as Array<Conversation>
      onSnapshot(collection(this.firestore, 'users/' + userId + '/conversations'), (conversations) => {
        conversations.forEach(conversation => {
          const conversationData = conversation.data();
          const conversationObject = {} as Conversation;
          conversationObject.conversationId = conversationData['conversationId'];
          conversationObject.conversationName = conversationData['conversationName'];
          conversationObject.createdBy = conversationData['createdBy'];
          conversationObject.fileUrl = conversationData['fileUrl'];
          conversationObject.recipientId = conversationData['recipientId'];
          ConversationList.push(conversationObject);
          resolve(ConversationList);
        })
      },(error) => {
        reject(error)
      })
    }) 
  }


  loadSpecificUserConversation(userId: string, conversationId: string):Promise<Conversation>{
    return new Promise<Conversation>((resolve, reject) =>{ 
      const conversationObject = {} as Conversation
      onSnapshot(collection(this.firestore, 'users/' + userId + '/conversations'), (conversations) => {
        conversations.forEach(conversation => {
          if(conversationId == conversation.id){
            const conversationData = conversation.data();
            conversationObject.conversationId = conversationData['conversationId'];
            conversationObject.conversationName = conversationData['conversationName'];
            conversationObject.createdBy = conversationData['createdBy'];
            conversationObject.fileUrl = conversationData['fileUrl'];
            conversationObject.recipientId = conversationData['recipientId'];
            resolve(conversationObject);
          }
        })
      },(error) => {
        reject(error)
      })
    })     
  }

  
  loadAllConversationMessages(){
    return new Promise<Array<ConversationMessage>>((resolve, reject) =>{
      const messageList = [] as Array<ConversationMessage>
      onSnapshot(collection(this.firestore, 'users'), (users) => {
      users.forEach(user => {
          onSnapshot(collection(this.firestore, 'users/' + user.id + '/conversations'), (conversations) => {
            conversations.forEach(conversation => {
              onSnapshot(collection(this.firestore, 'users/' + user.id + '/conversations/' + conversation.id + '/conversationmessages'), (messages) => {
                messages.forEach(message => {
                  const messageData = message.data();
                  const messageObject = {} as ConversationMessage;
                  messageObject.conversationId = messageData['conversationId'];
                  messageObject.content = messageData['content'];
                  messageObject.createdAt = messageData['createdAt'];
                  messageObject.createdBy = messageData['createdBy'];
                  messageObject.fileUrl = messageData['fileUrl'];
                  messageObject.threadId = messageData['threadId'];
                  messageObject.messageId = messageData['messageId'];
                  messageList.push(messageObject);
                  resolve(messageList);
                })
              })
            })
          })
        })
        }, (error) => {
          reject(error)
        })
     })
  }


  loadConversationMessages(userId: string, conversationId: string): Promise<Array<ConversationMessage>>{
    return new Promise<Array<ConversationMessage>>((resolve, reject) =>{
      const messageList = [] as Array<ConversationMessage>
      onSnapshot(collection(this.firestore, 'users/' + userId + '/conversations/' + conversationId + '/conversationmessages'), (messages) => {
        messages.forEach(message => {
          const messageData = message.data();
          const messageObject = {} as ConversationMessage;
          messageObject.conversationId = messageData['conversationId'];
          messageObject.content = messageData['content'];
          messageObject.createdAt = messageData['createdAt'];
          messageObject.createdBy = messageData['createdBy'];
          messageObject.fileUrl = messageData['fileUrl'];
          messageObject.threadId = messageData['threadId'];
          messageObject.messageId = messageData['messageId'];
          messageList.push(messageObject);
          resolve(messageList);
        })
      },(error) => {
        reject(error)
      })
    })
  }


  loadSpecificConversationMessage(userId: string, conversationId: string, messageId: string): Promise<ConversationMessage>{
    return new Promise<ConversationMessage>((resolve, reject) =>{
      const messageObject = {} as ConversationMessage
      onSnapshot(collection(this.firestore, 'users/' + userId + '/conversations/' + conversationId + '/conversationmessages'), (messages) => {
        messages.forEach(message => {
          if(message.id == messageId){
            const messageData = message.data();
            messageObject.conversationId = messageData['conversationId'];
            messageObject.content = messageData['content'];
            messageObject.createdAt = messageData['createdAt'];
            messageObject.createdBy = messageData['createdBy'];
            messageObject.fileUrl = messageData['fileUrl'];
            messageObject.threadId = messageData['threadId'];
            messageObject.messageId = messageData['messageId'];
            
            resolve(messageObject);
          }
        })
      },(error) => {
        reject(error)
      })
    })
  }


  //Folgende ID´s müssen aus dem HTML abgerufen werden?

   /*
   getChannelId(){
    
   }

   getConversationId(){

   }
 
 
   getMessageId(){
     
   }
   */

}