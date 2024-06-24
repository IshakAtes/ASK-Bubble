import { Component, inject, Output, EventEmitter, OnChanges, Input } from '@angular/core';
import { DatabaseService } from '../database.service';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';
import { Conversation } from '../../models/conversation.class';
import { CommonModule } from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import { DialogCreateChannelComponent } from '../dialog-create-channel/dialog-create-channel.component';
import { UserService } from '../user.service';
import { ChannelComponent } from '../channel/channel.component';



@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, ChannelComponent],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss'
})
export class WorkspaceComponent {
  database = inject(DatabaseService);
  userService = inject(UserService);
  


 // activeUser = new User()
  


  hideConversationBody: boolean = false;
  hideChannelBody: boolean = false;


  userSimon: string = 'simon@dummy.de';

  @Input() activeUserChannels: Array<Channel> 
  @Input() activeUserConversationList: Array<Conversation> 
  @Input() usersFromActiveUserConversationList: Array<User> 
  @Input() activeUser: User

  //output data to main component
  @Output() changeChannel = new EventEmitter<Channel>();
  


  constructor(public dialog: MatDialog, public us: UserService){  

    
    console.log('constructor of workspace triggered')
  }


  ngOnChanges(){
    console.log('workspace on change triggered')
  }


  openConversation(conversationId: string){
    console.log('opened conversation with conversationId: ' + conversationId);
  }


  openChannel(channel: Channel){
    this.changeChannel.emit(channel);
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
    this.dialog.open(DialogCreateChannelComponent)
  }
}