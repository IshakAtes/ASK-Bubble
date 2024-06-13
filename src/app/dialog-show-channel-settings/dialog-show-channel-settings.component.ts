import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { Channel } from '../../models/channel.class';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user.class';
import { DatabaseService } from '../database.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dialog-show-channel-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dialog-show-channel-settings.component.html',
  styleUrl: './dialog-show-channel-settings.component.scss'
})
export class DialogShowChannelSettingsComponent {
  currentChannel: Channel
  database = inject(DatabaseService)
  
  //id of spongebob l2RRMmucZi37mppmjU81

  activeUser: User;
  channelCreator: User;
  newChannelName: string = '';
  newChannelDescription: string = '';
  
  showEditNameInput: boolean = false;
  showEditDescriptionInput: boolean = false

 
  @ViewChild('errorMsg') errorMessage: ElementRef



  constructor(public dialogRef: MatDialogRef<DialogShowChannelSettingsComponent>, public dialog: MatDialog){
    this.database.loadUser('p1oEblSsradmfVeyvTu3')
      .then(user =>{
        this.activeUser = user;
    })
  }



  leaveChannel(){
    console.log('active user is leaving the channel: ' + this.activeUser.userId);
    this.dialogRef.close();
  }


  changeToEditView(value: string){
    if(value == 'name'){
      if(this.showEditNameInput){
        this.showEditNameInput = false;
      }
      else{
        this.showEditNameInput = true;
      }
    }
    else{
      if(this.showEditDescriptionInput){
        this.showEditDescriptionInput = false;
      }
      else{
        this.showEditDescriptionInput = true;
      }
    }
  }



  saveChangedChannelName(){
    this.validateContent()
    .then(bool => {
      if(bool){
        this.currentChannel.name = this.newChannelName;
        this.database.updateChannelName(new Channel(this.currentChannel))
        this.showEditNameInput = false;
      }
      else{
        this.errorMessage.nativeElement.innerHTML = 'Channel-Name existiert bereits'
      }
    })
  }



  validateContent(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) =>{
      this.database.loadAllChannels()
        .then(channelList => {
           let result = true;
           for (let channel of channelList) {
            if(this.newChannelName.toLowerCase() == channel.name.toLowerCase()){
              result = false;
              break;
            }
           }
           resolve(result);
          })
          .catch(error =>{
            reject(error)
          })
    },)
  }


  saveChangedChannelDescription(){
    console.log('save Channel Description: '  + this.newChannelDescription)
    this.currentChannel.description = this.newChannelDescription;
    this.database.updateChannelName(new Channel(this.currentChannel))
    this.showEditDescriptionInput = false;
  }



  setDefault(){
    this.errorMessage.nativeElement.innerHTML = '';
  }

  



  
}
