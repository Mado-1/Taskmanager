import { Component, OnInit, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../core/services/task.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Task } from '../../../models/task.model';

// Komponent för formulär att skapa eller uppdatera en uppgift
@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private dialogRef: MatDialogRef<TaskFormComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA)
    public data: { userId: number; projectId: number; task?: Task }
  ) {
    this.taskForm = this.fb.group({
      title: [data.task?.title || '', [Validators.required]],
      description: [data.task?.description || ''],
      priority: [data.task?.priority || 'Low', [Validators.required]],
      status: [data.task?.status || 'active', [Validators.required]],
      projectId: [data.projectId, [Validators.required]],
      creatorId: [data.userId, [Validators.required]],
      deadline: [data.task?.deadline || ''],
    });
  }

  // Initierar komponenten
  ngOnInit(): void {}

  // Skickar in formuläret och skapar eller uppdaterar uppgift
  onSubmit(): void {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;

      if (this.data.task?.id) {
        const updatedTask = this.createOrderedTaskData({
          ...this.data.task,
          ...formValue,
        });

        this.taskService.updateTask(updatedTask.id, updatedTask);
        this.snackBar.open('Uppgiften har uppdaterats!', 'Stäng', {
          duration: 3000,
        });
        this.dialogRef.close(updatedTask);
      } else {
        const newTask = this.createOrderedTaskData({
          ...formValue,
          creatorId: this.data.userId,
        });

        this.taskService.createTask(newTask);
        this.snackBar.open('Uppgiften har skapats!', 'Stäng', {
          duration: 3000,
        });
        this.dialogRef.close(newTask);
      }
    }
  }

  // Avbryter och stänger dialogen utan att spara
  onCancel(): void {
    this.dialogRef.close(false);
  }

  // Skapar task-objekt med rätt ordning på fälten
  createOrderedTaskData(formValue: any): any {
    return {
      id: formValue.id || 0,
      title: formValue.title,
      description: formValue.description,
      priority: formValue.priority,
      status: formValue.status,
      projectId: formValue.projectId,
      creatorId: formValue.creatorId,
      deadline: formValue.deadline,
    };
  }

  // Stänger dialogen
  close(): void {
    this.dialogRef.close();
  }
}
