import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';
import { Task } from '../../models/task.model';
import { Project } from '../../models/project.model';
import { PieChartComponent } from '../../shared/components/pie-chart/pie-chart.component';
import { BarChartTaskComponent } from '../../shared/components/bar-chart-task/bar-chart-task.component';
import { SummaryComponent } from '../../shared/components/summary/summary.component';
import { UserListComponent } from '../users/user-list/user-list.component';
import { ProjectListComponent } from '../projects/project-list/project-list.component';
import { TaskListComponent } from '../tasks/task-list/task-list.component';
import { TaskService } from '../../core/services/task.service';
import { BarChartByProjectComponent } from '../../shared/components/bar-chart-project/project.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    UserListComponent,
    PieChartComponent,
    BarChartTaskComponent,
    SummaryComponent,
    ProjectListComponent,
    TaskListComponent,
    BarChartByProjectComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  selectedUser: User | null = null;
  selectedProjectId: number | null = null;
  selectedProjectName: string = 'No Project Selected';
  selectedProjectTasks: Task[] = [];
  userProjects: Project[] = [];

  constructor(private taskService: TaskService) {}

  // Hanterar när en användare väljs
  onUserSelected(user: User): void {
    this.selectedUser = user;
    this.selectedProjectId = null;
    this.selectedProjectTasks = [];
  }

  // Hanterar när ett projekt klickas och hämtar tasks för projektet
  onProjectClick(projectData: { id: number; name: string }): void {
    this.selectedProjectId = projectData.id;
    this.selectedProjectName = projectData.name;
    this.taskService.fetchTasks();
    const allTasks = this.taskService['tasks']();
    this.selectedProjectTasks = allTasks.filter((t: Task) => {
      return (
        t.projectId === projectData.id &&
        t.creatorId === (this.selectedUser?.id || 0)
      );
    });
  }

  // Hanterar när ett projekt tas bort
  onProjectDeleted(projectId: number): void {
    if (this.selectedProjectId === projectId) {
      this.selectedProjectId = null;
      this.selectedProjectName = 'No Project Selected';
      this.selectedProjectTasks = [];
    }
    this.userProjects = this.userProjects.filter((p) => p.id !== projectId);
  }
}
