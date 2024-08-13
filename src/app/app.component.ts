import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthService } from './shared-services/auth.service';
import { user } from '@angular/fire/auth';
import { User } from '../models/user.class';




@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  authService = inject(AuthService);
  title = 'DA-Bubble';

  ngOnInit(): void {
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
    })
  }
}
