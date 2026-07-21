import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Clock, Zap, CheckCircle2, XCircle, ShieldAlert, ArrowRight, BookOpen, Flame } from 'lucide-react';
import { playSound } from '../utils/audio';

export default function QuizScreen() {
  const {
    questions, currentIndex,
    score, opponentScore,
    streak, opponentStreak,
    opponentAnswered, isFogged, isP2P,
    playerPseudo, opponentPseudo,
    submitAnswer, nextQuestion, gameMode, sealsUnlocked
  } = useGame();

  const currentQuestion = questions[currentIndex] || {};

  const [selectedOption, setSelectedOption] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [timeTaken, setTimeTaken] = useState(0);

  // Re-initialiser le timer à chaque question
  useEffect(() => {
    setSelectedOption(null);
    setHasAnswered(false);
    setTimeLeft(15);

    const startTime = Date.now();
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // Temps écoulé -> Réponse fausse automatique si pas encore répondu
          if (!hasAnswered) {
            handleOptionClick(-1, 15);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleOptionClick = (index, forcedTime = null) => {
    if (hasAnswered) return;
    playSound.click();

    const elapsedSeconds = forcedTime !== null ? forcedTime : Math.max(1, 15 - timeLeft);
    setSelectedOption(index);
    setHasAnswered(true);
    setTimeTaken(elapsedSeconds);

    const isCorrect = index === currentQuestion.answerIndex || index === currentQuestion.answer;
    submitAnswer(isCorrect, elapsedSeconds);
  };

  return (
    <div className={isFogged ? 'fog-active' : ''} style={{
      width: '100%',
      maxWidth: '850px',
      margin: '0 auto',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>

      {/* Alert Fog Brouillard si attaqué */}
      {isFogged && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999,
          background: 'rgba(239, 68, 68, 0.9)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '30px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.5)'
        }}>
          <ShieldAlert size={24} /> 🌫️ Attaque Brouillard de l'Adversaire ! (4s)
        </div>
      )}

      {/* 1v1 Scoreboard Header */}
      <div className="glass-card" style={{ padding: '16px 24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          {/* Mon Score & Combo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--accent-gold)',
              color: '#0f172a',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {playerPseudo.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{playerPseudo}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-gold)' }}>
                {score} pts {streak >= 3 && <span style={{ fontSize: '0.8rem' }}>🔥x{streak}</span>}
              </div>
            </div>
          </div>

          {/* Timer & Question Progress */}
          <div style={{ textAlign: 'center' }}>
            <div className="glass-pill" style={{
              background: timeLeft <= 4 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              borderColor: timeLeft <= 4 ? 'var(--danger)' : 'var(--border-glass)',
              color: timeLeft <= 4 ? 'var(--danger)' : 'white'
            }}>
              <Clock size={16} /> {timeLeft}s
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Question {currentIndex + 1} / {questions.length}
            </div>
          </div>

          {/* Score Adversaire (Si P2P) */}
          {isP2P ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'right' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{opponentPseudo}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-purple)' }}>
                  {opponentScore} pts {opponentStreak >= 3 && <span style={{ fontSize: '0.8rem' }}>🔥</span>}
                </div>
              </div>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--accent-purple)',
                color: 'white',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {opponentPseudo.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <div className="glass-pill" style={{ color: 'var(--accent-cyan)' }}>
              <BookOpen size={16} /> Mode Solo
            </div>
          )}
        </div>

        {/* Indicateur de réponse adverse */}
        {isP2P && opponentAnswered && (
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--success)',
            textAlign: 'right',
            marginTop: '8px',
            fontWeight: '600'
          }}>
            ⚡ {opponentPseudo} a déjà répondu !
          </div>
        )}
      </div>

      {/* Mode Apocalypse : 7 Sceaux Progress Bar */}
      {gameMode === 'apocalypse' && (
        <div className="glass-card" style={{ padding: '12px 20px', background: 'rgba(139, 92, 246, 0.12)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={16} /> Sceaux de l'Apocalypse Déverrouillés
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'white' }}>
              {sealsUnlocked} / 7
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[1, 2, 3, 4, 5, 6, 7].map(sealNum => (
              <div key={sealNum} style={{
                flex: 1,
                height: '10px',
                borderRadius: '5px',
                background: sealNum <= sealsUnlocked ? 'linear-gradient(90deg, #8b5cf6, #f59e0b)' : 'rgba(255, 255, 255, 0.1)',
                boxShadow: sealNum <= sealsUnlocked ? '0 0 10px rgba(139, 92, 246, 0.5)' : 'none',
                transition: 'all 0.4s ease'
              }} />
            ))}
          </div>
        </div>
      )}

      {/* Question Card */}
      <div className="glass-card" style={{ padding: '28px 24px' }}>
        {/* Badges de Catégorie & Difficulté */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span className="glass-pill" style={{ color: 'var(--accent-gold)', fontSize: '0.8rem' }}>
            {currentQuestion.category || 'Culture Générale'}
          </span>
          {currentQuestion.difficulty && (
            <span className="glass-pill" style={{
              fontSize: '0.8rem',
              color: currentQuestion.difficulty === 'facile' ? 'var(--success)' : currentQuestion.difficulty === 'moyen' ? 'var(--accent-gold)' : 'var(--danger)'
            }}>
              {currentQuestion.difficulty.toUpperCase()}
            </span>
          )}
        </div>

        {/* Question Text */}
        <h3 style={{
          fontSize: '1.35rem',
          fontWeight: '700',
          lineHeight: '1.4',
          marginBottom: '24px',
          color: 'white'
        }}>
          {currentQuestion.question}
        </h3>

        {/* Options Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentQuestion.options && currentQuestion.options.map((option, idx) => {
            const isCorrectAnswer = idx === currentQuestion.answerIndex || option === currentQuestion.answer;
            const isSelected = selectedOption === idx;

            let btnBg = 'rgba(255, 255, 255, 0.05)';
            let btnBorder = 'var(--border-glass)';
            let textColor = 'white';

            if (hasAnswered) {
              if (isCorrectAnswer) {
                btnBg = 'rgba(16, 185, 129, 0.2)';
                btnBorder = 'var(--success)';
                textColor = 'var(--success)';
              } else if (isSelected) {
                btnBg = 'rgba(239, 68, 68, 0.2)';
                btnBorder = 'var(--danger)';
                textColor = 'var(--danger)';
              }
            }

            return (
              <button
                key={idx}
                disabled={hasAnswered}
                onClick={() => handleOptionClick(idx)}
                style={{
                  width: '100%',
                  background: btnBg,
                  border: `1px solid ${btnBorder}`,
                  borderRadius: '14px',
                  padding: '16px 20px',
                  color: textColor,
                  fontSize: '1rem',
                  fontWeight: '600',
                  textAlign: 'left',
                  cursor: hasAnswered ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <span>{option}</span>
                {hasAnswered && isCorrectAnswer && <CheckCircle2 size={20} color="var(--success)" />}
                {hasAnswered && isSelected && !isCorrectAnswer && <XCircle size={20} color="var(--danger)" />}
              </button>
            );
          })}
        </div>

        {/* Explanation & Next Button after answering */}
        {hasAnswered && (
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-glass)' }}>
            {currentQuestion.explanation && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '20px',
                fontSize: '0.92rem',
                lineHeight: '1.5',
                color: 'var(--text-muted)'
              }}>
                <strong style={{ color: 'var(--accent-gold)' }}>💡 Explication biblique : </strong>
                {currentQuestion.explanation}
                {currentQuestion.reference && (
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                    Réf : {currentQuestion.reference}
                  </span>
                )}
              </div>
            )}

            <button
              onClick={() => { playSound.click(); nextQuestion(); }}
              className="btn-primary"
              style={{ width: '100%', padding: '14px' }}
            >
              {currentIndex + 1 === questions.length ? 'Voir les Résultats 🎉' : 'Question Suivante'}
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
