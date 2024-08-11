import { Injectable } from '@angular/core';
import { User } from '../../../models/user.class';
import { Channel } from '../../../models/channel.class';
import { DatabaseService } from '../../database.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MentionAndChannelDropdownService {

  content: BehaviorSubject<string> = new BehaviorSubject<string>('');
  allChannels: Array<Channel> = [];
  allUsers = [] as Array<User>;

  userId = 'Adxrm7CExizb76lVrknu';

  focusTrigger = new BehaviorSubject<void>(undefined);
  selectedMessageId: string | null = null;
  showEmoticons: boolean = false;
  showMention: boolean = false;


  constructor(private data: DatabaseService) {
    this.loadUsersOfUser();
    this.loadChannlesofUser()
  }


  loadUsersOfUser() {
    this.data.loadAllUsers().then(userList => {
      this.allUsers = userList;
      console.log('All Users:', this.allUsers);
    }).catch(error => {
      console.error('Fehler beim Laden der Benutzer:', error);
    });
  }


  loadChannlesofUser() {
    this.data.loadAllUserChannels(this.userId).then(channel => {
      this.allChannels = channel;
      console.log('channels:');
      console.log(this.allChannels);
    })
  }


  //show dropdownmenu with mentions or channels 
  showDropdown: boolean = false;
  filteredItems: Array<User | Channel> = [];

  onInput(event: any): void {
    const input = event.target.value;
    const cursorPosition = event.target.selectionStart;
  
    if (cursorPosition > 0) {
      const lastTypedChar = input[cursorPosition - 1];
  
      // Überprüfen, ob das zuletzt getippte Zeichen ein Trigger-Zeichen ist
      if (lastTypedChar === '#' || lastTypedChar === '@') {
        console.log(lastTypedChar);
  
        this.showDropdown = true;
        this.filterItems(input, lastTypedChar, cursorPosition);
      } else if (this.showDropdown) {
        // Überprüfen, ob der Eingabetext ein Trigger-Zeichen enthält
        const hashIndex = input.lastIndexOf('#', cursorPosition - 1);
        const atIndex = input.lastIndexOf('@', cursorPosition - 1);
        console.log('#', hashIndex);
        console.log('@', atIndex);
  
        if (hashIndex === -1 && atIndex === -1) {
          this.showDropdown = false;
        } 
        else if (lastTypedChar === ' ' || cursorPosition === 0) {
          this.showDropdown = false;
        } 
        else {
          const triggerChar = hashIndex > atIndex ? '#' : '@';
          this.filterItems(input, triggerChar, cursorPosition);
        }
      }
    } else {
      this.showDropdown = false; // Schließe das Dropdown, wenn kein Inhalt mehr vorhanden ist
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
  
  
  selectItem(item: User | Channel, textarea: HTMLTextAreaElement): void {
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
    this.content.next(newContent);
    this.showDropdown = false;
  
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


  toggleEmoticons() {
    if (this.showMention) {
      this.showMention = false;
    }
    this.showEmoticons = !this.showEmoticons;
  }


  toggleEmoticonsReactionbar(messageId: string) {
    if (this.selectedMessageId === messageId) {
      this.selectedMessageId = null;
    } else {
      this.selectedMessageId = messageId;
    }
  }

  toggleMention() {
    if (this.showEmoticons) {
      this.showEmoticons = false;
    }
    this.showMention = !this.showMention;
  }

  addEmoji(event: any) {
    const currentValue = this.content.value;  // Den aktuellen Wert auslesen
    const newValue = `${currentValue}${event.emoji.native}`;  // Neuen Wert zusammenstellen
    this.content.next(newValue);  // Neuen Wert in den BehaviorSubject setzen
    this.showEmoticons = false;
    this.triggerFocus();
  }

  addMention(mention: string) {
    const currentValue = this.content.value;
    const newValue = `${currentValue} @${mention}`
    this.content.next(newValue);
    this.showMention = false;
    this.triggerFocus();
  }
}
