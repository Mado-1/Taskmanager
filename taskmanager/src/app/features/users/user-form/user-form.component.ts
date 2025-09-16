import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../../core/services/user.service';


// Komponent för formulär att lägga till ny användare
@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent {
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private dialogRef: MatDialogRef<UserFormComponent>
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      role: ['', Validators.required],
      avatar: [''],
    });
  }

  // Skickar in formuläret och lägger till användare
  onSubmit(): void {
    if (this.userForm.valid) {
      const { id, ...newUserData } = this.userForm.value;
      this.userService.addUser(newUserData).subscribe(() => {
        this.dialogRef.close('refresh');
      });
    }
  }

  // Avbryter och stänger dialogen utan att spara
  onCancel(): void {
    this.dialogRef.close();
  }

  // Stänger dialogen
  close() {
    this.dialogRef.close();
  }
}
