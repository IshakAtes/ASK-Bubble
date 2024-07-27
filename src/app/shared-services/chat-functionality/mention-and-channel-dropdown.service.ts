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
    debugger
    const input = event.target.value;
    this.content.next(input); // Aktualisiere den Inhalt hier
    const lastChar = input[input.length - 1];
    console.log(lastChar);


    // Überprüfen, ob das letzte Zeichen ein Trigger-Zeichen ist
    if (lastChar === '#' || lastChar === '@') {
      console.log(lastChar);

      this.showDropdown = true;
      this.filterItems(input, lastChar);
    } else if (this.showDropdown) {
      // Überprüfen, ob der Eingabetext ein Trigger-Zeichen enthält
      const hashIndex = input.lastIndexOf('#');
      const atIndex = input.lastIndexOf('@');
      console.log('#', hashIndex);
      console.log('@', atIndex);

      debugger
      if (hashIndex === -1 && atIndex === -1) {
        this.showDropdown = false;
      } 
      else if (lastChar === ' ') {
        this.showDropdown = false;
      } 
      else {
        const triggerChar = hashIndex > atIndex ? '#' : '@';
        this.filterItems(input, triggerChar);
      }
    }
  }


  filterItems(input: string, triggerChar: string): void {
    const queryArray = input.split(triggerChar);
    const query = queryArray.length > 1 ? queryArray.pop()?.trim().toLowerCase() : '';

    if (query !== undefined) {
      if (triggerChar === '#') {
        this.filteredItems = this.allChannels.filter(channel => channel.name.toLowerCase().includes(query));
      } else if (triggerChar === '@') {
        this.filteredItems = this.allUsers.filter(user => user.name.toLowerCase().includes(query));
      }
    }
  }


  selectItem(item: User | Channel): void {
    const triggerChar = item.hasOwnProperty('channelId') ? '#' : '@';
    const currentContent = this.content.getValue();
    const inputParts = currentContent.split(triggerChar);

    // Verwende 'lastPart' nur, wenn es definiert ist
    const lastPart = inputParts.length > 0 ? inputParts.pop() : '';

    // Füge das ausgewählte Item in den bestehenden Text ein
    const newContent = inputParts.join(triggerChar) + `${triggerChar}${item.name} ` + (lastPart ? lastPart.split(' ').slice(1).join(' ') : '');

    this.content.next(newContent);
    this.showDropdown = false;
    this.triggerFocus();
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
