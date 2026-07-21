import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { BookOpen, User, Wifi, Edit2, Check } from 'lucide-react';
import { playSound } from '../utils/audio';

export default function Header() {
  const { playerPseudo, setPlayerPseudo, isP2P, gameState } = useGame();
  const [isEditing, setIsEditing] = useState(false);
  const [tempPseudo, setTempPseudo] = useState(playerPseudo);

  const handleSave = () => {
    playSound.click();
    setPlayerPseudo(tempPseudo);
    setIsEditing(false);
  };

  return (
    <header className="header-container" style={{
      width: '100%',
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '16px 20px 8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      flexWrap: 'nowrap'
    }}>
      {/* Brand Logo Only */}
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '11px',
        background: 'linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)',
        flexShrink: 0
      }}>
        <BookOpen size={22} color="#ffffff" />
      </div>

      {/* Badges Info Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexShrink: 0,
        flexWrap: 'nowrap'
      }}>
        {/* Connection Mode Status Badge */}
        <div className="glass-pill" style={{
          borderColor: isP2P ? 'var(--success)' : 'rgba(255, 255, 255, 0.12)',
          color: isP2P ? 'var(--success)' : 'var(--text-main)',
          background: isP2P ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.05)',
          padding: '7px 13px',
          fontSize: '0.8rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap'
        }}>
          <Wifi size={14} style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', fontWeight: '600' }}>
            {isP2P ? '1v1 P2P Direct' : 'Mode Solo'}
          </span>
        </div>

        {/* Pseudo Badge */}
        {isEditing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="text"
              value={tempPseudo}
              onChange={(e) => setTempPseudo(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid var(--accent-gold)',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '20px',
                outline: 'none',
                fontFamily: 'inherit',
                fontSize: '0.82rem',
                width: '110px'
              }}
              maxLength={15}
            />
            <button
              onClick={handleSave}
              style={{
                background: 'var(--accent-gold)',
                border: 'none',
                color: '#0f172a',
                padding: '5px 9px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Check size={13} />
            </button>
          </div>
        ) : (
          <div
            onClick={() => { playSound.click(); setIsEditing(true); }}
            className="glass-pill"
            style={{
              cursor: gameState === 'HOME' ? 'pointer' : 'default',
              padding: '7px 14px',
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              background: 'rgba(255, 255, 255, 0.05)'
            }}
            title="Cliquer pour modifier le pseudo"
          >
            <User size={14} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', fontWeight: '600' }}>{playerPseudo}</span>
            {gameState === 'HOME' && <Edit2 size={11} style={{ opacity: 0.7, flexShrink: 0 }} />}
          </div>
        )}
      </div>
    </header>
  );
}
