import { Component, OnInit, inject } from '@angular/core';
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
export class MainComponent{
  chat: boolean = false;
  

  database = inject(DatabaseService);
  userService = inject(UserService);

  currentChannel: Channel;
  

  //TestData
  channelId: string = 'CHA-BSHDDuLBHC0o8RKcrcr6'
  activeUser: string = 'p1oEblSsradmfVeyvTu3'

  isWSVisible: boolean = true;
  channelBig: boolean = false;
  reloadChannel: boolean = false;

  
  constructor(){
    

    this.database.loadSpecificUserChannel(this.activeUser, this.channelId)
    .then(channel => {
      this.currentChannel = channel;
    })
   
  }



  


  changeChannel(channel: Channel){
    
    console.log(channel)
    this.reloadChannel = true;
    console.log('reload from changeChannel: (main):', this.reloadChannel)
    this.currentChannel = channel;
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
