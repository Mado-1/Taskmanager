import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Komponent för sidomeny och hantering av öppet/stängt läge
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class SidebarComponent {
  @Output() sidebarToggle = new EventEmitter<boolean>(); // Event för att meddela ändrat sidomeny-tillstånd
  isOpen = true;

  // Växlar sidomenyn mellan öppet och stängt läge
  toggleSidebar(): void {
    this.isOpen = !this.isOpen;
    this.sidebarToggle.emit(this.isOpen);
  }
}
