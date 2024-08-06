import { Injectable, Input } from '@angular/core';
import { Conversation } from '../../models/conversation.class';
import { User } from '../../models/user.class';
import { DatabaseService } from '../database.service';
import { BehaviorSubject } from 'rxjs';
import { Thread } from '../../models/thread.class';
import { ConversationMessage } from '../../models/conversationMessage.class';
import { UserService } from '../user.service';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {

  @Input() specific: Conversation;
  @Input() user: User

  sendingUser: User;
  passiveUser: User;

  constructor(public databaseService: DatabaseService, public loggedUser: UserService) { }

  ngOnChanges() {
    // this.sendingUser = new User()
    // this.passiveUser = new User()

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
}

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