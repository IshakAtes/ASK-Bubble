import { CommonModule, NgStyle } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../user.service';
import { User } from '../../models/user.class';
import { AuthService } from '../shared-services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgStyle, FormsModule, ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  authService = inject(AuthService);
  errorMessage: string | null = null;
  authMessage: boolean | null = false;
  hub = inject(UserService)
  isPressed = false;
  myForm: FormGroup;
  guestLog = {
    email: 'guest@mail.com',
    name: 'John Doe',
    password: 'guest123',
    status: 'offline',
    avatarUrl: '../../assets/img/unUsedDefault.png',
    userId: '',
    logIn: 'https://bubble.ishakates.com/',
    usedLastTwoEmojis: ['✅', '🙌'],
    uid: 'null'
  };

  constructor(private fb: FormBuilder, private router: Router, public us: UserService) {
    console.log(this.us.loadAllUsers());
    this.hub.guestData = this.guestLog;
    this.us.wrongLogin = false;
    this.myForm = this.fb.group({
      pw: ['', [Validators.required, Validators.minLength(5)]],
      mail: ['', [Validators.required, Validators.email]],
    });
    this.authService.getToken();
  }

  ngOnInit(): void {
    // this.authService.getToken();
    // console.log('get Token finished');
    
  }

  
  async onSubmit() {
    if (this.us.guest) {
      this.myForm.setValue({
        pw: this.guestLog.password,
        mail: this.guestLog.email
      });
      await this.normalSignIn();
    } else {
      await this.normalSignIn(); 
    }
  }


  googleAuthentification() {
    this.authService.googleAuth();
  }


  guestLogin() {
    this.us.guest = true;
    this.onSubmit()
  }


  async normalSignIn () {
    if (this.us.guest) {
      await this.us.addUser(this.hub.guestData);
      try {
        const guestUser = await this.us.getUser(this.hub.guestData.email, this.guestLog.password);
        this.us.guest = false;
        this.us.loggedUser = guestUser;
        this.us.userOnline(this.us.loggedUser.userId);
        this.router.navigate(['/main']);
      } catch (error) {
        console.log('Kein Gastbenutzer gefunden, erstelle neuen Gastbenutzer');
      }
    } else {
      this.acceptedAuth(); 
    }
  }


  acceptedAuth() {
    this.authService
      .login(this.myForm.value.mail, this.myForm.value.pw)
      .subscribe({
        next: () => {
        // this.authMessage = true;
        this.logCorrectUser();
      },
      error: (err) => {
        this.errorMessage = err.code;
        console.log(this.errorMessage);
      },
    });
  }


  async logCorrectUser() {
    const acceptedUser = await this.us.getUser(this.myForm.value.mail, this.us.userToken);
    if (this.myForm.valid && acceptedUser || this.authMessage) {
      try {
        this.us.loggedUser = acceptedUser;
        this.us.userOnline(this.us.loggedUser.userId);
        this.router.navigate(['/main']);
        this.us.userToken = '';
      } catch (error) {
        console.error('Fehler beim Abrufen des Benutzers:', error);
      }
    } else {
      this.us.userToken = '';
    }
  }


  onMouseDown() {
    this.isPressed = true;
  }

  onMouseUp() {
    this.isPressed = false;
  }

}
