import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { ProjectService } from '../../core/services/project.service';
import { TaskService } from '../../core/services/task.service';
import { NgSelectModule, NgSelectComponent } from '@ng-select/ng-select';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-list',
  standalone: true,
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    NgSelectComponent,
    AsyncPipe,
  ],
})
export class ListComponent implements OnInit {
  users = signal<any[]>([]);
  projects = signal<any[]>([]);
  tasks = signal<any[]>([]);
  selectedUser = signal<(number | null)[]>([]);
  selectedUserProjects = signal<any[]>([]);
  selectedUserTasks = signal<any[]>([]);
  expandedUserId: number | null = null;
  expandedProjectId: number | null = null;
  users$!: Observable<any[]>;

  constructor(
    private userService: UserService,
    private projectService: ProjectService,
    private taskService: TaskService
  ) {
    // Uppdatera tasks och filtrerade listor när data ändras
    effect(() => {
      const users = this.users();
      const projects = this.projects();
      const tasksRaw = this.taskService['tasks']();

      const enriched = tasksRaw.map((task) => {
        const project = projects.find((p) => p.id === task.projectId);
        const user = users.find((u) => u.id === task.creatorId);
        return {
          ...task,
          projectName: project ? project.name : 'Unknown',
          userName: user ? user.name : 'Unknown',
        };
      });

      this.tasks.set(enriched);

      const selectedUserIds = this.selectedUser();
      if (
        !selectedUserIds ||
        selectedUserIds.length === 0 ||
        selectedUserIds.includes(null)
      ) {
        this.selectedUserProjects.set(projects);
        this.selectedUserTasks.set(enriched);
      } else {
        const filteredProjects = projects.filter(
          (project) =>
            project.userIds &&
            project.userIds.some((id: number) => selectedUserIds.includes(id))
        );
        const userProjectIds = filteredProjects.map((p) => p.id);
        const filteredTasks = enriched.filter(
          (task) =>
            selectedUserIds.includes(task.creatorId) ||
            userProjectIds.includes(task.projectId)
        );
        this.selectedUserProjects.set(filteredProjects);
        this.selectedUserTasks.set(filteredTasks);
      }
    });
  }

  // Hämta data vid initiering
  ngOnInit(): void {
    this.userService.getUsers().subscribe((data) => this.users.set(data));
    this.projectService
      .getProjects()
      .subscribe((data) => this.projects.set(data));
    this.taskService.fetchTasks();
    this.users$ = this.userService.getUsers();
  }

  // Filtrera projekt och tasks när användarval ändras
  onUserChange(): void {
    const selected = this.selectedUserModel;
    if (!selected || selected.length === 0 || selected.includes(null)) {
      this.selectedUserProjects.set(this.projects());
      this.selectedUserTasks.set(this.tasks());
    } else {
      const filteredProjects = this.projects().filter(
        (project) =>
          project.userIds &&
          project.userIds.some((id: number) => selected.includes(id))
      );
      const userProjectIds = filteredProjects.map((p) => p.id);
      const filteredTasks = this.tasks().filter(
        (task) =>
          selected.includes(task.creatorId) ||
          userProjectIds.includes(task.projectId)
      );
      this.selectedUserProjects.set(filteredProjects);
      this.selectedUserTasks.set(filteredTasks);
    }
  }

  // Getter/setter för användarval i dropdown
  get selectedUserModel(): (number | null)[] {
    return this.selectedUser() ?? [];
  }

  set selectedUserModel(value: (number | null)[]) {
    this.selectedUser.set(value ?? []);
    this.onUserChange();
  }

  // Hämta användarnamn från id
  getUserName(userId: number | null): string {
    if (userId === null) return 'Unknown';
    const user = this.users().find((u) => u.id === userId);
    return user ? user.name : 'Unknown';
  }

  // Returnera projekt-typ (Shared/Eget)
  getProjectType(projectId: number): string {
    const project = this.projects().find((p) => p.id === projectId);
    return project && project.userIds && project.userIds.length > 1
      ? 'Shared'
      : 'Own';
  }

  // Expandera/stäng användardata
  toggleUserData(userId: number): void {
    let selected = [...this.selectedUserModel];
    const idx = selected.indexOf(userId);
    if (idx > -1) {
      selected.splice(idx, 1);
    } else {
      selected.push(userId);
    }
    if (selected.length === 0) {
      this.expandedUserId = null;
    } else {
      this.expandedUserId = userId;
    }
    this.selectedUserModel = selected;
  }

  // Expandera/stäng projektinformation
  toggleProjectDetails(projectId: number): void {
    if (this.expandedProjectId === projectId) {
      this.expandedProjectId = null;
    } else {
      this.expandedProjectId = projectId;
    }
  }

  // Hämta tasks för ett projekt
  getTasksForProject(projectId: number): any[] {
    return this.tasks().filter((task) => task.projectId === projectId);
  }

  // Summera antal tasks per projekt
  getProjectSummary(projectId: number) {
    const tasks = this.getTasksForProject(projectId);
    const active = tasks.filter(
      (t) => t.status?.toLowerCase() === 'active'
    ).length;
    const completed = tasks.filter(
      (t) => t.status?.toLowerCase() === 'completed'
    ).length;
    const high = tasks.filter(
      (t) => t.priority?.toLowerCase() === 'high'
    ).length;
    const medium = tasks.filter(
      (t) => t.priority?.toLowerCase() === 'medium'
    ).length;
    const low = tasks.filter((t) => t.priority?.toLowerCase() === 'low').length;
    return { active, completed, high, medium, low };
  }
}
