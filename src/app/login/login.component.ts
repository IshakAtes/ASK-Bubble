import { CommonModule, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../user.service';
import { __symbol__ } from 'zone.js/lib/zone-impl';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgStyle, FormsModule, ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  isPressed = false;
  myForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, public us: UserService) {
    console.log(this.us.loadAllUsers());
    this.myForm = this.fb.group({
      pw: ['', [Validators.required, Validators.minLength(5)]],
      mail: ['', [Validators.required, Validators.email]],
    });
  }

  async onSubmit() {
    const logUser = await this.us.getUser(this.myForm.value.mail, this.myForm.value.pw);
    if (this.myForm.valid && logUser) {
      try {
        //User status online setzen nicht nur lokal sondern auch auf firebase
        console.log(logUser);
      } catch (error) {
        console.error('Fehler beim Abrufen des Benutzers:', error);
      }
    } else {
      console.log('Formular ist ungültig');
    }
  }

  guestLogin() {
    console.log('Gäste-Login wurde angeklickt');
    // Hier kannst du weitere Logik für Gäste-Login hinzufügen, z.B. Routing
  }

  onMouseDown() {
    this.isPressed = true;
  }

  onMouseUp() {
    this.isPressed = false;
  }

}
