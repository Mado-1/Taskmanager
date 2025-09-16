import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task } from '../../models/task.model';
import { WritableSignal, signal } from '@angular/core';

// Service för hantering av tasks mot API och signal
@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private baseUrl = 'http://localhost:3000/tasks';
  private tasks: WritableSignal<Task[]> = signal([]);

  constructor(private http: HttpClient) {}

  // Hämtar alla tasks från API och uppdaterar signalen
  fetchTasks() {
    this.http.get<Task[]>(this.baseUrl).subscribe((data) => {
      this.tasks.set(data);
    });
  }

  // Hämtar alla tasks för en användare och uppdaterar signalen
  getTasksByUserId(userId: number) {
    this.http.get<Task[]>(this.baseUrl).subscribe((data) => {
      const filtered = data.filter((t) => t.creatorId === userId);
      this.tasks.set(filtered);
    });
  }

  // Hämtar tasks för ett specifikt projekt
  getTasksForProject(projectId: number) {
    return this.http.get<Task[]>(`${this.baseUrl}?projectId=${projectId}`);
  }

  // Skapar en ny task och uppdaterar signalen
  createTask(task: Task) {
    this.http.post<Task>(this.baseUrl, task).subscribe((created: Task) => {
      this.tasks.set([...this.tasks(), created]);
    });
  }

  // Lägger till en task och uppdaterar signalen
  addTask(task: Task) {
    const newTask: Task = {
      id: 0,
      title: task.title,
      priority: task.priority,
      status: task.status,
      projectId: task.projectId,
      creatorId: task.creatorId,
      deadline: task.deadline,
      projectName: task.projectName,
    };

    this.http.post<Task>(this.baseUrl, newTask).subscribe((created: Task) => {
      this.tasks.set([...this.tasks(), created]);
    });
  }

  // Tar bort en task och uppdaterar signalen
  deleteTask(id: number) {
    this.http.delete<void>(`${this.baseUrl}/${id}`).subscribe(() => {
      this.tasks.set(this.tasks().filter((t) => t.id !== id));
    });
  }

  // Uppdaterar en task och uppdaterar signalen
  updateTask(id: number, task: Task) {
    this.http
      .put<Task>(`${this.baseUrl}/${id}`, task)
      .subscribe((updated: Task) => {
        this.tasks.set(this.tasks().map((t) => (t.id === id ? updated : t)));
      });
  }
}
