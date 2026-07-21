import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Copy, Check, Share2, Swords, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import { playSound } from '../utils/audio';

export default function LobbyScreen() {
  const {
    shareLink, playerPseudo, opponentPseudo,
    isHost, startHostGame, returnHome, gameMode, setGameMode
  } = useGame();

  const [copied, setCopied] = useState(false);

  const isOpponentReady = opponentPseudo && opponentPseudo !== 'Adversaire';

  const handleCopy = () => {
    playSound.click();
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    playSound.click();
    const text = encodeURIComponent(
      `⚔️ *Défi Crack Béréen V2* 📖\n${playerPseudo} te défie en duel 1v1 Quiz Chrétien !\nClique ici pour rejoindre :\n${shareLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '680px',
      margin: '0 auto',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      <button
        onClick={() => { playSound.click(); returnHome(); }}
        className="btn-secondary"
        style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.85rem' }}
      >
        <ArrowLeft size={16} /> Annuler & Retour
      </button>

      <div className="glass-card" style={{ padding: '36px 28px', textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 0 25px var(--accent-gold-glow)'
        }}>
          <Swords size={32} color="#ffffff" />
        </div>

        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>
          Salon de Duel 1v1 P2P
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '28px' }}>
          Envoie le lien d'invitation à ton adversaire. La connexion s'établira en direct sans serveur.
        </p>

        {/* Players Status Box */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '16px',
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '28px',
          border: '1px solid var(--border-glass)'
        }}>
          {/* Joueur 1 (Hôte) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--accent-gold)',
              color: '#0f172a',
              fontWeight: '800',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {playerPseudo.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{playerPseudo}</span>
            <span className="glass-pill" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>Hôte</span>
          </div>

          <span style={{ fontWeight: '900', fontSize: '1.4rem', color: 'var(--accent-gold)' }}>VS</span>

          {/* Joueur 2 (Adversaire) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: isOpponentReady ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontWeight: '800',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isOpponentReady ? opponentPseudo.charAt(0).toUpperCase() : '?'}
            </div>
            <span style={{ fontWeight: '700', fontSize: '0.95rem', color: isOpponentReady ? 'white' : 'var(--text-subtle)' }}>
              {isOpponentReady ? opponentPseudo : 'En attente...'}
            </span>
            {isOpponentReady ? (
              <span className="glass-pill" style={{ fontSize: '0.75rem', padding: '2px 8px', color: 'var(--success)' }}>
                <ShieldCheck size={12} /> Prêt
              </span>
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Attente
              </span>
            )}
          </div>
        </div>

        {/* Share Link Input */}
        <div style={{ marginBottom: '24px', textAlign: 'left' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
            Lien d'invitation à copier & partager :
          </label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <input
              type="text"
              readOnly
              value={shareLink || 'Génération du lien en cours...'}
              style={{
                flex: '1 1 240px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-glass)',
                borderRadius: '10px',
                padding: '12px 14px',
                color: 'white',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <button onClick={handleCopy} className="btn-secondary" style={{ padding: '12px 16px' }}>
              {copied ? <Check size={18} color="var(--success)" /> : <Copy size={18} />}
              {copied ? 'Copié !' : 'Copier'}
            </button>
            <button onClick={handleWhatsAppShare} className="btn-primary" style={{ padding: '12px 16px', background: '#25D366', color: 'white' }}>
              <Share2 size={18} /> WhatsApp
            </button>
          </div>

          {/* Indication Localhost vs En ligne */}
          {window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? (
            <div style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '0.82rem',
              color: 'var(--accent-gold)',
              lineHeight: '1.4'
            }}>
              💡 <strong>Note Test Local :</strong> En mode local (localhost), le lien fonctionne entre deux onglets ou fenêtres du même ordinateur. Une fois déployé sur GitHub Pages, le lien WhatsApp ouvrira directement le jeu sur les téléphones mobiles !
            </div>
          ) : null}
        </div>

        {/* Launch Button for Host */}
        {isHost ? (
          <div>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                onClick={() => setGameMode('classic')}
                className={gameMode === 'classic' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                10 QCM Mixés
              </button>
              <button
                onClick={() => setGameMode('apocalypse')}
                className={gameMode === 'apocalypse' ? 'btn-purple btn-secondary' : 'btn-secondary'}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                📜 Apocalypse (7 Sceaux)
              </button>
            </div>

            <button
              onClick={() => { playSound.click(); startHostGame(gameMode); }}
              disabled={!isOpponentReady}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1.1rem',
                opacity: isOpponentReady ? 1 : 0.5,
                cursor: isOpponentReady ? 'pointer' : 'not-allowed'
              }}
            >
              {isOpponentReady ? 'LANCER LE COMBAT ! ⚔️' : 'En attente de l\'adversaire...'}
            </button>
          </div>
        ) : (
          <p style={{ color: 'var(--accent-gold)', fontWeight: '600', animation: 'pulse 1.5s infinite' }}>
            ⏳ En attente du lancement par l'hôte...
          </p>
        )}
      </div>
    </div>
  );
}
