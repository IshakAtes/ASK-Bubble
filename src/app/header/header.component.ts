import { Component, EventEmitter, Output, Input, inject } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { UserService } from '../user.service';
import { User } from '../../models/user.class';
import { CommonModule, NgStyle } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogShowUserProfilComponent } from '../dialog-show-user-profil/dialog-show-user-profil.component';
import { AuthService } from '../shared-services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ChatComponent, CommonModule, NgStyle],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent  {
  authService = inject(AuthService);
  hovered: boolean = false;
  dropdownOpen: boolean = false;
  router = inject(Router);
  
  @Output() search: EventEmitter<string> = new EventEmitter<string>();
  
  
  @Output() showWorkspace = new EventEmitter<boolean>();
  @Input() isWSVisible: boolean;


  
  constructor(public us: UserService, public dialog: MatDialog) {}

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout() {
    this.authService.logout();
    this.us.loggedUser = new User();
    this.router.navigate(['']);
  }

  onSearch(event: any): void {
    this.search.emit(event.target.value);
  }

  viewWorkspace(){
    this.showWorkspace.emit(true)
  }

  openProfileDialog(event: Event) {
    this.hovered = false;
    event.stopPropagation();
    this.toggleDropdown();
    
    // Öffne den Dialog mit den Benutzerdaten
    const dialogRef = this.dialog.open(DialogShowUserProfilComponent, {
      data: { user: this.us.loggedUser } // Daten, die an den Dialog übergeben werden
    });

  }

}
