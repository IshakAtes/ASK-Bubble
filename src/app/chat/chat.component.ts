import { AfterViewInit, Component, ElementRef, ViewChild, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DatabaseService } from '../database.service';
import { UserService } from '../user.service';
import { Conversation } from '../../models/conversation.class';
import { ConversationMessage } from '../../models/conversationMessage.class';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';
import { HeaderComponent } from '../header/header.component';
import { FormsModule } from '@angular/forms';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { Reaction } from '../../models/reactions.class';
import { LastTwoEmojisService } from '../shared-services/chat-functionality/last-two-emojis.service';
import { TimeFormatingService } from '../shared-services/chat-functionality/time-formating.service';
import { MentionAndChannelDropdownService } from '../shared-services/chat-functionality/mention-and-channel-dropdown.service';
import { EditMessageService } from '../shared-services/chat-functionality/edit-message.service';
import { FileUploadService } from '../shared-services/chat-functionality/file-upload.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { GeneralChatService } from '../shared-services/chat-functionality/general-chat.service';
import { Thread } from '../../models/thread.class';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, PickerModule, HeaderComponent, CommonModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss', './chatResp.component.scss']
})
export class ChatComponent implements AfterViewInit, OnInit {

  //input Data from main component
  @Input() specific: Conversation;
  @Input() user: User;
  @Input() reload: Boolean;

  @Output() changeReloadStatus = new EventEmitter<boolean>();

  sendingUser: User;
  passiveUser: User;


  allUsers = [] as Array<User>;
  list: Array<ConversationMessage> = [];
  allChannels: Array<Channel> = [];
  reactions: Array<Reaction> = [];

  isChatDataLoaded: boolean = true;
  userEmojis$: Observable<Array<string>>;
  fileUploadError: string | null = null;
  groupedReactions: Map<string, Array<{ emoji: string, count: number, users: string[] }>> = new Map();

  content = '';
  @ViewChild('myTextarea') myTextarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('lastDiv') lastDiv: ElementRef<HTMLDivElement>;

  @Output() emitThread = new EventEmitter<Thread>();


  constructor(public databaseService: DatabaseService,
    public userService: UserService,
    private lastTwoEmojiService: LastTwoEmojisService,
    public time: TimeFormatingService,
    public mAndC: MentionAndChannelDropdownService,
    public fileUpload: FileUploadService,
    public edit: EditMessageService,
    public chat: GeneralChatService,
  ) {

    this.allChannels = mAndC.allChannels;
    this.allUsers = mAndC.allUsers;
    this.reactions = chat.reactions;
    this.chat.groupedReactions$.subscribe(groupedReactions => { this.groupedReactions = groupedReactions; });
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
    this.fileUpload.fileUploadError$.subscribe(error => {
      this.fileUploadError = error;
      setTimeout(() => {
        this.fileUploadError = null;
      }, 2500);
    });
  }


  ngOnInit() {
    this.isChatDataLoaded = false;

    /*
    this.loadAllMessages().then(() => {
      this.initializeChat()
    });
    */


    this.databaseService.loadUser(this.specific.createdBy)
      .then(creatorUser => {
        if (creatorUser.userId == this.user.userId) {
          this.sendingUser = creatorUser;
          console.log('this is the creatorUser', this.sendingUser)
        }
        else {
          this.passiveUser = creatorUser;
        }
      })

    this.databaseService.loadUser(this.specific.recipientId)
      .then(recipientUser => {
        if (recipientUser.userId == this.user.userId) {
          this.sendingUser = recipientUser;
          console.log('this is the recipientUser', this.passiveUser)
        }
        else {
          this.passiveUser = recipientUser;
        }
      })

    this.mAndC.loadUsersOfUser();
    this.mAndC.loadChannlesofUser();
    this.userEmojis$ = this.lastTwoEmojiService.watchUserEmojis(this.user.userId);
  }


  /*wird ggf nicht gebraucht */
  // initializeChat() {

  //   this.loadAllMessageReactions()
  //   setTimeout(() => {
  //     this.chat.groupReactions(this.list).then(() => {
  //       this.isChatDataLoaded = true;
  //     })

  //   }, 1000);
  // }


  changeReload() {
    this.changeReloadStatus.emit()
  }


  openThread(thread: Thread) {
    this.emitThread.emit(thread)
  }

  ngOnChanges() {
    this.isChatDataLoaded = false;
    this.sendingUser = new User()
    this.passiveUser = new User()
    
    /*reset reactions and set reactions to observable to avoid double loading reactions*/
    this.chat.reactions = [];
    this.reactions = this.chat.reactions;
    this.chat.groupedReactions$.subscribe(groupedReactions => { this.groupedReactions = groupedReactions; });


    //defining passiveUser if specific = ConversationWithSelf
    if (this.specific.createdBy == this.specific.recipientId) {
      this.databaseService.loadUser(this.specific.createdBy)
        .then(creatorUser => {
          if (creatorUser.userId == this.user.userId) {
            this.passiveUser = creatorUser;
          }
        })
    }


    this.databaseService.loadUser(this.specific.createdBy)
      .then(creatorUser => {
        if (creatorUser.userId == this.user.userId) {
          this.sendingUser = creatorUser;
          console.log('this is the creatorUser', this.sendingUser)
        }
        else {
          this.passiveUser = creatorUser;
        }
      })

    this.databaseService.loadUser(this.specific.recipientId)
      .then(recipientUser => {
        if (recipientUser.userId == this.user.userId) {
          this.sendingUser = recipientUser;
          console.log('this is the recipientUser', this.passiveUser)
        }
        else {
          this.passiveUser = recipientUser;
        }
      })

    this.mAndC.loadUsersOfUser();
    this.mAndC.loadChannlesofUser();
    this.userEmojis$ = this.lastTwoEmojiService.watchUserEmojis(this.user.userId);


    this.loadAllMessages().then(() => {
      this.initializeChatAfterChange();
    })
  }



  initializeChatAfterChange() {
    this.loadAllMessageReactions();
    setTimeout(() => {
      this.chat.groupReactions(this.list)
        .then(() => {
          this.changeReload();
          this.isChatDataLoaded = true;
        });
    }, 1000);
  }


  //load functions
  loadAllMessages(): Promise<void> {
    return this.databaseService.loadConversationMessages(this.user.userId, this.specific.conversationId).then(messageList => {
      this.list = messageList;
      this.list.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
      console.log('list');
      console.log(this.list);
    });
  }

  //kopieren
  loadAllMessageReactions() {
    for (let i = 0; i < this.list.length; i++) {
      const list = this.list[i];
      this.databaseService.loadConversationMessagesReactions(this.user.userId, this.specific.conversationId, list.messageId).then(reaction => {
        reaction.forEach(reaction => {
          this.reactions.push(reaction)
        });
      })
    }
  }


  //kopieren
  saveNewMessage() {
    if (this.content == '' && this.fileUpload.downloadURL == '') {
      this.displayEmptyContentError();
    } else {
      this.list = [];
      let newMessage: ConversationMessage = this.databaseService.createConversationMessage(this.specific, this.content, this.user.userId, this.fileUpload.downloadURL)

      this.databaseService.addConversationMessage(this.specific, newMessage)

      this.content = '';
      const newContent = '';
      this.mAndC.content.next(newContent);

      this.databaseService.loadConversationMessages(this.user.userId, this.specific.conversationId).then(messageList => {
        this.list = messageList;
        this.list.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
      })

      setTimeout(() => {
        this.scrollToBottom();
      }, 10);

      this.fileUpload.downloadURL = '';
    }
  }

  displayEmptyContentError() {
    this.fileUploadError = 'Das abschicken von leeren Nachrichten ist nicht möglich';
    setTimeout(() => {
      this.fileUploadError = null;
      console.log(this.fileUploadError);
    }, 2500);
  };


  //kopieren
  // save message reaction
  async saveNewMessageReaction(event: any, convo: ConversationMessage, userId: string, reactionbar?: string) {
    let emoji: string
    if (reactionbar) {
      emoji = reactionbar
    } else {
      emoji = event.emoji.native
    }

    const userAlreadyReacted = this.reactions.some(reaction =>
      reaction.messageId === convo.messageId && reaction.emoji === emoji && reaction.userId === userId
    );
    if (userAlreadyReacted) {
      console.log('User has already reacted with this emoji');
      return;
    }

    this.reactions = [];
    let reaction = this.databaseService.createConversationMessageReaction(emoji, userId, this.user.name, convo);
    await this.databaseService.addConversationMessageReaction(this.specific, convo, reaction)
    await this.loadAllMessageReactions();


    this.chat.reactions = this.reactions

    setTimeout(() => {
      this.chat.groupReactions(this.list)
    }, 500);


    this.chat.checkIfEmojiIsAlreadyInUsedLastEmojis(this.user, emoji, userId);
    this.mAndC.loadUsersOfUser();
    this.mAndC.loadChannlesofUser()

    this.mAndC.selectedMessageId = null;
  }


  ngAfterViewInit(): void {
    setTimeout(() => {
      this.setFocus();
      this.scrollToBottom();
    }, 2000);
  }


  // später anschauen 
  // search messages
  filteredList: Array<ConversationMessage> = [];

  onSearch(query: string): void {
    if (query) {
      this.filteredList = this.list.filter(message =>
        message.content.toLowerCase().includes(query.toLowerCase())
      );
      this.list = this.filteredList;
    } else {
      this.loadAllMessages();
      setTimeout(() => {
        this.scrollToBottom();
      }, 10);
    }
  }

  //kopieren
  // Focusing tesxtarea after component is initilized 
  setFocus(): void {
    setTimeout(() => {
      this.myTextarea.nativeElement.focus();
    }, 10);
  }

  //kopieren
  // Scroll to the bottom of the chatarea 
  scrollToBottom(): void {
    try {
      if (this.list.length > 0) {
        this.lastDiv.nativeElement.scrollIntoView();
      }

    } catch (err) {
      console.error('Scroll to bottom failed', err);
    }
  }

  //kopieren
  // Trigger click on fileupload input field
  @ViewChild('fileInput') fileInput!: ElementRef;

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  //kopieren
  // Edit Message
  updateMessage(message: ConversationMessage) {
    const updatedContent = this.edit.editContent;
    this.edit.isEditing = false;
    this.edit.selectedMessageIdEdit = null;
    message.content = updatedContent;

    this.databaseService.updateMessage(message, this.specific).then(() => {
      console.log('Message updated successfully');
    }).catch(error => {
      console.error('Error updating message: ', error);
    });

    this.loadAllMessages();
  }

  createOrOpenThread(message: ConversationMessage) {
    if (message.threadId !== '') {
      console.log('Thread already exists');
      this.databaseService.loadSpecificThread(message, this.sendingUser)
        .then(oldThread => {
          console.log(oldThread);
          this.openThread(oldThread);
        })
        .catch(error => console.error('Error loading thread:', error));
    } else {
      const thread: Thread = this.databaseService.createThread(message, this.sendingUser, this.passiveUser);
      console.log(thread);
      this.databaseService.addThread(thread)
      this.databaseService.updateMessageThreadId(thread)
      this.ngOnChanges();
      this.openThread(thread);
    }
  }


}

