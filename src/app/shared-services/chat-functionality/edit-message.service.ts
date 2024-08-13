import { Injectable } from '@angular/core';
import { ConversationMessage } from '../../../models/conversationMessage.class';
import { DatabaseService } from '../../database.service';
import { ChannelMessage } from '../../../models/channelMessage.class';
import { ThreadMessage } from '../../../models/threadMessage';
import { ChannelThreadMessage } from '../../../models/channelThreadMessage';

@Injectable({
  providedIn: 'root'
})
export class EditMessageService {

  constructor(private data: DatabaseService,) { }
  isEditing: boolean = false;
  isEditingThread: boolean = false;
  editContent: string = '';
  selectedMessageIdEdit: string | null = null;

  toggleMessageEdit(messageId: string) {
    if (this.selectedMessageIdEdit === messageId) {
      this.selectedMessageIdEdit = null;
    } else {
      this.selectedMessageIdEdit = messageId;
    }
  }

  editMessage(message: ConversationMessage | ChannelMessage | ThreadMessage | ChannelThreadMessage, thread?: string) {
    debugger
    if (thread) {
      if ('threadMessageId' in message) {
      this.toggleMessageEdit(message.threadMessageId)
      this.isEditingThread = true;
      }
    }
    else {
      this.toggleMessageEdit(message.messageId)
      this.isEditing = true;
    }
    this.editContent = message.content;
  }

  cancelEditMessage(thread?: string) {
    if (thread) {
      this.isEditingThread = false;
    } else {
      this.isEditing = false;
    }    
    this.editContent = '';
    this.selectedMessageIdEdit = null;
  }
}
