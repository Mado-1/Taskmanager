import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

// Data för bekräftelsedialog
export interface ConfirmDialogData {
  title?: string;
  content?: string;
}

// Komponent för bekräftelsedialog (t.ex. vid borttagning)
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>{{ data.title || 'Confirm' }}</h2>
    <mat-dialog-content>
      {{ data.content || 'Are you sure you want to delete this?' }}
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-button color="warn" (click)="confirm()">Delete</button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  // Avbryter och stänger dialogen utan att bekräfta
  cancel() {
    this.dialogRef.close(false);
  }

  // Bekräftar åtgärden och stänger dialogen
  confirm() {
    this.dialogRef.close(true);
  }
}
