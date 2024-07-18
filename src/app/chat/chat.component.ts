import { AfterViewInit, Component, ElementRef, ViewChild, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, PickerModule, HeaderComponent, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements AfterViewInit, OnInit {
  allUsers = [] as Array<User>;
  user: User;

  messages = [] as Array<ConversationMessage>;
  list: Array<ConversationMessage> = [];
  dates: Array<string> = [];

  allConversations: Array<Conversation> = [];
  specificConversation: Array<Conversation> = [];

  allChannels: Array<Channel> = [];

  reactions: Array<Reaction> = [];
  groupedReactions: Map<string, Array<{ emoji: string, count: number, users: string[] }>> = new Map();
  userEmojis$: Observable<Array<string>>;

  // userId = 'HTMknmA28FP56EIqrtZo';
  // userName = 'Kerim Tasci';
  // conversationId = 'CONV-HTMknmA28FP56EIqrtZo-0.4380479343879251';

  userId = 'Adxrm7CExizb76lVrknu';
  userName = 'Simon Weirauch';
  conversationId = 'CONV-HTMknmA28FP56EIqrtZo-0.4380479343879251';
  ;

  /*test START Simon*/
  specific: Conversation;
  sendingUser: User;
  passiveUser: User;

  isChatDataLoaded: boolean = true;
  /*Test END Simon*/

  fileUploadError: string | null = null;

  constructor(public databaseService: DatabaseService,
    public userService: UserService,
    private lastTwoEmojiService: LastTwoEmojisService,
    public time: TimeFormatingService,
    public mAndC: MentionAndChannelDropdownService,
    public fileUpload: FileUploadService,
    public edit: EditMessageService,
  ) {


    this.allChannels = mAndC.allChannels;
    this.allUsers = mAndC.allUsers;

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

  ngOnInit(): void {
    this.isChatDataLoaded = false;
    this.loadAllMessages();


    // If loading user data via service is necessary 
    // this.userData.loadUserData().then(() => {
    //   this.user = this.userData.user;
    //   this.specific = this.userData.specific;
    //   this.sendingUser = this.userData.sendingUser;
    //   this.passiveUser = this.userData.passiveUser;
    // }).catch(error => {
    //   console.error('Error loading user data', error);
    // });
  
    
    this.databaseService.loadUser(this.userId).then(user => {
      this.user = user;
    })

    this.databaseService.loadSpecificUserConversation(this.userId, this.conversationId)
      .then(conversation => {
        this.specific = conversation;
        console.log('this is the searched Conversation', this.specific)

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
      })

    this.mAndC.loadUsersOfUser();
    this.mAndC.loadChannlesofUser();
    this.userEmojis$ = this.lastTwoEmojiService.watchUserEmojis(this.userId);
    


    setTimeout(() => {
      this.loadAllMessageReactions();
      console.log('reactions');
      console.log(this.reactions);
    }, 1500);


    setTimeout(() => {
      this.groupReactions();
      console.log('groupreaction');
      console.log(this.groupedReactions);
      this.isChatDataLoaded = true;
    }, 2000);
  }

  //load functions
  loadAllMessages() {
    this.databaseService.loadConversationMessages(this.userId, this.conversationId).then(messageList => {
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
      this.databaseService.loadConversationMessagesReactions(this.userId, this.conversationId, list.messageId).then(reaction => {
        reaction.forEach(reaction => {
          this.reactions.push(reaction)
        });
      })
    }
  }

  content = '';


//kopieren
  saveNewMessage() {
    this.list = [];
    let newMessage: ConversationMessage = this.databaseService.createConversationMessage(this.specific, this.content, this.userId, this.fileUpload.downloadURL)

    this.databaseService.addConversationMessage(this.specific, newMessage)

    this.content = '';

    this.databaseService.loadConversationMessages(this.userId, this.conversationId).then(messageList => {
      this.list = messageList;
      this.list.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
    })

    setTimeout(() => {
      this.scrollToBottom();
    }, 10);

    this.fileUpload.downloadURL = '';
  }

  // Auslagern Service
  // group together all reaction based on their messageId and count them to display the right count in html
  groupReactions() {
    this.groupedReactions = new Map();

    this.list.forEach(message => {
      const reactionMap = new Map<string, { count: number, users: string[] }>();

      this.reactions
        .filter(reaction => reaction.messageId === message.messageId)
        .forEach(reaction => {
          if (!reactionMap.has(reaction.emoji)) {
            reactionMap.set(reaction.emoji, { count: 0, users: [] });
          }
          const reactionData = reactionMap.get(reaction.emoji)!;
          reactionData.count += 1;
          reactionData.users.push(reaction.userName);
        });

      this.groupedReactions.set(
        message.messageId,
        Array.from(reactionMap.entries()).map(([emoji, { count, users }]) => ({ emoji, count, users }))
      );
    });
  }

  // Auslagern in Service - Daten aus user.service
  //display and hide the reaction info on hover and retun the right text based on reaction(s) creator(s)
  emojiInfoVisible: boolean = false;
  hoveredReaction: { emoji: string, count: number, users: string[] } | null = null;

  showTooltip(reaction: { emoji: string, count: number, users: string[] }) {
    this.hoveredReaction = reaction;
    this.emojiInfoVisible = true;
  }

  hideTooltip() {
    this.emojiInfoVisible = false;
    this.hoveredReaction = null;
  }

  getReactionUser(users: string[]): string {
    const userName = this.userName;
    const userText = users.map(user => user === userName ? 'du' : user);
    const formattedUserText = userText.map(user => `${user}`);

    if (userText.length === 1) {
      return formattedUserText[0];
    } else if (userText.length === 2) {
      return `${formattedUserText[0]} und ${formattedUserText[1]}`;
    } else {
      return `${formattedUserText.slice(0, -1).join(', ')} und ${formattedUserText[formattedUserText.length - 1]}`;
    }
  }

  getReactionText(users: string[]): string {
    const userName = this.userName;
    const userText = users.map(user => user === userName ? 'du' : user);

    if (userText.length === 1) {
      return userText[0] === 'du' ? 'hast darauf reagiert' : 'hat darauf reagiert';
    } else {
      return 'haben darauf reagiert';
    }
  }

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
    let reaction = this.databaseService.createConversationMessageReaction(emoji, userId, this.userName, convo);
    await this.databaseService.addConversationMessageReaction(this.specific, convo, reaction)
    await this.loadAllMessageReactions();

    // Funktion wird in Service ausgelagert
    this.checkIfEmojiIsAlreadyInUsedLastEmojis(emoji, userId);
    this.mAndC.loadUsersOfUser();
    this.mAndC.loadChannlesofUser()

    setTimeout(() => {
      this.groupReactions()
    }, 1000);

    this.mAndC.selectedMessageId = null;
  }

  //Auslagern in Service
  checkIfEmojiIsAlreadyInUsedLastEmojis(emoji: string, userId: string) {
    let usedLastEmoji = this.user.usedLastTwoEmojis[0]
    let usedSecondEmoji = this.user.usedLastTwoEmojis[1]
    if (usedSecondEmoji != emoji && usedLastEmoji != emoji) {
      this.databaseService.updateUsedLastTwoEmojis(userId, usedSecondEmoji || usedLastEmoji, emoji)
    }
  }

  @ViewChild('myTextarea') myTextarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('lastDiv') lastDiv: ElementRef<HTMLDivElement>;

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
      this.lastDiv.nativeElement.scrollIntoView();
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
}

