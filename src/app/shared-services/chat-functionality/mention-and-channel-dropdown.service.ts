import { Injectable } from '@angular/core';
import { User } from '../../../models/user.class';
import { Channel } from '../../../models/channel.class';
import { DatabaseService } from '../../database.service';
import { BehaviorSubject } from 'rxjs';
import { UserService } from '../../user.service';

@Injectable({
  providedIn: 'root'
})
export class MentionAndChannelDropdownService {

  content: BehaviorSubject<string> = new BehaviorSubject<string>('');
  contentThread: BehaviorSubject<string> = new BehaviorSubject<string>('');
  allChannels: Array<Channel> = [];
  allUsers = [] as Array<User>;

  focusTrigger = new BehaviorSubject<void>(undefined);
  selectedMessageId: string | null = null;
  showEmoticons: boolean = false;
  showMention: boolean = false;
  showEmoticonsThread: boolean = false;
  showMentionThread: boolean = false;


  constructor(private data: DatabaseService, public userService: UserService) {
    this.loadUsersOfUser();
    this.loadChannlesofUser()
  }


  loadUsersOfUser() {
    this.data.loadAllUsers().then(userList => {
      this.allUsers = userList;
    }).catch(error => {
      // console.error('Fehler beim Laden der Benutzer:', error);
    });
  }


  loadChannlesofUser() {
    this.data.loadAllUserChannels(this.userService.activeUserObject.userId).then(channel => {
      this.allChannels = channel;

    })
  }


  //show dropdownmenu with mentions or channels 
  showDropdown: boolean = false;
  showDropdownThread: boolean = false;
  filteredItems: Array<User | Channel> = [];

  onInput(event: any, thread?: string): void {
    const input = event.target.value;
    if (thread) {
      this.contentThread.next(input);
    } else {
      this.content.next(input);
    }
    
    const cursorPosition = event.target.selectionStart;

    if (cursorPosition > 0) {
      const lastTypedChar = input[cursorPosition - 1];

      // Überprüfen, ob das zuletzt getippte Zeichen ein Trigger-Zeichen ist
      if (lastTypedChar === '#' || lastTypedChar === '@') {
        if (thread) {
          this.showDropdownThread = true;
        } else {
          this.showDropdown = true;
        }
        this.filterItems(input, lastTypedChar, cursorPosition);
      } else if (this.showDropdown) {
        // Überprüfen, ob der Eingabetext ein Trigger-Zeichen enthält
        const hashIndex = input.lastIndexOf('#', cursorPosition - 1);
        const atIndex = input.lastIndexOf('@', cursorPosition - 1);

        if (hashIndex === -1 && atIndex === -1) {
          if (thread) {
            this.showDropdownThread = false;
          } else {
            this.showDropdown = false; 
          }
        }
        else if (lastTypedChar === ' ' || cursorPosition === 0) {
          if (thread) {
            this.showDropdownThread = false;
          } else {
            this.showDropdown = false; 
          }
        }
        else {
          const triggerChar = hashIndex > atIndex ? '#' : '@';
          this.filterItems(input, triggerChar, cursorPosition);
        }
      }
    } else {
      if (thread) {
        this.showDropdownThread = false;
      } else {
        this.showDropdown = false; 
      }
    }
  }

  filterItems(input: string, triggerChar: string, cursorPosition: number): void {
    const queryArray = input.slice(0, cursorPosition).split(triggerChar);
    const query = queryArray.length > 1 ? queryArray.pop()?.trim().toLowerCase() : '';

    if (query !== undefined) {
      if (triggerChar === '#') {
        this.filteredItems = this.allChannels.filter(channel => channel.name.toLowerCase().includes(query));
      } else if (triggerChar === '@') {
        this.filteredItems = this.allUsers.filter(user => user.name.toLowerCase().includes(query));
      }
    }
  }


  selectItem(item: User | Channel, textarea: HTMLTextAreaElement, thread?: string): void {
    const triggerChar = item.hasOwnProperty('channelId') ? '#' : '@';
    const currentContent = textarea.value; // Den aktuellen Wert direkt aus der Textarea holen
    const cursorPosition = textarea.selectionStart;

    // Finde das letzte Trigger-Zeichen vor der aktuellen Cursor-Position
    const lastTriggerIndex = currentContent.lastIndexOf(triggerChar, cursorPosition - 1);

    // Teile den Inhalt in drei Teile auf: vor dem Trigger, das Trigger-Segment und nach dem Trigger
    const beforeTrigger = currentContent.slice(0, lastTriggerIndex);
    const afterTrigger = currentContent.slice(cursorPosition);

    // Füge das ausgewählte Item in den bestehenden Text ein
    const newContent = beforeTrigger + `${triggerChar}${item.name} ` + afterTrigger;

    // Aktualisiere das Textarea-Element und den BehaviorSubject-Wert
    textarea.value = newContent;
    if (thread) {
      this.contentThread.next(newContent);
      this.showDropdownThread = false;
    } else {
      this.content.next(newContent);
      this.showDropdown = false;
    }

    // Setze den Cursor ans Ende des neu eingefügten Texts
    const newCursorPosition = beforeTrigger.length + triggerChar.length + item.name.length + 1;
    textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    textarea.focus();
  }

  triggerFocus() {
    this.focusTrigger.next();
  }

  getFocusTrigger() {
    return this.focusTrigger.asObservable();
  }


  toggleEmoticons(thread?: string) {
    if (thread) {
      if (this.showMentionThread) {
        this.showMentionThread = false;
      }
      this.showEmoticonsThread = !this.showEmoticonsThread;
    } else {
      if (this.showMention) {
        this.showMention = false;
      }
      this.showEmoticons = !this.showEmoticons;
    }

  }


  toggleEmoticonsReactionbar(messageId: string) {
    if (this.selectedMessageId === messageId) {
      this.selectedMessageId = null;
    } else {
      this.selectedMessageId = messageId;
    }
  }

  toggleMention(thread?: string) {
    if (thread) {
      if (this.showEmoticonsThread) {
        this.showEmoticonsThread = false;
      }
      this.showMentionThread = !this.showMentionThread;
    } else {
      if (this.showEmoticons) {
        this.showEmoticons = false;
      }
      this.showMention = !this.showMention;
    }

  }

  addEmoji(event: any, thread?: string) {
    if (thread) {
      const currentValue = this.contentThread.value;
      const newValue = `${currentValue}${event.emoji.native}`;
      this.contentThread.next(newValue);
      this.showEmoticonsThread = false;
    } else {
      const currentValue = this.content.value;
      const newValue = `${currentValue}${event.emoji.native}`;
      this.content.next(newValue);
      this.showEmoticons = false;
      this.triggerFocus();
    }
  }

  addMention(mention: string, thread?: string) {
    if (thread) {
      const currentValue = this.contentThread.value;
      const newValue = `${currentValue} @${mention}`
      this.contentThread.next(newValue);
      this.showMentionThread = false;
    } else {
      const currentValue = this.content.value;
      const newValue = `${currentValue} @${mention}`
      this.content.next(newValue);
      this.showMention = false;
      this.triggerFocus();
    }
  }
}
