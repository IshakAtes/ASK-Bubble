import { Component, OnInit, inject, OnChanges, AfterViewChecked, AfterViewInit } from '@angular/core';
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
  isWSVisible: boolean = true;
  channelBig: boolean = false;
  reloadChannel: boolean = false;
  



  currentConversation: Conversation;
  currentChannel: Channel;




  
  constructor(public userservice: UserService, public database: DatabaseService){
    
  }

  ngOnChanges(){
    console.log('triggered on change from main')
  }

  ngAfterViewInit(){
    console.log('triggered afterViewInit from main')
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
    this.userservice.loadActiveUserConversations();
    
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
