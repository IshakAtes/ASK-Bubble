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
  

 async groupReactions(messageList: Array<ConversationMessage> | Array<ChannelMessage> | Array<ThreadMessage> | Array<ChannelThreadMessage>) {
  console.log('messageList: ', messageList);
  console.log('reactions:', this.reactions);
  debugger;
  const groupedReactions = new Map<string, Array<{ emoji: string, count: number, users: string[] }>>();

    //TODO - Gedanken zur Lösung zum Emoji Thread Message Problem
    //Abfrage welche Art von message das ist von den 4 möglichen?
    //properties von "message" beim Typ Conversation/Chat Message 
    //sind unterschiedlich zu properties zu Thread channel/chat message
    //Muss ggf nicht abgefragt werden wenn reaction die neue property
    //"threadId" siehe Kommentar ab Z 39
    messageList.forEach(message => {
      const reactionMap = new Map<string, { count: number, users: string[] }>();
      //Bei Filter müsste was anderes oder etwas zusätzlich abgefragt werden 
      //wenn es sich um eine thread reaction handelt, sodass die Message von der ?
      //reaction ID von channel/chatmessage-reaction sieht so aus: CHA-MSG-REACT-Nr
      //reaction ID von channel/chatTHREADmessage-reaction sieht so aus: THR-MSG-REACT-Nr
      //reactions benötigt zusätzliche property namens "threadId", sodass beim Filtern
      //reaction.threadId auf message.threadId gefiltert werden kann
      //Steh noch offen, ob dieser Filter zusätzlich oder ersatzweise für 
      //channel/chat-Thread messages angewandt werden kann
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


  checkIfEmojiIsAlreadyInUsedLastEmojis(user:User,emoji: string, userId: string) {

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

