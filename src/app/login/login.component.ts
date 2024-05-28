import { CommonModule, NgStyle } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

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

  constructor(private fb: FormBuilder, private router: Router) {
    this.myForm = this.fb.group({
      pw: ['', [Validators.required, Validators.minLength(5)]],
      mail: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {}

  onMouseDown() {
    this.isPressed = true;
  }

  onMouseUp() {
    this.isPressed = false;
  }

}
