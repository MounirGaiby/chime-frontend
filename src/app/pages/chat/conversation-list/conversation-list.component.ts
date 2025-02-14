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
    <mat-nav-list class="conversation-list">
      @for (conversation of conversations; track conversation.id) {
        <mat-list-item 
          (click)="conversationSelected.emit(conversation.id)"
          [class.active]="conversation.id === activeConversationId">
          <div class="conversation-item">
            <div class="conversation-info">
              <span class="title">{{ conversation.title }}</span>
              <span class="message-count">{{ conversation.chats_count }} messages</span>
            </div>
            <button 
              mat-icon-button 
              class="delete-button"
              (click)="onDelete($event, conversation.id)"
              matTooltip="Delete conversation">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </mat-list-item>
      }
    </mat-nav-list>
  `,
  styles: [`
    .conversation-list {
      padding: 0;
      background: transparent;
      overflow-x: hidden;
    }

    .conversation-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 8px 16px;
      box-sizing: border-box;
    }

    mat-list-item {
      height: auto !important;
      background: rgba(26, 28, 30, 0.6);
      margin: 4px 8px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: all 0.3s ease;

      &:hover {
        background: rgba(26, 28, 30, 0.8);
        transform: translateY(-1px);
        border-color: rgba(52, 152, 219, 0.3);
      }

      &.active {
        background: rgba(52, 152, 219, 0.15);
        border-color: rgba(52, 152, 219, 0.3);
      }
    }

    .conversation-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .title {
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
      font-size: 0.95rem;
    }

    .message-count {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.8rem;
    }

    .delete-button {
      opacity: 0;
      transform: translateX(10px);
      transition: all 0.3s ease;
      color: rgba(255, 255, 255, 0.5);
      
      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        line-height: 18px;
      }

      &:hover {
        color: #e74c3c;
        background: rgba(231, 76, 60, 0.1);
      }
    }

    mat-list-item:hover .delete-button {
      opacity: 1;
      transform: translateX(0);
    }
  `]
})
export class ConversationListComponent {
  @Input() conversations: Conversation[] | null = [];
  @Input() activeConversationId?: number;
  @Output() conversationSelected = new EventEmitter<number>();
  @Output() conversationDeleted = new EventEmitter<number>();

  onDelete(event: Event, id: number) {
    event.stopPropagation();
    this.conversationDeleted.emit(id);
  }
} 