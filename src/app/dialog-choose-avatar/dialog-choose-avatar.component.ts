import { CommonModule, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../user.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../shared-services/auth.service';


@Component({
  selector: 'app-dialog-choose-avatar',
  standalone: true,
  imports: [CommonModule, RouterLink, NgFor, NgStyle, NgIf, NgClass],
  templateUrl: './dialog-choose-avatar.component.html',
  styleUrl: './dialog-choose-avatar.component.scss'
})


export class DialogChooseAvatarComponent {
  http = inject(HttpClient);
  images: string[] = [
    '/assets/img/defaultAvatars/defaultFemale1.png',
    '/assets/img/defaultAvatars/defaultMale1.png',
    '/assets/img/defaultAvatars/defaultMale4.png',
    '/assets/img/defaultAvatars/defaultMale2.png',
    '/assets/img/defaultAvatars/defaultFemale2.png',
    '/assets/img/defaultAvatars/defaultMale3.png'
  ];
  selectedAvatar: string = "";
  userCreated: boolean = false;
  authService = inject(AuthService);


  constructor(private router: Router, public us: UserService) {}

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
        // console.log('Userform Registered', this.us.userCache);
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


  createUser() {
    this.us.userCache.avatarUrl = this.selectedAvatar;
    this.authService.authRegistration();
    this.sendRegisteredMail();
  }
  

  selectDummyAvatar(item: any) {
    this.selectedAvatar = item;
  }


}
