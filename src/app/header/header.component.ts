import { Component, EventEmitter, Output, Input } from '@angular/core';
import { ChatComponent } from '../chat/chat.component';
import { UserService } from '../user.service';
import { User } from '../../models/user.class';
import { CommonModule, NgStyle } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogShowUserProfilComponent } from '../dialog-show-user-profil/dialog-show-user-profil.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ChatComponent, CommonModule, NgStyle], //Ist das noch notwendig
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent  {
  hovered: boolean = false;
  dropdownOpen: boolean = false;
  activeUser: User = this.us.loggedUser;
  
  @Output() search: EventEmitter<string> = new EventEmitter<string>(); //Ist das noch notwendig
  
  
  @Output() showWorkspace = new EventEmitter<boolean>();
  @Input() isWSVisible: boolean;


  
  constructor(public us: UserService, public dialog: MatDialog) {}

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout() {
    this.us.logout();
  }

  onSearch(event: any): void {
    this.search.emit(event.target.value); //Ist das noch notwendig
  }

  viewWorkspace(){
    this.showWorkspace.emit(true)
  }

  openProfileDialog(event: Event) {
    this.hovered = false;
    event.stopPropagation();
    console.log('Öffne Profil-Dialog');
    
    // Öffne den Dialog mit den Benutzerdaten
    const dialogRef = this.dialog.open(DialogShowUserProfilComponent, {
      data: { user: this.activeUser } // Daten, die an den Dialog übergeben werden
    });

    // Beispiel für das Reagieren auf das Schließen des Dialogs
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog geschlossen', result);
    });
  }

}
