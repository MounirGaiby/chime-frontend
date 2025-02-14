import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ConversationDetail,
  AIModel,
  SSEResponse,
} from '../../../interfaces/chat.interface';
import { ChatService } from '../../../services/chat.service';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TextFieldModule } from '@angular/cdk/text-field';
import hljs from 'highlight.js';
import { Renderer2 } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { ClipboardModule } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    TextFieldModule,
    ClipboardModule,
  ],
  host: {
    '[class.sidebar-closed]': '!sidebarOpen'
  },
  template: `
    @if (!conversation) {
    <div class="empty-state">
      <h2>No conversation selected</h2>
      <p>Select a conversation from the sidebar or start a new one</p>
    </div>
    } @else {
    <div class="chat-container">
      <div #messagesContainer class="messages" [class.has-reasoning]="currentReasoningContent">
        @for (chat of conversation.chats; track chat.id) {
        <div class="message-group">
          <div class="message user">
            <div class="message-content">
              <div [innerHTML]="sanitizeHtml(markdownToHtml(chat.message))"></div>
              <button mat-icon-button class="copy-button" (click)="copyMessage(chat.message)" matTooltip="Copy message">
                <mat-icon>content_copy</mat-icon>
              </button>
            </div>
          </div>
          <div class="message ai">
            @if (chat.reasoning_content) {
              <button
                mat-button
                class="show-reasoning"
                (click)="showReasoning(chat.id)"
              >
                <mat-icon>psychology</mat-icon>
                {{ chat.id === selectedReasoningChatId ? 'Hide Reasoning' : 'Show Reasoning' }}
              </button>
            }
            @if (chat.id === selectedReasoningChatId && chat.reasoning_content) {
              <div class="reasoning-content">
                <div [innerHTML]="sanitizeHtml(markdownToHtml(chat.reasoning_content || ''))"></div>
                <button mat-icon-button class="copy-button" (click)="copyMessage(chat.reasoning_content || '')" matTooltip="Copy reasoning">
                  <mat-icon>content_copy</mat-icon>
                </button>
              </div>
            }
            <div class="response">
              <div [innerHTML]="sanitizeHtml(markdownToHtml(chat.response))"></div>
              <button mat-icon-button class="copy-button" (click)="copyMessage(chat.response)" matTooltip="Copy response">
                <mat-icon>content_copy</mat-icon>
              </button>
            </div>
          </div>
        </div>
        } @if (pendingMessage) {
        <div class="message-group">
          <div
            class="message user"
            [innerHTML]="sanitizeHtml(markdownToHtml(pendingMessage))"
          ></div>
          <div class="message ai typing">
            @if (currentReasoningContent) {
            <div
              class="reasoning-content"
              [innerHTML]="sanitizeHtml(currentReasoningContent)"
            ></div>
            }
            <div
              class="response"
              [innerHTML]="sanitizeHtml(currentResponse)"
            ></div>
          </div>
        </div>
        }
      </div>
      <div class="input-area">
        <div class="model-selector">
          <mat-form-field appearance="outline">
            <mat-label>Select Model</mat-label>
            <mat-select [(ngModel)]="selectedModel" [disabled]="isTyping">
              @for (model of modelArray; track model.id) {
              <mat-option
                [value]="model.id"
                [disabled]="!model.is_active"
                [matTooltip]="
                  !model.is_active ? 'This model is currently inactive' : ''
                "
              >
                {{ model.display_name }}
              </mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
        
        <mat-form-field class="message-input" appearance="outline">
          <mat-label>Type your message...</mat-label>
          <textarea
            matInput
            [(ngModel)]="newMessage"
            [disabled]="isTyping"
            cdkTextareaAutosize
            cdkAutosizeMinRows="1"
            cdkAutosizeMaxRows="5"
            (keydown)="onKeyDown($event)"
            placeholder="Type your message..."
          ></textarea>
          <mat-hint>Enter to send, Shift+Enter for new line</mat-hint>
        </mat-form-field>

        <div class="action-buttons">
          @if (selectedModel && getSelectedModel()?.supports_files) {
            <button mat-icon-button class="action-button" (click)="fileInput.click()">
              <mat-icon>attach_file</mat-icon>
            </button>
            <input
              #fileInput
              type="file"
              hidden
              (change)="onFileSelected($event)"
            />
          }
          <button
            mat-icon-button
            class="action-button send-button"
            (click)="sendMessage()"
            [disabled]="!newMessage.trim() || isTyping"
          >
            <mat-icon>send</mat-icon>
          </button>
        </div>
      </div>
    </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        padding: 0 !important;
        box-sizing: border-box;
        width: 100%;
        overflow: hidden;
        
        &.sidebar-closed {
          padding-left: 0 !important;
        }
      }

      .chat-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        background: rgba(26, 28, 30, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 0;
        overflow: hidden;
      }

      .messages {
        flex: 1;
        padding: 24px;
        color: rgba(255, 255, 255, 0.9);
        overflow-y: auto;
        overflow-x: hidden;
        min-height: 0;
        
        &::-webkit-scrollbar {
          width: 8px;
        }

        &::-webkit-scrollbar-track {
          background: transparent;
        }

        &::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
      }

      .message-group {
        margin-bottom: 24px;

        .timestamp {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.8rem;
          margin: 4px 0;
          text-align: center;
        }
      }

      .message {
        max-width: 85%;
        padding: 16px;
        border-radius: 16px;
        margin-bottom: 8px;
        line-height: 1.5;
        font-size: 1rem;
        backdrop-filter: blur(10px);
        
        &.user {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: #f0f0ff;
          margin-left: auto;
          border-bottom-right-radius: 4px;
          box-shadow: 0 4px 20px rgba(124, 58, 237, 0.3),
                      0 0 15px rgba(124, 58, 237, 0.2);
          border: 1px solid rgba(124, 58, 237, 0.3);

          pre, code {
            background: rgba(0, 0, 0, 0.3) !important;
            color: #e0e7ff;
            text-shadow: 0 0 8px rgba(124, 58, 237, 0.3);
          }
        }
        
        &.ai {
          background: rgba(17, 24, 39, 0.95);
          color: #4ade80;
          border-bottom-left-radius: 4px;
          border: 1px solid rgba(74, 222, 128, 0.2);
          box-shadow: 0 4px 15px rgba(74, 222, 128, 0.1),
                      0 0 10px rgba(74, 222, 128, 0.05);
          text-shadow: 0 0 8px rgba(74, 222, 128, 0.2);

          pre, code {
            background: rgba(0, 0, 0, 0.4) !important;
            border: 1px solid rgba(74, 222, 128, 0.2);
            color: #4ade80;
          }
        }

        pre {
          margin: 8px 0;
          padding: 12px;
          border-radius: 8px;
          overflow-x: auto;
          font-family: 'Fira Code', monospace;
        }

        code {
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Fira Code', monospace;
        }

        &.user, &.ai {
          position: relative;

          .copy-button {
            position: absolute;
            right: 8px;
            top: 8px;
            opacity: 0;
            transition: opacity 0.2s ease;
            background: rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(4px);
            scale: 0.8;
            z-index: 1;

            &:hover {
              background: rgba(0, 0, 0, 0.3);
            }

            mat-icon {
              color: rgba(255, 255, 255, 0.8);
              font-size: 18px;
              width: 18px;
              height: 18px;
              line-height: 18px;
            }
          }

          &:hover {
            .copy-button {
              opacity: 1;
            }
          }
        }
      }

      .input-area {
        flex-shrink: 0;
        padding: 20px;
        background: rgba(26, 28, 30, 0.95);
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        display: flex;
        gap: 16px;
        align-items: flex-start;
        container-type: inline-size;
        flex-wrap: wrap;
      }

      .model-selector {
        min-width: 150px;
        max-width: 200px;
        flex-shrink: 1;
        
        @container (max-width: 600px) {
          width: 100%;
          max-width: 100%;
          order: -1;
        }
      }

      .message-input {
        flex: 1;
        min-width: 200px;
        
        @container (max-width: 600px) {
          min-width: 0;
          width: 100%;
        }
      }

      .action-buttons {
        display: flex;
        gap: 8px;
        align-items: flex-end;
        margin-bottom: 8px;
        
        @container (max-width: 600px) {
          margin-left: auto;
        }
      }

      .action-button {
        margin-top: 8px;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        color: rgba(255, 255, 255, 0.9);
        transition: all 0.3s ease;

        &:hover:not([disabled]) {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        &[disabled] {
          opacity: 0.5;
          cursor: not-allowed;
        }

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
        }
      }

      .send-button {
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
        border: none;
        
        &:hover:not([disabled]) {
          box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3),
                      0 0 20px rgba(124, 58, 237, 0.2);
        }
        
        &[disabled] {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      }

      .empty-state {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.5);
        text-align: center;
        padding: 2rem;
        min-height: 400px; // Add minimum height for empty state

        h2 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: rgba(255, 255, 255, 0.9);
        }

        p {
          color: rgba(255, 255, 255, 0.6);
          max-width: 400px;
          line-height: 1.6;
        }
      }

      .show-reasoning {
        background: rgba(17, 24, 39, 0.95);
        border: 1px solid rgba(74, 222, 128, 0.2);
        border-radius: 8px;
        padding: 8px 16px;
        color: #4ade80;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        margin-top: 8px;
        text-shadow: 0 0 8px rgba(74, 222, 128, 0.2);
        box-shadow: 0 2px 10px rgba(74, 222, 128, 0.1);

        &:hover {
          background: rgba(17, 24, 39, 0.98);
          border-color: rgba(74, 222, 128, 0.4);
          box-shadow: 0 4px 15px rgba(74, 222, 128, 0.15);
          transform: translateY(-1px);
        }

        mat-icon {
          font-size: 18px;
          color: #4ade80;
        }
      }

      .reasoning-content {
        background: rgba(17, 24, 39, 0.95);
        border-left: 4px solid #4ade80;
        border-radius: 8px;
        padding: 16px;
        margin: 12px 0;
        color: #4ade80;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        line-height: 1.6;
        font-size: 0.95em;
        text-shadow: 0 0 8px rgba(74, 222, 128, 0.2);
        border: 1px solid rgba(74, 222, 128, 0.2);
        box-shadow: 0 4px 15px rgba(74, 222, 128, 0.1);
      }

      .typing {
        color: #4ade80;
        text-shadow: 0 0 8px rgba(74, 222, 128, 0.2);
        
        &::after {
          content: '▋';
          animation: blink 1s step-start infinite;
          color: #4ade80;
        }
      }

      @keyframes blink {
        50% { opacity: 0; }
      }

      @media (max-width: 768px) {
        :host {
          padding: 0;
          
          &.sidebar-closed {
            padding-left: 0;
          }
        }

        .chat-container {
          margin: 0;
          border-radius: 0;
        }

        .input-area {
          padding: 8px;
          gap: 8px;
        }
      }

      @media (max-width: 480px) {
        :host {
          padding: 0;
          
          &.sidebar-closed {
            padding-left: 0;
          }
        }

        .chat-container {
          border-radius: 0;
        }

        .messages {
          padding: 8px;
        }

        .input-area {
          padding: 8px;
        }
      }

      // Add these styles for better dark mode support
      ::ng-deep {
        blockquote {
          border-left: 4px solid #7c3aed;
          background: rgba(124, 58, 237, 0.1);
          margin: 8px 0;
          padding: 12px 16px;
          color: #f0f0ff;
          border-radius: 0 8px 8px 0;
        }

        a {
          color: #4ade80;
          text-decoration: none;
          text-shadow: 0 0 8px rgba(74, 222, 128, 0.2);
          
          &:hover {
            text-decoration: underline;
            color: #22c55e;
          }
        }
      }
    `,
  ],
})
export class ChatWindowComponent implements OnInit, OnDestroy {
  @Input() set conversation(value: ConversationDetail | null) {
    this._conversation = value;
    // Scroll to bottom whenever conversation changes
    if (value) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }
  get conversation(): ConversationDetail | null {
    return this._conversation;
  }
  private _conversation: ConversationDetail | null = null;

  @Input() models: { [key: string]: AIModel } | null = null;
  @Output() messageSent = new EventEmitter<{ message: string; model: string; attachments?: File[] }>();
  @ViewChild('messagesContainer', { static: false }) messagesContainer!: ElementRef;
  
  newMessage = '';
  selectedModel = '';
  pendingMessage = '';
  currentResponse = '';
  currentReasoningContent = '';
  isTyping = false;
  selectedFile: File | null = null;
  private streamBuffer = { content: '', reasoning: '' };
  expandedReasonings: { [key: number]: boolean } = {};
  selectedReasoningChatId: number | null = null;
  private destroy$ = new Subject<void>();
  private scrollTimeout: any = null;

  // Add input for sidebar state
  @Input() sidebarOpen = true;

  constructor(
    private chatService: ChatService,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2,
    private clipboard: Clipboard
  ) {}

  get modelArray(): AIModel[] {
    return Object.values(this.models || {});
  }

  ngOnInit() {
    this.clearState();
    
    // Watch for conversation changes to update the selected model
    this.chatService.currentConversation$
      .pipe(takeUntil(this.destroy$))
      .subscribe(conversation => {
        if (conversation && this.models) {
          // Try to get the last used model for this conversation
          const lastUsedModel = this.chatService.getLastUsedModel(conversation.id);
          
          if (lastUsedModel && this.models[lastUsedModel]?.is_active) {
            // Use the last used model if it exists and is active
            this.selectedModel = lastUsedModel;
          } else {
            // Fall back to default or first active model
            const defaultModel = Object.values(this.models).find(m => m.is_default) ||
                               Object.values(this.models).find(m => m.is_active);
            if (defaultModel) {
              this.selectedModel = defaultModel.id;
            }
          }
        }
      });

    this.chatService.sseResponse$
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        if (response) {
          this.handleSSEResponse(response);
        }
      });

    this.chatService.typingState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isTyping) => {
        this.isTyping = isTyping;
      });

    const extension = {
      name: 'highlight',
      level: 'block',
      start(src: string) {
        return src.match(/^```/)?.index;
      },
      tokenizer(src: string) {
        const match = src.match(/^```(\w+)?\n([\s\S]*?)\n```/);
        if (match) {
          const [, lang, code] = match;
          return {
            type: 'code',
            raw: match[0],
            lang,
            text: code,
          };
        }
        return false;
      },
      renderer(token: any) {
        const code = token.text;
        const lang = token.lang || 'plaintext';
        let highlighted = code;

        try {
          if (hljs.getLanguage(lang)) {
            highlighted = hljs.highlight(code, { language: lang }).value;
          } else {
            highlighted = hljs.highlightAuto(code).value;
          }
        } catch (e) {
          console.error('Highlight error:', e);
        }

        return `
          <pre><code class="hljs language-${lang}">
            ${highlighted}
            <button class="copy-button" onclick="window.copyCode(this)">
              <mat-icon>content_copy</mat-icon>
            </button>
          </code></pre>`;
      },
    };

    marked.use({ extensions: [extension] });

    (window as any).copyCode = (button: HTMLButtonElement) => {
      const pre = button.closest('pre');
      if (pre) {
        const code = pre.querySelector('code');
        if (code) {
          const text =
            code.textContent?.replace(/(copy|content_copy)/, '').trim() || '';
          navigator.clipboard.writeText(text);
          const icon = button.querySelector('mat-icon');
          if (icon) {
            const originalText = icon.textContent;
            icon.textContent = 'check';
            setTimeout(() => {
              icon.textContent = originalText;
            }, 2000);
          }
        }
      }
    };
  }

  ngOnDestroy() {
    this.clearState();
    this.destroy$.next();
    this.destroy$.complete();
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }

  getSelectedModel(): AIModel | undefined {
    return this.models?.[this.selectedModel];
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  sendMessage() {
    if (this.newMessage.trim() && !this.isTyping) {
      this.pendingMessage = this.newMessage;
      this.isTyping = true;
      this.messageSent.emit({
        message: this.newMessage,
        model: this.selectedModel,
        attachments: this.selectedFile ? [this.selectedFile] : undefined
      });
      this.newMessage = '';
      this.selectedFile = null;
      this.scrollToBottom();
    }
  }

  handleSSEResponse(response: SSEResponse) {
    try {
      if (response.content !== undefined) {
        this.streamBuffer.content = this.streamBuffer.content + response.content;
        this.currentResponse = this.markdownToHtml(this.streamBuffer.content);
        this.scrollToBottom();
      }
      
      if (response.reasoning_content !== undefined) {
        this.streamBuffer.reasoning = this.streamBuffer.reasoning + response.reasoning_content;
        this.currentReasoningContent = this.markdownToHtml(this.streamBuffer.reasoning);
        this.scrollToBottom();
      }
      
      if (response.done && response.chat) {
        if (this.conversation) {
          const finalChat = {
            ...response.chat,
            response: response.chat.response || this.streamBuffer.content,
            reasoning_content: response.chat.reasoning_content || this.streamBuffer.reasoning
          };

          this.conversation.chats = [...this.conversation.chats, finalChat];
          
          if (this.currentReasoningContent) {
            this.selectedReasoningChatId = finalChat.id;
          }
        }

        const keepReasoningId = this.selectedReasoningChatId;
        this.clearState();
        this.selectedReasoningChatId = keepReasoningId;
        this.scrollToBottom();
      }
    } catch (error) {
      console.error('Error processing SSE response:', error);
      this.handleError(error instanceof Error ? error.message : 'An error occurred while processing the response.');
    }
  }

  showReasoning(chatId: number) {
    // Toggle reasoning visibility
    this.selectedReasoningChatId = this.selectedReasoningChatId === chatId ? null : chatId;
  }

  hideReasoning() {
    this.currentReasoningContent = '';
  }

  markdownToHtml(text: string | undefined): string {
    if (!text) return '';
    try {
      return marked(text) as string;
    } catch (error) {
      console.error('Markdown parsing error:', error);
      return text || '';
    }
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  clearState() {
    this.currentResponse = '';
    this.currentReasoningContent = '';
    this.pendingMessage = '';
    this.streamBuffer = { content: '', reasoning: '' };
    this.isTyping = false;
  }

  private scrollToBottom(): void {
    try {
      requestAnimationFrame(() => {
        const element = document.querySelector('app-chat-window .messages');
        if (element) {
          element.scrollTop = element.scrollHeight;
        }
      });
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  handleError(errorMessage: string) {
    if (this.conversation) {
      const errorChat = {
        id: Date.now(),
        message: this.pendingMessage,
        response: `⚠️ Error: ${errorMessage}`,
        reasoning_content: undefined,
        model: this.selectedModel,
        conversation_id: this.conversation.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tokens_used: 0,
        temperature: 0.7
      } as const;

      this.conversation.chats = [...this.conversation.chats, errorChat];
      this.scrollToBottom();
    }
    this.clearState();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      // If Shift key is not pressed and Enter is pressed
      if (!event.shiftKey) {
        event.preventDefault(); // Prevent default newline
        if (this.newMessage.trim() && !this.isTyping) {
          this.sendMessage();
        }
      }
    }
  }

  copyMessage(text: string) {
    this.clipboard.copy(text);
  }
}
