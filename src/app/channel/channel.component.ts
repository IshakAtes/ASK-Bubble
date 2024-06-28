import { Component, ElementRef, Input, ViewChild, OnInit, Output, EventEmitter } from '@angular/core';
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
export class ChannelComponent implements OnInit {  

  //input Data from main component
  @Input() channel: Channel
  @Input() channelBig: boolean;
  @Input() reload: boolean;
  @Input() activeUser: User;


  //outputData to main component
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
    console.log('channel on change triggered')
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
    return Promise.all(memberPromises).then(() => {});
  }


  loadChannelCreator(): Promise<void>{
   return this.database.loadUser(this.channel.createdBy)
      .then(user =>{
        this.channelCreator = user;
    })
  }


  loadChannelMessages(): Promise<void>{
    return this.database.loadChannelMessages(this.activeUser.userId, this.channel.channelId)
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
    const channelInfo = this.dialog.open(DialogShowChannelSettingsComponent)
    channelInfo.componentInstance.currentChannel = this.channel;
    channelInfo.componentInstance.channelCreator = this.channelCreator;
    
    channelInfo.afterClosed()
    .subscribe((shouldReload: boolean) => {
      if (shouldReload){
        //TODO - ugly Solution with window.location.reload() https://stackoverflow.com/questions/72777325/angular-mat-dialog-refresh-page-upon-submit-and-not-close-dialog
       //window.location.reload();
       
      }  
      }
    );
    

   
  }

}