import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';
import { AuthResponse, LoginRequest, RegisterRequest } from '../interfaces/auth.interface';
import { Conversation, ConversationDetail, ModelsResponse, SSEResponse, ChatHistoryResponse } from '../interfaces/chat.interface';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private envService: EnvService
  ) {
    this.baseUrl = this.envService.apiUrl;
  }

  // Auth endpoints
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/api/login`, data);
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/api/register`, data);
  }

  logout(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.baseUrl}/api/logout`, {});
  }

  // Conversation endpoints
  getConversations(): Observable<{ success: boolean; data: Conversation[] }> {
    return this.http.get<{ success: boolean; data: Conversation[] }>(`${this.baseUrl}/api/conversations`);
  }

  getConversation(id: number): Observable<{ success: boolean; data: ConversationDetail }> {
    return this.http.get<{ success: boolean; data: ConversationDetail }>(`${this.baseUrl}/api/conversations/${id}`);
  }

  createConversation(title: string): Observable<{ success: boolean; data: Conversation }> {
    return this.http.post<{ success: boolean; data: Conversation }>(`${this.baseUrl}/api/conversations`, { title });
  }

  deleteConversation(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/api/conversations/${id}`);
  }

  // Chat endpoints
  getModels(): Observable<ModelsResponse> {
    return this.http.get<ModelsResponse>(`${this.baseUrl}/api/models`);
  }

  sendMessage(conversationId: number, message: string, model: string): Observable<SSEResponse> {
    return new Observable(observer => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${this.baseUrl}/api/conversations/${conversationId}/chat`, true);
      
      const token = localStorage.getItem('token');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('Content-Type', 'application/json');
      
      const processedLines = new Set<string>();
      let buffer = '';
      
      xhr.onprogress = () => {
        // Append new data to buffer
        const newData = xhr.responseText.slice(buffer.length);
        buffer = xhr.responseText;
        
        // Split only the new data into lines
        const newLines = newData.split('\n');
        
        for (const line of newLines) {
          if (line.startsWith('data: ') && !processedLines.has(line)) {
            try {
              const jsonStr = line.substring(6);
              console.log('Processing new SSE line:', jsonStr);
              
              processedLines.add(line); // Mark this line as processed
              const response = JSON.parse(jsonStr) as SSEResponse;
              observer.next(response);
              
              if (response.done) {
                observer.complete();
              }
            } catch (e) {
              console.debug('Skipping incomplete chunk');
            }
          }
        }
      };
      
      // Convert errors into fake successful responses
      const handleError = (errorMessage: string) => {
        // Send an error message as if it was a normal response
        const errorResponse: SSEResponse = {
          content: `⚠️ **Error**: ${errorMessage}\n\n*Please try again later or contact support if the issue persists.*`,
          done: true,
          chat: {
            id: Date.now(),
            message: message,
            response: `⚠️ **Error**: ${errorMessage}\n\n*Please try again later or contact support if the issue persists.*`,
            model: model,
            tokens_used: 0,
            temperature: 0.7
          }
        };
        
        observer.next(errorResponse);
        observer.complete();
      };

      xhr.onerror = () => {
        handleError('Network error occurred');
      };

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status !== 200) {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            handleError(errorResponse.message || 'Server error occurred');
          } catch {
            handleError('Failed to process the request');
          }
        }
      };
      
      xhr.send(JSON.stringify({ message, model }));
      return () => xhr.abort();
    });
  }

  getChatHistory(conversationId: number): Observable<ChatHistoryResponse> {
    return this.http.get<ChatHistoryResponse>(
      `${this.baseUrl}/api/conversations/${conversationId}/history`
    );
  }
} 