import { CommonModule, NgClass, NgStyle } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { User } from '../../models/user.class';
import { UserService } from '../user.service';
import { getDocs, query, where } from "firebase/firestore";
import { Firestore, collection } from '@angular/fire/firestore';


@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [NgStyle, FormsModule, ReactiveFormsModule, CommonModule, RouterLink, MatCheckboxModule, NgClass],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  isPressed = false;
  firestore: Firestore = inject(Firestore)
  myForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, public us: UserService) {
    this.myForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      pw: ['', [Validators.required, Validators.minLength(5)]],
      mail: ['', [Validators.required, Validators.email]],
      box: ['', [Validators.requiredTrue]],
    });
  }


  // async checkEmail(email: string): Promise<void> {
  //   try {
  //     const q = query(collection(this.firestore, 'users'), where('email', '==', email));
  //     const querySnapshot = await getDocs(q);

  //     if (querySnapshot.empty && this.myForm.valid) {
  //         const formValues = this.myForm.value;
  //         const newUser = new User({
  //           email: formValues.mail,
  //           name: formValues.name,
  //           password: formValues.pw,
  //           status: 'offline',
  //           avatarUrl: '',
  //           userId: ''
  //         });
  //         this.us.userCache = newUser;
  //         this.router.navigate(['/choosingAvatar']);
  //     } else {
  //       querySnapshot.forEach((doc) => {
  //         alert('Die angegebene email adresse, existiert bereits')
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Fehler beim Abrufen der Dokumente:', error);
  //   }
  // }


  onSubmit() {
    this.us.checkEmail(this.myForm.value.mail, this.myForm)
  }

}
