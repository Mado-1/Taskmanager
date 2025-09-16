import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss'],
})
export class TaskDetailComponent implements OnInit {
  task?: Task;
  taskForm!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { task: Task },
    private dialogRef: MatDialogRef<TaskDetailComponent>,
    private taskService: TaskService,
    private fb: FormBuilder
  ) {}

  // Initierar och hämtar task-data vid start
  ngOnInit(): void {
    this.task = this.data.task;

    this.taskForm = this.fb.group({
      title: [this.task?.title, [Validators.required]],
      description: [this.task?.description],
      priority: [this.task?.priority, [Validators.required]],
      status: [this.task?.status, [Validators.required]],
      deadline: [
        this.task?.deadline
          ? typeof this.task.deadline === 'string'
            ? this.task.deadline.substring(0, 10)
            : new Date(this.task.deadline).toISOString().substring(0, 10)
          : '',
      ],
    });
  }

  // Skickar in ändringar och uppdaterar task
  onSubmit(): void {
    if (this.taskForm.valid && this.task && this.task.id !== undefined) {
      const updatedTask = { ...this.task, ...this.taskForm.value };
      this.taskService.updateTask(this.task.id, updatedTask);
      this.dialogRef.close(updatedTask);
    }
  }

  // Avbryter och stänger dialogen utan att spara
  onCancel(): void {
    this.dialogRef.close();
  }

  // Stänger dialogen
  close(): void {
    this.dialogRef.close();
  }
}
