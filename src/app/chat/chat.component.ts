import { Component, inject } from '@angular/core';
import { DatabaseService } from '../database.service';
import { Firestore } from 'firebase/firestore';
import { Conversation } from '../../models/conversation.class';
import { ConversationMessage } from '../../models/conversationMessage.class';
import { User } from '../../models/user.class';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  //firestore: Firestore = inject(Firestore);

  allUsers = [] as Array<User>;

  constructor(public databaseService: DatabaseService) {

    databaseService.loadAllUsers().then(userList => {
      this.allUsers.push(...userList);
      console.log('All Users:', this.allUsers);
    }).catch(error => {
      console.error('Fehler beim Laden der Benutzer:', error);
    });
  }


  online: boolean = true;
  showEmoticons: boolean = false;
  showMention: boolean = false;

  emoticons = ["angry-face.svg", "astonished-face.svg", "clapping-hands-sign.svg", "confounded-face.svg", "confused-face.svg", "crying-face.svg", "disappointed-but-relieved-face.svg", "disappointed-face.svg", "face-palm.svg", "face-savouring-delicious-food.svg", "face-screaming-in-fear.svg", "face-throwing-a-kiss.svg", "face-with-cold-sweat.svg", "face-with-look-of-triumph.svg", "face-with-open-mouth-and-cold-sweat.svg", "face-with-open-mouth.svg", "face-with-stuck-out-tongue-and-tightly-closed-eyes.svg", "face-with-stuck-out-tongue-and-winking-eye.svg", "fire.svg", "flexed-biceps.svg", "flushed-face.svg", "frowning-face-with-open-mouth.svg", "grimacing-face.svg", "grinning-face-with-smiling-eyes.svg", "grinning-face.svg", "handshake.svg", "heavy-black-heart.svg", "hugging-face.svg", "hushed-face.svg", "loudly-crying-face.svg", "nerd-face.svg", "neutral-face.svg", "ok-hand-sign.svg", "party-popper.svg", "person-raising-both-hands-in-celebration.svg", "pouting-face.svg", "raised-hand.svg", "relieved-face.svg", "rocket.svg", "sleeping-face.svg", "slightly-frowning-face.svg", "slightly-smiling-face.svg", "smiling-face-with-halo.svg", "smiling-face-with-heart-shaped-eyes.svg", "smiling-face-with-open-mouth-and-cold-sweat.svg", "smiling-face-with-open-mouth-and-smiling-eyes.svg", "smiling-face-with-open-mouth-and-tightly-closed-eyes.svg", "smiling-face-with-open-mouth.svg", "smiling-face-with-smiling-eyes.svg", "smiling-face-with-sunglasses.svg", "thinking-face.svg", "tired-face.svg", "upside-down-face.svg", "victory-hand.svg", "waving-hand-sign.svg", "white-heavy-check-mark.svg", "white-medium-star.svg", "white-smiling-face.svg", "winking-face.svg", "worried-face.svg"];


  toggleEmoticons() {
    if (this.showMention) {
      this.showMention =false;
    }
    this.showEmoticons = !this.showEmoticons;
  }

  toggleMention() {
    if (this.showEmoticons) {
      this.showEmoticons =false;
    }
    this.showMention = !this.showMention;
  }
}
