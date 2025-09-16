import {
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { ChartType } from 'chart.js';
import { Task } from '../../../models/task.model';
import { Subject } from 'rxjs';
import { TaskService } from '../../../core/services/task.service';
import { signal, effect } from '@angular/core';
import { ProjectService } from '../../../core/services/project.service';

// Komponent för att visa cirkeldiagram över tasks för en användare
@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
})
export class PieChartComponent implements OnInit, OnDestroy, OnChanges {
  @Input() selectedUserId!: number | undefined;
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  pieChartData: any = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        data: [0, 0, 0],
      },
    ],
  };

  pieChartType: ChartType = 'pie';
  private destroy$ = new Subject<void>();
  private tasksSignal = signal<Task[]>([]);

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService
  ) {
    // Effekt som uppdaterar diagrammet när tasks eller projekt ändras
    effect(() => {
      if (this.selectedUserId === undefined) return;

      const allTasks = this.taskService['tasks']();
      const allProjects = this.projectService['projects']();

      const userProjectIds = allProjects
        .filter((project: any) =>
          project.userIds?.includes(this.selectedUserId)
        )
        .map((project: any) => project.id);

      const userTasks = allTasks.filter(
        (task: Task) =>
          task.creatorId === this.selectedUserId ||
          userProjectIds.includes(task.projectId)
      );

      this.tasksSignal.set(userTasks);
      this.updateChart(userTasks);
    });
  }

  // Initierar och hämtar tasks för användaren vid start
  ngOnInit(): void {
    if (this.selectedUserId !== undefined) {
      this.fetchTasksForUser();
    }
  }

  // Uppdaterar tasks när input ändras
  ngOnChanges(): void {
    if (this.selectedUserId !== undefined) {
      this.fetchTasksForUser();
    }
  }

  // Hämtar tasks för användaren
  fetchTasksForUser(): void {
    if (this.selectedUserId === undefined) return;
    this.taskService.fetchTasks();
  }

  // Uppdaterar cirkeldiagrammet med nya data
  updateChart(tasks: Task[]): void {
    const priorityCounts = { high: 0, medium: 0, low: 0 };
    const activeTasks = tasks.filter((t) => t.status === 'active');

    activeTasks.forEach((task) => {
      if (task.priority === 'High') priorityCounts.high++;
      else if (task.priority === 'Medium') priorityCounts.medium++;
      else if (task.priority === 'Low') priorityCounts.low++;
    });

    this.pieChartData.datasets[0].data = [
      priorityCounts.high,
      priorityCounts.medium,
      priorityCounts.low,
    ];

    this.chart?.update();
  }

  // Rensar subscriptions vid komponentens borttagning
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
