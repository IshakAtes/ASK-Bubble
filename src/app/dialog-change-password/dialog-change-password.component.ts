import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dialog-change-password',
  standalone: true,
  imports: [],
  templateUrl: './dialog-change-password.component.html',
  styleUrl: './dialog-change-password.component.scss'
})
export class DialogChangePasswordComponent implements OnInit {
  userId: any = '';

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit():void {
    this.userId = this.route.snapshot.paramMap.get('id');
    console.log(this.userId);
  }
}
