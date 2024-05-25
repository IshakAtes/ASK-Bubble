import { Component, inject } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, doc, onSnapshot } from '@angular/fire/firestore';
import { DatabaseService } from '../database.service';
import { User } from '../../models/user.class';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent {

firestore: Firestore = inject(Firestore);
database = inject(DatabaseService);

user = new User()

constructor(){  
  this.database.loadUsers();
  this.database.loadChannels();
  this.database.loadConversations();
  


  console.log(this.database.users);
  console.log(this.database.userChannels);
  console.log(this.database.userConversations);
}

createUser(){
  this.user.email = 'firstAttempt@dummy.de';
  this.user.name = 'firstAttempt';
  this.user.password = 'test';
  this.user.status = 'online';
  this.user.avatarUrl = 'avatar1';
}

}
