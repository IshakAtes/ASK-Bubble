import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject} from '@angular/core';
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
  database = inject(DatabaseService)
  channelCache: Channel;
  
  hideUserInput: boolean = true;
  hideUserContainer: boolean = true;
  inputFocused: boolean =  false;
  
  searchUser: string = '';
  
  userlist: Array<User> = [];
  foundUserList: Array<User> = [];
  selectedUserList: Array<User> = [];
  memberIdList: Array<string> = [];


  @ViewChild('errorMsg') errorMessage: ElementRef

  resultRadioButton: string;
  

  constructor(public dialogRef: MatDialogRef<DialogAddChannelMembersComponent>, public dialog: MatDialog){
    this.database.loadAllUsers().then(allUsers =>{
      this.userlist = allUsers
    })
  }


  showFilteredUser(){
    this.foundUserList = this.userlist.filter((user) => user.name.toLowerCase().startsWith(this.searchUser));
  }


  selectUser(user: User){
    let doubleSelection: boolean = false
    this.selectedUserList.forEach(selectedUser => {
      if(selectedUser.email == user.email){doubleSelection = true;}
    })
    
    if(doubleSelection){
      this.errorMessage.nativeElement.innerHTML = 'Nutzer wurde bereits ausgewählt';
      this.inputFocused =  false;
      this.hideUserContainer = true;
      this.searchUser = '';
    }
    else{
      this.selectedUserList.push(user);
      this.setDefault();
      console.log(this.selectedUserList);
    }
  }

  removeUser(user: User){
    this.selectedUserList.splice(this.selectedUserList.indexOf(user), 1);
    this.setDefault();
  }


  setDefault(){
    this.inputFocused =  false;
    this.hideUserContainer = true;
    this.searchUser = '';
    this.errorMessage.nativeElement.innerHTML = '';
  }

  
  createNewChannel(){    
    if(this.resultRadioButton == "selection"){
      if(this.selectedUserList.length == 0){
        this.errorMessage.nativeElement.innerHTML = 'Bitte wählen Sie weitere Nutzer aus';
      }
      else{
        console.log('add selection to DB');
          /*
            this.selectedUserList.forEach(user => {
              this.memberIdList.push(user.userId)
            })
            this.database.addChannel(this.database.createChannel(this.channelCache.createdBy, this.channelCache.description, this.memberIdList, this.channelCache.name))
          */
      }
    }
    else{
      console.log('add team to DB');
    }
  }


  changeUserInputVisibility(value: string){
    if(value == 'hide'){
      this.hideUserInput = true;
    }
    else{
      this.hideUserInput = false;
    }
    console.log('check input focus error ');
  }



  changeUserContainerVisibility(){
    if(this.hideUserContainer){
      this.hideUserContainer = false;
    }
    else{
      this.hideUserContainer = true;
    }
    console.log('check input focus error ');
  }


  detectInputFocus(){
    if(this.inputFocused){
      this.inputFocused = false;
    }
    else{
      this.inputFocused = true;
    }
  }

}
