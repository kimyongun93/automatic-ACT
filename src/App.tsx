import { useState } from 'react';
import { ViewType } from './types';
import { useAppState } from './hooks/useAppState';
import { DeckList } from './components/DeckList';
import { CardList } from './components/CardList';
import { ReviewSession } from './components/ReviewSession';
import { Stats } from './components/Stats';
import { exportData, importData } from './storage';
import './App.css';

function App() {
  const appState = useAppState();
  const [view, setView] = useState<ViewType>('decks');
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  const selectedDeck = selectedDeckId
    ? appState.state.decks.find(d => d.id === selectedDeckId)
    : null;

  const handleSelectDeck = (deckId: string) => {
    setSelectedDeckId(deckId);
    setView('cards');
  };

  const handleStartReview = (deckId: string) => {
    setSelectedDeckId(deckId);
    setIsReviewing(true);
  };

  const handleEndReview = () => {
    setIsReviewing(false);
  };

  const handleBackToDecks = () => {
    setSelectedDeckId(null);
    setView('decks');
  };

  const handleExport = () => {
    const data = exportData(appState.state);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spaced-repetition-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const data = importData(content);
        if (data) {
          appState.importState(data);
          alert('Data imported successfully!');
        } else {
          alert('Failed to import data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const renderContent = () => {
    if (isReviewing && selectedDeck) {
      return (
        <ReviewSession
          deck={selectedDeck}
          appState={appState}
          onFinish={handleEndReview}
        />
      );
    }

    if (view === 'stats') {
      return <Stats appState={appState} />;
    }

    if (view === 'cards' && selectedDeck) {
      const cards = appState.getCardsForDeck(selectedDeck.id);
      return (
        <CardList
          deck={selectedDeck}
          cards={cards}
          appState={appState}
          onBack={handleBackToDecks}
          onStartReview={() => handleStartReview(selectedDeck.id)}
        />
      );
    }

    return (
      <DeckList
        decks={appState.state.decks}
        appState={appState}
        onSelectDeck={handleSelectDeck}
        onStartReview={handleStartReview}
      />
    );
  };

  const overallStats = appState.getOverallStats();

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1 onClick={handleBackToDecks} style={{ cursor: 'pointer' }}>
            Spaced Repetition
          </h1>
        </div>
        <nav className="header-nav">
          <button
            className={`nav-btn ${view === 'decks' && !isReviewing ? 'active' : ''}`}
            onClick={() => {
              setView('decks');
              setSelectedDeckId(null);
              setIsReviewing(false);
            }}
          >
            Decks
          </button>
          <button
            className={`nav-btn ${view === 'stats' ? 'active' : ''}`}
            onClick={() => {
              setView('stats');
              setIsReviewing(false);
            }}
          >
            Stats
          </button>
        </nav>
        <div className="header-right">
          <div className="header-stats">
            <span className="due-badge" title="Cards due for review">
              {overallStats.dueCards} due
            </span>
            <span className="streak-badge" title="Day streak">
              {overallStats.streak} day streak
            </span>
          </div>
          <div className="header-actions">
            <button className="btn btn-small" onClick={handleExport} title="Export data">
              Export
            </button>
            <button className="btn btn-small" onClick={handleImport} title="Import data">
              Import
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {renderContent()}
      </main>

      <footer className="app-footer">
        <p>Spaced Repetition App - Learn smarter with the SM-2 algorithm</p>
      </footer>
    </div>
  );
}

export default App;
