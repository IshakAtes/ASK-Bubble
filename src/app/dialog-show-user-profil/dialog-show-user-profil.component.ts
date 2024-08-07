import { Component, EventEmitter, inject, Inject, Input, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user.class';
import { DatabaseService } from '../database.service';
import { UserService } from '../user.service';
import { Conversation } from '../../models/conversation.class';
import { CommonModule, NgIf, NgStyle } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth, updateProfile } from '@angular/fire/auth';
import { AuthService } from '../shared-services/auth.service';

@Component({
  selector: 'app-dialog-show-user-profil',
  standalone: true,
  imports: [NgIf, FormsModule, NgStyle, ReactiveFormsModule, CommonModule],
  templateUrl: './dialog-show-user-profil.component.html',
  styleUrl: './dialog-show-user-profil.component.scss'
})
export class DialogShowUserProfilComponent implements OnInit {
  userData: User;
  database = inject(DatabaseService);
  us = inject(UserService);
  authService = inject(AuthService);
  editMode: boolean = false;
  selectedAvatar: string = '../../assets/img/unUsedDefault.png';
  newData: User;
  myForm: FormGroup;
  showPasswordInput: boolean = false;
  userPassword: string = '';

  @Input() activeUser: User

  @Output() changeToConversation = new EventEmitter<Conversation>();

  constructor(
    public dialogRef: MatDialogRef<DialogShowUserProfilComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User },
    private fb: FormBuilder
  ) {
    this.userData = data.user;
    this.myForm = this.fb.group({
      name: [this.userData.name, [Validators.minLength(6)]],
      email: [this.userData.email, [Validators.email]],
      password: ['', [Validators.maxLength(6)]]
    });
  }


  ngOnInit() {
    this.myForm = this.fb.group({
      name: [this.userData.name, [Validators.minLength(6)]],
      email: [this.userData.email, [Validators.email]],
      password: ['', [Validators.maxLength(6)]]
    });
  }

  onEmailChange(): void {
    this.showPasswordInput = this.userData.email !== this.myForm.value.email;
  }



  editUser() {
    console.log('userData before edit', this.userData);
    this.userData.avatarUrl = this.selectedAvatar;
    this.userData.name = this.myForm.value.name;
    this.userData.email = this.myForm.value.email;
    console.log('editForm', this.myForm.value, 'userData after edit', this.userData);
  
    // Erfasse das aktuelle Passwort nur, wenn die E-Mail geändert wurde
    const currentPassword: string | null = this.showPasswordInput ? this.userPassword : null;
  
    this.authService.changeUserData(
      this.selectedAvatar, 
      this.myForm.value.name, 
      this.myForm.value.email,
      currentPassword
    );
  }
  

  // editUser() {
  //   console.log('userData', this.userData);
  //   this.authService.changeUserData(this.userData.avatarUrl, this.userData.name, this.userData.email);

  //   // Hier können Sie die aktualisierten Benutzerdaten speichern, z.B. durch einen Service-Aufruf.
  //   // this.database.updateUser(this.newData).subscribe(response => {
  //   //   console.log('User updated successfully', response);
  //   //   this.onClose();
  //   // });
  // }
  
  

  selectFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedAvatar = e.target.result;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  triggerFileUpload(fileInput: HTMLInputElement): void {
    fileInput.click();
  }


  openEditTemplate() {
    this.editMode = true;
    this.newData = this.userData;
    this.selectedAvatar = this.userData.avatarUrl ?? '../../assets/img/unUsedDefault.png';
  }


  // openNewConversation(){
  //   let newConversation = this.database.createConversation(this.userData.userId, this.userData.userId);
  //   this.database.addConversation(newConversation);
  //   this.us.loadActiveUserConversations();
    
  //   setTimeout(() => {
  //     this.dialogRef.close(newConversation);
  //   }, 400);
  // }


  openConversation(conversation: Conversation){
    console.log('click');
    this.changeToConversation.emit(conversation);
  }


  // openConversation(){
  //   console.log('click');
  //   this.changeToConversation.emit(this.us.activeUserOwnConversation);
  // }

  onClose(): void {
    this.editMode = false;
    this.dialogRef.close();
  }

}
