import { Component, EventEmitter, inject, Inject, Input, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user.class';
import { DatabaseService } from '../database.service';
import { UserService } from '../user.service';
import { Conversation } from '../../models/conversation.class';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dialog-show-user-profil',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './dialog-show-user-profil.component.html',
  styleUrl: './dialog-show-user-profil.component.scss'
})
export class DialogShowUserProfilComponent {
  userData: User;
  database = inject(DatabaseService)
  us = inject(UserService)
  editMode: boolean = false;

  @Input() activeUser: User

  @Output() changeToConversation = new EventEmitter<Conversation>();

  constructor(
    public dialogRef: MatDialogRef<DialogShowUserProfilComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) {
    this.userData = data.user;
    console.log('show User', this.userData);
  }


  openEditTemplate() {
    this.editMode = true;

  }


  // openNewConversation(){
  //   let newConversation = this.database.createConversation(this.userData.userId, this.userData.userId);
  //   this.database.addConversation(newConversation);
  //   this.us.loadActiveUserConversations();
    
  //   setTimeout(() => {
  //     this.dialogRef.close(newConversation);
  //   }, 400);
  // }


  openConversation(conversation: Conversation){
    console.log('click');
    this.changeToConversation.emit(conversation);
  }


  // openConversation(){
  //   console.log('click');
  //   this.changeToConversation.emit(this.us.activeUserOwnConversation);
  // }

  onClose(): void {
    this.editMode = false;
    this.dialogRef.close();
  }

}
