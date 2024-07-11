import { Component } from '@angular/core';
import { User } from '../../models/user.class';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog-user-profile.component.html',
  styleUrl: './dialog-user-profile.component.scss'
})
export class DialogUserProfileComponent {
  shownUser: User;

  constructor(public dialogRef: MatDialogRef<DialogUserProfileComponent>, public dialog: MatDialog){
    
  }

  openConversation(user: User){
    console.log('open conversation with user: ' + user.userId)
  }
}
