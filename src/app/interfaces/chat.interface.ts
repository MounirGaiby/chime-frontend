export interface Conversation {
  id: number;
  title: string;
  last_message_at: string;
  chats_count: number;
}

export interface Chat {
  id: number;
  message: string;
  response: string;
  reasoning_content?: string;
  model?: string;
  tokens_used?: number;
  temperature?: number;
}

export interface ConversationDetail {
  id: number;
  title: string;
  chats: Chat[];
}

export interface AIModel {
  id: string;
  display_name: string;
  provider: string;
  supports_files: boolean;
  can_reason: boolean;
  can_access_web: boolean;
  temperature: {
    min: number;
    max: number;
    default: number;
  };
  is_default: boolean;
  is_active: boolean;
}

export interface SSEResponse {
  content?: string;
  reasoning_content?: string;
  done: boolean;
  chat?: Chat;
}

export interface ModelsResponse {
  success: boolean;
  data: {
    models: AIModel[];
    default_model: string;
  };
}

export interface ChatHistoryResponse {
  success: boolean;
  data: {
    conversation: {
      id: number;
      title: string;
      user_id: number;
      last_message_at: string;
      created_at: string;
      updated_at: string;
    };
    chats: Chat[];
  };
} 