import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  effect,
  OnInit,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { Chart, ChartData, ChartOptions } from 'chart.js';
import { TaskService } from '../../../core/services/task.service';
import { ProjectService } from '../../../core/services/project.service';
import { Task } from '../../../models/task.model';
import { Project } from '../../../models/project.model';
import { Subject } from 'rxjs';

// Komponent för att visa stapeldiagram över egna och delade tasks för en användare
@Component({
  selector: 'app-bar-chart-task',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  template: `<canvas #chartCanvas></canvas>`,
})
export class BarChartTaskComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() selectedUserId!: number;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  chart!: Chart<'bar'>;

  private destroy$ = new Subject<void>();

  chartData: ChartData<'bar'> = {
    labels: ['Task'],
    datasets: [
      {
        label: 'Own',
        data: [0],
        backgroundColor: '#42a5f5',
      },
      {
        label: 'Shared',
        data: [0],
        backgroundColor: '#66bb6a',
      },
    ],
  };

  chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    indexAxis: 'x',
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService
  ) {
    // Effekt som uppdaterar diagrammet när projekt- eller taskdata ändras
    effect(() => {
      if (!this.selectedUserId) return;

      const allProjects = this.projectService['projects']();
      const allTasks = this.taskService['tasks']();

      // Egna projekt: där användaren är skapare och det inte är delat
      const ownProjectIds = allProjects
        .filter(
          (p: Project) =>
            p.creatorId === this.selectedUserId && p.userIds.length === 1
        )
        .map((p: Project) => p.id);

      // Delade projekt: där användaren är med och det är fler än en användare
      const sharedProjectIds = allProjects
        .filter(
          (p: Project) =>
            p.userIds.includes(this.selectedUserId) && p.userIds.length > 1
        )
        .map((p: Project) => p.id);

      // Tasks i egna projekt
      const ownTasks = allTasks.filter((t: Task) =>
        ownProjectIds.includes(t.projectId)
      );
      // Tasks i delade projekt
      const sharedTasks = allTasks.filter((t: Task) =>
        sharedProjectIds.includes(t.projectId)
      );

      if (this.chart) {
        this.chart.data.labels = ['Task'];
        this.chart.data.datasets[0].data = [ownTasks.length];
        this.chart.data.datasets[1].data = [sharedTasks.length];
        this.chart.update();
      }
    });
  }

  // Initierar och hämtar projekt och tasks vid start
  ngOnInit(): void {
    this.projectService.fetchProjects();
    this.taskService.fetchTasks();
  }

  // Skapar diagrammet efter att vyn har initierats
  ngAfterViewInit(): void {
    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: this.chartData,
      options: this.chartOptions,
    });
  }

  // Rensar subscriptions vid komponentens borttagning
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
