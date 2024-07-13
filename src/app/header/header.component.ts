import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { UserService } from '../user.service';
import { User } from '../../models/user.class';
import { CommonModule, NgStyle } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ChatComponent, CommonModule, NgStyle], //Ist das noch notwendig
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent  {
  dropdownOpen: boolean = false;
  activeUser: User = this.us.loggedUser;
  
  @Output() search: EventEmitter<string> = new EventEmitter<string>(); //Ist das noch notwendig
  
  
  @Output() showWorkspace = new EventEmitter<boolean>();
  @Input() isWSVisible: boolean;


  
  constructor(public us: UserService) {}

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout() {
    // Füge hier die Logout-Logik hinzu, z.B. Aufruf einer Methode in UserService
    this.us.logout();
  }

  onSearch(event: any): void {
    this.search.emit(event.target.value); //Ist das noch notwendig
  }

  viewWorkspace(){
    this.showWorkspace.emit(true)
  }

  openProfileDialog(){
    console.log('open profile Dialog')
  }

}
