import { Component, ElementRef, Input, ViewChild, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Channel } from '../../models/channel.class';
import { User } from '../../models/user.class';
import { DatabaseService } from '../database.service';
import { ChannelMessage } from '../../models/channelMessage.class';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
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
import { Conversation } from '../../models/conversation.class';
import { ConversationMessage } from '../../models/conversationMessage.class';
import { Thread } from '../../models/thread.class';
import { ChannelThread } from '../../models/channelThread.class';



@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule, FormsModule, PickerModule],
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.scss', './channelResp.component.scss']
})
export class ChannelComponent implements OnInit {

  @Input() channel: Channel
  @Input() channelBig: boolean;
  @Input() reload: boolean;
  @Input() activeUser: User;

  @Output() changeReloadStatus = new EventEmitter<boolean>();
  @Output() userLeftChannel = new EventEmitter<boolean>();
  @Output() updatedMemberList = new EventEmitter<boolean>();
  @Output() openConversation = new EventEmitter<Conversation>();
  @Output() emitThread = new EventEmitter<ChannelThread>();

  memberList: Array<User> = [];
  messageList: Array<ChannelMessage>
  reactions: Array<Reaction> = []; //Behaviour Subject wird noch hinzugefügt
  groupedReactions: Map<string, Array<{ emoji: string, count: number, users: string[] }>> = new Map();
  allChannels: Array<Channel> = [];
  allUsers = [] as Array<User>;

  channelCreator: User;

  content: string = '';

  isdataLoaded: boolean = false;
  fileUploadError: string | null = null;

  @ViewChild('main') main: ElementRef
  @ViewChild('lastDiv') lastDiv: ElementRef<HTMLDivElement>;
  @ViewChild('myTextarea') myTextarea!: ElementRef<HTMLTextAreaElement>;
  // Trigger click on fileupload input field
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(public dialog: MatDialog, private database: DatabaseService,
    public us: UserService,
    public editService: EditMessageService,
    public fileService: FileUploadService,
    public chatService: GeneralChatService,
    public twoEmoji: LastTwoEmojisService,
    public mAndC: MentionAndChannelDropdownService,
    public time: TimeFormatingService) {

    this.allChannels = mAndC.allChannels;
    this.allUsers = mAndC.allUsers;
    this.reactions = chatService.reactions;
    this.chatService.groupedReactions$.subscribe(groupedReactions => { this.groupedReactions = groupedReactions; });
    const newContent = '';
    this.mAndC.content.next(newContent);
    this.mAndC.content.subscribe(newContent => { this.content = newContent; });
    this.handleFileUploadError();
    this.mAndC.getFocusTrigger().subscribe(() => {
      if (this.myTextarea) {
        this.myTextarea.nativeElement.focus();
      }
    });
  }


  /**
   * handles the fileupload error
   */
  handleFileUploadError() {
    this.fileService.fileUploadError$.subscribe(error => {
      this.fileUploadError = error;
      setTimeout(() => {
        this.fileUploadError = null;
      }, 2500);
    });
  }


  /**
   * loads all needed data after DOM is loaded
   */
  ngOnInit() {
    this.memberList = [];
    this.messageList = [];
    setTimeout(() => {
      Promise.all([
        this.loadMemberList(),
        this.loadChannelMessages(),
        this.loadChannelCreator(),
        this.loadAllMessageReactions(),
      ]).then(() => {
        this.initializeChannel();
      }).catch(error => {
        console.log('this ', error)
      });
    }, 500);
  }


  /**
   * loads all message reactions and groups them after DOM
   * is loaded
   */
  initializeChannel() {
    this.loadAllMessageReactions()
    setTimeout(() => {
      this.chatService.groupReactions(this.messageList).then(() => {
      this.isdataLoaded = true;
    })
    }, 1000);
  }


  /**
   * reloads the data after a change happend in the channel
   */
  ngOnChanges() {
    if (this.reload) {
      this.memberList = [];
      this.messageList = [];
      this.isdataLoaded = false;
      setTimeout(() => {
        Promise.all([
          this.loadMemberList(),
          this.loadChannelMessages(),
          this.loadChannelCreator(),
        ]).then(() => {
          this.initializeChannelAfterChange()
        }).catch(error => { console.log('this ', error) });
      }, 1000);
    }
  }


  /**
   * loads all message reactions and groups them after something changed
   * in the channel
   */
  initializeChannelAfterChange() {
    this.loadAllMessageReactions()
    setTimeout(() => {
      this.chatService.groupReactions(this.messageList)
      .then(() => {
        //this.changeReload(); //Important to be able to load another channel
        this.isdataLoaded = true;
      })
    }, 1000);
  }


  /**
   * sets focus to message input field and scrolls to
   * newest message in the channel
   */
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.setFocus();
      this.scrollToBottom();
    }, 2000);
  }


  /**
   * sends the info to reload the channel to main component
   */
  changeReload() {
    this.changeReloadStatus.emit()
  }




  /**
   * loads the memberlist of the channel
   * @returns  promise 
   */
  loadMemberList(): Promise<void> {
    const memberPromises = this.channel.membersId.map(member => {
      this.database.loadUser(member)
        .then(user => {
          this.memberList.push(user);
        })
    });
    return Promise.all(memberPromises).then(() => { });
  }


  /**
   * loads the creator of the channel
   * @returns promise
   */
  loadChannelCreator(): Promise<void> {
    return this.database.loadUser(this.channel.createdBy)
      .then(user => {
        this.channelCreator = user;
      })
  }


  /**
   * loads all channel messages of the channel
   * @returns promise
   */
  loadChannelMessages(): Promise<void> {
    return this.database.loadChannelMessages(this.activeUser.userId, this.channel.channelId)
      .then(messages => {
        this.messageList = messages;
        this.messageList.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());

      })
  }


  /**
   * loads all message reactions of the messages in the channel
   */
  loadAllMessageReactions() {
    for (let i = 0; i < this.messageList.length; i++) {
      const list = this.messageList[i];
      this.database.loadChannelMessagesReactions(this.activeUser.userId, this.channel.channelId, list.messageId)
        .then(reactions => {
          reactions.forEach(reaction => {
            this.reactions.push(reaction)
          });
        })
    }
  }


  /**
   * saves the new message into the database and displays it in the chat area
   */
  saveNewMessage() {
    this.messageList = [];
    let newMessage: ChannelMessage = this.database.createChannelMessage(this.channel, this.content, this.activeUser.userId, this.fileService.downloadURL)
    this.database.addChannelMessage(this.channel, newMessage)
    this.content = '';
    const newContent = '';
    this.mAndC.content.next(newContent);
    this.database.loadChannelMessages(this.activeUser.userId, this.channel.channelId).then(messageList => {
      this.messageList = messageList;
      this.messageList.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
    })
    setTimeout(() => {
      this.scrollToBottom();
    }, 10);
    this.fileService.downloadURL = '';
  }


  /**
   * saves the message reaction to the database
   * @param event 
   * @param message channelmessage object
   * @param userId userid
   * @param reactionbar infos about the last two used emoji
   * @returns returns nothing if the user already used the selected emoji
   */
  async saveNewMessageReaction(event: any, message: ChannelMessage, userId: string, reactionbar?: string) {
    let emoji: string
    if (reactionbar) { emoji = reactionbar } else { emoji = event.emoji.native }
    const userAlreadyReacted = this.reactions.some(reaction => reaction.messageId === message.messageId && reaction.emoji === emoji && reaction.userId === userId);
    if (userAlreadyReacted) { console.log('User has already reacted with this emoji'); return; }
    this.reactions = [];
    let reaction = this.database.createChannelMessageReaction(emoji, userId, this.activeUser.name, message);
    await this.database.addChannelMessageReaction(this.channel, message, reaction)
    await this.loadAllMessageReactions();
    this.chatService.reactions = this.reactions;
    setTimeout(() => { this.chatService.groupReactions(this.messageList) }, 500);
    this.chatService.checkIfEmojiIsAlreadyInUsedLastEmojis(this.activeUser, emoji, userId);
    this.mAndC.loadUsersOfUser();
    this.mAndC.loadChannlesofUser()
    this.mAndC.selectedMessageId = null;
  }


  /**
   * updates the edited channel message to the database
   * @param message channelmessageobject
   */
  updateMessage(message: ChannelMessage) {
    const updatedContent = this.editService.editContent;
    this.editService.isEditing = false;
    this.editService.selectedMessageIdEdit = null;
    message.content = updatedContent;
    this.database.updateChannelMessage(message, this.channel)
    this.loadChannelMessages();
  }


  /**
   * focuses the inputfield of the textarea after
   * initialization
   */
  setFocus(): void {
    setTimeout(() => {
      this.myTextarea.nativeElement.focus();
    }, 10);
  }


  /**
   * scrolls to the newest message of the channel
   */
  scrollToBottom(): void {
    try {
      if (this.messageList.length > 0) {
        this.lastDiv.nativeElement.scrollIntoView();
      }
    } catch (err) {
      console.error('Scroll to bottom failed', err);
    }
  }


  /**
   * opens the dialog to upload a file
   */
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }


  /**
   * opens a dialog where new members can be added to the channel
   */
  showAddMember() {
    const channelInfo = this.dialog.open(DialogAddAdditionalMemberComponent);
    channelInfo.componentInstance.currentChannel = this.channel;
    channelInfo.afterClosed().subscribe(() => {
      this.isdataLoaded = false;
      this.memberList = [];
      this.loadMemberList().then(() => {
        this.isdataLoaded = true;
      })
    })
  }


  /**
   * opens the dialog with a list of all channel members
   */
  showMemberList() {
    const channelInfo = this.dialog.open(DialogShowMemberListComponent);
    channelInfo.componentInstance.currentChannel = this.channel;
    channelInfo.afterClosed().subscribe((conversation) => {
      if (conversation) {
        this.openConversation.emit(conversation)
      }
    })
  }


  /**
   * opens the dialog with the channel settings
   */
  showChannelSettings() {
    const channelInfo = this.dialog.open(DialogShowChannelSettingsComponent, {
      panelClass: 'customDialog'
    })
    channelInfo.componentInstance.currentChannel = this.channel;
    channelInfo.componentInstance.channelCreator = this.channelCreator;
    channelInfo.afterClosed().subscribe(result => {
      if (result) {
        this.userLeftChannel.emit(true);
      }
    })
  }


  createOrOpenThread(message: ChannelMessage) {
    if(message.threadId !== '') {
      console.log('Thread already exists');
      this.database.loadSpecificChannelThread(message, this.channel)
        .then(oldThread => {
          console.log(oldThread);
          this.openThread(oldThread);
        })
        .catch(error => console.error('Error loading thread:', error));
    } else {
      console.log('create new Thread');
      const thread: ChannelThread = this.database.createChannelThread(message, this.channel);
      console.log(thread);
      this.database.addChannelThread(thread, this.channel)
      this.database.updateMessageChannelThreadId(thread, this.channel)
      this.changeReload();
      this.openThread(thread);
      
    }
  

  }


  openThread(thread: ChannelThread) {
    this.emitThread.emit(thread)
  }

}