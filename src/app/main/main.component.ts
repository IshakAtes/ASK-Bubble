import { Component, inject } from '@angular/core';
import { WorkspaceComponent } from '../workspace/workspace.component';
import { ChannelComponent } from '../channel/channel.component';
import { ChatComponent } from '../chat/chat.component';
import { ThreadComponent } from '../thread/thread.component';
import { DatabaseService } from '../database.service';
import { Channel } from '../../models/channel.class';
import { UserService } from '../user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [WorkspaceComponent, ChannelComponent, ChatComponent, ThreadComponent, CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  chat: boolean = false;
  

  database = inject(DatabaseService);
  userService = inject(UserService);

  currentChannel: Channel;

  //TestData
  channelId: string = 'CHA-BSHDDuLBHC0o8RKcrcr6'
  activeUser: string = 'p1oEblSsradmfVeyvTu3'

  isWSVisible: boolean = true;

  
  constructor(){
    
    //this.currentChannel = this.userService.currenChannel;

      this.database.loadSpecificUserChannel(this.activeUser, this.channelId)
      .then(channel => {
        this.currentChannel = channel;
      })




    /*
    this.database.loadSpecificUserChannel(this.activeUser, this.channelId)
    .then(channel => {
      this.currentChannel = channel;
    })
    */
 
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
