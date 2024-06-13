import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { DatabaseService } from '../database.service';
import { FormsModule } from '@angular/forms';
import { Channel } from '../../models/channel.class';
import { DialogAddChannelMembersComponent } from '../dialog-add-channel-members/dialog-add-channel-members.component';

@Component({
  selector: 'app-dialog-create-channel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dialog-create-channel.component.html',
  styleUrl: './dialog-create-channel.component.scss'
})
export class DialogCreateChannelComponent {

  database = inject(DatabaseService)
  description: string;
  channelName: string;
  activeUser: string = 'p1oEblSsradmfVeyvTu3';
  channelCache: Channel;

  buttonDisabled: boolean = true;
  @ViewChild('errorMsg') errorMessage: ElementRef
  

  constructor(public dialogRef: MatDialogRef<DialogCreateChannelComponent>, public dialog: MatDialog){
    
  }

  checkContent(){
    if(this.channelName == ''){
      this.buttonDisabled = true;
    }
    else{
      this.buttonDisabled = false;
    }
  }

  validateContent(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) =>{
      this.database.loadAllChannels()
        .then(channelList => {
          let result = true;
           for (let channel of channelList) {
            if(this.channelName.toLowerCase() == channel.name.toLowerCase()){
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
  

  saveChannelInformation(){
    this.validateContent()
      .then(bool => {
        if(bool){
          this.channelCache = this.database.createChannel(this.activeUser, this.description, [], this.channelName)
          const channelInfo = this.dialog.open(DialogAddChannelMembersComponent)
          channelInfo.componentInstance.channelCache = this.database.createChannel(this.activeUser, this.description, [], this.channelName);
          this.dialogRef.close();
        }
        else{
          this.errorMessage.nativeElement.innerHTML = 'Channel-Name existiert bereits'
        }
      })
  }

}
