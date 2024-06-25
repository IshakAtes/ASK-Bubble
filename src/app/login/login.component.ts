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
  isPressed = false;
  myForm: FormGroup;
  guestLog: User = new User({
    email: 'guest@mail.com',
    name: 'John Doe',
    password: 'guest123',
    status: 'online',
    avatarUrl: '',
    userId: ''
  });

  constructor(private fb: FormBuilder, private router: Router, public us: UserService) {
    console.log(this.us.loadAllUsers());
    this.us.wrongLogin = false;
    this.myForm = this.fb.group({
      pw: ['', [Validators.required, Validators.minLength(5)]],
      mail: ['', [Validators.required, Validators.email]],
    });
  }

  
  async onSubmit() {
    console.log('anmelden', this.myForm.value);
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
    } else {
      console.log('Formular ist ungültig');
    }
  }


  googleAuthentification() {
    console.log('Google wurde angeklickt');
  }


  async guestLogin(event: Event) {
    event.preventDefault();
    try {
      const acceptedUser = await this.us.getUser(this.guestLog.email, this.guestLog.password);
      if (acceptedUser) {
        this.us.loggedUser = acceptedUser;
        this.us.userOnline(this.us.loggedUser.userId);
        this.router.navigate(['/main']);
        console.log(this.us.loggedUser);
      } else if(!acceptedUser) {
        this.us.addUser(this.guestLog);
      }
    } catch (error) {
      console.error('Fehler beim Abrufen des Benutzers:', error);
    }
  }

  onMouseDown() {
    this.isPressed = true;
  }

  onMouseUp() {
    this.isPressed = false;
  }

}
