import { AfterViewInit, Component, ElementRef, ViewChild, OnChanges, SimpleChanges, Input } from '@angular/core';
import { DatabaseService } from '../database.service';
import { UserService } from '../user.service';
import { Timestamp } from 'firebase/firestore';
import { Conversation } from '../../models/conversation.class';
import { ConversationMessage } from '../../models/conversationMessage.class';
import { User } from '../../models/user.class';
import { Channel } from '../../models/channel.class';
import { FormsModule } from '@angular/forms';
import { PickerModule } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, PickerModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements AfterViewInit {
  allUsers = [] as Array<User>;

  messages = [] as Array<ConversationMessage>;
  //@Input() 
  list: Array<ConversationMessage> = [];
  dates: Array<string> = [];

  allConversations: Array<Conversation> = [];
  specificConversation: Array<Conversation> = [];

  allChannels: Array<Channel> = [];

  userId = 'p1oEblSsradmfVeyvTu3';
  conversationId = 'CONV-p1oEblSsradmfVeyvTu3';



  constructor(public databaseService: DatabaseService, public userService: UserService) {
    databaseService.loadSpecificUserConversation("p1oEblSsradmfVeyvTu3", "CONV-p1oEblSsradmfVeyvTu3").then(conversationObject => {
      this.specificConversation.push(conversationObject)

      console.log('specialconversation');
      console.log(this.specificConversation);
    });


    databaseService.loadConversationMessages(this.userId, this.conversationId).then(messageList => {
      this.list = messageList;
      this.list.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());

      console.log('list');
      console.log(this.list);
    });


    databaseService.loadAllUsers().then(userList => {
      this.allUsers = userList;
      console.log('All Users:', this.allUsers);
    }).catch(error => {
      console.error('Fehler beim Laden der Benutzer:', error);
    });


    databaseService.loadAllChannels().then(channel => {
      this.allChannels = channel;
      console.log('channels:');
      console.log(this.allChannels);
    })    
  }



  online: boolean = true;
  showEmoticons: boolean = false;
  showMention: boolean = false;

  content = '';


  saveNewMessage() {
    this.list = [];
    let newMessage: ConversationMessage = this.databaseService.createConversationMessage(this.specificConversation[0], this.content, this.userId)

    this.databaseService.addConversationMessage(this.specificConversation[0], newMessage)

    this.content = '';

    this.databaseService.loadConversationMessages(this.userId, this.conversationId).then(messageList => {

      this.list = messageList;
      this.list.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());

      console.log('list 2');
      console.log(this.list);
    }
    )
    setTimeout(() => {
      this.scrollToBottom();
    }, 10);
  }



  @ViewChild('myTextarea') myTextarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('lastDiv') lastDiv : ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    this.setFocus();
    setTimeout(() => {
      this.scrollToBottom();
    }, 1000);
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes['list']) {
  //     this.scrollToBottom();
  //   }
  // }

  // Focusing tesxtarea after component is initilized 
  setFocus(): void {
    this.myTextarea.nativeElement.focus();
  }

  // Scroll to the bottom of the chatarea 
  scrollToBottom(): void {
      try {
        this.lastDiv.nativeElement.scrollIntoView();
      } catch (err) {
        console.error('Scroll to bottom failed', err);
      }
  }

  // toggeling emoticons and mentions divs and selecting emoticons

  toggleEmoticons() {
    if (this.showMention) {
      this.showMention = false;
    }
    this.showEmoticons = !this.showEmoticons;
  }

  toggleMention() {
    if (this.showEmoticons) {
      this.showEmoticons = false;
    }
    this.showMention = !this.showMention;
  }

  addEmoji(event: any) {
    this.content = `${this.content}${event.emoji.native}`;
    this.showEmoticons = false;
  }

  addMention(mention: string){
    this.content = `${this.content} @${mention}`;
    this.showMention = false;
  }

  // Formating timestamp into date

  formatTimestamp(timestamp: Timestamp): Date {
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
    return new Date(date)
  }


  formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  formatDate(date: Date): string {
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];

    return `${dayName}, ${day} ${monthName}`;
  }
}