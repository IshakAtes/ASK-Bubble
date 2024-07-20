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
import { UserService } from '../user.service';
import { TimeFormatingService } from '../shared-services/chat-functionality/time-formating.service';
import { EditMessageService } from '../shared-services/chat-functionality/edit-message.service';
import { FileUploadService } from '../shared-services/chat-functionality/file-upload.service';
import { GeneralChatService } from '../shared-services/chat-functionality/general-chat.service';
import { LastTwoEmojisService } from '../shared-services/chat-functionality/last-two-emojis.service';
import { MentionAndChannelDropdownService } from '../shared-services/chat-functionality/mention-and-channel-dropdown.service';
import { Reaction } from '../../models/reactions.class';
import { PickerModule } from '@ctrl/ngx-emoji-mart';



@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule, FormsModule, PickerModule],
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss', './channelResp.component.scss']
})
export class ChannelComponent implements OnInit {  

  //input Data from main component
  @Input() channel: Channel
  @Input() channelBig: boolean;
  @Input() reload: boolean;
  @Input() activeUser: User;


  //outputData to main component
  @Output() changeReloadStatus = new EventEmitter<boolean>();
  @Output() reloadWorkspaceStatus = new EventEmitter<boolean>();
  @Output() userLeftChannel = new EventEmitter<boolean>();
  @Output() updatedMemberList = new EventEmitter<boolean>();

  memberList: Array<User> = [];
  messageList: Array<ChannelMessage>
  channelCreator: User;

  reactions: Array<Reaction> = []; //Behaviour Subject wird noch hinzugefügt
  groupedReactions: Map<string, Array<{ emoji: string, count: number, users: string[] }>> = new Map();
  allChannels: Array<Channel> = [];
  allUsers = [] as Array<User>;
  
  isdataLoaded: boolean = false;

  content: string = '';
  fileUploadError: string | null = null;
 
  @ViewChild('main') main: ElementRef 
  @ViewChild('lastDiv') lastDiv: ElementRef<HTMLDivElement>;
  @ViewChild('myTextarea') myTextarea!: ElementRef<HTMLTextAreaElement>;

  constructor(public dialog: MatDialog, private database: DatabaseService, 
    public us: UserService,
    public editService: EditMessageService,
    public fileService: FileUploadService,
    public chatService: GeneralChatService,
    public twoEmoji: LastTwoEmojisService,
    public mAndC: MentionAndChannelDropdownService,
    public time: TimeFormatingService){
      this.allChannels = mAndC.allChannels;
      this.allUsers = mAndC.allUsers;
  
      this.reactions = chatService.reactions;
      this.chatService.groupedReactions$.subscribe(groupedReactions => {
        // debugger
        this.groupedReactions = groupedReactions;
        console.log('Updated groupedReactions:', this.groupedReactions);
      });
  
      this.mAndC.content.subscribe(newContent => {
        this.content = newContent;
      });
  
      this.fileService.fileUploadError$.subscribe(error => {
        this.fileUploadError = error;
        console.log(this.fileUploadError);
  
        setTimeout(() => {
          this.fileUploadError = null;
          console.log(this.fileUploadError);
        }, 2500);
      });
  
      this.mAndC.getFocusTrigger().subscribe(() => {
        if (this.myTextarea) {
          this.myTextarea.nativeElement.focus();
        }
      });
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
      }, 500);
    }
  }


  changeReload(){
    this.changeReloadStatus.emit()
  }

  reloadWorkspace(){
    this.reloadWorkspaceStatus.emit(true);
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


  loadAllMessageReactions() {
    for (let i = 0; i < this.messageList.length; i++) {
      const list = this.messageList[i];
      this.database.loadChannelMessagesReactions(this.activeUser.userId, this.channel.channelId, list.messageId)
      .then(reaction => {
        reaction.forEach(reaction => {
          this.reactions.push(reaction)
        });
      })
    }
  }



  saveNewMessage() {
    this.messageList = [];
    let newMessage: ChannelMessage = this.database.createChannelMessage(this.channel, this.content, this.activeUser.userId, this.fileService.downloadURL)

    this.database.addChannelMessage(this.channel, newMessage)

    this.content = '';

    this.database.loadChannelMessages(this.activeUser.userId, this.channel.channelId).then(messageList => {
      this.messageList = messageList;
      this.messageList.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
    })

    setTimeout(() => {
      this.scrollToBottom();
    }, 10);

    this.fileService.downloadURL = '';
  }

  //group reactions aus chatservice funktioniert noch nicht

  // save message reaction
  async saveNewMessageReaction(event: any, message: ChannelMessage, userId: string, reactionbar?: string) {
    let emoji: string
    if (reactionbar) {
      emoji = reactionbar
    } else {
      emoji = event.emoji.native
    }

    const userAlreadyReacted = this.reactions.some(reaction =>
      reaction.messageId === message.messageId && reaction.emoji === emoji && reaction.userId === userId
    );
    if (userAlreadyReacted) {
      console.log('User has already reacted with this emoji');
      return;
    }

    this.reactions = [];
    let reaction = this.database.createChannelMessageReaction(emoji, userId, this.activeUser.name, message);
    await this.database.addChannelMessageReaction(this.channel, message, reaction)
    await this.loadAllMessageReactions();

  
    //this.chatService.checkIfEmojiIsAlreadyInUsedLastEmojis(emoji, userId);  // Funktion wird in Service ausgelagert
    
    this.mAndC.loadUsersOfUser();
    this.mAndC.loadChannlesofUser()

    setTimeout(() => {
      this.chatService.groupReactions(this.messageList)
    }, 1000);
    this.mAndC.selectedMessageId = null;
  }


  // Edit Message
  updateMessage(message: ChannelMessage) {
    const updatedContent = this.editService.editContent;
    this.editService.isEditing = false;
    this.editService.selectedMessageIdEdit = null;
    message.content = updatedContent;
    this.database.updateChannelMessage(message, this.channel)
    this.loadChannelMessages();
  }

  
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.setFocus();
      this.scrollToBottom();
    }, 2000);
  }

  // Focusing tesxtarea after component is initilized 
  setFocus(): void {
    setTimeout(() => {
      this.myTextarea.nativeElement.focus();
    }, 10);
  }

  // Scroll to the bottom of the chatarea 
  scrollToBottom(): void {
    try {
      if(this.messageList.length > 0){
        this.lastDiv.nativeElement.scrollIntoView();
      }
      
    } catch (err) {
      console.error('Scroll to bottom failed', err);
    }
  }


  // Trigger click on fileupload input field
  @ViewChild('fileInput') fileInput!: ElementRef;

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }


  showAddMember(){
    const channelInfo = this.dialog.open(DialogAddAdditionalMemberComponent);
    channelInfo.componentInstance.currentChannel = this.channel;
    channelInfo.afterClosed().subscribe(result => {
      this.isdataLoaded = false;
      setTimeout(() => {
        this.isdataLoaded = true;
      }, 500);

    })
  }


  showMemberList(){
    const channelInfo = this.dialog.open(DialogShowMemberListComponent);
    channelInfo.componentInstance.currentChannel = this.channel;
  }


  showChannelSettings(){
    const channelInfo = this.dialog.open(DialogShowChannelSettingsComponent,{
      panelClass: 'customDialog'
    })
    
    channelInfo.componentInstance.currentChannel = this.channel;
    channelInfo.componentInstance.channelCreator = this.channelCreator;
    channelInfo.afterClosed().subscribe(result => {
      if(result){
        this.userLeftChannel.emit(true);
      }
    })
  }

}