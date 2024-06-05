import { NgFor, NgIf, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../user.service';



@Component({
  selector: 'app-dialog-choose-avatar',
  standalone: true,
  imports: [RouterLink, NgFor, NgStyle, NgIf],
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
  constructor(private router: Router, public us: UserService) {
  }

  createUser() {
    this.us.userCache.avatarUrl = this.selectedAvatar;
    console.log(this.us.userCache);
  }

  selectDummyAvatar(item: any) {
    this.selectedAvatar = item;
  }

  uploadAvatarImage() {
  }

}
