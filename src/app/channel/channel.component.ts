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

  channelId: string = 'ChaM-BSHDDuLBHC0o8RKcrcr6'
  messageID: string = 'uX2zpZuE5rr9ZE5OHG8q'

  test: Array<any> = []; 


  channel = new Channel();
  user = new User()
  reaction = new Reaction();
  conversationCreator = new Conversation();
  conversationRecipient = new Conversation();
  channelMessage = new ChannelMessage();

  specificMessageId: any;
  
  loadedConversation = new Conversation();
  conversationMessage = new ConversationMessage();


  constructor(){  

    this.database.loadAllUsers();
    console.log('all Users');
    console.log(this.database.allUsers);


    this.database.loadAllConversations();
    console.log('all Conversations');
    console.log(this.database.allConversations);


    this.database.loadUserConversations(this.userId3);
    console.log('all Conversations from: ' + this.userId3);
    console.log(this.database.userConversations);


    this.database.loadAllUserChannels(this.userId3);
    console.log('all Channels from user: ' + this.userId3);
    console.log(this.database.userChannels);


    this.database.loadAllChannels();
    console.log('all Channels');
    console.log(this.database.allChannels);
    

    this.database.loadSpecificUserChannel(this.userId1, this.channelId)
    console.log('specific UserChannel');
    console.log(this.database.specificUserChannel);


    this.database.loadAllChannelMessages();
    console.log('all channel Messages');
    console.log(this.database.allChannelMessages);


    this.database.loadChannelMessages(this.userId2, this.channelId);
    console.log('Messages from a specific channel');
    console.log(this.database.channelMessages);

    
    this.createChannel(this.userId1, 'TestDescription',[this.userId1, this.userId2, this.userId3] ,'TestName')
    

    //Wichtig!!!//
    /*
    this.database.loadSpecificChannelMessage(this.userId1, this.channel.channelId, 'CHA-MSG-0.7055061652767145')
    .then((message: ChannelMessage) => {
      this.createReaction('testEmoji', this.userId1, message);
      this.database.addChannelMessageReaction(this.channel, message, this.reaction)
    });
    */
    
    
    //this.createConversationFromDB();
  }

  createReaction(emoji: string, userId: string, channelMessage: ChannelMessage){
    const randomNumber = Math.random()
    this.reaction.emoji = emoji;
    this.reaction.userId = userId;
    this.reaction.messageId = channelMessage.messageId;
    this.reaction.reactionId = 'CHA-MSG-REACT-' + randomNumber;
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


  createChannelMessage(channel: Channel, content: string, createdBy: string, fileUrl?: string, threadId?: string){
    const randomNumber = Math.random()
    this.channelMessage.channelId = channel.channelId;
    this.channelMessage.content = content;
    this.channelMessage.createdAt = new Date();
    this.channelMessage.createdBy = createdBy;
    this.channelMessage.messageId = 'CHA-MSG-' + randomNumber
    this.channelMessage.fileUrl = fileUrl ? fileUrl : '';
    this.channelMessage.threadId = threadId ? threadId: '';
  }





  createConversationCreator(createdBy: string, recipientId: string){
    this.conversationCreator.conversationName = 'Conversation with ' + recipientId;
    this.conversationCreator.createdBy = createdBy;
    this.conversationCreator.fileUrl = 'null';
    this.conversationCreator.recipientId = recipientId;
  }


  createConversationRecipient(createdBy: string, recipientId: string){
    this.conversationRecipient.conversationName = 'Conversation with ' + createdBy;
    this.conversationRecipient.createdBy = createdBy;
    this.conversationRecipient.fileUrl = 'null';
    this.conversationRecipient.recipientId = recipientId;
  }


  createConversationMessage(){
    this.conversationMessage.conversationId = 'CoM-BSHDDuLBHC0o8RKcrcr6';
    this.conversationMessage.content = 'First Conversation Message';
    this.conversationMessage.createdAt = new Date();
    this.conversationMessage.createdBy = 'BSHDDuLBHC0o8RKcrcr6';
    this.conversationMessage.fileUrl = '';
    this.conversationMessage.threadId = '';
  }


  createConversationFromDB(){
    console.log('database entry');
    this.test = this.database.loadSpecificUserConversation(this.userId1, 'CoM-BSHDDuLBHC0o8RKcrcr6')
  }

}
