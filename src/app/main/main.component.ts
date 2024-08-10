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
import { Thread } from '../../models/thread.class';
import { ChannelThread } from '../../models/channelThread.class';

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
  thread: boolean = false;
  channelThread: boolean = false;
  
  
  currentConversation: Conversation;
  currentChannel: Channel;
  currentThread: Thread;
  currentChannelThread: ChannelThread;



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
      this.thread = false;
    }
    else{
      this.currentChannel = channel;
      this.conversation = false;
      this.channel = true;
      this.thread = false;
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
      this.thread = false;
    }
    else{
      this.currentChannel = channel;
      this.conversation = false;
      this.channel = true;
      this.thread = false;
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
      this.thread = false;
    }
    else{
      this.currentConversation = conversation;
      this.conversation = true;
      this.channel = false;
      this.isWSVisible = false;
      this.thread = false;
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


  openThread(thread: Thread){
    this.currentThread = thread;
    if(this.userservice.deviceWidth < 1200){
      this.thread = true;
      this.channelThread = false;
      this.conversation = false;
      this.channel = false;
    }
    else{
      this.thread = true;
      this.channelThread = false;
    }
  }

  /*TODO main component html config input variables channelThread and normal Thread */
  openChannelThread(thread: ChannelThread){
    this.currentChannelThread = thread;
    if(this.userservice.deviceWidth < 1200){
      this.thread = true;
      this.channelThread = true;
      this.conversation = false;
      this.channel = false;
    }
    else{
      this.thread = true;
      this.channelThread = true;
    }
  }

  
  /**
   * closes the open thread and returns the user to the
   * previous channel or conversation
   */
  closeThread(){
    if(this.channelThread){
      this.thread = false;
      this.channelThread = false;
      this.channel = true;
      this.conversation = false;
    }
    else{
      this.thread = false;
      this.channelThread = false;
      this.channel = false;
      this.conversation = true;
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
