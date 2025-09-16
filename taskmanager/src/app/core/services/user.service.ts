import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';

// Service för hantering av användare mot API
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  // Hämtar alla användare från API
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  // Hämtar en användare baserat på id
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  // Lägger till en ny användare
  addUser(user: User): Observable<User> {
    const newUser: User = {
      id: 0,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    };
    return this.http.post<User>(this.baseUrl, newUser);
  }

  // Tar bort en användare
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  // Uppdaterar en användare
  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${user.id}`, user);
  }
}
