import { Injectable } from '@angular/core';
import { User } from '../../../models/user.class';
import { Channel } from '../../../models/channel.class';
import { DatabaseService } from '../../database.service';
import { ChatComponent } from '../../chat/chat.component';

@Injectable({
  providedIn: 'root'
})
export class MentionAndChannelDropdownService {

  content = '';
  allChannels: Array<Channel> = [];
  allUsers = [] as Array<User>;

  userId = 'Adxrm7CExizb76lVrknu';

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
    const lastChar = input[input.length - 1];

    // Überprüfen, ob das letzte Zeichen ein Trigger-Zeichen ist
    if (lastChar === '#' || lastChar === '@') {
      this.showDropdown = true;
      this.filterItems(input, lastChar);
    } else if (this.showDropdown) {
      // Überprüfen, ob der Eingabetext ein Trigger-Zeichen enthält
      const hashIndex = input.lastIndexOf('#');
      const atIndex = input.lastIndexOf('@');

      if (hashIndex === -1 && atIndex === -1) {
        this.showDropdown = false;
      } else {
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
    const inputParts = this.content.split(triggerChar);
    inputParts.pop();
    this.content = inputParts.join(triggerChar) + `${triggerChar}${item.name} `;
    this.showDropdown = false;
  }
}
