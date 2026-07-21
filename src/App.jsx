import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import Header from './components/Header';
import HomeScreen from './components/HomeScreen';
import LobbyScreen from './components/LobbyScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';

function MainContent() {
  const { gameState } = useGame();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <Header />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        {gameState === 'HOME' && <HomeScreen />}
        {gameState === 'LOBBY' && <LobbyScreen />}
        {gameState === 'PLAYING' && <QuizScreen />}
        {gameState === 'RESULT' && <ResultScreen />}
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '16px',
        color: 'var(--text-subtle)',
        fontSize: '0.8rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        marginTop: '30px'
      }}>
        Crack Béréen V2 • Quiz Chrétien P2P Multijoueur • 380+ Questions Bibliques
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <MainContent />
    </GameProvider>
  );
}
