import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { UserService } from '../user.service';
<<<<<<< HEAD
import { User } from '../../models/user.class';
=======
>>>>>>> 8e54c9cb24e247765bef121199d1650f1ac487f7

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
  @Output() showWorkspace = new EventEmitter<boolean>();
  @Input() isWSVisible: boolean;
  
  constructor(public us: UserService) {
    console.log(this.us.loggedUser);
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
