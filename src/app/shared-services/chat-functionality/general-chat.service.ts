import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConversationMessage } from '../../../models/conversationMessage.class';
import { Reaction } from '../../../models/reactions.class';
import { ChannelMessage } from '../../../models/channelMessage.class';
import { User } from '../../../models/user.class';
import { DatabaseService } from '../../database.service';

@Injectable({
  providedIn: 'root'
})
export class GeneralChatService {

  userId = 'Adxrm7CExizb76lVrknu';
  userName = 'Simon Weirauch';
  conversationId = 'CONV-HTMknmA28FP56EIqrtZo-0.4380479343879251';

  //Änderung nach FR
  constructor(public databaseService: DatabaseService) { }

  private groupedReactions: BehaviorSubject<Map<string, Array<{ emoji: string, count: number, users: string[] }>>> = new BehaviorSubject(new Map());
  groupedReactions$ = this.groupedReactions.asObservable();
  reactions: Array<Reaction> = [];
  

 async groupReactions(messageList: Array<ConversationMessage> | Array<ChannelMessage>) {
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

   //Änderung nach FR
  checkIfEmojiIsAlreadyInUsedLastEmojis(user:User,emoji: string, userId: string) {
     //Änderung nach FR
    let usedLastEmoji = user.usedLastTwoEmojis[0]
     //Änderung nach FR
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
}

