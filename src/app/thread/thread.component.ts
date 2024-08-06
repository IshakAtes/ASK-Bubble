import { AfterViewInit, Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { Thread } from '../../models/thread.class';
import { User } from '../../models/user.class';
import { Conversation } from '../../models/conversation.class';
import { ConversationMessage } from '../../models/conversationMessage.class';
import { Channel } from '../../models/channel.class';
import { Reaction } from '../../models/reactions.class';
import { BehaviorSubject, Observable } from 'rxjs';
import { DatabaseService } from '../database.service';
import { UserService } from '../user.service';
import { LastTwoEmojisService } from '../shared-services/chat-functionality/last-two-emojis.service';
import { TimeFormatingService } from '../shared-services/chat-functionality/time-formating.service';
import { MentionAndChannelDropdownService } from '../shared-services/chat-functionality/mention-and-channel-dropdown.service';
import { FileUploadService } from '../shared-services/chat-functionality/file-upload.service';
import { EditMessageService } from '../shared-services/chat-functionality/edit-message.service';
import { GeneralChatService } from '../shared-services/chat-functionality/general-chat.service';
import { ThreadService } from '../shared-services/thread.service';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent implements AfterViewInit {

  currentThread: Thread | null = null;

  //input Data from main component
  @Input() specific: Conversation;
  @Input() user: User

  sendingUser: User;
  passiveUser: User;

  @Output() changeReloadStatus = new EventEmitter<boolean>();

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

  @ViewChild(ChatComponent) chatComp: ChatComponent;

  constructor(
    public databaseService: DatabaseService,
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
    this.chat.groupedReactions$.subscribe(groupedReactions => {
      this.groupedReactions = groupedReactions;
      console.log('Updated groupedReactions:', this.groupedReactions);
    });

    this.mAndC.content.subscribe(newContent => {
      this.content = newContent;
    });

    this.fileUpload.fileUploadError$.subscribe(error => {
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

 
  ngAfterViewInit() {
    debugger
    this.chatComp.thread$.subscribe(thread => {
      this.currentThread = thread;
      console.log('Current thread:', thread);
    });
  }

//   ngOnChanges() {
//     // this.sendingUser = new User()
//     // this.passiveUser = new User()

//     //defining passiveUser if specific = ConversationWithSelf
//     if (this.specific.createdBy == this.specific.recipientId) {
//       this.databaseService.loadUser(this.specific.createdBy)
//         .then(creatorUser => {
//           if (creatorUser.userId == this.user.userId) {
//             this.passiveUser = creatorUser;
//           }

//         })
//     }

//     this.databaseService.loadUser(this.specific.createdBy)
//       .then(creatorUser => {
//         if (creatorUser.userId == this.user.userId) {
//           this.sendingUser = creatorUser;
//           console.log('this is the creatorUser', this.sendingUser)
//         }
//         else {
//           this.passiveUser = creatorUser;
//         }
//       })

//     this.databaseService.loadUser(this.specific.recipientId)
//       .then(recipientUser => {
//         if (recipientUser.userId == this.user.userId) {
//           this.sendingUser = recipientUser;
//           console.log('this is the recipientUser', this.passiveUser)
//         }
//         else {
//           this.passiveUser = recipientUser;
//         }
//       })

//       console.log('active', this.sendingUser);
      
//       console.log('passiv',this.passiveUser);
      
// }

  // thread$ = new BehaviorSubject<Thread | null>(null);

  // createOrOpenThread(message: ConversationMessage) {
  //   if (message.threadId !== '') {
  //     console.log('Thread already exists');
  //     this.databaseService.loadSpecificThread(message, this.sendingUser)
  //       .then(oldThread => {
  //         console.log(oldThread);
  //         this.thread$.next(oldThread); // Update the BehaviorSubject with the existing thread
  //       })
  //       .catch(error => console.error('Error loading thread:', error));
  //   } else {
  //     const thread: Thread = this.databaseService.createThread(message, this.sendingUser, this.passiveUser);
  //     console.log(thread);
  //     this.databaseService.addThread(thread)
  //     this.databaseService.updateMessageThreadId(thread)
  //     this.thread$.next(thread)
  //   }
  // }

}
