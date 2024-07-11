import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { UserService } from '../user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ChatComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent  {
  @Output() search: EventEmitter<string> = new EventEmitter<string>();

  @Output() showWorkspace = new EventEmitter<boolean>();
  @Input() isWSVisible: boolean;

  onSearch(event: any): void {
    this.search.emit(event.target.value);
  }

  constructor(public us: UserService){

  }

  viewWorkspace(){
    this.showWorkspace.emit(true)
  }

  openProfileDialog(){
    console.log('open profile Dialog')
  }

}
