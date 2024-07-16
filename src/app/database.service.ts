import { inject } from '@angular/core';
import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, onSnapshot } from '@angular/fire/firestore';
import { User } from '../models/user.class';
import { Channel } from '../models/channel.class';
import { Conversation } from '../models/conversation.class';
import { ChannelMessage } from '../models/channelMessage.class';
import { Reaction } from '../models/reactions.class';
import { ConversationMessage } from '../models/conversationMessage.class';
import { Timestamp, deleteDoc, setDoc } from 'firebase/firestore';
import { updateDoc, doc } from 'firebase/firestore'; // Korrigiert den Importpfad
import { WorkspaceComponent } from './workspace/workspace.component';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  firestore: Firestore = inject(Firestore)
  
  workspace: WorkspaceComponent;

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
    user.usedLastTwoEmojis = ['✅', '🙌']
    return user
  }


  createChannel(createdBy: string, description: string, membersId: Array<string>, channelName: string): Channel{
    let channel = {} as Channel
    const randomNumber = Math.random();
    channel.createdAt = new Date();
    channel.createdBy = createdBy;
    channel.description = description;
    channel.membersId = membersId;
    channel.name = channelName;
    channel.channelId = 'CHA-' + createdBy + '-' + randomNumber;
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

  createConversation(createdBy: string, recipientId: string): Conversation{
    const conversation = {} as Conversation
    const randomNumber = Math.random();
    conversation.conversationId = 'CONV-' + createdBy + '-' + randomNumber;
    conversation.conversationNameCreator = 'Conversation with ' + recipientId;
    conversation.conversationNameRecipient = 'Conversation with ' + createdBy;
    conversation.createdBy = createdBy;
    conversation.fileUrl = 'null';
    conversation.recipientId = recipientId;
    return conversation;
  }


  createConversationMessage(conversation: Conversation, content: string, createdBy: string, fileUrl?: string, threadId?: string): ConversationMessage{
    let conversationMessage = {} as ConversationMessage;
    const randomNumber = Math.random();
    conversationMessage.conversationId = conversation.conversationId;
    conversationMessage.content = content;
    conversationMessage.createdAt = Timestamp.fromDate(new Date());
    conversationMessage.createdBy = createdBy;
    conversationMessage.fileUrl = fileUrl ? fileUrl : '';
    conversationMessage.threadId = threadId ? threadId: '';
    conversationMessage.messageId = 'CONV-MSG-' +  randomNumber
    return conversationMessage
  }
  


  createConversationMessageReaction(emoji: string, userId: string, userName: string, conversationMessage: ConversationMessage): Reaction{
    let reaction = {} as Reaction;
    const randomNumber = Math.random();
    reaction.emoji = emoji;
    reaction.userId = userId;
    reaction.userName = userName;
    reaction.messageId = conversationMessage.messageId;
    reaction.reactionId = 'CONV-MSG-REACT-' + randomNumber;
    return reaction
  }



  /*create database entry functions */
  addUser(user: User){
    addDoc(collection(this.firestore, 'users'), user);
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


  addConversation(conversation: Conversation){
    //add converstaion to creator
    setDoc(doc(this.firestore, 'users/' + conversation.createdBy + '/conversations', conversation.conversationId), conversation);
    //add conversation to recipient
    setDoc(doc(this.firestore, 'users/' + conversation.recipientId + '/conversations', conversation.conversationId), conversation);
  }


  addConversationMessage(conversation: Conversation, conversationMessage: ConversationMessage){
    //add Message to creator
    setDoc(doc(this.firestore, 'users/' + conversation.createdBy + '/conversations/' + conversationMessage.conversationId + '/conversationmessages', conversationMessage.messageId), conversationMessage);
    //add Message to recipient
    setDoc(doc(this.firestore, 'users/' + conversation.recipientId + '/conversations/' + conversationMessage.conversationId + '/conversationmessages', conversationMessage.messageId), conversationMessage);
  }


  
  addConversationMessageThread(){

  }


  addConversationMessageReaction(conversation: Conversation, conversationMessage: ConversationMessage, reaction: Reaction){
    //add reaction to creator message
    setDoc(doc(this.firestore, 'users/' + conversation.createdBy + '/conversations/' 
    + conversation.conversationId + '/conversationmessages/' + conversationMessage.messageId + '/reactions', reaction.reactionId), reaction);
    //add reaction to recipient message
    setDoc(doc(this.firestore, 'users/' + conversation.recipientId + '/conversations/' 
    + conversation.conversationId + '/conversationmessages/' + conversationMessage.messageId + '/reactions', reaction.reactionId), reaction);
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
            activeUser.usedLastTwoEmojis = userData['usedLastTwoEmojis']
          }
        })
        resolve(activeUser);
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
            foundUser.usedLastTwoEmojis = userData['usedLastTwoEmojis'] 
          }
        })
        resolve(foundUser);
        }, (error) => {
          reject(error)
        })
    })
  }


  loadAllUsers(): Promise<Array<User>>{
    return new Promise<Array<User>>((resolve, reject) =>{
      const userList = [] as Array<User>
      onSnapshot(collection(this.firestore, 'users'), (users) => {
        users.forEach(user => {
          const userData = user.data();
          const userObject = {} as User;
          userObject.avatarUrl = userData['avatarUrl'];
          userObject.email = userData['email'];
          userObject.name = userData['name'];
          userObject.password = userData['password'];
          userObject.status = userData['status'];
          userObject.userId = user.id;
          userObject.usedLastTwoEmojis = userData['usedLastTwoEmojis']
          userList.push(userObject);
        })
        resolve(userList);
        }, (error) => {
          reject(error)
        })
    })
  }


  loadAllChannels(): Promise<Array<Channel>> {
    return new Promise<Array<Channel>>((resolve, reject) =>{
      const channelList = [] as Array<Channel>
      onSnapshot(collection(this.firestore, 'users'), (users) => {
        const channelPromises = [] as Array<Promise<void>>;
        users.forEach(user => {
          const channelPromise = new Promise<void>((resolveChannel, rejectChannel) => {
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
              });
              resolveChannel();
            }, rejectChannel);
          });
          channelPromises.push(channelPromise);
        });
        Promise.all(channelPromises)
          .then(() => resolve(channelList))
          .catch(error => reject(error));
      },reject);  
    });
  }
  

  loadAllUserChannels(userId: string): Promise<Array<Channel>>{
    return new Promise<Array<Channel>>((resolve, reject) =>{ 
      const channelList = [] as Array<Channel>
      const channelPromises = [] as Array<Promise<void>>
      const channelPromise = new Promise<void>((resolveChannel, rejectChannel) => {
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
          });
          resolveChannel();
        }, rejectChannel);
      });
      channelPromises.push(channelPromise);
      Promise.all(channelPromises)
        .then(() => resolve(channelList))
        .catch(error => reject(error));
    });
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
          }
        })
        resolve(channelObject);
      },(error) => {
        reject(error)
      })
    }) 
  }


  loadAllChannelMessages(){
    return new Promise<Array<ChannelMessage>>((resolve, reject) => {
      const messageList: Array<ChannelMessage> = [];
      const userPromises: Array<Promise<void>> = [];
  
      onSnapshot(collection(this.firestore, 'users'), (users) => {
        users.forEach(user => {
          const channelPromise = new Promise<void>((resolveChannel, rejectChannel) => {
            onSnapshot(collection(this.firestore, `users/${user.id}/channels`), (channels) => {
              const messagePromises: Array<Promise<void>> = [];
              channels.forEach(channel => {
                const messagePromise = new Promise<void>((resolveMessage, rejectMessage) => {
                  onSnapshot(collection(this.firestore, `users/${user.id}/channels/${channel.id}/channelmessages`), (messages) => {
                    messages.forEach(message => {
                      const messageData = message.data();
                      const messageObject: ChannelMessage = {
                        channelId: messageData['channelId'],
                        content: messageData['content'],
                        createdAt: messageData['createdAt'],
                        createdBy: messageData['createdBy'],
                        fileUrl: messageData['fileUrl'],
                        threadId: messageData['threadId'],
                        messageId: messageData['messageId'],
                        toJSON: function (): { channelId: string; content: string; createdAt: Date; createdBy: string; fileUrl: string; threadId: string; messageId: string; } {
                          throw new Error('Function not implemented.');
                        }
                      };
                      messageList.push(messageObject);
                    });
                    resolveMessage();
                  }, rejectMessage);
                });
                messagePromises.push(messagePromise);
              });
              Promise.all(messagePromises).then(() => {resolveChannel()}).catch(rejectChannel);
            });
          });
          userPromises.push(channelPromise);
        });
  
        Promise.all(userPromises)
          .then(() => resolve(messageList))
          .catch(error => reject(error));
      }, reject);
    });
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
        })
        resolve(messageList);
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
            }
          });
          resolve(specificMessage);
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
        const conversationPromises = [] as Array<Promise<void>>
        users.forEach(user => {
          const conversationPromise = new Promise<void>((resolveConversation, rejectConversation) => {
            onSnapshot(collection(this.firestore, 'users/' + user.id + '/conversations'), (conversations) => {
              conversations.forEach(conversation => {
                const conversationData = conversation.data();
                const conversationObject = {} as Conversation;
                conversationObject.conversationId = conversationData['conversationId'];
                conversationObject.conversationNameCreator = conversationData['conversationNameCreator'];
                conversationObject.conversationNameRecipient = conversationData['conversationNameRecipient'];
                conversationObject.createdBy = conversationData['createdBy'];
                conversationObject.fileUrl = conversationData['fileUrl'];
                conversationObject.recipientId = conversationData['recipientId'];
                conversationList.push(conversationObject);
              });
              resolveConversation();
            }, rejectConversation)
          });
          conversationPromises.push(conversationPromise);
        });
        Promise.all(conversationPromises)
          .then(() => resolve(conversationList))
          .catch(error => reject(error));
        }, reject);
        });
  }

  
  loadAllUserConversations(userId: string): Promise<Array<Conversation>>{
    return new Promise<Array<Conversation>>((resolve, reject) =>{ 
      const ConversationList = [] as Array<Conversation>
      onSnapshot(collection(this.firestore, 'users/' + userId + '/conversations'), (conversations) => {
        conversations.forEach(conversation => {
          const conversationData = conversation.data();
          const conversationObject = {} as Conversation;
          conversationObject.conversationId = conversationData['conversationId'];
          conversationObject.conversationNameCreator = conversationData['conversationNameCreator'];
          conversationObject.conversationNameRecipient = conversationData['conversationNameRecipient'];
          conversationObject.createdBy = conversationData['createdBy'];
          conversationObject.fileUrl = conversationData['fileUrl'];
          conversationObject.recipientId = conversationData['recipientId'];
          ConversationList.push(conversationObject);
        })
        resolve(ConversationList);
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
            conversationObject.conversationNameCreator = conversationData['conversationNameCreator'];
            conversationObject.conversationNameRecipient = conversationData['conversationNameRecipient'];
            conversationObject.createdBy = conversationData['createdBy'];
            conversationObject.fileUrl = conversationData['fileUrl'];
            conversationObject.recipientId = conversationData['recipientId'];
          }
        })
        resolve(conversationObject);
      },(error) => {
        reject(error)
      })
    })     
  }


  loadAllConversationMessages():Promise<Array<ConversationMessage>>{
    return new Promise<Array<ConversationMessage>>((resolve, reject) => {
      const messageList: Array<ConversationMessage> = [];
      const userPromises: Array<Promise<void>> = [];
      onSnapshot(collection(this.firestore, 'users'), (users) => {
        users.forEach(user => {
          const conversationPromise = new Promise<void>((resolveConversation, rejectConversation) => {
            onSnapshot(collection(this.firestore, `users/${user.id}/conversations`), (conversations) => {
              const messagePromises: Array<Promise<void>> = [];
              conversations.forEach(conversation => {
                const messagePromise = new Promise<void>((resolveMessage, rejectMessage) => {
                  onSnapshot(collection(this.firestore, `users/${user.id}/conversations/${conversation.id}/conversationmessages`), (messages) => {
                    messages.forEach(message => {
                      const messageData = message.data();
                      const messageObject: ConversationMessage = {
                        conversationId: messageData['conversationId'],
                        content: messageData['content'],
                        createdAt: messageData['createdAt'],
                        createdBy: messageData['createdBy'],
                        fileUrl: messageData['fileUrl'],
                        threadId: messageData['threadId'],
                        messageId: messageData['messageId'],
                        toJSON: function (): { conversationId: string; content: string; createdAt: Timestamp; createdBy: string; fileUrl: string; threadId: string; messageId: string; } {
                          throw new Error('Function not implemented.');
                        }
                      };
                      messageList.push(messageObject);
                    });
                    resolveMessage();
                  }, rejectMessage);
                });
                messagePromises.push(messagePromise);
              });
              Promise.all(messagePromises).then(() => {resolveConversation()}).catch(rejectConversation);
            });
          });
          userPromises.push(conversationPromise);
        });
        Promise.all(userPromises)
          .then(() => resolve(messageList))
          .catch(error => reject(error));
      }, reject);
    });
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
        })
        resolve(messageList);
      },(error) => {
        reject(error)
      })
    })
  }

  
  // loadConversationMessagesReactions(userId: string, conversationId: string, conversationMessageId: string): Promise<Array<Reaction>>{
  //   return new Promise<Array<Reaction>>((resolve, reject) =>{
  //     const reactionList = [] as Array<Reaction>
  //     onSnapshot(collection(this.firestore, 'users/' + userId + '/conversations/' + conversationId + '/conversationmessages' + conversationMessageId + '/reactions'), (reactions) => {
  //       reactions.forEach(reactions => {
  //         const reactionData = reactions.data();
  //         const reactionObject = {} as Reaction;
  //         reactionObject.emoji = reactionData['emoji'];
  //         reactionObject.messageId = reactionData['messageId'];
  //         reactionObject.reactionId = reactionData['reactionId'];
  //         reactionObject.userId = reactionData['userId'];
  //         reactionList.push(reactionObject);
  //       })
  //       resolve(reactionList);
  //     },(error) => {
  //       reject(error)
  //     })
  //   })
  // }

  loadConversationMessagesReactions(userId: string, conversationId: string, conversationMessageId: string): Promise<Array<Reaction>> {
    return new Promise<Array<Reaction>>((resolve, reject) => {
      const reactionList = [] as Array<Reaction>;
      
      const path = `users/${userId}/conversations/${conversationId}/conversationmessages/${conversationMessageId}/reactions`;
      const reactionsCollection = collection(this.firestore, path);
      
      onSnapshot(reactionsCollection, (snapshot) => {
        snapshot.forEach((doc) => {
          const reactionData = doc.data();
          const reactionObject = {
            emoji: reactionData['emoji'],
            messageId: reactionData['messageId'],
            reactionId: reactionData['reactionId'],
            userId: reactionData['userId'],
            userName: reactionData['userName'],
          } as Reaction;
          reactionList.push(reactionObject);
        });
        resolve(reactionList);
      }, (error) => {
        reject(error);
      });
    });
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
          }
        })
        resolve(messageObject);
      },(error) => {
        reject(error)
      })
    })
  }


  /*update functions */
  updateChannelMembers(channel: Channel){
    channel.membersId.forEach(user => {
      updateDoc(doc(collection(this.firestore, 'users/' + user + '/channels/'), channel.channelId), channel.toJSON());
    })
  }


  updateChannelName(channel: Channel){
    channel.membersId.forEach(user => {
      updateDoc(doc(collection(this.firestore, 'users/' + user + '/channels/'), channel.channelId), channel.toJSON())
    })
  }
  

  updateUsedLastTwoEmojis(userId:string, emoji1:string, emoji2:string){
    updateDoc(doc(this.firestore, 'users', userId), 'usedLastTwoEmojis', [emoji1, emoji2]);
  }

  updateMessage(message: ConversationMessage, conversation: Conversation): Promise<void> {
    const creatorMessageRef = doc(
      this.firestore,
      'users/' + conversation.createdBy + '/conversations/' + message.conversationId + '/conversationmessages',
      message.messageId
    );
  
    const recipientMessageRef = doc(
      this.firestore,
      'users/' + conversation.recipientId + '/conversations/' + message.conversationId + '/conversationmessages',
      message.messageId
    );
  
    return Promise.all([
      updateDoc(creatorMessageRef, { content: message.content }),
      updateDoc(recipientMessageRef, { content: message.content })
    ]).then(() => {
      console.log('Message updated successfully for both users');
    }).catch(error => {
      console.error('Error updating message: ', error);
    });
  }

  
  /*delete functions */
  deleteChannel(channel: Channel, userId: string){
    deleteDoc(doc(collection(this.firestore, 'users/' + userId + '/channels/'), channel.channelId));
  }

}