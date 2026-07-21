import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Swords, Flame, Trophy, Play, Share2, Users, ArrowRight, BookOpen } from 'lucide-react';
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
    
    // Extrait le PEER_ID s'il s'agit d'un lien complet ou directement du code
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
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px'
    }}>
      {/* Hero Banner */}
      <div className="glass-card" style={{
        padding: '40px 32px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(19, 27, 46, 0.8) 0%, rgba(30, 42, 70, 0.9) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'var(--accent-gold-glow)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }} />

        <div className="glass-pill" style={{ marginBottom: '16px', color: 'var(--accent-gold)' }}>
          <Flame size={16} /> Version 2.0 Multijoueur Temps Réel
        </div>

        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '12px' }}>
          Affronte tes amis en <span className="gradient-text">Duel 1v1 P2P</span>
        </h2>
        
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '1.1rem',
          maxWidth: '580px',
          margin: '0 auto 28px',
          lineHeight: '1.6'
        }}>
          Testez votre culture biblique sans inscription et sans serveur. Un simple lien d'invitation suffit pour lancer le combat !
        </p>

        {/* Pseudo Input Field */}
        <div style={{
          maxWidth: '380px',
          margin: '0 auto 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          textAlign: 'left'
        }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            Ton Pseudo de Joueur
          </label>
          <input
            type="text"
            value={playerPseudo}
            onChange={(e) => setPlayerPseudo(e.target.value)}
            placeholder="Entre ton pseudo..."
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.07)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              padding: '14px 18px',
              color: 'white',
              fontSize: '1.05rem',
              fontFamily: 'inherit',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Main Game Modes Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px'
      }}>
        {/* Mode 1v1 P2P (Défier un Ami) */}
        <div className="glass-card glow-pulse" style={{
          padding: '28px 24px',
          borderColor: 'rgba(245, 158, 11, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between',
          gap: '20px'
        }}>
          <div>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Swords size={28} color="#0f172a" />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '8px' }}>
              Défier un Ami (1v1)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5' }}>
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
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Mode Apocalypse (7 Sceaux) */}
        <div className="glass-card" style={{
          padding: '28px 24px',
          borderColor: 'rgba(139, 92, 246, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between',
          gap: '20px'
        }}>
          <div>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Flame size={28} color="#ffffff" />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '8px' }}>
              Les 7 Sceaux (Apocalypse)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5' }}>
              Déverrouille les 7 Sceaux mystiques avec 7 bonnes réponses consécutives.
            </p>
          </div>

          <button
            onClick={() => { playSound.click(); startSoloGame('apocalypse'); }}
            className="btn-secondary btn-purple"
            style={{ width: '100%' }}
          >
            Lancer l'Apocalypse
            <Play size={18} />
          </button>
        </div>

        {/* Mode Solo Classique */}
        <div className="glass-card" style={{
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between',
          gap: '20px'
        }}>
          <div>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <BookOpen size={28} color="var(--accent-cyan)" />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '8px' }}>
              Quiz Solo Entraînement
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5' }}>
              10 questions aléatoires parmi 380+ questions bibliques pour t'entraîner.
            </p>
          </div>

          <button
            onClick={() => { playSound.click(); startSoloGame('classic'); }}
            className="btn-secondary"
            style={{ width: '100%' }}
          >
            Jouer en Solo
            <Play size={18} />
          </button>
        </div>
      </div>

      {/* Join Game via Link/Code input */}
      <div className="glass-card" style={{ padding: '24px 28px' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} color="var(--accent-gold)" /> Rejoindre une partie existante
        </h4>
        <form onSubmit={handleJoinByCode} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Colle le lien ou le code P2P d'un ami..."
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value)}
            style={{
              flex: '1 1 240px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-glass)',
              borderRadius: '10px',
              padding: '12px 16px',
              color: 'white',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
          <button type="submit" className="btn-secondary" style={{ padding: '12px 20px' }}>
            Rejoindre
          </button>
        </form>
      </div>
    </div>
  );
}
