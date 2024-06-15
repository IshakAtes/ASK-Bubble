import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../user.service';
import { HttpClient } from '@angular/common/http';
import { getDocs, query, where } from "firebase/firestore";
import { Firestore, collection, addDoc, updateDoc, doc, onSnapshot } from '@angular/fire/firestore';

@Component({
  selector: 'app-dialog-password-reset',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './dialog-password-reset.component.html',
  styleUrl: './dialog-password-reset.component.scss'
})
export class DialogPasswordResetComponent {
  http = inject(HttpClient);
  firestore: Firestore = inject(Firestore)
  myForm: FormGroup;
  emailSent: boolean = false;

  constructor(private formBuilder: FormBuilder, private router: Router, private us: UserService) {
    this.myForm = this.formBuilder.group({
      mail: ['', [Validators.required, Validators.email]],
    });
  }


  post = {
    endPoint: 'https://bubble.ishakates.com/sendMail.php',
    body: (payload: any) => JSON.stringify(payload),
    options: {
      headers: {
        'Content-Type': 'text/plain',
        responseType: 'text',
      },
    },
  };


  onSubmit() {
    // this.us.findUser(this.myForm.value.mail);
    this.checkEmail(this.myForm.value.mail);

  }

  async checkEmail(email: string): Promise<void> {
    try {
      const q = query(collection(this.firestore, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert('Kein User mit der angegebenen E-Mail-Adresse gefunden');
      } else {
        querySnapshot.forEach((doc) => {
          this.us.resetUserPw = doc.data();
          this.us.resetUserPw['userId'] = doc.id;
          this.sendMail()
        });
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Dokumente:', error);
    }
  }


  sendMail() {
    if (this.myForm.valid) {
      this.http.post(this.post.endPoint, this.post.body(this.us.resetUserPw))
        .subscribe({
          next: (_response: any) => {
            this.us.resetUserPw = '';
            this.myForm.reset();
          },
          error: (error: any) => {
            console.error(error);
          },
          complete: () => {
            this.emailSent = true;
            setTimeout(() => {
              this.emailSent = false;
              this.router.navigate(['/']);
            }, 2000);
          },
        });
    }
  }

}
