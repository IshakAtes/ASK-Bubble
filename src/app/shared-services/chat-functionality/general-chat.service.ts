import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConversationMessage } from '../../../models/conversationMessage.class';
import { Reaction } from '../../../models/reactions.class';
import { ChannelMessage } from '../../../models/channelMessage.class';
import { User } from '../../../models/user.class';
import { DatabaseService } from '../../database.service';
import { ThreadMessage } from '../../../models/threadMessage';
import { ChannelThreadMessage } from '../../../models/channelThreadMessage';
import { UserService } from '../../user.service';

@Injectable({
  providedIn: 'root'
})
export class GeneralChatService {


  constructor(public databaseService: DatabaseService, public userService: UserService) { }

  private groupedReactions: BehaviorSubject<Map<string, Array<{ emoji: string, count: number, users: string[] }>>> = new BehaviorSubject(new Map());
  groupedReactions$ = this.groupedReactions.asObservable();
  reactions: Array<Reaction> = [];

  private groupedReactionsThread: BehaviorSubject<Map<string, Array<{ emoji: string, count: number, users: string[] }>>> = new BehaviorSubject(new Map());
  groupedReactionsThread$ = this.groupedReactions.asObservable();
  reactionsThread: Array<Reaction> = [];


  async groupReactions(messageList: Array<ConversationMessage> | Array<ChannelMessage>) {
    console.log('messageList: ', messageList);
    console.log('reactions:', this.reactions);
    const groupedReactions = new Map<string, Array<{ emoji: string, count: number, users: string[] }>>();
    messageList.forEach(message => {
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

      groupedReactions.set(
        message.messageId,
        Array.from(reactionMap.entries()).map(([emoji, { count, users }]) => ({ emoji, count, users }))
      );
    });

    this.groupedReactions.next(groupedReactions);
  }

  async groupReactionsThread(messageList: Array<ThreadMessage> | Array<ChannelThreadMessage>) {
    // debugger
    console.log('messageList: ', messageList);
    console.log('reactionsThread:', this.reactionsThread);
    console.log('reactions:', this.reactions);
    const groupedReactionsThread = new Map<string, Array<{ emoji: string, count: number, users: string[] }>>();
    messageList.forEach(message => {
      debugger
      const reactionMap = new Map<string, { count: number, users: string[] }>();
      this.reactionsThread
        .filter(reaction => reaction.messageId === message.threadMessageId)
        .forEach(reaction => {
          if (!reactionMap.has(reaction.emoji)) {
            reactionMap.set(reaction.emoji, { count: 0, users: [] });
          }
          const reactionData = reactionMap.get(reaction.emoji)!;
          reactionData.count += 1;
          reactionData.users.push(reaction.userName);
        });

      groupedReactionsThread.set(
        message.threadMessageId,
        Array.from(reactionMap.entries()).map(([emoji, { count, users }]) => ({ emoji, count, users }))
      );
      console.log('variable innerhalb funktion');
      console.log(groupedReactionsThread);
      
      
    });

    this.groupedReactionsThread.next(groupedReactionsThread);
    console.log(this.groupedReactionsThread);
    
  }


  checkIfEmojiIsAlreadyInUsedLastEmojis(user: User, emoji: string, userId: string) {

    let usedLastEmoji = user.usedLastTwoEmojis[0]

    let usedSecondEmoji = user.usedLastTwoEmojis[1]
    if (usedSecondEmoji != emoji && usedLastEmoji != emoji) {
      this.databaseService.updateUsedLastTwoEmojis(userId, usedSecondEmoji || usedLastEmoji, emoji)
    }
  }

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
    const userName = this.userService.activeUserObject.name;
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
    const userName = this.userService.activeUserObject.name;
    const userText = users.map(user => user === userName ? 'du' : user);

    if (userText.length === 1) {
      return userText[0] === 'du' ? 'hast darauf reagiert' : 'hat darauf reagiert';
    } else {
      return 'haben darauf reagiert';
    }
  }
}

