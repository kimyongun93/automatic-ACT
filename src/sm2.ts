// SM-2 (SuperMemo 2) Spaced Repetition Algorithm
// Reference: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2

import { Card, Quality } from './types';

interface SM2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: number;
}

/**
 * Calculate the next review parameters using the SM-2 algorithm
 * @param card - The card being reviewed
 * @param quality - Quality of response (0-5)
 * @returns Updated card parameters
 */
export function calculateSM2(card: Card, quality: Quality): SM2Result {
  let { easeFactor, interval, repetitions } = card;

  // Quality must be between 0 and 5
  const q = Math.max(0, Math.min(5, quality));

  // If quality is less than 3, reset repetitions (failed recall)
  if (q < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    // Successful recall
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

  // Ease factor should not fall below 1.3
  easeFactor = Math.max(1.3, easeFactor);

  // Calculate next review date
  const now = Date.now();
  const nextReviewDate = now + interval * 24 * 60 * 60 * 1000;

  return {
    easeFactor,
    interval,
    repetitions,
    nextReviewDate,
  };
}

/**
 * Check if a card is due for review
 * @param card - The card to check
 * @returns True if the card is due for review
 */
export function isDueForReview(card: Card): boolean {
  return Date.now() >= card.nextReviewDate;
}

/**
 * Get cards that are due for review from a list
 * @param cards - List of cards
 * @param deckId - Optional deck ID to filter by
 * @returns Cards that are due for review, sorted by next review date
 */
export function getDueCards(cards: Card[], deckId?: string): Card[] {
  const now = Date.now();
  return cards
    .filter(card => {
      if (deckId && card.deckId !== deckId) return false;
      return card.nextReviewDate <= now;
    })
    .sort((a, b) => a.nextReviewDate - b.nextReviewDate);
}

/**
 * Get new cards (never reviewed) from a list
 * @param cards - List of cards
 * @param deckId - Optional deck ID to filter by
 * @returns New cards that have never been reviewed
 */
export function getNewCards(cards: Card[], deckId?: string): Card[] {
  return cards
    .filter(card => {
      if (deckId && card.deckId !== deckId) return false;
      return card.lastReviewDate === null;
    })
    .sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * Calculate the quality label for display
 * @param quality - Quality rating (0-5)
 * @returns Human-readable quality label
 */
export function getQualityLabel(quality: Quality): string {
  const labels: Record<Quality, string> = {
    [Quality.CompleteBlackout]: 'Complete Blackout',
    [Quality.IncorrectButRemembered]: 'Incorrect (Remembered)',
    [Quality.IncorrectButEasy]: 'Incorrect (Seemed Easy)',
    [Quality.CorrectWithDifficulty]: 'Correct (Difficult)',
    [Quality.CorrectWithHesitation]: 'Correct (Hesitation)',
    [Quality.Perfect]: 'Perfect',
  };
  return labels[quality];
}
