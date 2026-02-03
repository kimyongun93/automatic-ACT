// LocalStorage persistence layer

import { AppState, Card, Deck, ReviewSession } from './types';

const STORAGE_KEY = 'spaced-repetition-app-data';

const DEFAULT_STATE: AppState = {
  decks: [],
  cards: [],
  reviewHistory: [],
};

/**
 * Load app state from localStorage
 */
export function loadState(): AppState {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_STATE;

    const parsed = JSON.parse(data) as AppState;

    // Validate structure
    if (!parsed.decks || !parsed.cards || !parsed.reviewHistory) {
      return DEFAULT_STATE;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return DEFAULT_STATE;
  }
}

/**
 * Save app state to localStorage
 */
export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new deck
 */
export function createDeck(name: string, description: string = ''): Deck {
  const now = Date.now();
  return {
    id: generateId(),
    name,
    description,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Create a new card
 */
export function createCard(deckId: string, front: string, back: string): Card {
  const now = Date.now();
  return {
    id: generateId(),
    deckId,
    front,
    back,
    createdAt: now,
    updatedAt: now,
    easeFactor: 2.5, // Default starting ease factor
    interval: 0,
    repetitions: 0,
    nextReviewDate: now, // Immediately available for review
    lastReviewDate: null,
  };
}

/**
 * Create a review session record
 */
export function createReviewSession(
  cardId: string,
  deckId: string,
  quality: number,
  previousInterval: number,
  newInterval: number
): ReviewSession {
  return {
    cardId,
    deckId,
    timestamp: Date.now(),
    quality,
    previousInterval,
    newInterval,
  };
}

/**
 * Export data as JSON for backup
 */
export function exportData(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

/**
 * Import data from JSON backup
 */
export function importData(jsonString: string): AppState | null {
  try {
    const parsed = JSON.parse(jsonString) as AppState;

    // Validate structure
    if (!Array.isArray(parsed.decks) ||
        !Array.isArray(parsed.cards) ||
        !Array.isArray(parsed.reviewHistory)) {
      throw new Error('Invalid data structure');
    }

    return parsed;
  } catch (error) {
    console.error('Failed to import data:', error);
    return null;
  }
}
