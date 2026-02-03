import { useState, useMemo } from 'react';
import { Card, Deck, Quality } from '../types';
import { AppStateHook } from '../hooks/useAppState';
import { getQualityLabel } from '../sm2';

interface ReviewSessionProps {
  deck: Deck;
  appState: AppStateHook;
  onFinish: () => void;
}

export function ReviewSession({ deck, appState, onFinish }: ReviewSessionProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  // Get cards to review (due cards + new cards)
  const cardsToReview = useMemo(() => {
    const dueCards = appState.getDueCardsForDeck(deck.id);
    const newCards = appState.getNewCardsForDeck(deck.id);
    // Interleave new cards with due cards, prioritizing due cards
    const combined: Card[] = [];
    let dueIdx = 0;
    let newIdx = 0;

    while (dueIdx < dueCards.length || newIdx < newCards.length) {
      // Add 3 due cards for every 1 new card
      for (let i = 0; i < 3 && dueIdx < dueCards.length; i++) {
        combined.push(dueCards[dueIdx++]);
      }
      if (newIdx < newCards.length) {
        combined.push(newCards[newIdx++]);
      }
    }

    return combined;
  }, [appState, deck.id]);

  const currentCard = cardsToReview[reviewedCount];
  const totalCards = cardsToReview.length;
  const progress = totalCards > 0 ? (reviewedCount / totalCards) * 100 : 100;

  const handleRating = (quality: Quality) => {
    if (!currentCard) return;

    appState.reviewCard(currentCard.id, quality);
    setShowAnswer(false);
    setReviewedCount(prev => prev + 1);
  };

  if (!currentCard) {
    return (
      <div className="review-session">
        <div className="review-complete">
          <h2>Review Complete!</h2>
          <p>You have reviewed {reviewedCount} card(s) in this session.</p>
          <div className="review-summary">
            <p>Great work! Come back later for more reviews.</p>
          </div>
          <button className="btn btn-primary" onClick={onFinish}>
            Back to Deck
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="review-session">
      <div className="review-header">
        <button className="btn btn-secondary" onClick={onFinish}>
          &larr; End Session
        </button>
        <h2>Studying: {deck.name}</h2>
        <div className="review-progress">
          <span>{reviewedCount} / {totalCards}</span>
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="flashcard-container">
        <div className={`flashcard ${showAnswer ? 'flipped' : ''}`}>
          <div className="flashcard-inner">
            <div className="flashcard-front">
              <div className="card-label">Question</div>
              <div className="card-text">{currentCard.front}</div>
              <button
                className="btn btn-primary show-answer-btn"
                onClick={() => setShowAnswer(true)}
              >
                Show Answer
              </button>
            </div>
            <div className="flashcard-back">
              <div className="card-label">Answer</div>
              <div className="card-text">{currentCard.back}</div>
              <div className="rating-section">
                <p>How well did you remember?</p>
                <div className="rating-buttons">
                  <button
                    className="btn rating-btn rating-0"
                    onClick={() => handleRating(Quality.CompleteBlackout)}
                    title={getQualityLabel(Quality.CompleteBlackout)}
                  >
                    <span className="rating-number">1</span>
                    <span className="rating-label">Again</span>
                  </button>
                  <button
                    className="btn rating-btn rating-2"
                    onClick={() => handleRating(Quality.IncorrectButEasy)}
                    title={getQualityLabel(Quality.IncorrectButEasy)}
                  >
                    <span className="rating-number">2</span>
                    <span className="rating-label">Hard</span>
                  </button>
                  <button
                    className="btn rating-btn rating-3"
                    onClick={() => handleRating(Quality.CorrectWithDifficulty)}
                    title={getQualityLabel(Quality.CorrectWithDifficulty)}
                  >
                    <span className="rating-number">3</span>
                    <span className="rating-label">Good</span>
                  </button>
                  <button
                    className="btn rating-btn rating-5"
                    onClick={() => handleRating(Quality.Perfect)}
                    title={getQualityLabel(Quality.Perfect)}
                  >
                    <span className="rating-number">4</span>
                    <span className="rating-label">Easy</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-info">
        <span className={`card-status ${currentCard.lastReviewDate === null ? 'new' : 'review'}`}>
          {currentCard.lastReviewDate === null ? 'New Card' : 'Review'}
        </span>
        {currentCard.lastReviewDate !== null && (
          <span className="card-interval">
            Current interval: {currentCard.interval} day(s)
          </span>
        )}
      </div>
    </div>
  );
}
