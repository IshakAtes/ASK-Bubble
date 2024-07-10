import { Component, OnInit, inject, OnChanges, AfterViewChecked, AfterViewInit, } from '@angular/core';
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
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [WorkspaceComponent, HeaderComponent , ChannelComponent, ChatComponent, ThreadComponent, CommonModule, CreateConversationComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent{
  conversation: boolean = false;
  channel: boolean = false;
  isWSVisible: boolean = true;
  channelBig: boolean = false;
  reloadChannel: boolean = false;
  



  currentConversation: Conversation;
  currentChannel: Channel;




  
  constructor(public userservice: UserService, public database: DatabaseService){
    userservice.getDeviceWidth();
  }

  ngOnChanges(){
    console.log('triggered on change from main')
  }

  ngAfterViewInit(){
    console.log('triggered afterViewInit from main')
  }





  changeChannel(channel: Channel){
    //if switch happens between channels a reload is needed!
    if(this.userservice.deviceWidth > 500){
      //ts settings for desktopView
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
    else{
      //ts settings for mobile view
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
      this.isWSVisible = false;
    }

  }



  changeConversation(conversation: Conversation){
    if(this.userservice.deviceWidth > 500){
      this.currentConversation = conversation;
      //this.reloadConversation?
      this.conversation = true;
      this.channel = false;
      this.userservice.loadActiveUserConversations();
    }
    else{
      this.currentConversation = conversation;
      this.conversation = true;
      this.channel = false;
      this.isWSVisible = false;
      this.userservice.loadActiveUserConversations();
    }

    
  }


  changeNewConversation(){
    if(this.userservice.deviceWidth > 500){
      this.reloadChannel = false;
      this.conversation = false;
      this.channel = false;
    }
    else{
      this.reloadChannel = false;
      this.conversation = false;
      this.channel = false;
      this.isWSVisible = false;
    }

  }

  

  setReloadToFalse(reload: boolean){
    this.reloadChannel = false;
    console.log('reload from setReloadToFalse (main):')
    console.log('reload', this.reloadChannel)
  }





  changeWSVisibility(){
    if(this.isWSVisible){
      this.isWSVisible = false;
      this.channelBig = true;
    }
    else{
      this.isWSVisible = true;
      this.channelBig = false;
    }
  }
}
