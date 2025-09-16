import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../models/user.model';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { UserFormComponent } from '../user-form/user-form.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ProjectService } from '../../../core/services/project.service';
import { Task } from '../../../models/task.model';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { WritableSignal, signal } from '@angular/core';
import { TaskService } from '../../../core/services/task.service';

// Komponent för att visa och hantera användarlistan
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatDialogModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit, OnDestroy {
  @Output() userSelected = new EventEmitter<User>();

  users: User[] = [];
  filteredUsers: User[] = [];
  searchQuery: string = '';
  loading: boolean = true;
  errorMessage: string = '';
  tasksPerUser: WritableSignal<{ [userId: number]: Task[] }> = signal({});

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private projectService: ProjectService,
    private taskService: TaskService,
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog
  ) {
    // Effekt som uppdaterar filtrerade användare vid förändring av tasksPerUser
    effect(() => {
      const tasks = this.tasksPerUser();
      this.filteredUsers = [...this.filteredUsers];
    });
  }

  // Initierar och hämtar användare, projekt och tasks vid start
  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load users';
        this.loading = false;
      },
    });

    this.projectService.fetchProjects();
    this.taskService.fetchTasks();
  }

  // Rensar subscriptions vid komponentens borttagning
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Filtrerar användare baserat på sökterm
  filterUsers(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredUsers = this.users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
    );
  }

  // Väljer användare och skickar event
  selectUser(user: User): void {
    this.userSelected.emit(user);
  }

  // Navigerar till användardetaljsida
  goToUserDetail(userId: number): void {
    this.router.navigate(['/user', userId]);
  }

  // Öppnar dialog för att visa/redigera användare
  openUserDetailDialog(user: User): void {
    const dialogRef = this.dialog.open(UserDetailComponent, {
      panelClass: 'useredit-dialog-container',
      data: { id: user.id },
    });

    dialogRef.componentInstance.userUpdated.subscribe((updatedUser: User) => {
      const index = this.users.findIndex((u) => u.id === updatedUser.id);
      if (index !== -1) {
        this.users[index] = updatedUser;
        this.filteredUsers[index] = updatedUser;
      }
    });
  }

  // Öppnar dialog för att lägga till ny användare
  openUserFormDialog(): void {
    const dialogRef = this.dialog.open(UserFormComponent, {
      panelClass: 'newuser-dialog-container',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'refresh') {
        this.refreshUsers();
      }
    });
  }

  // Uppdaterar användarlistan
  refreshUsers(): void {
    this.userService.getUsers().subscribe((users) => {
      this.users = users;
      this.filteredUsers = users;
    });
  }

  // Tar bort användare och uppdaterar listan
  deleteUser(user: User): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Delete User',
          content: 'Are you sure you want to delete this user?',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          const idToDelete = Number(user.id);
          this.userService.deleteUser(idToDelete).subscribe(() => {
            this.users = this.users.filter((u) => Number(u.id) !== idToDelete);
            this.filteredUsers = this.filteredUsers.filter(
              (u) => Number(u.id) !== idToDelete
            );
            const updatedTasks = { ...this.tasksPerUser() };
            delete updatedTasks[idToDelete];
            this.tasksPerUser.set(updatedTasks);
          });
        }
      });
  }

  // Hämtar antal projekt för användare
  getProjectCount(user: User): number {
    const allProjects = this.projectService['projects']();
    return allProjects.filter((p) => p.userIds?.includes(user.id)).length;
  }

  // Hämtar antal tasks för användare
  getTaskCount(user: User): number {
    const allTasks = this.taskService['tasks']();
    const allProjects = this.projectService['projects']();

    const userProjectIds = allProjects
      .filter((project) => project.userIds?.includes(user.id))
      .map((project) => project.id);

    return allTasks.filter(
      (task: Task) =>
        task.creatorId === user.id || userProjectIds.includes(task.projectId)
    ).length;
  }

  // Hämtar procentandel av tasks per prioritet för användare
  getTaskPercentage(user: User, priority: string): number {
    const allTasks = this.taskService['tasks']();
    const allProjects = this.projectService['projects']();

    const userProjectIds = allProjects
      .filter((project) => project.userIds?.includes(user.id))
      .map((project) => project.id);

    const userTasks = allTasks.filter(
      (task: Task) =>
        (task.creatorId === user.id ||
          userProjectIds.includes(task.projectId)) &&
        task.status?.toLowerCase() === 'active'
    );

    const total = userTasks.length;
    if (total === 0) {
      return 0;
    }

    const priorityTasks = userTasks.filter(
      (t) => t.priority?.toLowerCase() === priority.toLowerCase()
    );

    return (priorityTasks.length / total) * 100;
  }
}
