import { inject, Injectable } from '@angular/core';
import { Storage } from '@angular/fire/storage';
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  uploadProgress$!: Observable<number>;
  downloadURL$!: Observable<string>;

  private storage: Storage = inject(Storage);

  onFileSelected(event:any){
    const archivoSeleccionado:File = event.target.files[0];
    this.uploadFile(archivoSeleccionado);
  }

  async uploadFile(file:File){
    const filePath = `messageFiles/${file.name}`;
    const fileRef = ref(this.storage,filePath);
    const uploadFile = uploadBytesResumable(fileRef, file);

    uploadFile.on('state_changed', 
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Loading progress:', progress);
    },
    (error) => {
      console.error('Error while loading:', error);
    },
    async () => {
      console.log("The file was uploaded successfully!");
      const url = await getDownloadURL(fileRef);
      console.log("url: ", url)
    })
  }
}
