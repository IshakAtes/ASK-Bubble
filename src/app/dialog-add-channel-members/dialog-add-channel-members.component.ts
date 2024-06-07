import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Channel } from '../../models/channel.class';
import {MatRadioModule} from '@angular/material/radio'; 
import { MatDialog, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-dialog-add-channel-members',
  standalone: true,
  imports: [CommonModule, MatRadioModule],
  templateUrl: './dialog-add-channel-members.component.html',
  styleUrl: './dialog-add-channel-members.component.scss'
})
export class DialogAddChannelMembersComponent {
  channelCache: Channel;
  hidden: boolean = true;

  constructor(public dialogRef: MatDialogRef<DialogAddChannelMembersComponent>, public dialog: MatDialog){

    
  }

  changeUserInputVisibility(value: string){
    if(value == 'hide'){
      this.hidden = true;
    }
    else{
      this.hidden = false;
    }
  }

}
