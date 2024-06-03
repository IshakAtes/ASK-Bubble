import { NgFor, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';



@Component({
  selector: 'app-dialog-choose-avatar',
  standalone: true,
  imports: [RouterLink, NgFor, NgStyle],
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
  user: any;
  constructor(private router: Router) {}

  selectDummyAvatar(item: any) {
    console.log(item);
  }

  uploadAvatarImage() {}

}
