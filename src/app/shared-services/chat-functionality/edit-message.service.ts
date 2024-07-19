import { Injectable } from '@angular/core';
import { ConversationMessage } from '../../../models/conversationMessage.class';
import { DatabaseService } from '../../database.service';
import { ChannelMessage } from '../../../models/channelMessage.class';

@Injectable({
  providedIn: 'root'
})
export class EditMessageService {

  constructor(private data:DatabaseService,) { }
   isEditing: boolean = false;
   editContent: string = '';
   selectedMessageIdEdit: string | null = null;
 
   toggleMessageEdit(messageId: string) {
     if (this.selectedMessageIdEdit === messageId) {
       this.selectedMessageIdEdit = null;
     } else {
       this.selectedMessageIdEdit = messageId;
     }
   }
 
   editMessage(message: ConversationMessage | ChannelMessage) {
     this.toggleMessageEdit(message.messageId)
     this.isEditing = true;
     this.editContent = message.content;
   }
 
   cancelEditMessage() {
     this.isEditing = false;
     this.editContent = '';
     this.selectedMessageIdEdit = null;
   }
}
