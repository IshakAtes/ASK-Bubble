import { Component, ElementRef, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Channel } from '../../models/channel.class';
import { User } from '../../models/user.class';
import { DatabaseService } from '../database.service';
import { ChannelMessage } from '../../models/channelMessage.class';
import { MatDialog} from '@angular/material/dialog';
import { ConversationMessage } from '../../models/conversationMessage.class';
import { FormsModule } from '@angular/forms';
import { Conversation } from '../../models/conversation.class';


@Component({
  selector: 'app-create-conversation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-conversation.component.html',
  styleUrl: './create-conversation.component.scss'
})
export class CreateConversationComponent {
  //input Data from main component

  @Input() channelBig: boolean;



  //outputData to main component
  @Output() changeReloadStatus = new EventEmitter<boolean>();
  @Output() changeToChannel = new EventEmitter<Channel>()
  @Output() changeToConversation = new EventEmitter<Conversation>()
  
  
  hideUserContainer: boolean = true;
  inputFocused: boolean =  false;
  isdataLoaded: boolean = true;


  userId = 'p1oEblSsradmfVeyvTu3';


  inputUser: string = '';


 
  userlist: Array<User> = [];
  channelList: Array<Channel> = [];
  conversationList: Array<Conversation> = [];
  foundUserList: Array<User> = [];
  foundChannelList: Array<Channel> = [];





  constructor(public dialog: MatDialog, private database: DatabaseService){
    this.loadUserList();
    this.loadUserChannel();
    this.loadUserConversation();
  }



  loadUserList() {
    setTimeout(() => {
      this.userlist = [];
      this.database.loadAllUsers().then(allUsers =>{
        this.userlist = allUsers;
        console.log(this.userlist)
      })
    }, 200);
  }


  loadUserChannel(){
    setTimeout(() => {
      this.channelList = [];
      this.database.loadAllUserChannels(this.userId).then(allChannel => {
        this.channelList = allChannel;
        console.log(this.channelList)
      })
    }, 200);
  }


  loadUserConversation(){
    setTimeout(() => {
      this.conversationList = [];
      this.database.loadAllUserConversations(this.userId).then(allConversations => {
        this.conversationList = allConversations;
        console.log('ConversationList')
        console.log(this.conversationList)
      })
    }, 200);
  }


  showFilteredUser(){
    if(this.inputUser.startsWith('@')){
      let searchUser = this.inputUser.substring(1);
      this.foundUserList = this.userlist.filter((user) => user.name.toLowerCase().startsWith(searchUser));
    }
    else if(this.inputUser.startsWith('#')){
      let searchChannel = this.inputUser.substring(1);
      this.foundChannelList = this.channelList.filter((channel) => channel.name.toLowerCase().startsWith(searchChannel))
    }
    else{
      this.foundUserList = this.userlist.filter((user) => user.email.toLowerCase().startsWith(this.inputUser));
    }
  }

  selectUser(user: User){
    for(let conversation of this.conversationList){
      if(conversation.createdBy == this.userId){
        if(conversation.recipientId == user.userId){
          console.log('A Conversation was Found --> open Conversation via emit')
          
          this.changeToConversation.emit(conversation);
          break;
        }
      }
      else if(conversation.createdBy == user.userId){
        if(conversation.recipientId == this.userId){
          console.log('A Conversation was Found --> open Conversation via emit')
          this.changeToConversation.emit(conversation);
          break;
        }
      }
      else{
        console.log('No Conversation was found --> create new Conversation')
        this.openNewConversation(user);
      }
    }
  }



  openNewConversation(user: User){
    let newConversation = this.database.createConversation(this.userId, user.userId)
    setTimeout(() => {
      console.log('create new conversation' + newConversation)
      console.log(newConversation)
      //TODO - scharf schalten !
      //this.database.addConversation(newConversation);
    }, 200);
    
    setTimeout(() => {
        this.changeToConversation.emit(newConversation);
    }, 500);

  }


  selectChannel(channel: Channel){
    this.changeToChannel.emit(channel);
  }


  changeUserContainerVisibility(){
    if(this.hideUserContainer){
      this.hideUserContainer = false;
    }
    else{
      this.hideUserContainer = true;
    }
    console.log('check input focus error ');
  }

  detectInputFocus(){
    if(this.inputFocused){
      this.inputFocused = false;
    }
    else{
      this.inputFocused = true;
    }
  }










}
