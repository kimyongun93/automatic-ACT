import React, { useState } from 'react';
import { Card, Deck } from '../types';
import { AppStateHook } from '../hooks/useAppState';

interface CardListProps {
  deck: Deck;
  cards: Card[];
  appState: AppStateHook;
  onBack: () => void;
  onStartReview: () => void;
}

export function CardList({ deck, cards, appState, onBack, onStartReview }: CardListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const stats = appState.getDeckStats(deck.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    if (editingCard) {
      appState.updateCard(editingCard.id, { front: front.trim(), back: back.trim() });
    } else {
      appState.addCard(deck.id, front.trim(), back.trim());
    }

    setFront('');
    setBack('');
    setShowForm(false);
    setEditingCard(null);
  };

  const handleEdit = (card: Card) => {
    setEditingCard(card);
    setFront(card.front);
    setBack(card.back);
    setShowForm(true);
  };

  const handleDelete = (cardId: string) => {
    if (confirm('Are you sure you want to delete this card?')) {
      appState.deleteCard(cardId);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCard(null);
    setFront('');
    setBack('');
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleDateString();
  };

  const getCardStatus = (card: Card) => {
    if (card.lastReviewDate === null) return 'new';
    if (Date.now() >= card.nextReviewDate) return 'due';
    return 'learning';
  };

  return (
    <div className="card-list">
      <div className="card-list-header">
        <button className="btn btn-secondary" onClick={onBack}>
          &larr; Back to Decks
        </button>
        <div className="header-info">
          <h2>{deck.name}</h2>
          <div className="deck-stats-inline">
            <span>{stats.total} cards</span>
            <span className="stat-due">{stats.due} due</span>
            <span className="stat-new">{stats.new} new</span>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={onStartReview}
            disabled={stats.due === 0 && stats.new === 0}
          >
            Study Now
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowForm(true)}
            disabled={showForm}
          >
            + Add Card
          </button>
        </div>
      </div>

      {showForm && (
        <form className="card-form" onSubmit={handleSubmit}>
          <h3>{editingCard ? 'Edit Card' : 'Add New Card'}</h3>
          <div className="form-group">
            <label htmlFor="card-front">Front (Question)</label>
            <textarea
              id="card-front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Enter the question or prompt"
              rows={3}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="card-back">Back (Answer)</label>
            <textarea
              id="card-back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Enter the answer"
              rows={3}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingCard ? 'Update' : 'Add Card'}
            </button>
          </div>
        </form>
      )}

      {cards.length === 0 ? (
        <div className="empty-state">
          <p>No cards in this deck yet. Add your first card!</p>
        </div>
      ) : (
        <div className="cards-table">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Front</th>
                <th>Back</th>
                <th>Next Review</th>
                <th>Ease</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => {
                const status = getCardStatus(card);
                return (
                  <tr key={card.id} className={`card-row status-${status}`}>
                    <td>
                      <span className={`status-badge ${status}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td className="card-content">{card.front}</td>
                    <td className="card-content">{card.back}</td>
                    <td>{formatDate(card.nextReviewDate)}</td>
                    <td>{card.easeFactor.toFixed(2)}</td>
                    <td className="card-actions">
                      <button
                        className="btn btn-small"
                        onClick={() => handleEdit(card)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(card.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
