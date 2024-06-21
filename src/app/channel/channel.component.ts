import { Component, ElementRef, inject, input, Input, ViewChild, AfterViewInit, OnInit, OnChanges, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
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
import { timeout } from 'rxjs';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent implements OnInit {

  //TestData
  activeUser: string = 'p1oEblSsradmfVeyvTu3'
  activeUser1: string = 'l2RRMmucZi37mppmjU81'
  

  //realData
  @Input() channel: Channel
  @Input() channelBig: boolean;
  @Input() reload: boolean;


  @Output() changeReloadStatus = new EventEmitter<boolean>();

  memberList: Array<User> = [];
  messageList: Array<ChannelMessage>
  channelCreator: User;

  isdataLoaded: boolean = false;
 
  @ViewChild('main') main: ElementRef 

  constructor(public dialog: MatDialog, private database: DatabaseService){

  }

  ngOnInit(){
    this.memberList = [];
    this.messageList = [];
    setTimeout(() => {
      Promise.all([
        this.loadMemberList(),
        this.loadChannelMessages(),
        this.loadChannelCreator()
      ]).then(() => {
        this.isdataLoaded = true;
      }).catch(error => {
        console.log('this ', error)
      });
    }, 500);
    console.log('ngOnInit channel triggered')
  }


  changeReload(){
    this.changeReloadStatus.emit()
  }



  ngOnChanges(){
    console.log(this.reload);
    if(this.reload){
      this.memberList = [];
      this.messageList = [];
      this.isdataLoaded = false;
      setTimeout(() => {
        Promise.all([
          this.loadMemberList(),
          this.loadChannelMessages(),
          this.loadChannelCreator()
        ]).then(() => {
          this.changeReload(); //Important to be able to load another channel
          this.isdataLoaded = true;
        }).catch(error => {
          console.log('this ', error)
        });
      }, 250);
    }
  }



  loadMemberList(): Promise<void>{
    const memberPromises = this.channel.membersId.map(member => {
      this.database.loadUser(member)
        .then(user => {
          this.memberList.push(user);
        })
    });
    console.log(this.memberList);
    return Promise.all(memberPromises).then(() => {});
  }


  loadChannelCreator(): Promise<void>{
   return this.database.loadUser(this.channel.createdBy)
      .then(user =>{
        this.channelCreator = user;
    })
  }


  loadChannelMessages(): Promise<void>{
    return this.database.loadChannelMessages(this.activeUser, this.channel.channelId)
    .then(messages => {
      this.messageList = messages;
    })
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