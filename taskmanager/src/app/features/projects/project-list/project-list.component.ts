import {
  Component,
  Input,
  Output,
  EventEmitter,
  WritableSignal,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../models/project.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProjectFormComponent } from '../project-form/project-form.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ProjectDetailComponent } from '../project-detail/project-detail.component';

// Komponent för att visa och hantera projektlistan
@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent {
  @Input() userId!: number;
  @Input() projects: Project[] = [];
  @Input() selectedProjectName: string = '';
  @Output() projectSelected = new EventEmitter<{ id: number; name: string }>();
  @Output() projectDeleted = new EventEmitter<number>();

  searchTerm: WritableSignal<string> = signal('');
  searchQuery: string = '';
  loading: boolean = false;
  filteredProjects = signal<Project[]>([]);

  constructor(
    private projectService: ProjectService,
    private dialog: MatDialog
  ) {
    // Effekt för att uppdatera projektlistan vid förändringar
   effect(() => {
  const allProjects = this.projectService.getProjectsSignal();
  const userProjects = allProjects.filter((project) =>
    project.userIds?.includes(this.userId)
  );
  this.projects = userProjects;

  const query = this.searchTerm().toLowerCase();
  const filtered = this.projects.filter(
    (project) =>
      project.name.toLowerCase().includes(query) ||
      (project.description && project.description.toLowerCase().includes(query))
  );
  this.filteredProjects.set(filtered);
});
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  ngOnChanges(): void {
    if (this.userId) {
      this.loadProjects();
    }
  }

  // Laddar och filtrerar projekt för aktuell användare
  loadProjects(): void {
    this.loading = true;
    const allProjects = this.projectService.getProjectsSignal();
    const userProjects = allProjects.filter((project) => {
      if (!project.id) {
        return false;
      }
      return project.userIds?.includes(this.userId);
    });
    this.projects = userProjects;
    this.filteredProjects.set(this.projects);
    this.loading = false;
  }

  // Sätter sökterm och filtrerar uppgifter
  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  // Hanterar klick på projekt
  onProjectClick(project: Project): void {
    this.projectSelected.emit({ id: project.id, name: project.name });
  }

  // Öppnar dialog för att skapa nytt eller redigera projekt
  openProjectFormDialog(project?: Project): void {
    const dialogRef = this.dialog.open(ProjectFormComponent, {
      panelClass: 'newproject-dialog',
      data: {
        userId: this.userId,
        project: project || { name: '', description: '', userIds: [] },
      },
    });

    dialogRef.afterClosed().subscribe((result: Project | false) => {
      if (result) {
        // Hantera resultat om det behövs
      }
    });
  }

  // Tar bort projekt och uppdaterar listan
  deleteProject(projectId: number): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Delete Project',
          content:
            'Are you sure you want to delete this project? All tasks will be deleted',
          confirmButtonText: 'Delete',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.projectService.deleteProject(projectId);
          this.projects = this.projects.filter((p) => p.id !== projectId);
          this.filteredProjects.set(this.projects);
          this.projectDeleted.emit(projectId);
        }
      });
  }

  // Öppnar dialog för att redigera projekt
  editProject(project: Project): void {
    const dialogRef = this.dialog.open(ProjectDetailComponent, {
      panelClass: 'editproject-detail-dialog',
      data: { project },
    });

    dialogRef.afterClosed().subscribe((updatedProject) => {
      if (updatedProject) {
        if (!updatedProject.id) {
          return;
        }
        this.projectService.updateProject(updatedProject).subscribe(() => {
          const index = this.projects.findIndex(
            (p) => p.id === updatedProject.id
          );
          if (index !== -1) {
            this.projects[index] = updatedProject;
            this.filteredProjects.set([...this.projects]);
          }
        });
      }
    });
  }
}
