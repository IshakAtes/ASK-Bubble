import { inject, Injectable } from '@angular/core';
import { Storage } from '@angular/fire/storage';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  uploadProgress$!: Observable<number>;
  downloadURL$!: Observable<string>;

  private fileUploadErrorSubject = new Subject<string>();
  fileUploadError$ = this.fileUploadErrorSubject.asObservable();

  downloadURL:string =''

  private storage: Storage = inject(Storage);

  fileUploading : boolean = false;

  onFileSelected(event:any){
    const selectedFile:File = event.target.files[0];
    this.uploadFile(selectedFile);
    console.log(selectedFile);
  }

  async uploadFile(file: File) {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 500 * 1024; // 500 KB

    if (!validTypes.includes(file.type)) {
      this.fileUploadErrorSubject.next('Nur PDF-Dateien und Bilder (JPEG, PNG, GIF) sind erlaubt.');
      return;
    }

    if (file.size > maxSize) {
      this.fileUploadErrorSubject.next('Die Datei darf nicht größer als 500 KB sein.');
      return;
    }

    const filePath = `messageFiles/${file.name}`;
    const fileRef = ref(this.storage, filePath);
    const uploadFile = uploadBytesResumable(fileRef, file);

    uploadFile.on('state_changed',
      (snapshot) => {
        this.fileUploading = true;
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Loading progress:', progress);
      },
      (error) => {
        console.error('Error while loading:', error);
        this.fileUploadErrorSubject.next('Fehler beim Hochladen der Datei.');
      },
      async () => {
        console.log("Die Datei wurde erfolgreich hochgeladen!");
        const url = await getDownloadURL(fileRef);
        console.log("URL: ", url);
        this.downloadURL = url;
        this.fileUploading = false;
      }
    );
  }

  async deletePreview() {
    if (this.downloadURL) {
      try {
        const fileRef = ref(this.storage, this.downloadURL);
        await deleteObject(fileRef);
        console.log("Die Datei wurde erfolgreich gelöscht!");
        this.downloadURL = '';
      } catch (error) {
        console.error('Fehler beim Löschen der Datei:', error);
        this.fileUploadErrorSubject.next('Fehler beim Löschen der Datei.');
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
