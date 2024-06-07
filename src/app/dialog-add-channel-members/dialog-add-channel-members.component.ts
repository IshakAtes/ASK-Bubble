import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Channel } from '../../models/channel.class';
import {MatRadioModule} from '@angular/material/radio'; 
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user.class';
import { DatabaseService } from '../database.service';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-dialog-add-channel-members',
  standalone: true,
  imports: [CommonModule, MatRadioModule, FormsModule],
  templateUrl: './dialog-add-channel-members.component.html',
  styleUrl: './dialog-add-channel-members.component.scss'
})
export class DialogAddChannelMembersComponent {
  channelCache: Channel;
  hideUserInput: boolean = true;
  hideSearch: boolean = true;
  database = inject(DatabaseService)
  userlist: Array<User> = [];
  searchUser: string = '';


  constructor(public dialogRef: MatDialogRef<DialogAddChannelMembersComponent>, public dialog: MatDialog){
    this.database.loadAllUsers().then(allUsers =>{
      this.userlist = allUsers
    })
    
  }

  
  showFilteredUser(): Promise<Array<User>>{
    return new Promise<Array<User>>((resolve, reject) => {
      this.database.loadAllUsers()
        .then(user =>{

        })
    })
  }

  changeUserInputVisibility(value: string){
    if(value == 'hide'){
      this.hideUserInput = true;
    }
    else{
      this.hideUserInput = false;
    }
  }

}
