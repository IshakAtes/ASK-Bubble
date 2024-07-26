import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject} from '@angular/core';
import { Channel } from '../../models/channel.class';
import {MatRadioModule} from '@angular/material/radio'; 
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user.class';
import { DatabaseService } from '../database.service';
import { FormsModule } from '@angular/forms';
import { DialogShowSelectedUserComponent } from '../dialog-show-selected-user/dialog-show-selected-user.component';
import { UserService } from '../user.service';

@Component({
  selector: 'app-dialog-add-members-from-settings',
  standalone: true,
  imports: [CommonModule, MatRadioModule, FormsModule],
  templateUrl: './dialog-add-members-from-settings.component.html',
  styleUrl: './dialog-add-members-from-settings.component.scss'
})
export class DialogAddMembersFromSettingsComponent {
  currentChannel: Channel;
  database = inject(DatabaseService)
  
  channelCache: Channel;
  
  hideUserInput: boolean = true;
  hideUserContainer: boolean = true;
  inputFocused: boolean =  false;
  
  activeUser: string = this.us.activeUserObject.userId
  searchUser: string = '';
  resultRadioButton: string;

  memberIdList: Array<string> = [];
  userlist: Array<User> = [];
  foundUserList: Array<User> = [];
  selectedUserList: Array<User> = [];



  newChannel: Channel;
  

  selectedListWidth240: boolean = false;
  selectedListWidthMobile: number;





  @ViewChild('errorMsg') errorMessage: ElementRef 
  @ViewChild('selectedList') selectedList: ElementRef 
 


  constructor(public dialogRef: MatDialogRef<DialogAddMembersFromSettingsComponent>, public dialog: MatDialog, public us: UserService){
    this.setUserlist();
  }

  setUserlist(){
    this.loadUserList();
    this.createPossibleUserSelection();
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
    this.database.updateChannelMembers(new Channel(this.currentChannel));
    this.setUserlist();
  }

  loadUserList(){
    this.database.loadAllUsers().then(allUsers =>{
      this.userlist = allUsers
      this.userlist.forEach(user => {
        if(user.userId == this.activeUser){
          this.userlist.splice(this.userlist.indexOf(user), 1);
        }
      })
    })
  }


  showFilteredUser(){
    this.foundUserList = this.userlist.filter((user) => user.name.toLowerCase().startsWith(this.searchUser));
  }


  selectUser(user: User){
    let doubleSelection: boolean = false
    this.selectedUserList.forEach(selectedUser => {if(selectedUser.email == user.email){doubleSelection = true;}})
    if(doubleSelection){
      this.errorMessage.nativeElement.innerHTML = 'Nutzer wurde bereits ausgewählt';
      this.inputFocused =  false;
      this.hideUserContainer = true;
      this.searchUser = '';
    }
    else{
      this.selectedUserList.push(user);
      this.setDefault();

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


  openSelectedUserList(){
    const userlistInfo = this.dialog.open(DialogShowSelectedUserComponent);
    userlistInfo.componentInstance.selectedUserList = this.selectedUserList;
  }
}
