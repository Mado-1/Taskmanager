import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { HomeComponent } from './features/home/home.component';
import { ListComponent } from './features/list/list.component';
import { DownloadComponent } from './features/download/download.component';

// Definierar applikationens rutter
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // Omdirigerar roten till "home"
  { path: 'home', component: HomeComponent }, // Hem-sida
  { path: 'dashboard', component: DashboardComponent }, // Dashboard-sida
  { path: 'list', component: ListComponent }, // Lista-sida
  { path: 'download', component: DownloadComponent }, // Nedladdnings-sida
];
