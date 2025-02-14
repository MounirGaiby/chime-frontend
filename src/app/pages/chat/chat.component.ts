import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { ChatService } from '../../services/chat.service';
import { ConversationListComponent } from './conversation-list/conversation-list.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { NewChatDialogComponent } from './new-chat-dialog/new-chat-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    ConversationListComponent,
    ChatWindowComponent
  ],
  template: `
    <mat-sidenav-container class="chat-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="new-chat-button">
          <button mat-raised-button color="primary" (click)="openNewChatDialog()">
            <mat-icon>add</mat-icon>
            New Chat
          </button>
        </div>
        <app-conversation-list
          [conversations]="chatService.conversations$ | async"
          (conversationSelected)="onConversationSelected($event)"
          (conversationDeleted)="onConversationDeleted($event)"
        ></app-conversation-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <app-chat-window
          [conversation]="chatService.currentConversation$ | async"
          [models]="chatService.models$ | async"
          (messageSent)="onMessageSent($event)"
        ></app-chat-window>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .chat-container {
      height: 100%;
    }

    .sidenav {
      width: 300px;
      padding: 16px;
    }

    .new-chat-button {
      margin-bottom: 16px;
      
      button {
        width: 100%;
      }
    }
  `]
})
export class ChatComponent implements OnInit {
  constructor(
    public chatService: ChatService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    // Load initial conversations
    this.chatService.loadConversations();
  }

  openNewChatDialog() {
    const dialogRef = this.dialog.open(NewChatDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(title => {
      if (title) {
        this.chatService.createConversation(title).subscribe(conversation => {
          this.onConversationSelected(conversation.id);
        });
      }
    });
  }

  onConversationSelected(id: number) {
    this.chatService.loadConversation(id);
  }

  onConversationDeleted(id: number) {
    this.chatService.deleteConversation(id).subscribe();
  }

  onMessageSent(event: { message: string; model: string; attachments?: File[] }) {
    this.chatService.currentConversation$.pipe(take(1)).subscribe(conversation => {
      if (conversation) {
        const subscription = this.chatService.sendMessage(
          conversation.id,
          event.message,
          event.model,
          // event.attachments
        ).subscribe({
          next: (response) => {
            this.chatService.handleSSEResponse(response);
          },
          error: (error) => {
            console.error('Error sending message:', error);
            this.chatService.setTypingState(false);
          },
          complete: () => subscription.unsubscribe()
        });
      }
    });
  }
} 