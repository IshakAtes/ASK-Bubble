import { Component } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { Thread } from '../../models/thread.class';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

  currentThread: Thread | null = null;

  constructor(public chatComp: ChatComponent){
    this.chatComp.thread$.subscribe(thread => {
      this.currentThread = thread;
      console.log('current thread',  thread);
    });

  }

}
