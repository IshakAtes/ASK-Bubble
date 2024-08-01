import { Component, inject} from '@angular/core';
import { WorkspaceComponent } from '../workspace/workspace.component';
import { ChannelComponent } from '../channel/channel.component';
import { ChatComponent } from '../chat/chat.component';
import { ThreadComponent } from '../thread/thread.component';
import { DatabaseService } from '../database.service';
import { Channel } from '../../models/channel.class';
import { UserService } from '../user.service';
import { CommonModule } from '@angular/common';
import { Conversation } from '../../models/conversation.class';
import { CreateConversationComponent } from '../create-conversation/create-conversation.component';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '../shared-services/auth.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [WorkspaceComponent, HeaderComponent , ChannelComponent, ChatComponent, ThreadComponent, CommonModule, CreateConversationComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent{
  authService = inject(AuthService);
  conversation: boolean = false;
  channel: boolean = false;
  isWSVisible: boolean = true;
  channelBig: boolean = false;
  reloadChannel: boolean = false;
  thread: boolean = true;
  
  currentConversation: Conversation;
  currentChannel: Channel;



  constructor(public userservice: UserService, public database: DatabaseService){
    userservice.getDeviceWidth();
    console.log(this.authService.checkUserStatus());
  }


  /**
   * opens a the channel view
   * @param channel channelobject
   */
  changeChannel(channel: Channel){
    if(this.userservice.deviceWidth > 850){
      this.getDesktopChannelView(channel);
    }
    else{
      this.getMobileChannelView(channel);
    }
  }


  /**
   * sets the variables according to deskotp view
   * @param channel channelobject
   */
  getDesktopChannelView(channel: Channel){
    //if switch happens between channels a reload is needed!
    if(this.channel){
      this.reloadChannel = true;
      this.currentChannel = channel;
      this.conversation = false;
      this.channel = true;
    }
    else{
      this.currentChannel = channel;
      this.conversation = false;
      this.channel = true;
    }
  }


  /**
   * sets the variables according to mobile view
   * @param channel channelobject
   */
  getMobileChannelView(channel: Channel){
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


  /**
   * changes the view to the an existing conversation
   */
  changeConversation(conversation: Conversation){
    if(this.userservice.deviceWidth > 850){
      this.currentConversation = conversation;
      this.conversation = true;
      this.channel = false;
    }
    else{
      this.currentConversation = conversation;
      this.conversation = true;
      this.channel = false;
      this.isWSVisible = false;
    }
  }


  /**
   * changes the view to the new conversation
   */
  changeNewConversation(){
    if(this.userservice.deviceWidth > 850){
      this.reloadChannel = false;
      this.conversation = false;
      this.channel = false;
      this.thread = false;
    }
    else{
      this.reloadChannel = false;
      this.conversation = false;
      this.channel = false;
      this.isWSVisible = false;
      this.thread = false;
    }
  }

  
  /**
  * reloads the channel component
  * @param reload boolean
  */
  setReloadToFalse(reload: boolean){
    this.reloadChannel = false;
  }


  /**
   * switches view to workspace
   */
  viewWorkspace(){
    this.isWSVisible = true
    this.channel = false;
    this.conversation = false;
  }


  /**
   * shows the default view after leaving a channel
   */
  userLeftChannel(){
    this.conversation = false;
    this.channel = false;
  }


  /**
   * changes the visibility of the workspace
   */
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
