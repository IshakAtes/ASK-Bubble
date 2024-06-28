import { Component, OnInit, inject, OnChanges } from '@angular/core';
import { WorkspaceComponent } from '../workspace/workspace.component';
import { ChannelComponent } from '../channel/channel.component';
import { ChatComponent } from '../chat/chat.component';
import { ThreadComponent } from '../thread/thread.component';
import { DatabaseService } from '../database.service';
import { Channel } from '../../models/channel.class';
import { UserService } from '../user.service';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef} from '@angular/material/dialog';
import { Conversation } from '../../models/conversation.class';
import { User } from '../../models/user.class';
import { CreateConversationComponent } from '../create-conversation/create-conversation.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [WorkspaceComponent, ChannelComponent, ChatComponent, ThreadComponent, CommonModule, CreateConversationComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent{
  conversation: boolean = false;
  channel: boolean = false;

  

  database = inject(DatabaseService);

  currentConversation: Conversation;
  currentChannel: Channel;
  activeUserChannels: Array<Channel> = [];
  activeUserConversationList: Array<Conversation> = [];
  usersFromActiveUserConversationList: Array<User> = [];
  activeUser = new User()

  
  isWSVisible: boolean = true;
  channelBig: boolean = false;
  reloadChannel: boolean = false;

  workspace: WorkspaceComponent;



  //TestData
  channelId: string = 'CHA-BSHDDuLBHC0o8RKcrcr6'


  
  constructor(public userservice: UserService){
    this.loadActiveUserChannels();
    this.loadActiveUserConversations();
    
    
  }

  ngOnChanges(){
    console.log('triggered on change from main')
  }


  loadActiveUserChannels(){
    this.activeUserChannels = [];
    console.log('loadActiveUserChannels triggered')
    this.database.getUser(this.userservice.activeUserMail).then(user =>{
      this.activeUser = user;
      this.database.loadAllUserChannels(user.userId).then(userChannels => {
        console.log('user Channels after load');
        console.log(userChannels);
        this.activeUserChannels = userChannels
      });
      
      //TODO - this.channelid from testdata should be a property of the userObject 
      //to load the last channel he visited.
      this.database.loadSpecificUserChannel(this.activeUser.userId, this.channelId)
      .then(channel => {
        this.currentChannel = channel;
      })
    })
  }


  loadActiveUserConversations(){
    this.database.getUser(this.userservice.activeUserMail).then(user =>{
      this.database.loadAllUserConversations(user.userId)
      .then(userConversations => {
        this.activeUserConversationList = userConversations;
        userConversations.forEach(conversation =>{
          if(conversation.createdBy == user.userId){
            this.getRecievedConversation(conversation);
          }else{
            this.getCreatedConversation(conversation);
          }
        })
      });
    })
  }


  getCreatedConversation(conversation: Conversation){
    this.database.loadUser(conversation.createdBy)
    .then(loadedUser => {
      this.usersFromActiveUserConversationList.push(loadedUser);
    })
  }


  getRecievedConversation(conversation: Conversation){
    this.database.loadUser(conversation.recipientId)
    .then(loadedUser => {
      this.usersFromActiveUserConversationList.push(loadedUser);
    })
  }



  changeChannel(channel: Channel){
    //if switch happens between channels a reload is needed!
    if(this.channel){
      this.currentChannel = channel;
      this.reloadChannel = true;
      this.conversation = false;
      this.channel = true;
    }
    else{
      this.currentChannel = channel;
      this.conversation = false;
      this.channel = true;
    }
  }

  changeConversation(conversation: Conversation){
    this.currentConversation = conversation;
    //this.reloadConversation?
    this.conversation = true;
    this.channel = false;
  }


  changeNewConversation(){
    this.reloadChannel = false;
    this.conversation = false;
    this.channel = false;
  }


  setReloadToFalse(reload: boolean){
    this.reloadChannel = false;
    console.log('reload from setReloadToFalse (main):')
    console.log('reload', this.reloadChannel)
  }


  changeWSVisibility(){
    if(this.isWSVisible){
      this.isWSVisible = false;
    }
    else{
      this.isWSVisible = true;
    }
  }
}
