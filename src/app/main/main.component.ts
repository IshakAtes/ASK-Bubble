import { Component, inject } from '@angular/core';
import { WorkspaceComponent } from '../workspace/workspace.component';
import { ChannelComponent } from '../channel/channel.component';
import { ChatComponent } from '../chat/chat.component';
import { ThreadComponent } from '../thread/thread.component';
import { DatabaseService } from '../database.service';
import { Channel } from '../../models/channel.class';
import { UserService } from '../user.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [WorkspaceComponent, ChannelComponent, ChatComponent, ThreadComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  chat: boolean = false;
  currentChannel: Channel;

  database = inject(DatabaseService);
  userService = inject(UserService);

  //TestData
  channelId: string = 'CHA-BSHDDuLBHC0o8RKcrcr6'
  activeUser: string = 'p1oEblSsradmfVeyvTu3'



  
  constructor(){
    
    
    this.database.loadSpecificUserChannel(this.activeUser, this.channelId)
    .then(channel => {
      this.currentChannel = channel;

    })
    

    
  }

}
