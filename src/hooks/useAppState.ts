import { useState, useEffect, useCallback } from 'react';
import { AppState, Card, Deck, Quality, ReviewSession } from '../types';
import { loadState, saveState, createDeck, createCard, createReviewSession } from '../storage';
import { calculateSM2, getDueCards, getNewCards } from '../sm2';

export function useAppState() {
  const [state, setState] = useState<AppState>(() => loadState());

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Deck operations
  const addDeck = useCallback((name: string, description: string = '') => {
    const deck = createDeck(name, description);
    setState(prev => ({
      ...prev,
      decks: [...prev.decks, deck],
    }));
    return deck;
  }, []);

  const updateDeck = useCallback((id: string, updates: Partial<Pick<Deck, 'name' | 'description'>>) => {
    setState(prev => ({
      ...prev,
      decks: prev.decks.map(deck =>
        deck.id === id
          ? { ...deck, ...updates, updatedAt: Date.now() }
          : deck
      ),
    }));
  }, []);

  const deleteDeck = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      decks: prev.decks.filter(deck => deck.id !== id),
      cards: prev.cards.filter(card => card.deckId !== id),
      reviewHistory: prev.reviewHistory.filter(review => review.deckId !== id),
    }));
  }, []);

  // Card operations
  const addCard = useCallback((deckId: string, front: string, back: string) => {
    const card = createCard(deckId, front, back);
    setState(prev => ({
      ...prev,
      cards: [...prev.cards, card],
    }));
    return card;
  }, []);

  const updateCard = useCallback((id: string, updates: Partial<Pick<Card, 'front' | 'back'>>) => {
    setState(prev => ({
      ...prev,
      cards: prev.cards.map(card =>
        card.id === id
          ? { ...card, ...updates, updatedAt: Date.now() }
          : card
      ),
    }));
  }, []);

  const deleteCard = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      cards: prev.cards.filter(card => card.id !== id),
      reviewHistory: prev.reviewHistory.filter(review => review.cardId !== id),
    }));
  }, []);

  // Review operations
  const reviewCard = useCallback((cardId: string, quality: Quality) => {
    setState(prev => {
      const card = prev.cards.find(c => c.id === cardId);
      if (!card) return prev;

      const result = calculateSM2(card, quality);
      const reviewSession = createReviewSession(
        cardId,
        card.deckId,
        quality,
        card.interval,
        result.interval
      );

      return {
        ...prev,
        cards: prev.cards.map(c =>
          c.id === cardId
            ? {
                ...c,
                ...result,
                lastReviewDate: Date.now(),
              }
            : c
        ),
        reviewHistory: [...prev.reviewHistory, reviewSession],
      };
    });
  }, []);

  // Query helpers
  const getCardsForDeck = useCallback((deckId: string): Card[] => {
    return state.cards.filter(card => card.deckId === deckId);
  }, [state.cards]);

  const getDueCardsForDeck = useCallback((deckId?: string): Card[] => {
    return getDueCards(state.cards, deckId);
  }, [state.cards]);

  const getNewCardsForDeck = useCallback((deckId?: string): Card[] => {
    return getNewCards(state.cards, deckId);
  }, [state.cards]);

  const getDeckStats = useCallback((deckId: string) => {
    const cards = state.cards.filter(card => card.deckId === deckId);
    const dueCards = getDueCards(cards);
    const newCards = getNewCards(cards);
    const reviewedCards = cards.filter(card => card.lastReviewDate !== null);

    return {
      total: cards.length,
      due: dueCards.length,
      new: newCards.length,
      reviewed: reviewedCards.length,
    };
  }, [state.cards]);

  const getReviewHistoryForDeck = useCallback((deckId: string): ReviewSession[] => {
    return state.reviewHistory.filter(review => review.deckId === deckId);
  }, [state.reviewHistory]);

  const getOverallStats = useCallback(() => {
    const totalCards = state.cards.length;
    const totalDecks = state.decks.length;
    const dueCards = getDueCards(state.cards).length;
    const newCards = getNewCards(state.cards).length;
    const totalReviews = state.reviewHistory.length;

    // Calculate average ease factor
    const avgEaseFactor = totalCards > 0
      ? state.cards.reduce((sum, card) => sum + card.easeFactor, 0) / totalCards
      : 2.5;

    // Calculate reviews today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    const reviewsToday = state.reviewHistory.filter(
      review => review.timestamp >= todayStart
    ).length;

    // Calculate streak (consecutive days with reviews)
    const streak = calculateStreak(state.reviewHistory);

    return {
      totalCards,
      totalDecks,
      dueCards,
      newCards,
      totalReviews,
      avgEaseFactor,
      reviewsToday,
      streak,
    };
  }, [state]);

  // Import/export
  const importState = useCallback((newState: AppState) => {
    setState(newState);
  }, []);

  return {
    state,
    // Deck operations
    addDeck,
    updateDeck,
    deleteDeck,
    // Card operations
    addCard,
    updateCard,
    deleteCard,
    // Review operations
    reviewCard,
    // Queries
    getCardsForDeck,
    getDueCardsForDeck,
    getNewCardsForDeck,
    getDeckStats,
    getReviewHistoryForDeck,
    getOverallStats,
    // Import/export
    importState,
  };
}

function calculateStreak(reviews: ReviewSession[]): number {
  if (reviews.length === 0) return 0;

  const dayMs = 24 * 60 * 60 * 1000;
  const reviewDays = new Set<number>();

  reviews.forEach(review => {
    const day = Math.floor(review.timestamp / dayMs);
    reviewDays.add(day);
  });

  const sortedDays = Array.from(reviewDays).sort((a, b) => b - a);
  const today = Math.floor(Date.now() / dayMs);

  // Check if reviewed today or yesterday
  if (sortedDays[0] < today - 1) return 0;

  let streak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    if (sortedDays[i - 1] - sortedDays[i] === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export type AppStateHook = ReturnType<typeof useAppState>;
