export interface CharacterProfile {
  id: string;
  name: string;
  voice: string;
  personality: string;
  famousSource?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  characterId: string;
}

export interface AppSettings {
  apiKey: string;
  discoveryModel: string;
  conversationModel: string;
  muted: boolean;
}
