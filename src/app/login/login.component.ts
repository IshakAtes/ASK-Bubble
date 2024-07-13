import { CommonModule, NgStyle } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../user.service';
import { Firestore, collection, doc, updateDoc } from '@angular/fire/firestore';
import { User } from '../../models/user.class';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgStyle, FormsModule, ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  firestore: Firestore = inject(Firestore)
  hub = inject(UserService)
  isPressed = false;
  myForm: FormGroup;
  guestLog: User = new User({
    email: 'guest@mail.com',
    name: 'John Doe',
    password: 'guest123',
    status: 'offline',
    avatarUrl: '../../assets/img/unUsedDefault.png',
    userId: '',
    logIn: 'https://bubble.ishakates.com/',
    usedLastTwoEmojis: ''
  });

  constructor(private fb: FormBuilder, private router: Router, public us: UserService) {
    console.log(this.us.loadAllUsers());
    this.hub.guestData = this.guestLog;
    this.us.wrongLogin = false;
    this.myForm = this.fb.group({
      pw: ['', [Validators.required, Validators.minLength(5)]],
      mail: ['', [Validators.required, Validators.email]],
    });
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
    console.log('Google wurde angeklickt');
  }


  guestLogin() {
    this.us.guest = true;
    this.onSubmit()
  }


  async normalSignIn () {
    if (this.us.guest) {
      await this.us.addUser(this.hub.guestData);
      try {
        const guestUser = await this.us.getUser(this.hub.guestData.email, this.hub.guestData.password);
        this.us.guest = false;
        this.us.loggedUser = guestUser;
        this.us.userOnline(this.us.loggedUser.userId);
        this.router.navigate(['/main']);
        console.log('guestUser', guestUser);
      } catch (error) {
        console.log('Kein Gastbenutzer gefunden, erstelle neuen Gastbenutzer');
        // acceptedUser = await this.us.getUser(this.guestLog.email, this.guestLog.password);
      }
    } else {
      console.log('1form', this.myForm.value);
      const acceptedUser = await this.us.getUser(this.myForm.value.mail, this.myForm.value.pw);
      if (this.myForm.valid && acceptedUser) {
        try {
          this.us.loggedUser = acceptedUser;
          this.us.userOnline(this.us.loggedUser.userId);
          this.router.navigate(['/main']);
          console.log(this.us.loggedUser);
        } catch (error) {
          console.error('Fehler beim Abrufen des Benutzers:', error);
        }
      } 
    }
  }


  onMouseDown() {
    this.isPressed = true;
  }

  onMouseUp() {
    this.isPressed = false;
  }

}
