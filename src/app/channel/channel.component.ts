import { Component, inject } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, doc, onSnapshot } from '@angular/fire/firestore';
import { DatabaseService } from '../database.service';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';
import { Conversation } from '../../models/conversation.class';
import { ChannelMessage } from '../../models/channelMessage.class';
import { Reaction } from '../../models/reactions.class';
import { ConversationMessage } from '../../models/conversationMessage.class';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent {

  firestore: Firestore = inject(Firestore);
  database = inject(DatabaseService);
  
  
  userId1: string = 'p1oEblSsradmfVeyvTu3';
  userId2: string = 'BSHDDuLBHC0o8RKcrcr6';
  userId3: string = 'zd1XsuBu16TsbC3OVe1o';
  channelId: string = 'CHA-p1oEblSsradmfVeyvTu3'
  messageID: string = 'uX2zpZuE5rr9ZE5OHG8q'

  activeUser: string = '';


  userList: Array<any> = [];
  messageList: Array<ChannelMessage> = [];

  channel = new Channel();
  user = new User()
  reaction = new Reaction();
  conversationCreator = new Conversation();
  conversationRecipient = new Conversation();
  channelMessage = new ChannelMessage();
  loadedConversation = new Conversation();
  conversationMessage = new ConversationMessage();


  constructor(){  

    /*DONE*/


    this.database.loadAllUsers().then(userlist => {
      this.userList = userlist;
      console.log('this.userList from Promise:')
      console.log(this.userList)
    });

    setTimeout(() => {
      console.log('this.userList outside of Promise with delay:')
      console.log(this.userList)
    }, 500);

    
    this.database.loadAllChannels().then(allChannels => {
      console.log('all channels from Promise')
      console.log(allChannels);
    });


    this.database.loadAllUserChannels(this.userId1).then(userChannels => {
      console.log('all Channels from user: ' + this.userId1 + ' from promise');
      console.log(userChannels);
    });


    this.database.getUserId('ishak@dummy.de').then(userId =>{
      console.log('userid from promise')
      console.log(userId);
    })


    this.database.loadSpecificUserChannel(this.userId1, this.channelId).then(channel => {
      console.log('channel: ' + channel.channelId + ' from user ' + this.userId1 + ' from within the promise' );
      console.log(channel);
  
    })


    this.database.loadAllChannelMessages().then(messageList => {
      console.log('all channel Messages from Promise');
      console.log(messageList);
      this.messageList = messageList;
    });
   

    this.database.loadChannelMessages(this.userId2, this.channelId).then(messages => {
      console.log('Messages from a specific channel from Promise');
      console.log(messages);
    });


    this.database.loadAllConversations().then(allConversations =>{
      console.log('all Conversations from Promise');
      console.log(allConversations);
    });


    this.database.loadUserConversations(this.userId1).then(conversations =>{
      console.log('all Conversations from: ' + this.userId1 + ' from Promise');
      console.log(conversations);
    });


    this.database.loadSpecificUserConversation(this.userId1, 'CONV-p1oEblSsradmfVeyvTu3')
      .then(conversation => {
        console.log('single conversation from ' + this.userId1);
        console.log(conversation);
    })

    this.database.loadAllConversationMessages().then(allConversationMessages => {
      console.log('All conversation messages');
      console.log(allConversationMessages);
    })

    this.database.loadConversationMessages(this.userId1, 'CONV-p1oEblSsradmfVeyvTu3')
    .then(conversationMessages => {
      console.log('All Messages from a specific Conversation');
      console.log(conversationMessages);
    })

  
    /*
    this.database.loadSpecificUserConversation(this.userId2, 'CONV-p1oEblSsradmfVeyvTu3')
    .then(conversation => {
      this.createConversationMessage(conversation, '6th conversationmessage created by promise', this.userId2)
      this.database.addConversationMessage(conversation, this.conversationMessage)
    })
    */


    /*
    userId1: string = 'p1oEblSsradmfVeyvTu3';
    userId2: string = 'BSHDDuLBHC0o8RKcrcr6';
    userId3: string = 'zd1XsuBu16TsbC3OVe1o';
    */
    



    /* TODO */

    /*Conversation Functions */
    


    /*
    this.createConversationCreator(this.userId3, this.userId1);
    this.createConversationRecipient(this.userId3, this.userId1);
    this.database.addConversation(this.conversationCreator, this.conversationRecipient)
    */

    //this.createChannel(this.userId1, 'TestDescription',[this.userId1, this.userId2, this.userId3] ,'TestName')
    

    //Wichtig!!!//
    /*
    this.database.loadSpecificChannelMessage(this.userId1, this.channel.channelId, 'CHA-MSG-0.7055061652767145')
    .then((message: ChannelMessage) => {
      this.createReaction('testEmoji', this.userId1, message);
      this.database.addChannelMessageReaction(this.channel, message, this.reaction)
    });
    */
    
    


  }


  /*real Functions*/

  openConversation(userId: string){
    console.log('opened chat with user: ' + userId);
  }

  openChannel(channelId: string){
    console.log('opened channel with channelId: ' + channelId);
  }


  /* Dummy Data*/
  createUser(){
    this.user.email = 'firstAttempt@dummy.de';
    this.user.name = 'firstAttempt';
    this.user.password = 'test';
    this.user.status = 'online';
    this.user.avatarUrl = 'avatar1';
  }


  createChannel(createdBy: string, description: string, membersId: Array<string>, channelName: string){
    this.channel.createdAt = new Date();
    this.channel.createdBy = createdBy;
    this.channel.description = description;
    this.channel.membersId = membersId;
    this.channel.name = channelName;
    this.channel.channelId = 'CHA-' + this.channel.createdBy;
  }


  createChannelMessageReaction(emoji: string, userId: string, channelMessage: ChannelMessage){
    const randomNumber = Math.random()
    this.reaction.emoji = emoji;
    this.reaction.userId = userId;
    this.reaction.messageId = channelMessage.messageId;
    this.reaction.reactionId = 'CHA-MSG-REACT-' + randomNumber;
  }


  createConversationCreator(createdBy: string, recipientId: string){
    this.conversationCreator.conversationId = 'CONV-' + createdBy;
    this.conversationCreator.conversationName = 'Conversation with ' + recipientId;
    this.conversationCreator.createdBy = createdBy;
    this.conversationCreator.fileUrl = 'null';
    this.conversationCreator.recipientId = recipientId;
  }


  createConversationRecipient(createdBy: string, recipientId: string){
    this.conversationRecipient.conversationId = 'CONV-' + createdBy;
    this.conversationRecipient.conversationName = 'Conversation with ' + createdBy;
    this.conversationRecipient.createdBy = createdBy;
    this.conversationRecipient.fileUrl = 'null';
    this.conversationRecipient.recipientId = recipientId;
  }

  createChannelMessage(channel: Channel, content: string, createdBy: string, fileUrl?: string, threadId?: string){
    const randomNumber = Math.random()
    this.channelMessage.channelId = channel.channelId;
    this.channelMessage.content = content;
    this.channelMessage.createdAt = new Date();
    this.channelMessage.createdBy = createdBy;
    this.channelMessage.fileUrl = fileUrl ? fileUrl : '';
    this.channelMessage.threadId = threadId ? threadId: '';
    this.channelMessage.messageId = 'CHA-MSG-' + randomNumber
  }


  createConversationMessage(conversation: Conversation, content: string, createdBy: string, fileUrl?: string, threadId?: string){
    const randomNumber = Math.random()
    this.conversationMessage.conversationId = conversation.conversationId;
    this.conversationMessage.content = content;
    this.conversationMessage.createdAt = new Date();
    this.conversationMessage.createdBy = createdBy;
    this.conversationMessage.fileUrl = fileUrl ? fileUrl : '';
    this.conversationMessage.threadId = threadId ? threadId: '';
    this.conversationMessage.messageId = 'CONV-MSG-' +  randomNumber
  }



}
