import { Component } from '@angular/core';
import { User } from '../../models/user.class';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Channel } from '../../models/channel.class';
import { DatabaseService } from '../database.service';
import { Conversation } from '../../models/conversation.class';
import { UserService } from '../user.service';

@Component({
  selector: 'app-dialog-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog-user-profile.component.html',
  styleUrl: './dialog-user-profile.component.scss'
})
export class DialogUserProfileComponent {
  shownUser: User;
  activeUser: User = this.userService.activeUserObject;
  conversationList: Array<Conversation> = this.userService.activeUserConversationList;

  constructor(public dialogRef: MatDialogRef<DialogUserProfileComponent>, public dialog: MatDialog, public database: DatabaseService, public userService : UserService){
    
  }



  openConversation(user: User){

    for(let conversation of this.conversationList){
      if(conversation.createdBy == this.activeUser.userId){
        if(conversation.recipientId == user.userId){
          this.dialogRef.close(conversation);
          break;
        }
        else if(conversation.createdBy == user.userId){
          if(conversation.recipientId == this.activeUser.userId){
            this.dialogRef.close(conversation);
            break;
          }
        }
      }
      else if(conversation.createdBy == user.userId){
        if(conversation.recipientId == this.activeUser.userId){
          this.dialogRef.close(conversation);
          break;
        }
        else if(conversation.createdBy == this.activeUser.userId){
          if(conversation.recipientId == user.userId){
            this.dialogRef.close(conversation);
            break;
          }
        }
      }
      else{
        if((this.conversationList.indexOf(conversation) +1) == this.conversationList.length) {
          this.openNewConversation(user);
        }
      }

    }
  }


  openNewConversation(user: User){
    let newConversation = this.database.createConversation(this.activeUser.userId, user.userId);
    this.database.addConversation(newConversation);
    this.userService.loadActiveUserConversations();
    
    setTimeout(() => {
      this.dialogRef.close(newConversation);
    }, 400);
  }



}
