import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiService } from './services/ai.service';
import { StorageService } from './services/storage.service';
import { AppSettings, CharacterProfile, ChatMessage } from './models/character.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  @ViewChild('scrollAnchor') scrollAnchor?: ElementRef<HTMLDivElement>;

  settings: AppSettings;
  characters: CharacterProfile[];
  messages: ChatMessage[];
  selectedCharacterId = 'default-assistant';

  customName = '';
  customVoice = '';
  customPersonality = '';
  famousName = '';
  userInput = '';

  busy = false;
  error = '';

  constructor(
    private readonly storage: StorageService,
    private readonly ai: AiService
  ) {
    this.settings = this.storage.getSettings();
    this.characters = this.storage.getCharacters();
    this.messages = this.storage.getMessages();
    if (!this.characters.some((c) => c.id === this.selectedCharacterId)) {
      this.selectedCharacterId = this.characters[0]?.id ?? 'default-assistant';
    }
  }

  get activeCharacter(): CharacterProfile {
    return this.characters.find((c) => c.id === this.selectedCharacterId) ?? this.characters[0];
  }

  saveSettings(): void {
    this.storage.saveSettings(this.settings);
  }

  toggleMute(): void {
    this.settings.muted = !this.settings.muted;
    this.saveSettings();
  }

  addCustomCharacter(): void {
    if (!this.customName.trim() || !this.customVoice.trim() || !this.customPersonality.trim()) {
      this.error = 'Please fill name, voice and personality to add a character.';
      return;
    }

    this.characters.push({
      id: crypto.randomUUID(),
      name: this.customName.trim(),
      voice: this.customVoice.trim(),
      personality: this.customPersonality.trim()
    });

    this.customName = '';
    this.customVoice = '';
    this.customPersonality = '';
    this.error = '';
    this.persistCharacters();
  }

  async addFamousCharacter(): Promise<void> {
    if (!this.famousName.trim()) {
      this.error = 'Enter a famous character name first.';
      return;
    }

    this.error = '';
    this.busy = true;

    try {
      const profile = await this.ai.discoverFamousCharacter(this.settings.apiKey, this.settings.discoveryModel, this.famousName);
      this.characters.push({
        id: crypto.randomUUID(),
        name: profile.name,
        voice: profile.voice,
        personality: profile.personality,
        famousSource: this.famousName
      });
      this.famousName = '';
      this.persistCharacters();
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to discover character.';
    } finally {
      this.busy = false;
    }
  }

  removeCharacter(id: string): void {
    if (id === 'default-assistant') {
      return;
    }
    this.characters = this.characters.filter((c) => c.id !== id);
    if (!this.characters.some((c) => c.id === this.selectedCharacterId)) {
      this.selectedCharacterId = 'default-assistant';
    }
    this.persistCharacters();
  }

  async send(): Promise<void> {
    if (!this.userInput.trim()) {
      return;
    }

    const text = this.userInput.trim();
    this.userInput = '';
    this.error = '';

    const userMsg: ChatMessage = {
      role: 'user',
      text,
      timestamp: Date.now(),
      characterId: this.activeCharacter.id
    };
    this.messages.push(userMsg);
    this.persistMessages();
    this.busy = true;

    try {
      const answer = await this.ai.chatAsCharacter(
        this.settings.apiKey,
        this.settings.conversationModel,
        this.activeCharacter,
        this.messages.filter((m) => m.characterId === this.activeCharacter.id),
        text
      );
      const botMsg: ChatMessage = {
        role: 'assistant',
        text: answer,
        timestamp: Date.now(),
        characterId: this.activeCharacter.id
      };
      this.messages.push(botMsg);
      this.persistMessages();
      this.speak(answer);
      setTimeout(() => this.scrollAnchor?.nativeElement.scrollIntoView({ behavior: 'smooth' }), 0);
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to chat.';
    } finally {
      this.busy = false;
    }
  }

  private speak(text: string): void {
    if (this.settings.muted || !('speechSynthesis' in window)) {
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  private persistCharacters(): void {
    this.storage.saveCharacters(this.characters);
  }

  private persistMessages(): void {
    this.storage.saveMessages(this.messages);
  }
}
