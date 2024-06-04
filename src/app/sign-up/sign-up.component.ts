import { CommonModule, NgClass, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DatabaseService } from '../database.service';
import { User } from '../../models/user.class';


@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [NgStyle, FormsModule, ReactiveFormsModule, CommonModule, RouterLink, MatCheckboxModule, NgClass],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  isPressed = false;
  myForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, public us: DatabaseService) {
    this.myForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      pw: ['', [Validators.required, Validators.minLength(5)]],
      mail: ['', [Validators.required, Validators.email]],
      box: ['', [Validators.requiredTrue]],
    });
  }


  onSubmit() {
    if (this.myForm.valid) {
      const formValues = this.myForm.value;
      const newUser = new User({
        email: formValues.mail,
        name: formValues.name,
        password: formValues.pw,
        status: 'offline',
        avatarUrl: '',
        userId: ''
      });
      this.us.userCache = newUser;
      this.router.navigate(['/choosingAvatar']);
    } else {
      console.log('Form is invalid');
    }
  }

}
