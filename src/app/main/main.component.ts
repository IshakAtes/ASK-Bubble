import { Component, inject } from '@angular/core';
import { WorkspaceComponent } from '../workspace/workspace.component';
import { ChannelComponent } from '../channel/channel.component';
import { ChatComponent } from '../chat/chat.component';
import { ThreadComponent } from '../thread/thread.component';
import { DatabaseService } from '../database.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [WorkspaceComponent, ChannelComponent, ChatComponent, ThreadComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  chat: boolean = false;

  database = inject(DatabaseService);

  

  constructor(){
    
    
  }

}
