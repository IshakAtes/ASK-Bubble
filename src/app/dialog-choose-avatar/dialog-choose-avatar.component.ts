import { CommonModule, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../user.service';
import { HttpClient } from '@angular/common/http';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../shared-services/auth.service';
import { DatabaseService } from '../database.service';



@Component({
  selector: 'app-dialog-choose-avatar',
  standalone: true,
  imports: [CommonModule, RouterLink, NgFor, NgStyle, NgIf, NgClass],
  templateUrl: './dialog-choose-avatar.component.html',
  styleUrl: './dialog-choose-avatar.component.scss'
})


export class DialogChooseAvatarComponent {
  authService = inject(AuthService)
  http = inject(HttpClient);
  images: string[] = [
    '../../assets/img/defaultAvatars/defaultFemale1.png',
    '../../assets/img/defaultAvatars/defaultMale1.png',
    '../../assets/img/defaultAvatars/defaultMale4.png',
    '../../assets/img/defaultAvatars/defaultMale2.png',
    '../../assets/img/defaultAvatars/defaultFemale2.png',
    '../../assets/img/defaultAvatars/defaultMale3.png'
  ];
  selectedAvatar: string = "";
  userCreated: boolean = false;
  errorMessage: string | null = null;


  constructor(private router: Router, public us: UserService, public database: DatabaseService) {}

  post = {
    endPoint: 'https://bubble.ishakates.com/sendSignUp.php',
    body: (payload: any) => JSON.stringify(payload),
    options: {
      headers: {
        'Content-Type': 'text/plain',
        responseType: 'text',
      },
    },
  };


  sendRegisteredMail() {
    this.http.post(this.post.endPoint, this.post.body(this.us.userCache))
    .subscribe({
      next: (_response: any) => {
        // this.us.resetUserPw = '';
        console.log('form', this.us.userCache);
      },
      error: (error: any) => {
        console.error(error);
      },
      complete: () => {
        this.userCreated = true;
        setTimeout(() => {
          this.userCreated = false;
          this.router.navigate(['/']);
        }, 2000);
      },
    });
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


  authRegistration() {
    this.authService
      .register(this.us.userCache.email, this.us.userCache.name, this.us.userCache.password)
      .subscribe({
        next: () => {
        console.log('user registred');
      },
      error: (err) => {
        this.errorMessage = err.code;
        console.log(this.errorMessage);
      },
    });
  }
  

  createUser() {
    this.us.userCache.avatarUrl = this.selectedAvatar;
    console.log('userCache:', this.us.userCache);
    this.database.addUser(this.us.userCache);
    this.authRegistration();
    this.sendRegisteredMail();
    setTimeout(() => {
      this.database.getUser(this.us.userCache.email)
        .then(user =>{
          this.database.addConversation(this.database.createConversation(user.userId, user.userId))
        })
    }, 1000);
  }

  selectDummyAvatar(item: any) {
    this.selectedAvatar = item;
  }

  uploadAvatarImage() {
  }

}
