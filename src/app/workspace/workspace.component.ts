import { Component, inject, Output, EventEmitter, OnChanges, Input, output } from '@angular/core';
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
  @Output() changeToChannel = new EventEmitter<Channel>();
  @Output() changeToConversation = new EventEmitter<Conversation>();
  @Output() changeToNewConversation = new EventEmitter<Conversation>();
  


  constructor(public dialog: MatDialog, public us: UserService){  
    console.log('constructor of workspace triggered')
  }


  ngOnChanges(){
    console.log('workspace on change triggered')
  }

  openConversationWithSelf(userId: string){
    console.log('check if there is conversation with self: ', userId)
  }


  openConversation(conversation: Conversation){
    this.changeToConversation.emit(conversation);
  }

  openNewConversation(){
    this.changeToNewConversation.emit()
  }


  openChannel(channel: Channel){
    this.changeToChannel.emit(channel);
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