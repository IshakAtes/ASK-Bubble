import { Component, EventEmitter, inject, Inject, Input, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user.class';
import { DatabaseService } from '../database.service';
import { UserService } from '../user.service';
import { Conversation } from '../../models/conversation.class';
import { CommonModule, NgIf, NgStyle } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
  }


  ngOnInit() {
    this.myForm = this.fb.group({
      name: [this.userData.name, [Validators.required, Validators.minLength(6)]],
      email: [this.userData.email, [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]]
    });
    this.authService.activeUser?.subscribe((user) => {
      if (user) {
        const customUser = new User({
          email: user.email!,
          name: user.displayName!,
          status: 'online',
          avatarUrl: user.photoURL,
          userId: this.authService.us.loggedUser.userId,
          logIn: this.authService.us.loggedUser.logIn,
          usedLastTwoEmojis: this.authService.us.loggedUser.usedLastTwoEmojis,
          uid: user.uid
        });
        this.authService.currentUserSignal.set(customUser);
      } else {
        this.authService.currentUserSignal.set(null);
      }
      // console.log(this.authService.currentUserSignal());
    })
  }

  onEmailChange(): void {
    this.showPasswordInput = this.userData.email !== this.myForm.get('email')?.value;
  }



  async editUser() {
    console.log('hallo');
    if (this.myForm.valid) {
      const formData = this.myForm.value;
      const currentPassword = this.showPasswordInput ? formData.password : null;
      // console.log(formData);
      this.userData.avatarUrl = this.selectedAvatar;
      try {
        // console.log(formData.email,
        //   this.userData.email,
        //   currentPassword,
        //   formData.name,
        //   this.selectedAvatar);
        await this.authService.changeUserData(
          this.userData.email,
          formData.email,
          currentPassword,
          formData.name,
          this.selectedAvatar
        );
        await this.authService.checkUserStatus();
        // Aktualisiere die lokalen Daten
        this.userData.name = formData.name;
        this.userData.email = formData.email;
        this.editMode = false;
        this.userPassword = '';

        setTimeout(() => {
          if (this.authService.wrongEmail) {
            this.authService.wrongEmail = false;
            // console.log(this.us.loggedUser.email);
            this.myForm.patchValue({
              email: this.us.loggedUser.email,
              password: ''
            });
            this.userData.email = this.us.loggedUser.email;
            formData.email = this.us.loggedUser.email
            alert('Falsches Passwort oder E-Mail');
            this.editMode = true;
          }
        }, 512)
        
      } catch (error) {
        console.error('Fehler beim Aktualisieren der Benutzerdaten:', error);
      }
    } else {
      // Markiere alle Formularfelder als berührt, um Validierungsfehler anzuzeigen
      Object.values(this.myForm.controls).forEach(control => {
        control.markAsTouched();
      });
      alert('Bitte korrigieren Sie die Fehler im Formular');
    }
  }


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
    this.showPasswordInput = true;
    this.newData = this.userData;
    // console.log(this.newData);
    this.selectedAvatar = this.userData.avatarUrl ?? '/assets/img/unUsedDefault.png';
    
    // Aktualisieren Sie das Formular mit den aktuellen Werten
    this.myForm.patchValue({
      name: this.userData.name,
      email: this.userData.email
    });
  }

  openConversation(conversation: Conversation){
      this.dialogRef.close(conversation);
  }

  closeEdit() {
    this.editMode = false;
    this.myForm.reset({
      name: this.userData.name,
      email: this.userData.email
    });
    this.showPasswordInput = false;
    this.userPassword = '';
  }


  onClose(): void {
    this.editMode = false;
    this.dialogRef.close();
  }

}
