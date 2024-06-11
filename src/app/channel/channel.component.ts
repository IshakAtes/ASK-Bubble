import { Component, ElementRef, inject, input, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Channel } from '../../models/channel.class';
import { User } from '../../models/user.class';
import { DatabaseService } from '../database.service';
import { ChannelMessage } from '../../models/channelMessage.class';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogAddAdditionalMemberComponent } from '../dialog-add-additional-member/dialog-add-additional-member.component';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent {

  //TestData
  channelId: string = 'CHA-BSHDDuLBHC0o8RKcrcr6'
  activeUser: string = 'p1oEblSsradmfVeyvTu3'


  //realData
  @Input() channel: Channel
  database = inject(DatabaseService);
  memberList: Array<User> = [];
  messageList: Array<ChannelMessage>
 


  constructor(public dialog: MatDialog){
    setTimeout(() => {
      console.log(this.channel)
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
    }, 500);

    setTimeout(() => {
      console.log('MemberList');
      console.log(this.memberList);
      console.log('MessageList');
      console.log(this.messageList);
    }, 2000);
  }

  showAddMember(){
    //this.dialog.open(DialogAddAdditionalMemberComponent)

    const channelInfo = this.dialog.open(DialogAddAdditionalMemberComponent)
    channelInfo.componentInstance.currentChannel = this.channel;
    
  }

}
