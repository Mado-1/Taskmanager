import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DownloadService } from '../../core/services/download.service';

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class DownloadComponent implements OnInit {
  tasks: any[] = [];
  users: any[] = [];
  projects: any[] = [];

  selectedUserId: number | null = null;
  selectedProjectId: number | null = null;
  selectedTaskId: number | null = null;

  constructor(private downloadService: DownloadService) {}

  // Initierar och hämtar all data vid komponentstart
  ngOnInit() {
    this.downloadService
      .fetchTasks()
      .subscribe((tasks) => (this.tasks = tasks));
    this.downloadService
      .fetchUsers()
      .subscribe((users) => (this.users = users));
    this.downloadService
      .fetchProjects()
      .subscribe((projects) => (this.projects = projects));
  }

  // Filtrerar data baserat på val och laddar ner i valt format
  downloadFilteredData(format: string) {
    let filteredTasks = this.tasks;
    let filteredProjects = this.projects;
    let filteredUsers = this.users;

    if (this.selectedUserId) {
      filteredUsers = this.users.filter(
        (user) => user.id === this.selectedUserId
      );
      filteredTasks = this.tasks.filter(
        (task) => task.creatorId === this.selectedUserId
      );
      filteredProjects = this.projects.filter(
        (project) => project.creatorId === this.selectedUserId
      );
    }

    if (this.selectedProjectId) {
      filteredProjects = this.projects.filter(
        (project) => project.id === this.selectedProjectId
      );
      filteredTasks = this.tasks.filter(
        (task) => task.projectId === this.selectedProjectId
      );
    }

    if (this.selectedTaskId) {
      filteredTasks = this.tasks.filter(
        (task) => task.id === this.selectedTaskId
      );
    }

    const data = [
      { type: 'Users', data: filteredUsers },
      { type: 'Projects', data: filteredProjects },
      { type: 'Tasks', data: filteredTasks },
    ];

    if (format === 'json') {
      this.downloadService.downloadAsJSON(data, 'filtered_data');
    } else if (format === 'csv') {
      this.downloadService.downloadAsCSV(data, 'filtered_data');
    }
  }
}
