import { CommonModule, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../user.service';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';



@Component({
  selector: 'app-dialog-choose-avatar',
  standalone: true,
  imports: [CommonModule, RouterLink, NgFor, NgStyle, NgIf, NgClass],
  templateUrl: './dialog-choose-avatar.component.html',
  styleUrl: './dialog-choose-avatar.component.scss'
})


export class DialogChooseAvatarComponent {
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


  constructor(private router: Router, public us: UserService) {}

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
    console.log(this.us.userCache);
    this.userCreated = true;
    this.us.addUser(this.us.userCache);
    setTimeout(() => {
      this.userCreated = false;
      this.router.navigate(['/']);
    }, 2000);
  }

  selectDummyAvatar(item: any) {
    this.selectedAvatar = item;
  }

  uploadAvatarImage() {
  }

}
