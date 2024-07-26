import { Component, inject, Output, EventEmitter, OnChanges, Input, output } from '@angular/core';
import { DatabaseService } from '../database.service';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';
import { Conversation } from '../../models/conversation.class';
import { CommonModule } from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import { DialogCreateChannelComponent } from '../dialog-create-channel/dialog-create-channel.component';
import { UserService } from '../user.service';
import { ChannelComponent } from '../channel/channel.component';
import { FormsModule } from '@angular/forms';
import { ConversationMessage } from '../../models/conversationMessage.class';



@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, ChannelComponent, FormsModule],
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss', './workspaceResp.component.scss']
})
export class WorkspaceComponent {
  database = inject(DatabaseService);
  userService = inject(UserService);
  



  inputUser: string = '';

  inputFocused: boolean =  false;
  isdataLoaded: boolean = true;
  hideUserContainer: boolean = true;
  hideConversationBody: boolean = false;
  hideChannelBody: boolean = false;

  userlist: Array<User> = [];
  channelList: Array<Channel> = [];
  foundUserList: Array<User> = [];
  foundChannelList: Array<Channel> = [];
  filteredList: Array<ConversationMessage> = [];
  conversationList: Array<Conversation> = [];


  @Input() activeUserChannels: Array<Channel> 
  @Input() activeUserConversationList: Array<Conversation> 
  @Input() usersFromActiveUserConversationList: Array<User> 
  @Input() activeUser: User
  @Input() reload: boolean;


 
  @Output() changeToChannel = new EventEmitter<Channel>();
  @Output() changeToConversation = new EventEmitter<Conversation>();
  @Output() changeToNewConversation = new EventEmitter<Conversation>();
  


  constructor(public dialog: MatDialog, public us: UserService){  
   
    this.loadUserList();
    this.loadUserChannel();
    this.loadUserConversation();
    
  }


  ngOnChanges(){
    if(this.reload){
      
    }
  }


  loadUserList() {
    setTimeout(() => {
      this.userlist = [];
      this.database.loadAllUsers().then(allUsers =>{
        this.userlist = allUsers;
      })
    }, 500);
  }


  loadUserChannel(){
    setTimeout(() => {
      this.channelList = [];
      this.database.loadAllUserChannels(this.activeUser.userId).then(allChannel => {
        this.channelList = allChannel;
      })
    }, 600);
  }


  loadUserConversation(){
    setTimeout(() => {
      this.conversationList = [];
      this.database.loadAllUserConversations(this.activeUser.userId).then(allConversations => {
        this.conversationList = allConversations;
        //this.userService.isWorkspaceDataLoaded = true;
      })
    }, 700);
  }



  openConversation(conversation: Conversation){
    console.log('open conversation with', conversation)
    this.changeToConversation.emit(conversation);
  }

  openNewConversation(){
    this.changeToNewConversation.emit();
  }

  createNewConversation(user: User){
    let newConversation = this.database.createConversation(this.activeUser.userId, user.userId)
    this.database.addConversation(newConversation);
    this.us.loadActiveUserConversations();
    
    setTimeout(() => {
      this.changeToConversation.emit(newConversation);
    }, 200);
  }


  openChannel(channel: Channel){
    this.changeToChannel.emit(channel);
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

  
  openCreateChannelDialog(){
    this.dialog.open(DialogCreateChannelComponent, {
      panelClass: 'customDialog',
    })
  }


  detectInputFocus(){
    if(this.inputFocused){
      this.inputFocused = false;
    }
    else{
      this.inputFocused = true;
    }
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


  selectChannel(channel: Channel){
    this.changeToChannel.emit(channel);
  }


  selectUser(user: User){

    for(let conversation of this.conversationList){
      if(conversation.createdBy == this.activeUser.userId){
        if(conversation.recipientId == user.userId){

          console.log('A Conversation was Found --> open Conversation via emit')
          this.changeToConversation.emit(conversation);
          break;
        }
        else if(conversation.createdBy == user.userId){
          if(conversation.recipientId == this.activeUser.userId){

            console.log('A Conversation was Found --> open Conversation via emit')
            this.changeToConversation.emit(conversation);
            break;
          }
        }
      }
      else if(conversation.createdBy == user.userId){
        if(conversation.recipientId == this.activeUser.userId){
          console.log('A Conversation was Found --> open Conversation via emit')
          this.changeToConversation.emit(conversation);
          break;
        }
        else if(conversation.createdBy == this.activeUser.userId){

          if(conversation.recipientId == user.userId){
            console.log('A Conversation was Found --> open Conversation via emit')
            this.changeToConversation.emit(conversation);
            break;
          }
        }
      }
      else{
        if((this.conversationList.indexOf(conversation) +1) == this.conversationList.length) {
          console.log('nothing found in last iteration')
          console.log('No Conversation was found --> create new Conversation')
          this.createNewConversation(user);
        }
      }

    }
  }
}