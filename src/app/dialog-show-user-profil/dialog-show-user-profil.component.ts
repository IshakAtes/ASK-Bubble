import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/user.class';

@Component({
  selector: 'app-dialog-show-user-profil',
  standalone: true,
  imports: [],
  templateUrl: './dialog-show-user-profil.component.html',
  styleUrl: './dialog-show-user-profil.component.scss'
})
export class DialogShowUserProfilComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogShowUserProfilComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

}
