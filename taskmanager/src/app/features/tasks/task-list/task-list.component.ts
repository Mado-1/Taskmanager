import {
  Component,
  Input,
  Output,
  EventEmitter,
  WritableSignal,
  signal,
  effect,
  OnInit,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TaskFormComponent } from '../task-form/task-form.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { PriorityColorPipe } from '../../../pipes/priority-color.pipe';

// Komponent för att visa och hantera uppgiftslistan
@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, MatDialogModule, DragDropModule, PriorityColorPipe],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnInit {
  @Input() userId!: number;
  @Input() projectId!: number;
  @Output() taskSelected = new EventEmitter<number>();

  tasks: WritableSignal<Task[]> = signal([]);
  searchTerm: WritableSignal<string> = signal('');

  localTasks: Task[] = [];
  filteredTasksList: Task[] = [];
  loading: boolean = false;

  lowPriorityTasks: Task[] = [];
  mediumPriorityTasks: Task[] = [];
  highPriorityTasks: Task[] = [];
  completedTasks: Task[] = [];

  constructor(private taskService: TaskService, private dialog: MatDialog) {
    // Effekt som uppdaterar och sorterar uppgifter vid förändring
    effect(() => {
      const allTasks = this.taskService['tasks']();
      const tasks = allTasks.filter((t) => t.projectId === this.projectId);

      const query = this.searchTerm().toLowerCase();

      // Filtrera tasks baserat på söktermen
      const filtered = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.status.toLowerCase().includes(query) ||
          task.priority.toLowerCase().includes(query)
      );

      this.filteredTasksList = filtered;

      // Filtrera kolumner baserat på söktermen
      this.lowPriorityTasks = filtered.filter(
        (task) =>
          task.priority === 'Low' && task.status.toLowerCase() !== 'completed'
      );
      this.mediumPriorityTasks = filtered.filter(
        (task) =>
          task.priority === 'Medium' &&
          task.status.toLowerCase() !== 'completed'
      );
      this.highPriorityTasks = filtered.filter(
        (task) =>
          task.priority === 'High' && task.status.toLowerCase() !== 'completed'
      );
      this.completedTasks = filtered.filter(
        (task) => task.status.toLowerCase() === 'completed'
      );
    });
  }

  // Initierar och hämtar tasks vid start
  ngOnInit(): void {
    this.taskService.fetchTasks();
  }

  ngOnChanges(): void {
    if (this.projectId) {
      // Ingen loggning
    }
  }

  // Öppnar dialog för att skapa eller redigera uppgift
  openTaskFormDialog(task?: Task): void {
    if (!this.projectId) return;

    const dialogRef = this.dialog.open(TaskFormComponent, {
      panelClass: 'newtask-dialog',
      data: {
        userId: this.userId,
        projectId: this.projectId,
        task: task || null,
      },
    });

    dialogRef.afterClosed().subscribe((result: Task | false) => {
      if (result) {
        this.taskService.fetchTasks();
      }
    });
  }

  // Tar bort uppgift
  deleteTask(taskId: number): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Delete Task',
          content: 'Are you sure you want to delete this task?',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.taskService.deleteTask(taskId);
        }
      });
  }

  // Sätter sökterm och filtrerar uppgifter
  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  // Filtrerar uppgifter baserat på sökterm
  filterTasks(): void {
    const query = this.searchTerm().toLowerCase();
    this.filteredTasksList = this.localTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.status.toLowerCase().includes(query) ||
        task.priority.toLowerCase().includes(query)
    );
  }

  // Laddar tasks för användare och projekt
  loadTasks(userId: number): void {
    this.loading = true;
    this.taskService.fetchTasks();

    const allTasks = this.taskService['tasks']();
    const tasks = allTasks.filter(
      (t) => t.creatorId === userId && t.projectId === this.projectId
    );

    this.tasks.set(tasks);
    this.localTasks = tasks;
    this.filteredTasksList = tasks;

    this.lowPriorityTasks = [];
    this.mediumPriorityTasks = [];
    this.highPriorityTasks = [];
    this.completedTasks = [];

    for (const task of tasks) {
      if (task.status.toLowerCase() === 'completed') {
        this.completedTasks.push(task);
      } else {
        if (task.priority === 'Low') this.lowPriorityTasks.push(task);
        else if (task.priority === 'Medium')
          this.mediumPriorityTasks.push(task);
        else if (task.priority === 'High') this.highPriorityTasks.push(task);
      }
    }

    this.loading = false;
  }

  // Öppnar dialog för att redigera uppgift
  editTask(task: Task): void {
    this.dialog.open(TaskDetailComponent, {
      data: { task },
      panelClass: 'task-detail-dialog',
    });
  }

  // Filtrerar tasks efter prioritet
  filteredTasksByPriority(priority: string) {
    return this.filteredTasksList.filter((task) => task.priority === priority);
  }

  // Uppdaterar en uppgift
  updateTask(task: Task): void {
    if (task.id !== undefined) {
      this.taskService.updateTask(task.id, task);
    }
    this.loadTasks(this.userId);
  }

  // Hanterar drag and drop mellan kolumner
  onTaskDrop(event: any): void {
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;
    const task = event.item.data;

    if (event.container.id === 'completed') {
      task.status = 'completed';
    } else if (['low', 'medium', 'high'].includes(event.container.id)) {
      task.priority =
        event.container.id.charAt(0).toUpperCase() +
        event.container.id.slice(1);
      if (task.status === 'completed') {
        task.status = 'active';
      }
    }

    this.updateTask(task);
  }
}
