import { Component, inject } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, doc, onSnapshot } from '@angular/fire/firestore';
import { DatabaseService } from '../database.service';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';
import { Conversation } from '../../models/conversation.class';

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


constructor(){  
 
  //this.createConversationCreator(this.userId3, this.userId1);
  //this.createConversationRecipient(this.userId3, this.userId1);
  
  //debugger;
  //this.database.addConversation(this.userId2, this.userId1, this.conversationCreator, this.conversationRecipient);
 
  this.database.loadUserConversations(this.userId1);
  console.log('all conversations from user ' + this.userId1);
  console.log(this.database.userConversations);

  this.database.loadUserConversations(this.userId2);
  console.log('all conversations from user ' + this.userId2);
  console.log(this.database.userConversations);

  this.database.loadUserConversations(this.userId3);
  console.log('all conversations from user ' + this.userId3);
  console.log(this.database.userConversations);
  
  //this.database.loadAllUsers();
  //this.database.loadAllConversations();
  //this.database.loadAllChannels();
  
  //console.log(this.database.allConversations);
  
  
  //this.createUser();
  //this.database.addUser(this.user);
  
  //this.createChannel();
  //this.database.addChannel(this.userId3, this.channel);
  

  /*
  this.createConversationCreator(this.userId3, this.userId1);
  this.createConversationRecipient(this.userId3, this.userId1);
  const randomNumber = Math.random;
  console.log(randomNumber);
  this.database.addConversation(this.userId3, this.userId1, this.conversationCreator, this.conversationRecipient);
  */

  //console.log(this.database.users);
  
  /*
  console.log('channels for user: ' + this.userId3)
  console.log(this.database.userChannels);

  console.log('conversations for user: ' + this.userId3)
  console.log(this.database.userConversations);
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
  this.channel.description = 'This is a code created testchannel';
  this.channel.members = ['Simon', 'Ishak', 'Kerim'];
  this.channel.name = 'Code created testchannel';
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

}
