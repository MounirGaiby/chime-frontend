import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Conversation, ConversationDetail, AIModel, SSEResponse } from '../interfaces/chat.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private currentConversationSubject = new BehaviorSubject<ConversationDetail | null>(null);
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  private modelsSubject = new BehaviorSubject<{ [key: string]: AIModel }>({});
  private typingStateSubject = new BehaviorSubject<boolean>(false);
  private sseResponseSubject = new BehaviorSubject<SSEResponse | null>(null);
  private lastUsedModels: Map<number, string> = new Map();

  constructor(private apiService: ApiService) {
    this.loadConversations();
    this.loadModels();
  }

  get currentConversation$(): Observable<ConversationDetail | null> {
    return this.currentConversationSubject.asObservable();
  }

  get conversations$(): Observable<Conversation[]> {
    return this.conversationsSubject.asObservable();
  }

  get models$(): Observable<{ [key: string]: AIModel }> {
    return this.modelsSubject.asObservable();
  }

  get typingState$(): Observable<boolean> {
    return this.typingStateSubject.asObservable();
  }

  get sseResponse$(): Observable<SSEResponse | null> {
    return this.sseResponseSubject.asObservable();
  }

  loadConversations() {
    this.apiService.getConversations().subscribe({
      next: (response) => {
        this.conversationsSubject.next(response.data);
      }
    });
  }

  loadModels() {
    this.apiService.getModels().subscribe({
      next: (response) => {
        const modelConfigs = response.data.models.reduce((acc, model) => {
          acc[model.id] = model;
          return acc;
        }, {} as { [key: string]: AIModel });
        
        this.modelsSubject.next(modelConfigs);
      },
      error: (error) => {
        console.error('Error loading models:', error);
        this.modelsSubject.next({});
      }
    });
  }

  createConversation(title: string): Observable<Conversation> {
    return this.apiService.createConversation(title).pipe(
      map(response => {
        const conversations = this.conversationsSubject.value;
        this.conversationsSubject.next([response.data, ...conversations]);
        return response.data;
      })
    );
  }

  loadConversation(id: number) {
    this.apiService.getChatHistory(id).subscribe({
      next: (response) => {
        const conversationDetail: ConversationDetail = {
          id: response.data.conversation.id,
          title: response.data.conversation.title,
          chats: response.data.chats
        };
        
        if (!this.lastUsedModels.has(id) && response.data.chats.length > 0) {
          const lastChat = response.data.chats[response.data.chats.length - 1];
          if (lastChat.model) {
            this.lastUsedModels.set(id, lastChat.model);
          }
        }
        
        this.currentConversationSubject.next(conversationDetail);
      }
    });
  }

  sendMessage(conversationId: number, message: string, model: string): Observable<SSEResponse> {
    this.lastUsedModels.set(conversationId, model);
    this.setTypingState(true);
    return this.apiService.sendMessage(conversationId, message, model).pipe(
      tap({
        error: (error) => {
          this.setTypingState(false);
          console.error('Chat error:', error);
        },
        complete: () => this.setTypingState(false)
      })
    );
  }

  deleteConversation(id: number): Observable<any> {
    return this.apiService.deleteConversation(id).pipe(
      map(response => {
        const conversations = this.conversationsSubject.value.filter(c => c.id !== id);
        this.conversationsSubject.next(conversations);
        if (this.currentConversationSubject.value?.id === id) {
          this.currentConversationSubject.next(null);
        }
        return response;
      })
    );
  }

  handleSSEResponse(response: SSEResponse) {
    this.sseResponseSubject.next(response);
  }

  setTypingState(isTyping: boolean) {
    this.typingStateSubject.next(isTyping);
  }

  getLastUsedModel(conversationId: number): string | undefined {
    return this.lastUsedModels.get(conversationId);
  }
} 