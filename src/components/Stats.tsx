import { AppStateHook } from '../hooks/useAppState';

interface StatsProps {
  appState: AppStateHook;
}

export function Stats({ appState }: StatsProps) {
  const stats = appState.getOverallStats();

  const formatEaseFactor = (ef: number) => ef.toFixed(2);

  return (
    <div className="stats-page">
      <h2>Statistics</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalDecks}</div>
          <div className="stat-label">Total Decks</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.totalCards}</div>
          <div className="stat-label">Total Cards</div>
        </div>

        <div className="stat-card stat-highlight">
          <div className="stat-value">{stats.dueCards}</div>
          <div className="stat-label">Cards Due Today</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.newCards}</div>
          <div className="stat-label">New Cards</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.totalReviews}</div>
          <div className="stat-label">Total Reviews</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.reviewsToday}</div>
          <div className="stat-label">Reviews Today</div>
        </div>

        <div className="stat-card stat-streak">
          <div className="stat-value">{stats.streak}</div>
          <div className="stat-label">Day Streak</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{formatEaseFactor(stats.avgEaseFactor)}</div>
          <div className="stat-label">Avg. Ease Factor</div>
        </div>
      </div>

      <div className="stats-info">
        <h3>About Spaced Repetition</h3>
        <p>
          This app uses the <strong>SM-2 algorithm</strong> to optimize your learning.
          Cards you find easier will be shown less frequently, while difficult cards
          will appear more often until you master them.
        </p>

        <h4>Rating Guide</h4>
        <ul>
          <li><strong>Again (1):</strong> Complete blackout, didn't remember at all</li>
          <li><strong>Hard (2):</strong> Incorrect response, but seemed easy once revealed</li>
          <li><strong>Good (3):</strong> Correct response with some difficulty</li>
          <li><strong>Easy (4):</strong> Perfect response with no hesitation</li>
        </ul>

        <h4>Ease Factor</h4>
        <p>
          The ease factor determines how quickly the interval between reviews grows.
          A higher ease factor (max 2.5) means the card is easier for you and
          will be shown less frequently. The minimum ease factor is 1.3.
        </p>
      </div>
    </div>
  );
}
