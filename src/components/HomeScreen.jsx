import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Swords, Flame, Play, Users, ArrowRight, BookOpen } from 'lucide-react';
import { playSound } from '../utils/audio';

export default function HomeScreen() {
  const {
    playerPseudo, setPlayerPseudo,
    startSoloGame, createP2PGame, joinP2PGame,
    isPeerConnecting
  } = useGame();

  const [joinCodeInput, setJoinCodeInput] = useState('');

  const handleJoinByCode = (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    playSound.click();

    let peerId = joinCodeInput.trim();
    if (peerId.includes('join=')) {
      peerId = new URL(peerId).searchParams.get('join') || peerId;
    }
    joinP2PGame(peerId);
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '850px',
      margin: '0 auto',
      padding: '16px 12px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Hero Banner */}
      <div className="glass-card" style={{
        padding: '28px 20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(19, 27, 46, 0.85) 0%, rgba(30, 42, 70, 0.95) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '160px',
          height: '160px',
          background: 'var(--accent-gold-glow)',
          borderRadius: '50%',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }} />

        <div className="glass-pill" style={{ marginBottom: '14px', color: 'var(--accent-gold)' }}>
          <Flame size={14} /> Multijoueur Temps Réel V2
        </div>

        <h2 style={{ fontSize: 'min(2.2rem, 7.5vw)', fontWeight: '900', marginBottom: '10px', lineHeight: 1.2 }}>
          CRACK <span className="gradient-text">BÉRÉEN</span>
        </h2>

        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.95rem',
          maxWidth: '540px',
          margin: '0 auto 20px',
          lineHeight: '1.5'
        }}>
          Défis bibliques 1v1 instantanés, sans inscription.
        </p>

        {/* Pseudo Input Field */}
        <div style={{
          maxWidth: '340px',
          margin: '0 auto 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          textAlign: 'left'
        }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            Ton Pseudo de Joueur
          </label>
          <input
            type="text"
            value={playerPseudo}
            onChange={(e) => setPlayerPseudo(e.target.value)}
            placeholder="Entre ton pseudo..."
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              padding: '12px 14px',
              color: 'white',
              fontSize: '1rem',
              fontFamily: 'inherit',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Main Game Modes Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px'
      }}>
        {/* Mode 1v1 P2P (Défier un Ami) */}
        <div className="glass-card glow-pulse" style={{
          padding: '24px 20px',
          borderColor: 'rgba(245, 158, 11, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between',
          gap: '16px'
        }}>
          <div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px'
            }}>
              <Swords size={24} color="#0f172a" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '6px' }}>
              Défier un Ami (1v1)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.45' }}>
              Crée un salon P2P instantané et partage le lien pour jouer en direct.
            </p>
          </div>

          <button
            onClick={() => { playSound.click(); createP2PGame(); }}
            disabled={isPeerConnecting}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            {isPeerConnecting ? 'Connexion Réseau...' : 'Créer un Salon 1v1'}
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Mode Apocalypse (7 Sceaux) */}
        <div className="glass-card" style={{
          padding: '24px 20px',
          borderColor: 'rgba(139, 92, 246, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between',
          gap: '16px'
        }}>
          <div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px'
            }}>
              <Flame size={24} color="#ffffff" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '6px' }}>
              Les 7 Sceaux (Apocalypse)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.45' }}>
              Déverrouille les 7 Sceaux mystiques avec 7 bonnes réponses consécutives.
            </p>
          </div>

          <button
            onClick={() => { playSound.click(); startSoloGame('apocalypse'); }}
            className="btn-secondary btn-purple"
            style={{ width: '100%' }}
          >
            Lancer l'Apocalypse
            <Play size={16} />
          </button>
        </div>

        {/* Mode Solo Classique */}
        <div className="glass-card" style={{
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between',
          gap: '16px'
        }}>
          <div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px'
            }}>
              <BookOpen size={24} color="var(--accent-cyan)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '6px' }}>
              Quiz Solo Entraînement
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.45' }}>
              10 questions aléatoires parmi 380+ questions bibliques pour t'entraîner.
            </p>
          </div>

          <button
            onClick={() => { playSound.click(); startSoloGame('classic'); }}
            className="btn-secondary"
            style={{ width: '100%' }}
          >
            Jouer en Solo
            <Play size={16} />
          </button>
        </div>
      </div>

      {/* Join Game via Link/Code input */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Users size={16} color="var(--accent-gold)" /> Rejoindre une partie existante
        </h4>
        <form onSubmit={handleJoinByCode} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Colle le lien ou le code P2P..."
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value)}
            style={{
              flex: '1 1 200px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-glass)',
              borderRadius: '10px',
              padding: '10px 14px',
              color: 'white',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
          <button type="submit" className="btn-secondary" style={{ padding: '10px 16px', width: 'auto' }}>
            Rejoindre
          </button>
        </form>
      </div>
    </div>
  );
}
