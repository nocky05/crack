import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { BookOpen, User, Wifi, Edit2, Check } from 'lucide-react';
import { playSound } from '../utils/audio';

export default function Header() {
  const { playerPseudo, setPlayerPseudo, isP2P, isHost, opponentPseudo, gameState } = useGame();
  const [isEditing, setIsEditing] = useState(false);
  const [tempPseudo, setTempPseudo] = useState(playerPseudo);

  const handleSave = () => {
    playSound.click();
    setPlayerPseudo(tempPseudo);
    setIsEditing(false);
  };

  return (
    <header style={{
      width: '100%',
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px'
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
        }}>
          <BookOpen size={24} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, lineHeight: 1.1 }}>
            CRACK <span className="gradient-text">BÉRÉEN</span>
          </h1>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>
            Quiz Chrétien V2 • P2P 1v1
          </span>
        </div>
      </div>

      {/* Badges Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Connection Mode Status */}
        <div className="glass-pill" style={{
          borderColor: isP2P ? 'var(--success)' : 'var(--border-glass)',
          color: isP2P ? 'var(--success)' : 'var(--text-muted)'
        }}>
          <Wifi size={16} />
          <span>{isP2P ? '1v1 P2P Connecté' : 'Mode Solo'}</span>
        </div>

        {/* Pseudo Badge */}
        {isEditing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="text"
              value={tempPseudo}
              onChange={(e) => setTempPseudo(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid var(--accent-gold)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '8px',
                outline: 'none',
                fontFamily: 'inherit',
                fontSize: '0.9rem'
              }}
              maxLength={15}
            />
            <button
              onClick={handleSave}
              style={{
                background: 'var(--accent-gold)',
                border: 'none',
                color: '#0f172a',
                padding: '6px 10px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <Check size={16} />
            </button>
          </div>
        ) : (
          <div
            onClick={() => { playSound.click(); setIsEditing(true); }}
            className="glass-pill"
            style={{ cursor: gameState === 'HOME' ? 'pointer' : 'default' }}
            title="Cliquer pour modifier le pseudo"
          >
            <User size={16} color="var(--accent-gold)" />
            <span>{playerPseudo}</span>
            {gameState === 'HOME' && <Edit2 size={12} style={{ opacity: 0.6 }} />}
          </div>
        )}
      </div>
    </header>
  );
}
