import {
  Component,
  OnInit,
  Inject,
  EventEmitter,
  Output,
  effect,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { ProjectService } from '../../../core/services/project.service';
import { TaskService } from '../../../core/services/task.service';
import { User } from '../../../models/user.model';
import { Project } from '../../../models/project.model';
import { Task } from '../../../models/task.model';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
})
export class UserDetailComponent implements OnInit {
  @Output() userUpdated = new EventEmitter<User>();

  userForm!: FormGroup;
  user!: User;
  projects: Project[] = [];
  tasks: Task[] = [];
  expandedProjectId: number | null = null;

  searchQuery: string = '';

  selectedUser: any;
  userProjects: Project[] = [];
  selectedProjectTasks: Task[] = [];

  private userSignal: WritableSignal<User | null> = signal(null);

  users: User[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private projectService: ProjectService,
    private taskService: TaskService,
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private dialogRef: MatDialogRef<UserDetailComponent>
  ) {
    // Effekt som uppdaterar projekt och tasks när användaren ändras
    effect(() => {
      const user = this.userSignal();
      if (!user) return;

      const allProjects = this.projectService['projects']() ?? [];
      const allTasks = this.taskService['tasks']() ?? [];

      this.projects = allProjects.filter((p: Project) =>
        p.userIds.includes(user.id)
      );

      const userProjectIds = this.projects.map((p) => Number(p.id));
      this.tasks = allTasks
        .filter(
          (task: Task) =>
            task.creatorId === user.id ||
            userProjectIds.includes(Number(task.projectId))
        )
        .map((task: Task) => {
          const project = this.projects.find(
            (p) => Number(p.id) === task.projectId
          );
          return {
            ...task,
            projectName: project ? project.name : 'Unknown',
            formattedDeadline: task.deadline
              ? new Date(task.deadline).toLocaleDateString()
              : 'No deadline',
          };
        });
    });
  }

  // Initierar och hämtar användare, projekt och tasks vid start
  ngOnInit(): void {
    this.userService.getUserById(this.data.id).subscribe((user) => {
      this.user = user;
      this.userForm = this.fb.group({
        name: [user.name],
        role: [user.role],
      });
      this.userSignal.set(user);

      this.projectService.fetchProjects();
      this.taskService.fetchTasks?.();

      this.userService.getUsers().subscribe((users) => {
        this.users = users;
      });
    });
  }

  // Hämtar tasks för ett specifikt projekt
  getTasksForProject(projectId: number): Task[] {
    return this.tasks.filter((task) => task.projectId === projectId);
  }

  // Hämtar avslutade tasks för ett projekt
  getCompletedTasks(projectId: number): Task[] {
    return this.tasks.filter(
      (task) => task.projectId === projectId && task.status === 'completed'
    );
  }

  // Expandera eller minimera projektsektion
  toggleProject(projectId: number) {
    this.expandedProjectId =
      this.expandedProjectId === projectId ? null : projectId;
  }

  // Stänger dialogen och skickar tillbaka användaren
  close(): void {
    this.dialogRef.close(this.user);
  }

  // Hanterar val av användare och uppdaterar projekt och tasks
  onUserSelected(user: any): void {
    this.selectedUser = user;

    this.projectService.getProjectsByUserId(user.id);

    const projects = this.projectService['projects']();
    this.userProjects = projects.filter((p: Project) =>
      p.userIds.includes(user.id)
    );

    this.selectedProjectTasks = [];
  }

  // Filtrerar projekt baserat på sökterm
  get filteredProjects(): Project[] {
    return this.projects.filter((project) =>
      project.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // Hämtar projektnamn baserat på id
  getProjectName(projectId: number): string {
    const project = this.projects.find(
      (project) => project.id === Number(projectId)
    );
    return project ? project.name : 'Unknown';
  }

  // Hämtar användarnamn baserat på id
  getUserName(id: number): string {
    const user = this.users.find((u) => u.id === id);
    return user ? user.name : id.toString();
  }

  // Skickar in ändringar och uppdaterar användaren
  onSubmit(): void {
    if (this.userForm.valid) {
      const updatedUser = { ...this.user, ...this.userForm.value };
      this.userService.updateUser(updatedUser).subscribe((updatedData) => {
        this.user = updatedData;
        this.userUpdated.emit(updatedData);
      });
    }
  }

  // Returnerar CSS-klass för prioritet
  getPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  }

  // Hämtar antal användare för ett projekt
  getProjectUserCount(projectId: number): number {
    const project = this.projects.find((p) => p.id === projectId);
    return project ? project.userIds.length : 0;
  }
}
