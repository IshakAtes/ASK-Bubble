import { Component, inject } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, doc, onSnapshot } from '@angular/fire/firestore';
import { DatabaseService } from '../database.service';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';
import { Conversation } from '../../models/conversation.class';
import { ChannelMessage } from '../../models/channelMessage.class';

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
userId3: string = 'zd1XsuBu16TsbC3OVe1o'

channel = new Channel();
user = new User()
conversationCreator = new Conversation();
conversationRecipient = new Conversation();
channelMessage = new ChannelMessage();


constructor(){  
 
  //this.createConversationCreator(this.userId3, this.userId1);
  //this.createConversationRecipient(this.userId3, this.userId1);
  
  //debugger;
  //this.database.addConversation(this.userId2, this.userId1, this.conversationCreator, this.conversationRecipient);
 
  this.database.loadAllUsers();
  console.log('all Users');
  console.log(this.database.allUsers);


  this.database.loadUserConversations(this.userId3);
  console.log('all Conversations from: ' + this.userId3);
  console.log(this.database.userConversations);


  this.database.loadAllConversations();
  console.log('all Conversations');
  console.log(this.database.allConversations);


  this.database.loadUserChannels(this.userId3);
  console.log('all Channels from user: ' + this.userId3);
  console.log(this.database.userChannels);


  this.database.loadAllChannels();
  console.log('all Channels');
  console.log(this.database.allChannels);
  
  this.createChannel();
  this.createChannelMessage();
  //this.database.addChannelMessage(this.channel, this.channelMessage);


  /*
  this.createChannel();
  this.database.addChannel(this.channel);
  */
}



/* Dummy Data*/

createUser(){
  this.user.email = 'firstAttempt@dummy.de';
  this.user.name = 'firstAttempt';
  this.user.password = 'test';
  this.user.status = 'online';
  this.user.avatarUrl = 'avatar1';
}

createChannel(){
  this.channel.createdAt = new Date();
  this.channel.createdBy = 'BSHDDuLBHC0o8RKcrcr6';
  this.channel.description = 'First Channel with Function';
  this.channel.membersId = ['p1oEblSsradmfVeyvTu3', 'BSHDDuLBHC0o8RKcrcr6', 'zd1XsuBu16TsbC3OVe1o'];
  this.channel.name = 'FirstChannel';
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

createChannelMessage(){
  this.channelMessage.channelId = 'ChaM-BSHDDuLBHC0o8RKcrcr6';
  this.channelMessage.content = 'This is the second test message';
  this.channelMessage.createdAt = new Date();
  this.channelMessage.createdBy = 'ChaM-BSHDDuLBHC0o8RKcrcr6';
  this.channelMessage.fileUrl = '';
  this.channelMessage.threadId = '';
}

}
