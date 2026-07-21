import React from 'react';
import { useGame } from '../context/GameContext';
import { Trophy, Share2, RotateCcw, Home, Swords, Award, Flame } from 'lucide-react';
import { playSound } from '../utils/audio';

export default function ResultScreen() {
  const {
    score, opponentScore,
    playerPseudo, opponentPseudo,
    isP2P, gameMode, sealsUnlocked,
    requestRematch, returnHome
  } = useGame();

  const isWinner = !isP2P || score > opponentScore;
  const isTie = isP2P && score === opponentScore;

  const handleWhatsAppShare = () => {
    playSound.click();
    let text = '';
    if (isP2P) {
      if (isWinner) {
        text = `🏆 *Victoire sur Crack Béréen !*\nJ'ai battu ${opponentPseudo} (${score} pts vs ${opponentScore} pts) en Duel 1v1 Quiz Chrétien ! 📖🔥`;
      } else if (isTie) {
        text = `⚔️ *Égalité Épique sur Crack Béréen !*\n${playerPseudo} et ${opponentPseudo} terminent avec ${score} pts ex-æquo ! 📖`;
      } else {
        text = `🔥 *Duel Crack Béréen !*\nBeau match contre ${opponentPseudo} (${score} pts vs ${opponentScore} pts) sur le Quiz Chrétien V2 ! 📖`;
      }
    } else {
      text = `📖 *Mon Score Crack Béréen !*\nJ'ai obtenu ${score} points en Mode Solo sur le Quiz Chrétien V2 ! 🎯`;
    }

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '650px',
      margin: '0 auto',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      <div className="glass-card" style={{ padding: '36px 28px', textAlign: 'center' }}>
        {/* Trophy Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: isWinner
            ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
            : 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: isWinner ? '0 0 30px var(--accent-gold-glow)' : '0 0 30px var(--accent-purple-glow)',
          animation: 'float 3s ease-in-out infinite'
        }}>
          <Trophy size={42} color={isWinner ? '#0f172a' : '#ffffff'} />
        </div>

        <h2 style={{ fontSize: '2.2rem', fontWeight: '900', marginBottom: '8px' }}>
          {isP2P ? (
            isWinner ? <span className="gradient-text">VICTOIRE ÉPIQUE ! 🎉</span> :
            isTie ? <span className="gradient-text-purple">ÉGALITÉ PARFAITE ! 🤝</span> :
            <span>DEFAITE HONORABLE ⚔️</span>
          ) : (
            <span className="gradient-text">PARTIE TERMINÉE ! 🎉</span>
          )}
        </h2>

        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '1.05rem' }}>
          {isP2P ? (
            isWinner ? `Félicitations ${playerPseudo}, tu as triomphé dans ce duel 1v1 !` :
            isTie ? `Quel affrontement serré entre ${playerPseudo} et ${opponentPseudo} !` :
            `Belle tentative ! Prends ta revanche instantanément contre ${opponentPseudo}.`
          ) : (
            `Bravo ${playerPseudo} ! Tu as complété la session de quiz.`
          )}
        </p>

        {/* 1v1 Final Scoreboard */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isP2P ? '1fr auto 1fr' : '1fr',
          gap: '16px',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-glass)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          {/* Joueur 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{playerPseudo}</span>
            <span style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--accent-gold)' }}>
              {score}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>POINTS</span>
          </div>

          {isP2P && (
            <>
              <span style={{ fontWeight: '900', fontSize: '1.4rem', color: 'var(--border-glass)' }}>VS</span>

              {/* Joueur 2 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{opponentPseudo}</span>
                <span style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--accent-purple)' }}>
                  {opponentScore}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>POINTS</span>
              </div>
            </>
          )}
        </div>

        {/* Mode Apocalypse Badge Result */}
        {gameMode === 'apocalypse' && (
          <div className="glass-pill" style={{ marginBottom: '28px', color: 'var(--accent-purple)', padding: '10px 20px' }}>
            <Flame size={18} /> {sealsUnlocked} Sceaux sur 7 Déverrouillés !
          </div>
        )}

        {/* Actions Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => { playSound.click(); requestRematch(); }}
            className="btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '1.05rem' }}
          >
            <RotateCcw size={20} /> Revanche Instantanée
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="btn-secondary"
            style={{ width: '100%', padding: '14px', background: 'rgba(37, 211, 102, 0.15)', borderColor: '#25D366', color: '#25D366' }}
          >
            <Share2 size={18} /> Partager le Score sur WhatsApp
          </button>

          <button
            onClick={() => { playSound.click(); returnHome(); }}
            className="btn-secondary"
            style={{ width: '100%', padding: '12px' }}
          >
            <Home size={18} /> Retour au Menu Principal
          </button>
        </div>
      </div>
    </div>
  );
}
