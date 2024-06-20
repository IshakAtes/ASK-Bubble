import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-dialog-change-password',
  standalone: true,
  imports: [RouterLink, NgClass, NgIf, ReactiveFormsModule, CommonModule],
  templateUrl: './dialog-change-password.component.html',
  styleUrl: './dialog-change-password.component.scss'
})

export class DialogChangePasswordComponent implements OnInit {
  userId: any = '';
  myForm: FormGroup;
  passworChanged: boolean = false;

  constructor(public route: ActivatedRoute, private formBuilder: FormBuilder, private router: Router) {
    this.myForm = this.formBuilder.group({
      newPass1: ['', [Validators.required, Validators.minLength(5)]],
      newPass2: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit():void {
    this.userId = this.route.snapshot.paramMap.get('id');
    console.log(this.userId);
  }

  checkPasswords(): boolean {
    const newPass1 = this.myForm.get('newPass1')?.value;
    const newPass2 = this.myForm.get('newPass2')?.value;
    return newPass1 === newPass2;
  }

  onSubmit() {
    if (this.myForm.valid) {
      // Password change logic here
      console.log('Form submitted', this.myForm.value, this.checkPasswords());
    } else {
      console.log('Form not valid');
    }
    // this.us.findUser(this.myForm.value.mail);
    // this.checkEmail(this.myForm.value.mail);
  }
}
