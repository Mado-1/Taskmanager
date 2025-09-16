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
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../models/user.model';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Project } from '../../../models/project.model';

// Komponent för formulär att skapa eller uppdatera projekt
@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSelectModule,
    MatOptionModule,
  ],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss'],
})
export class ProjectFormComponent implements OnInit {
  projectForm: FormGroup;
  users: User[] = [];

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private userService: UserService,
    private dialogRef: MatDialogRef<ProjectFormComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { userId: number; project?: Project }
  ) {
    this.projectForm = this.fb.group({
      name: [data.project?.name || ''],
      description: [data.project?.description || ''],
      creatorId: [data.userId],
      userIds: [data.project?.userIds || []],
    });
  }

  // Initierar och hämtar användare vid start
  ngOnInit(): void {
    this.userService.getUsers().subscribe((users) => {
      this.users = users.filter((user) => user.id !== this.data.userId);
    });
  }

  // Skickar in formuläret och skapar eller uppdaterar projekt
  onSubmit(): void {
    if (this.projectForm.valid) {
      const formValue = this.projectForm.value;

      if (this.data.project?.id) {
        const updatedProject = this.createOrderedProjectData({
          ...this.data.project,
          ...formValue,
        });

        this.projectService.updateProject(updatedProject).subscribe(() => {
          this.snackBar.open('Projektet har uppdaterats!', 'Stäng', {
            duration: 3000,
          });
          this.dialogRef.close(updatedProject);
        });
      } else {
        const newProject = this.createOrderedProjectData({
          ...formValue,
          creatorId: this.data.userId,
          userIds: [...(formValue.userIds || []), this.data.userId],
        });

        this.projectService
          .createProject(newProject)
          .subscribe((createdProject) => {
            this.snackBar.open('Projektet har skapats!', 'Stäng', {
              duration: 3000,
            });
            this.dialogRef.close(createdProject);
          });
      }
    }
  }

  // Avbryter och stänger dialogen utan att spara
  onCancel(): void {
    this.dialogRef.close(false);
  }

  // Skapar projektobjekt med rätt ordning på fälten
  createOrderedProjectData(formValue: any): any {
    return {
      id: formValue.id || 0,
      name: formValue.name,
      description: formValue.description,
      creatorId: formValue.creatorId,
      userIds: formValue.userIds,
    };
  }

  // Stänger dialogen
  close() {
    this.dialogRef.close();
  }
}
