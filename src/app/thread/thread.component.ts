import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
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
  imports: [CommonModule, FormsModule, PickerModule,],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {



  //input Data from main component
  @Input() currentThread: Thread;

  @Input() specific: Conversation;
  @Input() user: User


  // TEST für Channel implementation
  @Input() currentChannelThread: ChannelThread;
  @Input() channelThread: boolean;
  @Input() currentChannel: Channel
  @Output() emitReloadChannel = new EventEmitter<Channel>()
  @Output() emitReloadChat = new EventEmitter<boolean>()
  @Output() emitReloadToFalse = new EventEmitter<boolean>()

  mainChannelMessage: ChannelMessage;
  channelThreadMessageList: Array<ChannelThreadMessage> = [];
  channelMemberList: Array<User> = [];
  //TEST ENDE


  sendingUser: User;
  passiveUser: User;

  @Output() emitCloseThread = new EventEmitter<string>();

  allUsers = [] as Array<User>;
  conversationThreadMessagelist: Array<ThreadMessage> = [];
  allChannels: Array<Channel> = [];
  reactions: Array<Reaction> = [];

  mainMessage: ConversationMessage;

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


    this.allChannels = mAndC.allChannels;
    this.allUsers = mAndC.allUsers;
    this.reactions = chat.reactions;
    //this.chat.groupedReactions$.subscribe(groupedReactions => {this.groupedReactions = groupedReactions;});
    const newContent = '';
    this.mAndC.contentThread.next(newContent);
    this.mAndC.contentThread.subscribe(newContent => {this.content = newContent;});
    this.handleFileUploadError();
    this.mAndC.getFocusTrigger().subscribe(() => {
      if (this.myTextarea) {
        this.myTextarea.nativeElement.focus();
      }
    });



    setTimeout(() => {
      this.loadMainMessage();
      setTimeout(() => {
        this.loadAllMessages();
        console.log('list');
        console.log(this.conversationThreadMessagelist);
      }, 1000);
    }, 1000);



    setTimeout(() => {
      this.isChatDataLoaded = true
      if (this.channelThread) {
        this.loadMemberList();
      }
    }, 3000);


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


  loadMainMessage() {
    if (this.channelThread) {
      //Logik, falls Thread durch Channel geöffnet wird
      setTimeout(() => {
        this.databaseService.loadSpecificChannelMessage(this.user.userId, this.currentChannelThread.channelId, this.currentChannelThread.messageId)
          .then(message => {
            this.mainChannelMessage = message;
            console.log('mainchannelMessage', this.mainChannelMessage); // Log nach dem Laden der Nachricht
          })
          .catch(error => {
            console.error('Error loading message:', error);
          });
      }, 1000);
    }
    else {
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
    if (this.channelThread) {
      //Logik, falls Thread durch Channel geöffnet wird
      this.databaseService.loadChannelThreadMessages(this.currentChannelThread).then(messageList => {
        this.channelThreadMessageList = messageList;
        this.channelThreadMessageList.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
        console.log('channelThreadMessageList');
        console.log(this.channelThreadMessageList);
      });
    }
    else {
      //Logik, falls Thread durch Conversation geöffnet wird
      this.databaseService.loadThreadMessages(this.currentThread).then(messageList => {
        this.conversationThreadMessagelist = messageList;
        this.conversationThreadMessagelist.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());

        console.log('list');
        console.log(this.conversationThreadMessagelist);
      });
    }
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
      this.chat.groupReactions(this.conversationThreadMessagelist)
    }, 500);


    this.chat.checkIfEmojiIsAlreadyInUsedLastEmojis(this.user, emoji, userId);
    this.mAndC.loadUsersOfUser();
    this.mAndC.loadChannlesofUser()

    this.mAndC.selectedMessageId = null;
  }



  loadAllMessageReactions() {
    if (this.channelThread) {
      //Logik, falls Thread durch Channel geöffnet wird
      for (let i = 0; i < this.channelThreadMessageList.length; i++) {
        const list = this.channelThreadMessageList[i];
        //TODO - neue Datenbankabfrage loadchannelThreadMessageReactions DONE!
        this.databaseService.loadChannelThreadMessageReactions(this.user.userId, this.currentChannel.channelId, list.messageId, list).then(reaction => {
          reaction.forEach(reaction => {
            this.reactions.push(reaction)
          });
        })
      }
    }
    else {
      //Logik, falls Thread durch Conversation geöffnet wird
      for (let i = 0; i < this.conversationThreadMessagelist.length; i++) {
        const list = this.conversationThreadMessagelist[i];
        //TODO - neue Datenbankabfrage loadConversationThreadMessageReactions
        this.databaseService.loadConversationMessagesReactions(this.user.userId, this.specific.conversationId, list.messageId).then(reaction => {
          reaction.forEach(reaction => {
            this.reactions.push(reaction)
          });
        })
      }
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
    if (this.content == '' && this.fileUpload.downloadURLThread == '') {
      this.displayEmptyContentError();
    } else {
      this.conversationThreadMessagelist = [];
      let newMessage: ThreadMessage = this.databaseService.createThreadMessage(this.specific, this.content, this.user.userId, this.currentThread, this.fileUpload.downloadURLThread)
      const timestamp: Timestamp = newMessage.createdAt;
      this.databaseService.addThreadMessage(this.currentThread, newMessage)
      this.content = '';
      const newContent = '';
      this.mAndC.contentThread.next(newContent);
      await this.databaseService.loadThreadMessages(this.currentThread).then(messageList => {
        this.conversationThreadMessagelist = messageList;
        this.conversationThreadMessagelist.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
      })
      const count: number = this.conversationThreadMessagelist.length;
      this.databaseService.updateMessageThreadCountAndThreadTime(newMessage, this.specific, count, timestamp)
      setTimeout(() => {
        this.scrollToBottom();
      }, 10);
      this.fileUpload.downloadURLThread = '';
      this.emitReloadChat.emit(true);
    }
  }

  /**
   * avoids sending empty messages
   */
  displayEmptyContentError() {
    this.fileUploadError = 'Das abschicken von leeren Nachrichten ist nicht möglich';
    setTimeout(() => {
      this.fileUploadError = null;
      console.log(this.fileUploadError);
    }, 2500);
  };



ngOnChanges() {
  


  if (!this.channelThread) {

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

    console.log('passiv', this.passiveUser);

    this.loadMainMessage();
    setTimeout(() => {
      this.loadAllMessages();
      console.log('list');
      console.log(this.conversationThreadMessagelist);
    }, 1000);
  }
  else {
    this.loadMainMessage();
    setTimeout(() => {
      this.loadAllMessages();
      console.log('list');
      console.log(this.conversationThreadMessagelist);
    }, 1000);
  }
}




// Scroll to the bottom of the chatarea 
scrollToBottom(): void {
  try {
    if(this.conversationThreadMessagelist.length > 0) {
  this.lastDiv.nativeElement.scrollIntoView();
}

    } catch (err) {
  console.error('Scroll to bottom failed', err);
}
  }

closeThread(){
  //debugger
  this.emitCloseThread.emit()
  
  //TEST for DATABASE QUERY
  // this.reactions = []
  // for (let i = 0; i < this.channelThreadMessageList.length; i++) {
  //   const list = this.channelThreadMessageList[i];
  //   this.databaseService.loadChannelThreadMessageReactions(this.user.userId, this.currentChannel.channelId, list.messageId, list).then(reaction => {
  //     reaction.forEach(reaction => {
  //       this.reactions.push(reaction)
  //       console.log(`reactions nach Durchlauf ${i}:`, this.reactions)
  //     });
  //   })
  // }

}




//NEW


/**
 * loads the memberlist of the channel
 * @returns  promise 
 */
loadMemberList(): Promise < void> {
  const memberPromises = this.currentChannel.membersId.map(member => {
    this.databaseService.loadUser(member)
      .then(user => {
        this.channelMemberList.push(user);
      })
  });
  return Promise.all(memberPromises).then(() => {
  });
}


async saveNewChannelThreadMessage() {
  if (this.content == '' && this.fileUpload.downloadURLThread == '') {
    this.displayEmptyContentError();
  } else {
  this.channelThreadMessageList = [];
  let newMessage: ChannelThreadMessage = this.databaseService.createChannelThreadMessage(this.currentChannel, this.content, this.user.userId, this.currentChannelThread, this.fileUpload.downloadURLThread)
  const timestamp: Timestamp = newMessage.createdAt;
  this.databaseService.addChannelThreadMessage(this.currentChannelThread, newMessage, this.currentChannel)
  this.content = '';
  const newContent = '';
  this.mAndC.contentThread.next(newContent);
  await this.databaseService.loadChannelThreadMessages(this.currentChannelThread).then(messageList => {
    this.channelThreadMessageList = messageList;
    this.channelThreadMessageList.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
  })
  const count: number = this.channelThreadMessageList.length;
  this.databaseService.updateMessageChannelThreadCountAndThreadTime(newMessage, this.currentChannel, count, timestamp)
  setTimeout(() => {
    this.scrollToBottom();
  }, 10);
  this.fileUpload.downloadURLThread = '';
  this.emitReloadChannel.emit()
}
}





updateChannelThreadMessage(message: ChannelThreadMessage){
  const updatedContent = this.edit.editContent;
  this.edit.isEditingThread = false;
  this.edit.selectedMessageIdEdit = null;
  message.content = updatedContent;
  this.databaseService.updateChannelThreadMessage(message, this.currentChannel)
  this.loadAllMessages();
}


async saveNewChannelMessageReaction(event: any, convo: ChannelThreadMessage, userId: string, reactionbar ?: string) {
  debugger;
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
  let reaction = this.databaseService.createChannelThreadMessageReaction(emoji, userId, this.user.name, convo);
  await this.databaseService.addChannelThreadMessageReaction(this.currentChannel, convo, reaction)
  await this.loadAllMessageReactions();


  // for (let i = 0; i < this.channelThreadMessageList.length; i++) {
  //   const list = this.channelThreadMessageList[i];
  //   this.databaseService.loadChannelThreadMessageReactions(this.user.userId, this.currentChannel.channelId, list.messageId, list).then(reaction => {
  //     debugger;
  //     reaction.forEach(reaction => {
  //       this.reactions.push(reaction)
  //     });

  //   })
  //   debugger;
  //   this.chat.reactions = this.reactions //überschreib die gefundene reactions wieder auf 0

  // }


  //TODO - Versuchsbereich um das Thread Emoji Problem zu lösen mit chatservice
  // reactions der ThreadNachricht werden korrekt geladen. Es werden grundsätzlich keine Emojis
  // im Thread angezeigt, da Sie durch das auskommentieren von Zeile 102 ausgeschaltet wurden
  // um die doppelte Anzeige der Emojis zu verhindern

  debugger;



  setTimeout(() => {
    //this.chat.groupReactions(this.channelThreadMessageList) //Wird auf die ChannelNachricht angewandt und nicht auf die ThreadNachricht
  }, 1000);


  this.chat.checkIfEmojiIsAlreadyInUsedLastEmojis(this.user, emoji, userId);
  this.mAndC.loadUsersOfUser();
  this.mAndC.loadChannlesofUser()
  this.mAndC.selectedMessageId = null;
}


}
