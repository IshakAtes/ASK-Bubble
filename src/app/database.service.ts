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
  userCache: any;
  
  
  constructor() { 
    
  }

  /*create functions */

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


  loadSpecificUser(){

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


  loadSpecificConversationMessage(userId: string, conversationId: string, messageId: string): Promise<Array<ConversationMessage>>{
    return new Promise<Array<ConversationMessage>>((resolve, reject) =>{
      const messageList = [] as Array<ConversationMessage>
      onSnapshot(collection(this.firestore, 'users/' + userId + '/conversations/' + conversationId + '/conversationmessages'), (messages) => {
        messages.forEach(message => {
          if(message.id == messageId){
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