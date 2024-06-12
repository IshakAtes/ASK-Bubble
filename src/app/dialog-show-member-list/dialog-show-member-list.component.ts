import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Channel } from '../../models/channel.class';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../database.service';
import { User } from '../../models/user.class';
import { CommonModule } from '@angular/common';
import { DialogAddAdditionalMemberComponent } from '../dialog-add-additional-member/dialog-add-additional-member.component';

@Component({
  selector: 'app-dialog-show-member-list',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dialog-show-member-list.component.html',
  styleUrl: './dialog-show-member-list.component.scss'
})
export class DialogShowMemberListComponent {
  
  currentChannel: Channel
  database = inject(DatabaseService)
  userlist: Array<User> = [];


  constructor(public dialogRef: MatDialogRef<DialogShowMemberListComponent>, public dialog: MatDialog){
    this.setUserlist();
  }

  setUserlist(){
    setTimeout(() => {
      this.currentChannel.membersId.forEach(userId => {
        this.database.loadUser(userId)
          .then(user => {
            this.userlist.push(user);
          })
      })
    }, 100);
  }


  showAddMember(){
    const channelInfo = this.dialog.open(DialogAddAdditionalMemberComponent);
    channelInfo.componentInstance.currentChannel = this.currentChannel;
    this.dialogRef.close();
  }

}