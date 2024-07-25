import { Component, inject, ElementRef, ViewChild, AfterViewInit, AfterContentInit } from '@angular/core';
import { User } from '../../models/user.class';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DatabaseService } from '../database.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Channel } from '../../models/channel.class';
import { DialogShowSelectedUserComponent } from '../dialog-show-selected-user/dialog-show-selected-user.component';
import { UserService } from '../user.service';


@Component({
  selector: 'app-dialog-add-additional-member',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dialog-add-additional-member.component.html',
  styleUrls: ['./dialog-add-additional-member.component.scss', './dialog-add-additional-memberResp.component.scss']
})
export class DialogAddAdditionalMemberComponent {

  database = inject(DatabaseService)
  
  currentChannel: Channel;
  newChannel: Channel;
  
  hideUserContainer: boolean = true;
  inputFocused: boolean =  false;

  selectedListWidthMobile: number;

  searchUser: string = '';

  userlist: Array<User> = [];
  foundUserList: Array<User> = [];
  selectedUserList: Array<User> = [];

  @ViewChild('errorMsg') errorMessage: ElementRef 
  @ViewChild('selectedList') selectedList: ElementRef 


  constructor(public dialogRef: MatDialogRef<DialogAddAdditionalMemberComponent>, public dialog: MatDialog, public us: UserService){
    this.setUserlist();
  }

  
  setUserlist(){
    this.loadUserList();
    this.createPossibleUserSelection();
  }
  

  loadUserList(){
    setTimeout(() => {
      this.userlist = [];
      this.database.loadAllUsers().then(allUsers =>{
        allUsers.forEach(member => {
          this.database.loadUser(member.userId)
            .then(user =>{
              this.userlist.push(user)
            })
        })
      })
    }, 100);
  }


  createPossibleUserSelection(){
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
      this.addUserToSelectedUserList(user)
    }
  }


  addUserToSelectedUserList(user: User){
    this.selectedUserList.push(user);
    this.setDefault();
    this.checkInputWidth();
  }


  checkInputWidth(){
    if(this.selectedList.nativeElement.offsetWidth > 500){
      this.selectedListWidthMobile = this.selectedList.nativeElement.offsetWidth
      console.log(this.selectedListWidthMobile)
    }
    else{
      this.selectedListWidthMobile = this.selectedList.nativeElement.offsetWidth
      console.log(this.selectedListWidthMobile)
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
    this.checkInputWidth();
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
    this.database.addChannel(this.newChannel);
  }


  updateChannel(){
    this.selectedUserList.forEach(user => {
      this.currentChannel.membersId.push(user.userId)
    })
    this.database.updateChannelMembers(this.currentChannel);
    this.setUserlist();
  }


  openSelectedUserList(){
    const userlistInfo = this.dialog.open(DialogShowSelectedUserComponent);
    
    userlistInfo.afterClosed().subscribe( () => {
      this.selectedUserList = userlistInfo.componentInstance.selectedUserList;
    })
    
    
    userlistInfo.componentInstance.selectedUserList = this.selectedUserList;
  }

}
