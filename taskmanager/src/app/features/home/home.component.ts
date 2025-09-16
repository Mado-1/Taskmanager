import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Komponent för startsidan i Task Manager
@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [CommonModule],
})
export class HomeComponent {
  // Lista med nyheter som visas på startsidan
  newsList = [
    {
      title: 'Ny funktion släppt!',
      content:
        'Vi har lagt till en ny funktion för att hantera uppgifter mer effektivt.',
    },
    {
      title: 'Underhållsuppdatering',
      content: 'Schemalagt underhåll sker den 5 maj 2025.',
    },
    {
      title: 'Tips & Tricks',
      content: 'Lär dig använda Task Manager som ett proffs med vår nya guide.',
    },
  ];
}
