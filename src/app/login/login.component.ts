import { CommonModule, NgStyle } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../user.service';
import { Firestore, collection, doc, updateDoc } from '@angular/fire/firestore';

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
        this.us.userOnline(logUser.userId);
        this.router.navigate(['/main']);
        console.log('update', logUser);
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
