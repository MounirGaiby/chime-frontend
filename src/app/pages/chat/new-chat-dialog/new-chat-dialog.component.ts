import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-new-chat-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>New Chat</h2>
      <mat-dialog-content>
        <mat-form-field class="full-width" appearance="fill">
          <mat-label>Chat Title</mat-label>
          <input matInput [(ngModel)]="title" required placeholder="Enter chat title">
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="dialogRef.close()">Cancel</button>
        <button 
          mat-flat-button 
          color="primary" 
          [disabled]="!title.trim()" 
          (click)="dialogRef.close(title)">
          Create
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 24px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
    }

    h2 {
      color: rgba(255, 255, 255, 0.9);
      margin: 0 0 20px 0;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-actions {
      margin: 24px -24px -24px;
      padding: 16px 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    button[color="primary"] {
      background: linear-gradient(135deg, #3498db, #2980b9);
      
      &:hover:not([disabled]) {
        transform: translateY(-1px);
        box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
      }
    }
  `]
})
export class NewChatDialogComponent {
  title = '';

  constructor(public dialogRef: MatDialogRef<NewChatDialogComponent>) {}
} 