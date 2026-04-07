import { Injectable } from '@angular/core';
import { AppSettings, CharacterProfile, ChatMessage } from '../models/character.model';

const SETTINGS_KEY = 'character_ai_settings';
const CHARACTERS_KEY = 'character_ai_characters';
const MESSAGES_KEY = 'character_ai_messages';

@Injectable({ providedIn: 'root' })
export class StorageService {
  getSettings(): AppSettings {
    const fallback: AppSettings = {
      apiKey: '',
      discoveryModel: 'gemma-3-27b-it',
      conversationModel: 'gemini-3.1-flash-live',
      muted: false
    };

    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...fallback, ...(JSON.parse(raw) as Partial<AppSettings>) } : fallback;
  }

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  getCharacters(): CharacterProfile[] {
    const raw = localStorage.getItem(CHARACTERS_KEY);
    if (!raw) {
      return [
        {
          id: 'default-assistant',
          name: 'AI Assistant',
          voice: 'Female (en-US)',
          personality: 'Gentle, supportive, and clear.'
        }
      ];
    }
    return JSON.parse(raw) as CharacterProfile[];
  }

  saveCharacters(characters: CharacterProfile[]): void {
    localStorage.setItem(CHARACTERS_KEY, JSON.stringify(characters));
  }

  getMessages(): ChatMessage[] {
    const raw = localStorage.getItem(MESSAGES_KEY);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  }

  saveMessages(messages: ChatMessage[]): void {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  }
}
