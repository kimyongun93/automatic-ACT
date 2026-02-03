// Core data types for the spaced repetition application

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  createdAt: number;
  updatedAt: number;
  // SM-2 algorithm fields
  easeFactor: number; // E-Factor, starts at 2.5
  interval: number; // Days until next review
  repetitions: number; // Number of successful reviews
  nextReviewDate: number; // Timestamp of next scheduled review
  lastReviewDate: number | null; // Timestamp of last review
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

export interface ReviewSession {
  cardId: string;
  deckId: string;
  timestamp: number;
  quality: number; // 0-5 rating
  previousInterval: number;
  newInterval: number;
}

export interface AppState {
  decks: Deck[];
  cards: Card[];
  reviewHistory: ReviewSession[];
}

// Quality ratings for SM-2 algorithm
export enum Quality {
  CompleteBlackout = 0,
  IncorrectButRemembered = 1,
  IncorrectButEasy = 2,
  CorrectWithDifficulty = 3,
  CorrectWithHesitation = 4,
  Perfect = 5,
}

export type ViewType = 'decks' | 'cards' | 'review' | 'stats';
