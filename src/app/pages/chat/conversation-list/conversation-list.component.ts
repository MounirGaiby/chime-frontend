import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Conversation } from '../../../interfaces/chat.interface';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatButtonModule],
  template: `
    <mat-nav-list>
      @for (conversation of conversations; track conversation.id) {
        <mat-list-item (click)="conversationSelected.emit(conversation.id)">
          <span matListItemTitle>{{ conversation.title }}</span>
          <span matListItemLine>Messages: {{ conversation.chats_count }}</span>
          <button mat-icon-button (click)="onDelete($event, conversation.id)">
            <mat-icon>delete</mat-icon>
          </button>
        </mat-list-item>
      }
    </mat-nav-list>
  `,
  styles: [`
    mat-list-item {
      cursor: pointer;
      &:hover {
        background: rgba(0, 0, 0, 0.04);
      }
    }
  `]
})
export class ConversationListComponent {
  @Input() conversations: Conversation[] | null = [];
  @Output() conversationSelected = new EventEmitter<number>();
  @Output() conversationDeleted = new EventEmitter<number>();

  onDelete(event: Event, id: number) {
    event.stopPropagation();
    this.conversationDeleted.emit(id);
  }
} 