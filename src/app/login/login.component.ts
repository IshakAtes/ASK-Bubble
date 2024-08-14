import { CommonModule, NgClass, NgStyle } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../user.service';
import { User } from '../../models/user.class';
import { AuthService } from '../shared-services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgStyle, NgClass, FormsModule, ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  intro = true;
  switchlogo = false;
  textVisible = false;
  authService = inject(AuthService);
  errorMessage: string | null = null;
  authMessage: boolean | null = false;
  hub = inject(UserService)
  isPressed = false;
  myForm: FormGroup;
  guestPw: string = 'guest123';
  guestLog: User = new User({
    email: 'guest@mail.com',
    name: 'John Doe',
    status: 'offline',
    avatarUrl: '../../assets/img/unUsedDefault.png',
    userId: '',
    logIn: 'https://bubble.ishakates.com/',
    usedLastTwoEmojis: ['✅', '🙌'],
    uid: null
  });

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
    setTimeout(() => {
      this.switchlogo = true;
      setTimeout(() => {
        this.textVisible = true;
        setTimeout(() => {
          this.intro = false;
        }, 2000);
      }, 1000);
    }, 125);
  }

  
  async onSubmit() {
    if (this.us.guest) {
      this.myForm.setValue({
        pw: this.guestPw,
        mail: this.guestLog.email
      });
      await this.signIn();
    } else {
      await this.signIn(); 
    }
  }


  googleAuthentification() {
    this.authService.googleAuth();
  }


  guestLogin() {
    this.us.guest = true;
    this.onSubmit()
  }


  async signIn() {
    if (this.us.guest) {
      try {
        this.authAsGuest();
      } catch (error) {
        console.log('Kein Gastbenutzer gefunden, erstelle neuen Gastbenutzer');
        this.authService.register(this.guestLog.email, this.guestLog.name, this.guestPw);
      }
    } else {
      this.acceptedAuth(); 
    }
  }


  authAsGuest() {
    this.authService
      .login(this.myForm.value.mail, this.myForm.value.pw)
      .subscribe({
        next: () => {
        this.logCorrectUser();
      },
      error: (err) => {
        this.errorMessage = err.code;
        this.authService.register(this.guestLog.email, this.guestLog.name, this.guestPw);
        console.log(this.errorMessage);
      },
    });

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
        this.us.guest = false;
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
