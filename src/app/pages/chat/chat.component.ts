import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
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
import { AppComponent } from '../../app.component';
import { MatSidenav } from '@angular/material/sidenav';

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
    <mat-sidenav-container class="chat-container" [hasBackdrop]="true">
      <mat-sidenav #sidenav [mode]="isMobile ? 'over' : 'side'" 
                   [opened]="initialSidenavState" 
                   class="sidenav">
        <div class="sidenav-header">
          <div class="new-chat-button">
            <button mat-raised-button color="primary" (click)="openNewChatDialog()">
              <mat-icon>add</mat-icon>
              New Chat
            </button>
          </div>
        </div>
        <app-conversation-list
          [conversations]="chatService.conversations$ | async"
          [activeConversationId]="(chatService.currentConversation$ | async)?.id"
          (conversationSelected)="onConversationSelected($event)"
          (conversationDeleted)="onConversationDeleted($event)"
        ></app-conversation-list>
      </mat-sidenav>

      <mat-sidenav-content [style.margin-left]="!isMobile && !sidenav.opened ? '0' : null">
        <app-chat-window
          [conversation]="chatService.currentConversation$ | async"
          [models]="chatService.models$ | async"
          [sidebarOpen]="sidenav.opened"
          (messageSent)="onMessageSent($event)"
        ></app-chat-window>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    :host {
      display: block;
      height: calc(100vh - 64px);
      width: 100%;
    }

    .chat-container {
      height: 100%;
      background: transparent;
      width: 100%;
    }

    .sidenav {
      width: 300px;
      background: rgba(26, 28, 30, 0.8);
      border-right: 1px solid rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      transition: width 0.3s ease;
    }

    .sidenav-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
    }

    .new-chat-button {
      flex: 1;
      button {
        width: 100%;
        background: linear-gradient(135deg, #3498db, #2980b9);
        border-radius: 12px;
        padding: 8px 16px;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
        }
      }
    }

    mat-sidenav-content {
      width: 100%;
      transition: margin-left 0.3s ease;
    }

    @media (max-width: 768px) {
      .sidenav {
        width: 85%;
        max-width: 300px;
      }
    }

    // Update backdrop styles to apply at all screen sizes
    ::ng-deep {
      .mat-drawer-backdrop.mat-drawer-shown {
        background-color: rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(3px);
      }
    }
  `]
})
export class ChatComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isMobile = window.innerWidth <= 768;
  initialSidenavState = true;

  @HostListener('window:resize')
  onResize() {
    const wasIsMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;
    
    // Only update mode without changing opened state
    if (this.sidenav) {
      this.sidenav.mode = this.isMobile ? 'over' : 'side';
    }
  }

  constructor(
    public chatService: ChatService,
    private dialog: MatDialog,
    private app: AppComponent
  ) {
    // Subscribe to sidenav toggle events
    this.app.toggleSidenav.subscribe(() => {
      this.sidenav?.toggle();
    });
  }

  ngOnInit() {
    // Load initial conversations
    this.chatService.loadConversations();
    this.initialSidenavState = !this.isMobile;
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