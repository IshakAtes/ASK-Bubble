import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dialog-choose-avatar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dialog-choose-avatar.component.html',
  styleUrl: './dialog-choose-avatar.component.scss'
})
export class DialogChooseAvatarComponent {
  constructor(private router: Router) {}

}
