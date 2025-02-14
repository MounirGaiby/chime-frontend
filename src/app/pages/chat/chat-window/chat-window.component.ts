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
  ],
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
          <div
            class="message user"
            [innerHTML]="sanitizeHtml(markdownToHtml(chat.message))"
          ></div>
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
            <div
              class="reasoning-content"
              [innerHTML]="sanitizeHtml(markdownToHtml(chat.reasoning_content || ''))"
            ></div>
            }
            <div
              class="response"
              [innerHTML]="sanitizeHtml(markdownToHtml(chat.response))"
            ></div>
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
          <mat-form-field>
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
          <mat-label>Type your message (Markdown supported)...</mat-label>
          <textarea
            matInput
            [(ngModel)]="newMessage"
            [disabled]="isTyping"
            cdkTextareaAutosize
            cdkAutosizeMinRows="1"
            cdkAutosizeMaxRows="5"
            (keydown.shift.enter)="sendMessage()"
            (keydown.enter)="$event.preventDefault()"
            placeholder="Use **bold**, *italic*, \`code\`, or \`\`\`codeblock\`\`\`"
          ></textarea>
          <mat-hint>Shift+Enter to send</mat-hint>
        </mat-form-field>
        @if (selectedModel && getSelectedModel()?.supports_files) {
        <button mat-icon-button (click)="fileInput.click()">
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
          (click)="sendMessage()"
          [disabled]="!newMessage.trim() || isTyping"
        >
          <mat-icon>send</mat-icon>
        </button>
      </div>
    </div>
    }
  `,
  styles: [
    `
      .chat-container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
      }

      .message.ai {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .show-reasoning {
        align-self: flex-start;
        color: var(--text-secondary);
        padding: 4px 8px;
        
        mat-icon {
          margin-right: 8px;
          font-size: 18px;
          vertical-align: text-bottom;
        }
      }

      .reasoning-content {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        background: #f8f9fa;
        border-left: 4px solid #6366f1;
        border-radius: 4px;
        padding: 12px 16px;
        margin: 8px 0;
        line-height: 1.6;
        color: #4b5563;
        font-size: 0.95em;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }

      .input-area {
        padding: 20px;
        display: flex;
        gap: 10px;
        align-items: center;
      }

      .message-input {
        flex: 1;
      }

      .empty-state {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #666;
      }

      .message-group {
        margin-bottom: 20px;
      }

      .model-selector {
        min-width: 150px;
      }

      .typing {
        &::after {
          content: '▋';
          animation: blink 1s step-start infinite;
        }
      }

      @keyframes blink {
        50% {
          opacity: 0;
        }
      }

      .message.ai .response :global(.error-message) {
        color: #dc2626;
        background-color: #fef2f2;
        border-left: 4px solid #dc2626;
        padding: 12px 16px;
        border-radius: 4px;
        margin: 8px 0;
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

  constructor(
    private chatService: ChatService,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2
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
        attachments: this.selectedFile ? [this.selectedFile] : undefined,
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
}
