import { Component, ElementRef, inject, input, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Channel } from '../../models/channel.class';
import { User } from '../../models/user.class';
import { DatabaseService } from '../database.service';
import { ChannelMessage } from '../../models/channelMessage.class';
import { FormsModule } from '@angular/forms';
import { MatDialog} from '@angular/material/dialog';
import { DialogAddAdditionalMemberComponent } from '../dialog-add-additional-member/dialog-add-additional-member.component';
import { DialogShowMemberListComponent } from '../dialog-show-member-list/dialog-show-member-list.component';
import { DialogShowChannelSettingsComponent } from '../dialog-show-channel-settings/dialog-show-channel-settings.component';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent {

  //TestData
  activeUser: string = 'p1oEblSsradmfVeyvTu3'
  activeUser1: string = 'l2RRMmucZi37mppmjU81'
  


  //realData
  @Input() channel: Channel
  @Input() channelBig: boolean;
  database = inject(DatabaseService);
  memberList: Array<User> = [];
  messageList: Array<ChannelMessage>
  channelCreator: User;
 


  constructor(public dialog: MatDialog){
    setTimeout(() => {
      this.channel.membersId.forEach(member => {
        this.database.loadUser(member)
          .then(user => {
            this.memberList.push(user);
          })
      })

      this.database.loadChannelMessages(this.activeUser, this.channel.channelId)
        .then(messages => {
          this.messageList = messages;
      })

      this.database.loadUser(this.channel.createdBy)
        .then(user =>{
          this.channelCreator = user;
        })

    }, 500);
  }

  
  showAddMember(){
    const channelInfo = this.dialog.open(DialogAddAdditionalMemberComponent);
    channelInfo.componentInstance.currentChannel = this.channel;
  }


  showMemberList(){
    const channelInfo = this.dialog.open(DialogShowMemberListComponent);
    channelInfo.componentInstance.currentChannel = this.channel;
  }


  showChannelSettings(){
    const channelInfo = this.dialog.open(DialogShowChannelSettingsComponent);
    channelInfo.componentInstance.currentChannel = this.channel;
    channelInfo.componentInstance.channelCreator = this.channelCreator;
  }

}
