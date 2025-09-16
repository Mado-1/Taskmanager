import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../../models/project.model';
import { Task } from '../../../models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../models/user.model';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';

// Komponent för att visa och redigera detaljer för ett projekt
@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
  ],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss'],
})
export class ProjectDetailComponent implements OnInit {
  project?: Project;
  tasks: Task[] = [];
  projectForm!: FormGroup;
  users: User[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { project: Project },
    private taskService: TaskService,
    private projectService: ProjectService,
    private userService: UserService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProjectDetailComponent>,
    private snackBar: MatSnackBar
  ) {}

  // Initierar och hämtar projektdata, användare och tasks vid start
  ngOnInit(): void {
    const projectId = this.data.project.id;
    if (!projectId) {
      return;
    }

    this.projectService
      .getProjectById(projectId)
      .subscribe((project: Project) => {
        this.project = project;
        this.projectForm = this.fb.group({
          name: [project.name],
          description: [project.description],
          userIds: [project.userIds || []],
        });

        this.userService.getUsers().subscribe((users: User[]) => {
          this.users = users;
        });

        this.taskService
          .getTasksForProject(this.project.id)
          .subscribe((tasks: Task[]) => {
            this.tasks = tasks;
          });
      });
  }

  // Skickar in ändringar och uppdaterar projektet
  onSubmit(): void {
    if (this.projectForm.valid) {
      const formValue = this.projectForm.value;
      const updatedProject = {
        ...this.project,
        ...formValue,
        userIds: formValue.userIds,
      };

      this.projectService.updateProject(updatedProject).subscribe(() => {
        this.dialogRef.close(updatedProject);
        this.snackBar.open('Projektet har uppdaterats!', 'Stäng', {
          duration: 3000,
        });
        this.projectService.fetchProjects();
      });
    }
  }

  // Stänger dialogen
  close() {
    this.dialogRef.close();
  }
}
