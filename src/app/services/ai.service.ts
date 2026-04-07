import { Injectable } from '@angular/core';
import { CharacterProfile, ChatMessage } from '../models/character.model';

interface CharacterDiscoveryResponse {
  name: string;
  voice: string;
  personality: string;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  async discoverFamousCharacter(apiKey: string, model: string, name: string): Promise<CharacterDiscoveryResponse> {
    const prompt = [
      `Find the famous character: ${name}.`,
      'Return only JSON with keys: name, voice, personality.',
      'Voice should be concise like "Female (en-US)" or "Male (en-GB)".',
      'Personality should be a short paragraph with speaking style.'
    ].join(' ');

    const text = await this.generate(apiKey, model, prompt);
    return this.parseJson<CharacterDiscoveryResponse>(text);
  }

  async chatAsCharacter(
    apiKey: string,
    model: string,
    character: CharacterProfile,
    history: ChatMessage[],
    userInput: string
  ): Promise<string> {
    const historyText = history
      .slice(-8)
      .map((m) => `${m.role.toUpperCase()}: ${m.text}`)
      .join('\n');

    const prompt = [
      `You are roleplaying as ${character.name}.`,
      `Voice style: ${character.voice}.`,
      `Personality: ${character.personality}.`,
      'Reply in the same character consistently and naturally.',
      historyText ? `Conversation history:\n${historyText}` : '',
      `User message: ${userInput}`
    ].join('\n\n');

    return this.generate(apiKey, model, prompt);
  }

  private async generate(apiKey: string, model: string, prompt: string): Promise<string> {
    if (!apiKey.trim()) {
      throw new Error('Please add your Gemini API key in setup.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 600
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API error: ${response.status} ${err}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '...';
  }

  private parseJson<T>(text: string): T {
    const extracted = text.match(/\{[\s\S]*\}/)?.[0] ?? text;
    return JSON.parse(extracted) as T;
  }
}
