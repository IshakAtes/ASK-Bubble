import { Component, inject, ElementRef, ViewChild } from '@angular/core';
import { User } from '../../models/user.class';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DatabaseService } from '../database.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Channel } from '../../models/channel.class';

@Component({
  selector: 'app-dialog-add-additional-member',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dialog-add-additional-member.component.html',
  styleUrl: './dialog-add-additional-member.component.scss'
})
export class DialogAddAdditionalMemberComponent {
  
  //From dialog-add-channel-members.ts because of adding members to channel
  currentChannel: Channel;
  activeUser: string = 'p1oEblSsradmfVeyvTu3'

  newChannel: Channel;
 
  database = inject(DatabaseService)
 
  hideUserContainer: boolean = true;
  inputFocused: boolean =  false;
   
  searchUser: string = '';
 
  userlist: Array<User> = [];
  foundUserList: Array<User> = [];
  selectedUserList: Array<User> = [];


  @ViewChild('errorMsg') errorMessage: ElementRef 
  
  constructor(public dialogRef: MatDialogRef<DialogAddAdditionalMemberComponent>, public dialog: MatDialog){
    this.setUserlist();
  }


  setUserlist(){
    
    setTimeout(() => {
      this.database.loadAllUsers().then(allUsers =>{
        allUsers.forEach(member => {
          this.database.loadUser(member.userId)
            .then(user =>{
              this.userlist.push(user)
            })
        })
      })
    }, 100);


    setTimeout(() => {
      this.currentChannel.membersId.forEach(memberid => {
        this.userlist.forEach(user => {
          if(memberid == user.userId){
            this.userlist.splice(this.userlist.indexOf(user), 1)
          }
        })
      })
    }, 150);
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

  setDefault(){
    this.inputFocused =  false;
    this.hideUserContainer = true;
    this.searchUser = '';
    this.errorMessage.nativeElement.innerHTML = '';
  }

  removeUser(user: User){
    this.selectedUserList.splice(this.selectedUserList.indexOf(user), 1);
    this.setDefault();
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

  showFilteredUser(){
    this.foundUserList = this.userlist.filter((user) => user.name.toLowerCase().startsWith(this.searchUser));
  }


  addNewMembers(){
    if(this.selectedUserList.length == 0){
      this.errorMessage.nativeElement.innerHTML = 'Bitte wählen Sie weitere Nutzer aus';
    }
    else{
      this.newChannel = new Channel(this.currentChannel);
      

      console.log('add selection to DB');

      this.addChannelToNewMembers();
      this.updateChannel();
      this.dialogRef.close();
      
    }
  }

  addChannelToNewMembers(){
    this.newChannel.membersId = [];
    this.selectedUserList.forEach(user =>{
      this.newChannel.membersId.push(user.userId)
    })
    console.log('New channel filled with new Users')
    console.log(this.newChannel)
    this.database.addChannel(this.newChannel);
  }

  updateChannel(){
    this.selectedUserList.forEach(user => {
      this.currentChannel.membersId.push(user.userId)
    })
    console.log('updated channel filled with all users')
    console.log(this.currentChannel)
    this.database.updateChannelMembers(new Channel(this.currentChannel));
    this.setUserlist();
  }
}
