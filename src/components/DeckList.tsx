import React, { useState } from 'react';
import { Deck } from '../types';
import { AppStateHook } from '../hooks/useAppState';

interface DeckListProps {
  decks: Deck[];
  appState: AppStateHook;
  onSelectDeck: (deckId: string) => void;
  onStartReview: (deckId: string) => void;
}

export function DeckList({ decks, appState, onSelectDeck, onStartReview }: DeckListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingDeck) {
      appState.updateDeck(editingDeck.id, { name: name.trim(), description: description.trim() });
    } else {
      appState.addDeck(name.trim(), description.trim());
    }

    setName('');
    setDescription('');
    setShowForm(false);
    setEditingDeck(null);
  };

  const handleEdit = (deck: Deck) => {
    setEditingDeck(deck);
    setName(deck.name);
    setDescription(deck.description);
    setShowForm(true);
  };

  const handleDelete = (deckId: string) => {
    if (confirm('Are you sure you want to delete this deck and all its cards?')) {
      appState.deleteDeck(deckId);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDeck(null);
    setName('');
    setDescription('');
  };

  return (
    <div className="deck-list">
      <div className="deck-list-header">
        <h2>Your Decks</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          disabled={showForm}
        >
          + New Deck
        </button>
      </div>

      {showForm && (
        <form className="deck-form" onSubmit={handleSubmit}>
          <h3>{editingDeck ? 'Edit Deck' : 'Create New Deck'}</h3>
          <div className="form-group">
            <label htmlFor="deck-name">Name</label>
            <input
              id="deck-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter deck name"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="deck-description">Description (optional)</label>
            <textarea
              id="deck-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter deck description"
              rows={2}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingDeck ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      )}

      {decks.length === 0 ? (
        <div className="empty-state">
          <p>No decks yet. Create your first deck to get started!</p>
        </div>
      ) : (
        <div className="deck-grid">
          {decks.map((deck) => {
            const stats = appState.getDeckStats(deck.id);
            return (
              <div key={deck.id} className="deck-card">
                <div className="deck-card-header">
                  <h3>{deck.name}</h3>
                  <div className="deck-actions">
                    <button
                      className="btn btn-icon"
                      onClick={() => handleEdit(deck)}
                      title="Edit deck"
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-icon btn-danger"
                      onClick={() => handleDelete(deck.id)}
                      title="Delete deck"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {deck.description && (
                  <p className="deck-description">{deck.description}</p>
                )}
                <div className="deck-stats">
                  <span className="stat">
                    <strong>{stats.total}</strong> cards
                  </span>
                  <span className="stat stat-due">
                    <strong>{stats.due}</strong> due
                  </span>
                  <span className="stat stat-new">
                    <strong>{stats.new}</strong> new
                  </span>
                </div>
                <div className="deck-card-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => onSelectDeck(deck.id)}
                  >
                    Manage Cards
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => onStartReview(deck.id)}
                    disabled={stats.due === 0 && stats.new === 0}
                  >
                    Study Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
