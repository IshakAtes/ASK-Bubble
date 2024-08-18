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
  reloadChannel: boolean = false;
  reloadChat: boolean = false;
  thread: boolean = false;
  channelThread: boolean = false;

  channelBig: boolean = false;

  channelSizeSmaller: boolean = false;
  channelSizeSmall: boolean = false;
  channelSizeBig: boolean = true;
  channelSizeBigger: boolean = false;
  
  
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

      this.channelSizeSmaller = false;
      this.channelSizeSmall = false;
      this.channelSizeBig = true;
      this.channelSizeBigger = false;
    }
    else{
      this.currentChannel = channel;
      this.conversation = false;
      this.channel = true;
      this.thread = false;

      this.channelSizeSmaller = false;
      this.channelSizeSmall = false;
      this.channelSizeBig = true;
      this.channelSizeBigger = false;
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

      this.channelSizeSmaller = false;
      this.channelSizeSmall = false;
      this.channelSizeBig = true;
      this.channelSizeBigger = false;
    }
    else{
      this.currentConversation = conversation;
      this.conversation = true;
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
      this.reloadChat = true;
    }
    else{
      this.thread = true;
      this.channelThread = false;
      this.reloadChat = true;
      if(this.isWSVisible){
        this.channelSizeSmaller = true;
        this.channelSizeSmall = false;
        this.channelSizeBig = false;
        this.channelSizeBigger =  false;
      }
      else{
        this.channelSizeSmaller = false;
        this.channelSizeSmall = true;
        this.channelSizeBig = false;
        this.channelSizeBigger =  false;
      }
    }
  }


  
  openChannelThread(thread: ChannelThread){
    this.currentChannelThread = thread;
    this.reloadChannel = false;
    if(this.userservice.deviceWidth < 1200){
      this.thread = true;
      this.channelThread = true;
      this.conversation = false;
      this.channel = false;
      this.reloadChannel = true;
    }
    else{
      this.thread = true;
      this.channelThread = true;
      this.reloadChannel = true;
      if(this.isWSVisible){
        this.channelSizeSmaller = true;
        this.channelSizeSmall = false;
        this.channelSizeBig = false;
        this.channelSizeBigger =  false;
      }
      else{
        this.channelSizeSmaller = false;
        this.channelSizeSmall = true;
        this.channelSizeBig = false;
        this.channelSizeBigger =  false;
      }
    }


  }

  
  /**
   * closes the open thread and returns the user to the
   * previous channel or conversation
   */
  closeThread(){
    if(this.isWSVisible){
      this.channelSizeSmaller = false;
      this.channelSizeSmall = false;
      this.channelSizeBig = true;
      this.channelSizeBigger =  false;
    }
    else{
      this.channelSizeSmaller = false;
      this.channelSizeSmall = false;
      this.channelSizeBig = false;
      this.channelSizeBigger = true;
    }

    
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
    this.reloadChat = false;
  }

  setChannelReloadToTrue(){
    this.reloadChannel = true;
  }

  /**
   * triggers the ngonchange functions (empties chat messagelist to avoid duplicated messages in chat window )
   * @param reload 
   */
  setChatReloadToTrue(reload: boolean){
    this.reloadChat = true
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
      if(this.thread){
        this.isWSVisible = false;
        this.channelSizeSmaller = false;
        this.channelSizeSmall = true;
        this.channelSizeBig = false;
        this.channelSizeBigger =  false;
      }
      else{
        this.isWSVisible = false;
        this.channelSizeSmaller = false;
        this.channelSizeSmall = false;
        this.channelSizeBig = false;
        this.channelSizeBigger =  true;
      }
    }
    else{
      if(this.thread){
        this.isWSVisible = true;
        this.channelSizeSmaller = true;
        this.channelSizeSmall = false;
        this.channelSizeBig = false;
        this.channelSizeBigger =  false;
      }
      else{
        this.isWSVisible = true;
        this.channelSizeSmaller = false;
        this.channelSizeSmall = false;
        this.channelSizeBig = true;
        this.channelSizeBigger =  false;
      }
    }
  }

   /**
   * changes the view to the create new conversation
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

  searchQuery: string = '';

  onSearch(query: string) {
    this.searchQuery = query;
  }
}
