import { inject, Injectable } from '@angular/core';
import { Storage } from '@angular/fire/storage';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { Observable, Subject } from 'rxjs';
import { User } from '../../../models/user.class';
import { Conversation } from '../../../models/conversation.class';
import { Channel } from '../../../models/channel.class';
import { Thread } from '../../../models/thread.class';
import { ChannelThread } from '../../../models/channelThread.class';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  uploadProgress$!: Observable<number>;
  downloadURL$!: Observable<string>;

  private fileUploadErrorSubject = new Subject<string>();
  fileUploadError$ = this.fileUploadErrorSubject.asObservable();

  private fileUploadErrorSubjectThread = new Subject<string>();
  fileUploadErrorThread$ = this.fileUploadErrorSubjectThread.asObservable();

  downloadURL: string = ''
  downloadURLThread: string = ''

  private storage: Storage = inject(Storage);

  fileUploading: boolean = false;
  fileUploadingThread: boolean = false;

  onFileSelected(event: any, user: User, chat: Conversation | Channel | Thread | ChannelThread, thread?: string) {
    // debugger;
    const selectedFile: File = event.target.files[0];
    if (thread) {
      this.uploadFile(selectedFile, user, chat, thread);
    } else {
      this.uploadFile(selectedFile, user, chat);
    }

    console.log(selectedFile);
  }

  async uploadFile(file: File, user: User, chat: Conversation | Channel | Thread | ChannelThread, thread?: string) {
    debugger;
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 500 * 1024; // 500 KB

    if (!validTypes.includes(file.type)) {
      if (thread) {
        this.fileUploadErrorSubjectThread.next('Nur PDF-Dateien und Bilder (JPEG, PNG, GIF) sind erlaubt.');
      } else {
        this.fileUploadErrorSubject.next('Nur PDF-Dateien und Bilder (JPEG, PNG, GIF) sind erlaubt.');
      }
      return;
    }

    if (file.size > maxSize) {
      if (thread) {
        this.fileUploadErrorSubjectThread.next('Die Datei darf nicht größer als 500 KB sein.');
      } else {
        this.fileUploadErrorSubject.next('Die Datei darf nicht größer als 500 KB sein.');
      }
      return;
    }

    // const filePath = `messageFiles/${file.name}`;
    const filePath = this.defineUploadPath(file, user, chat);
    const fileRef = ref(this.storage, filePath);
    const uploadFile = uploadBytesResumable(fileRef, file);

    uploadFile.on('state_changed',
      (snapshot) => {
        if (thread) {
          this.fileUploadingThread = true;
        } else {
          this.fileUploading = true;
        }
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Loading progress:', progress);
      },
      (error) => {
        console.error('Error while loading:', error);
        if (thread) {
          this.fileUploadErrorSubjectThread.next('Fehler beim Hochladen der Datei.');
        } else {
          this.fileUploadErrorSubject.next('Fehler beim Hochladen der Datei.');
        }
      },
      async () => {
        console.log("Die Datei wurde erfolgreich hochgeladen!");
        const url = await getDownloadURL(fileRef);
        console.log("URL: ", url);

        if (thread) {
          this.fileUploadingThread = false;
          this.downloadURLThread = url;
        } else {
          this.downloadURL = url;
          this.fileUploading = false;
        }
      }
    );
  }

  defineUploadPath(file: File, user: User, chat: Conversation | Channel | Thread | ChannelThread) {
    const randomNumber = Math.random();
    let filePath: string ='';
    if ('threadId' in chat) {
      filePath = `messageFiles/${user.userId}/${chat.threadId}/${randomNumber}/${file.name}`;
    } else if ('channelId' in chat) {
      filePath = `messageFiles/${user.userId}/${chat.channelId}/${randomNumber}/${file.name}`;
    } else if ('conversationId' in chat) {
      filePath = `messageFiles/${user.userId}/${chat.conversationId}/${randomNumber}/${file.name}`;
    }
    return filePath
  }

  async deletePreview(thread?: string) {
    //debugger;
    if (this.downloadURL || this.downloadURLThread) {
      try {

        if (thread) {
          const fileRef = ref(this.storage, this.downloadURLThread);
          await deleteObject(fileRef);
          console.log("Die Datei wurde erfolgreich gelöscht!");
          this.downloadURLThread = '';
        } else {
          const fileRef = ref(this.storage, this.downloadURL);
          await deleteObject(fileRef);
          console.log("Die Datei wurde erfolgreich gelöscht!");
          this.downloadURL = '';
        }
      } catch (error) {
        console.error('Fehler beim Löschen der Datei:', error);
        if (thread) {
          this.fileUploadErrorSubjectThread.next('Fehler beim Hochladen der Datei.');
        } else {
          this.fileUploadErrorSubject.next('Fehler beim Hochladen der Datei.');
        }
      }
    } else {
      console.log("Keine Datei zum Löschen gefunden.");
    }
  }

  isImage(fileUrl: string): boolean {
    const url = new URL(fileUrl);
    const path = url.pathname;
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const extension = path.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension || '');
  }
}
