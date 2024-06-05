import { Component, inject } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, doc, onSnapshot } from '@angular/fire/firestore';
import { DatabaseService } from '../database.service';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';
import { Conversation } from '../../models/conversation.class';
import { ChannelMessage } from '../../models/channelMessage.class';
import { Reaction } from '../../models/reactions.class';
import { ConversationMessage } from '../../models/conversationMessage.class';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss'
})
export class WorkspaceComponent {
  firestore: Firestore = inject(Firestore);
  database = inject(DatabaseService);
  
  //Initial ID´s
  userId1: string = 'p1oEblSsradmfVeyvTu3';
  userId2: string = 'BSHDDuLBHC0o8RKcrcr6';
  userId3: string = 'zd1XsuBu16TsbC3OVe1o';
  testuser: string = '0jAVMd6Boa2sVYhKmSiV'

  
  channelId: string = 'CHA-p1oEblSsradmfVeyvTu3'
  messageID: string = 'uX2zpZuE5rr9ZE5OHG8q'


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

 

  /*real variables */
  activeUser = new User()
  activeUserChannels: Array<Channel> = [];
  activeUserConversations: Array<Conversation> = [];
  hideConversationBody: boolean = false;
  hideChannelBody: boolean = false;

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


    this.database.loadAllUserConversations(this.userId1).then(conversations =>{
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


/*addConversationMessageReaction */
    /*
    this.database.loadSpecificUserConversation('BSHDDuLBHC0o8RKcrcr6', 'CONV-BSHDDuLBHC0o8RKcrcr6')
      .then(conversation => {
        this.database.loadSpecificConversationMessage('BSHDDuLBHC0o8RKcrcr6', conversation.conversationId, 'CONV-MSG-0.26562883108849533')
        .then(message => {
          this.createConversationMessageReaction('rocketEmoji', 'zd1XsuBu16TsbC3OVe1o', message )
          this.database.addConversationMessageReaction(conversation, message, this.reaction)
        })
      })
    */
   




    let testchannel = new Channel() 
    
    
    testchannel = this.createChannel('0jAVMd6Boa2sVYhKmSiV', 'Description of Testchannel', 
    ['0jAVMd6Boa2sVYhKmSiV', 'p1oEblSsradmfVeyvTu3', 'BSHDDuLBHC0o8RKcrcr6'], 'ForEachTest')
    
    console.log('TESTCHANNEL')
    console.log(testchannel);
    
    //this.database.addChannel(testchannel);
    
 
    

    //this.createTestDatabasePart1();


    
    /* TODO 
      needed functions
    */
    this.database.getUser('simon@dummy.de').then(user =>{
      this.activeUser = user;
      this.database.loadAllUserChannels(user.userId).then(userChannels => {
        this.activeUserChannels = userChannels
      });
    })

    this.database.getUser('simon@dummy.de').then(user =>{
      this.database.loadAllUserConversations(user.userId).then(userConversations => {
        this.activeUserConversations = userConversations;
      });
    })
  }


  openConversation(conversationId: string){
    console.log('opened conversation with conversationId: ' + conversationId);
  }


  openChannel(channelId: string){
    console.log('opened channel with channelId: ' + channelId);
  }


  switchVisibilityChannelbody(){
    if(this.hideChannelBody){
      this.hideChannelBody = false;
    }
    else{
      this.hideChannelBody = true;
    }
  }


  switchVisibilityConversationbody(){
    if(this.hideConversationBody){
      this.hideConversationBody = false;
    }
    else{
      this.hideConversationBody = true;
    }
  }


/*create Database Script */


//Adding Users
createTestDatabasePart1(){
  let user1 = new User(this.createUser('ishakTest@dummy.de', 'Ishak Ates', 'test', 'online', '../../assets/img/defaultAvatars/defaultMale3.png'));
  let user2 = new User(this.createUser('simonTest@dummy.de', 'Simon Weirauch', 'test', 'online', '../../assets/img/defaultAvatars/defaultMale2.png'));
  let user3 = new User(this.createUser('kerimTest@dummy.de', 'Kerim Tasci', 'test', 'online', '../../assets/img/defaultAvatars/defaultMale1.png'))
  
  this.database.addUser(user1);
  this.database.addUser(user2);
  this.database.addUser(user3);

  let loadedUser1: User;
  let loadedUser2: User;
  let loadedUser3: User;
  
  setTimeout(() => {
    this.database.getUser('ishakTest@dummy.de')
    .then(user1 =>{
      loadedUser1 = user1;
      this.database.getUser('simonTest@dummy.de')
        .then(user2 =>{
          loadedUser2 = user2;
          this.database.getUser('kerimTest@dummy.de')
          .then(user3 =>{
            loadedUser3 = user3;
            this.createTestDatabasePart2(loadedUser1, loadedUser2, loadedUser3)
          })
        })
    })
  }, 3000);


}

  //Adding Channels and Conversations
  createTestDatabasePart2(user1: User, user2: User, user3: User){
    

    //adding channels
    let channel1 = new Channel(this.createChannel(user1.userId, 'This is the description of Testchannel 1',  [user1.userId, user2.userId, user3.userId], 'Testchannel 1'));
    let channel2 = new Channel(this.createChannel(user2.userId, 'This is the description of Testchannel 2', [user1.userId, user2.userId], 'Testchannel 2'));
    
    setTimeout(() => {
      this.database.addChannel(channel1);
      this.database.addChannel(channel2);
    }, 3000);

    let loadedChannel1: Channel;
    let loadedChannel2: Channel;


    //adding conversations
    let conversationCreater1 = new Conversation(this.createConversationCreator(user1.userId, user2.userId));
    let conversationRecipient1 = new Conversation(this.createConversationRecipient(user1.userId, user2.userId));
    let conversationCreater2 = new Conversation(this.createConversationCreator(user2.userId, user3.userId));
    let conversationRecipient2 = new Conversation(this.createConversationRecipient(user2.userId, user3.userId));
    
    setTimeout(() => {
      this.database.addConversation(conversationCreater1, conversationRecipient1);
      this.database.addConversation(conversationCreater2, conversationRecipient2);
    }, 2000);
    let loadedConversation1;
    let loadedConversation2;


  }




  /* Dummy Data*/
  createUser(email: string, name: string, password: string, status: string, avatarUrl: string):User{
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


  createChannelMessageReaction(emoji: string, userId: string, channelMessage: ChannelMessage){
    const randomNumber = Math.random()
    this.reaction.emoji = emoji;
    this.reaction.userId = userId;
    this.reaction.messageId = channelMessage.messageId;
    this.reaction.reactionId = 'CHA-MSG-REACT-' + randomNumber;
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


  createConversationMessageReaction(emoji: string, userId: string, conversationMessage: ConversationMessage){
    const randomNumber = Math.random()
    this.reaction.emoji = emoji;
    this.reaction.userId = userId;
    this.reaction.messageId = conversationMessage.messageId;
    this.reaction.reactionId = 'CONV-MSG-REACT-' + randomNumber;
  }

}
