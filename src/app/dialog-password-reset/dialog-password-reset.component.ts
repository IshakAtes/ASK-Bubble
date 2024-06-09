import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-dialog-password-reset',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './dialog-password-reset.component.html',
  styleUrl: './dialog-password-reset.component.scss'
})
export class DialogPasswordResetComponent {
  myForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private router: Router, private us: UserService) {
    this.myForm = this.formBuilder.group({
      mail: ['', [Validators.required, Validators.email]],
    });
  }


  onSubmit() {
    // this.us.findUser(this.myForm.value.mail);
    this.us.checkEmail(this.myForm.value.mail);
  }

}
