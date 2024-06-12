import { Component } from '@angular/core';
import { Channel } from '../../models/channel.class';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-show-channel-settings',
  standalone: true,
  imports: [],
  templateUrl: './dialog-show-channel-settings.component.html',
  styleUrl: './dialog-show-channel-settings.component.scss'
})
export class DialogShowChannelSettingsComponent {
  currentChannel: Channel

  constructor(public dialogRef: MatDialogRef<DialogShowChannelSettingsComponent>, public dialog: MatDialog){

  }
  
}
