import { Component, EventEmitter, Output } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { UserService } from '../user.service';
import { User } from '../../models/user.class';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ChatComponent], //Ist das noch notwendig
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent  {
  activeUser: User = this.us.loggedUser;
  @Output() search: EventEmitter<string> = new EventEmitter<string>(); //Ist das noch notwendig

  constructor(public us: UserService) {
    console.log(this.us.loggedUser);
  }


  onSearch(event: any): void {
    this.search.emit(event.target.value); //Ist das noch notwendig
  }

}
