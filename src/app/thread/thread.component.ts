import { AfterViewInit, Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { Thread } from '../../models/thread.class';
import { User } from '../../models/user.class';
import { Conversation } from '../../models/conversation.class';
import { ConversationMessage } from '../../models/conversationMessage.class';
import { Channel } from '../../models/channel.class';
import { Reaction } from '../../models/reactions.class';
import { Observable } from 'rxjs';
import { DatabaseService } from '../database.service';
import { UserService } from '../user.service';
import { LastTwoEmojisService } from '../shared-services/chat-functionality/last-two-emojis.service';
import { TimeFormatingService } from '../shared-services/chat-functionality/time-formating.service';
import { MentionAndChannelDropdownService } from '../shared-services/chat-functionality/mention-and-channel-dropdown.service';
import { FileUploadService } from '../shared-services/chat-functionality/file-upload.service';
import { EditMessageService } from '../shared-services/chat-functionality/edit-message.service';
import { GeneralChatService } from '../shared-services/chat-functionality/general-chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThreadMessage } from '../../models/threadMessage';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { Timestamp } from 'firebase/firestore';
import { ChannelThread } from '../../models/channelThread.class';
import { ChannelMessage } from '../../models/channelMessage.class';
import { ChannelThreadMessage } from '../../models/channelThreadMessage';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [CommonModule, FormsModule, PickerModule, ],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent{



  //input Data from main component
  @Input() currentThread: Thread;

  @Input() specific: Conversation;
  @Input() user: User


  // TEST für Channel implementation
  @Input() currentChannelThread: ChannelThread;
  @Input() channelThread: boolean;

  mainChannelMessage : ChannelMessage;
  channelList: Array<ChannelThreadMessage> = [];

  //TEST ENDE


  sendingUser: User;
  passiveUser: User;

  @Output() emitCloseThread = new EventEmitter<string>();

  allUsers = [] as Array<User>;
  list: Array<ThreadMessage> = [];
  allChannels: Array<Channel> = [];
  reactions: Array<Reaction> = [];

  mainMessage : ConversationMessage;

  isChatDataLoaded: boolean = false;
  userEmojis$: Observable<Array<string>>;
  fileUploadError: string | null = null;
  groupedReactions: Map<string, Array<{ emoji: string, count: number, users: string[] }>> = new Map();

  content = '';


  @ViewChild('myTextarea') myTextarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('lastDiv') lastDiv: ElementRef<HTMLDivElement>;

  @ViewChild('fileInput') fileInput!: ElementRef;

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

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


  //  setTimeout(() => {
  //   if(this.channelThread){
  //     console.log('opened by channel')
  //     console.log(this.channelThread)
  //     console.log(this.currentChannelThread)
  //   }
  //   else{
  //     console.log('opened by conversation')
  //     console.log(this.channelThread)
  //     console.log(this.currentThread)
  //   }
  //  }, 1000);


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



    if(this.channelThread){   
      //Logik, falls Thread durch Channel geöffnet wird
      this.loadMainMessage();
      setTimeout(() => {
        this.loadAllMessages();
        console.log('list');
        console.log(this.list);
      }, 1000);

      //TODO - functions für ChannelThread anpassen + Database functions schreiben und HTML checken:
      //loadAllMessages
      //savenewmessagereaction (convo parameter mit oder versehen?)
      //loadallmessagereactions
      //updatemessage
      //savenewmessage
      //ng on changes checken was relevant für channel ist
    }
    else{
      //Logik, falls Thread durch Conversation geöffnet wird
      this.loadMainMessage();
      setTimeout(() => {
        this.loadAllMessages();
        console.log('list');
        console.log(this.list);
      }, 1000);
    }


    setTimeout(() => {
      this.isChatDataLoaded = true
    }, 2000);

  }




  loadMainMessage() {
    if(this.channelThread){
      //Logik, falls Thread durch Channel geöffnet wird
      setTimeout(() => {
        this.databaseService.loadSpecificChannelMessage(this.user.userId, this.currentChannelThread.channelId, this.currentChannelThread.messageId)
          .then(message => {
            this.mainChannelMessage = message;
            console.log(this.mainChannelMessage); // Log nach dem Laden der Nachricht
          })
          .catch(error => {
            console.error('Error loading message:', error);
          });
      }, 1000);
    }
    else{
      //Logik, falls Thread durch Conversation geöffnet wird
      setTimeout(() => {
        this.databaseService.loadSpecificConversationMessage(this.user.userId, this.currentThread.conversationId, this.currentThread.messageId)
          .then(message => {
            this.mainMessage = message;
            console.log(this.mainMessage); // Log nach dem Laden der Nachricht
          })
          .catch(error => {
            console.error('Error loading message:', error);
          });
      }, 1000);
    }

  }


  loadAllMessages() {
    this.databaseService.loadThreadMessages(this.currentThread).then(messageList => {
      this.list = messageList;
      this.list.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
  
      console.log('list');
      console.log(this.list);
    });
  }







async saveNewMessageReaction(event: any, convo: ThreadMessage, userId: string, reactionbar?: string) {
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
  let reaction = this.databaseService.createThreadMessageReaction(emoji, userId, this.user.name, convo);
  await this.databaseService.addThreadMessageReaction(this.specific, convo, reaction)
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

updateMessage(message: ThreadMessage) {
  const updatedContent = this.edit.editContent;
  this.edit.isEditing = false;
  this.edit.selectedMessageIdEdit = null;
  message.content = updatedContent;

  this.databaseService.updateThreadMessage(message, this.specific).then(() => {
    console.log('Message updated successfully');
  }).catch(error => {
    console.error('Error updating message: ', error);
  });

  this.loadAllMessages();
}







async saveNewMessage() {
  this.list = [];
  let newMessage: ThreadMessage = this.databaseService.createThreadMessage(this.specific, this.content, this.user.userId, this.currentThread, this.fileUpload.downloadURL)
  const timestamp: Timestamp = newMessage.createdAt;
 


  this.databaseService.addThreadMessage(this.currentThread, newMessage)

  this.content = '';

  await this.databaseService.loadThreadMessages(this.currentThread).then(messageList => {
    this.list = messageList;
    this.list.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
  })

  const count: number = this.list.length;

  this.databaseService.updateMessageThreadCountAndThreadTime(newMessage, this.specific, count, timestamp)



  setTimeout(() => {
    this.scrollToBottom();
  }, 10);

  this.fileUpload.downloadURL = '';
}



ngOnChanges() {
  //     // this.sendingUser = new User()
  //     // this.passiveUser = new User()
  
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
  
        console.log('active', this.sendingUser);
        
        console.log('passiv',this.passiveUser);     
  }




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

  closeThread(){
    this.emitCloseThread.emit()
    console.log(this.currentThread)
    console.log(this.specific)
    console.log(this.user)
    console.log(this.fileUploadError);
    console.log(this.fileUpload.fileUploading);
  }

}
