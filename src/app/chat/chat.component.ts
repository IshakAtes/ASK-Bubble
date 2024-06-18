import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DatabaseService } from '../database.service';
import { UserService } from '../user.service';
import { Timestamp } from 'firebase/firestore';
import { Conversation } from '../../models/conversation.class';
import { ConversationMessage } from '../../models/conversationMessage.class';
import { User } from '../../models/user.class';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements AfterViewInit {
  allUsers = [] as Array<User>;

  messages = [] as Array<ConversationMessage>;
  list: Array<ConversationMessage> = [];

  allConversations: Array<Conversation> = [];
  specificConversation: Array<Conversation> = [];

  userId = 'p1oEblSsradmfVeyvTu3';
  conversationId = 'CONV-p1oEblSsradmfVeyvTu3';



  constructor(public databaseService: DatabaseService, public userService: UserService) {

    databaseService.loadAllUsers().then(userList => {
      this.allUsers = userList;
      console.log('All Users:', this.allUsers);
    }).catch(error => {
      console.error('Fehler beim Laden der Benutzer:', error);
    });



    databaseService.loadConversationMessages(this.userId, this.conversationId).then(messageList => {
      this.list = messageList;

      console.log('list');
      console.log(this.list);
    }
    )

    databaseService.loadAllConversations().then(convo => {
      this.allConversations = convo;
      console.log('converstions:');
      console.log(this.allConversations);


    })



    databaseService.loadSpecificUserConversation("p1oEblSsradmfVeyvTu3", "CONV-p1oEblSsradmfVeyvTu3").then(conversationObject => {
      this.specificConversation.push(conversationObject)

      console.log('specialconversation');
      console.log(this.specificConversation);
    }
    )
  }



  online: boolean = true;
  showEmoticons: boolean = false;
  showMention: boolean = false;

  content = '';

  emoticons = ["angry-face.svg", "astonished-face.svg", "clapping-hands-sign.svg", "confounded-face.svg", "confused-face.svg", "crying-face.svg", "disappointed-but-relieved-face.svg", "disappointed-face.svg", "face-palm.svg", "face-savouring-delicious-food.svg", "face-screaming-in-fear.svg", "face-throwing-a-kiss.svg", "face-with-cold-sweat.svg", "face-with-look-of-triumph.svg", "face-with-open-mouth-and-cold-sweat.svg", "face-with-open-mouth.svg", "face-with-stuck-out-tongue-and-tightly-closed-eyes.svg", "face-with-stuck-out-tongue-and-winking-eye.svg", "fire.svg", "flexed-biceps.svg", "flushed-face.svg", "frowning-face-with-open-mouth.svg", "grimacing-face.svg", "grinning-face-with-smiling-eyes.svg", "grinning-face.svg", "handshake.svg", "heavy-black-heart.svg", "hugging-face.svg", "hushed-face.svg", "loudly-crying-face.svg", "nerd-face.svg", "neutral-face.svg", "ok-hand-sign.svg", "party-popper.svg", "person-raising-both-hands-in-celebration.svg", "pouting-face.svg", "raised-hand.svg", "relieved-face.svg", "rocket.svg", "sleeping-face.svg", "slightly-frowning-face.svg", "slightly-smiling-face.svg", "smiling-face-with-halo.svg", "smiling-face-with-heart-shaped-eyes.svg", "smiling-face-with-open-mouth-and-cold-sweat.svg", "smiling-face-with-open-mouth-and-smiling-eyes.svg", "smiling-face-with-open-mouth-and-tightly-closed-eyes.svg", "smiling-face-with-open-mouth.svg", "smiling-face-with-smiling-eyes.svg", "smiling-face-with-sunglasses.svg", "thinking-face.svg", "tired-face.svg", "upside-down-face.svg", "victory-hand.svg", "waving-hand-sign.svg", "white-heavy-check-mark.svg", "white-medium-star.svg", "white-smiling-face.svg", "winking-face.svg", "worried-face.svg"];


  emojis: string[] = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
    '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
    '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
    '🤢', '🤮', '🤧', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯',
    '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩',
    '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽',
    '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'
  ];


  saveNewMessage() {
    this.list = [];
    let newMessage: ConversationMessage = this.databaseService.createConversationMessage(this.specificConversation[0], this.content, this.userId)

    this.databaseService.addConversationMessage(this.specificConversation[0], newMessage)

    this.content = '';

    this.databaseService.loadConversationMessages(this.userId, this.conversationId).then(messageList => {
      this.list = messageList;

      console.log('list 2');
      console.log(this.list);
    }
    )
  }

  // Focusing tesxtarea after component is initilized 

  @ViewChild('myTextarea') myTextarea!: ElementRef<HTMLTextAreaElement>;

  ngAfterViewInit(): void {
    // Setze den Fokus auf die Textarea, sobald die Komponente initialisiert ist
    this.setFocus();
  }

  setFocus(): void {
    this.myTextarea.nativeElement.focus();
  }

  // toggeling emoticons and mentions

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