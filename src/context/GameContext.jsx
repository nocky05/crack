import React, { createContext, useContext, useState, useEffect } from 'react';
import { peerManager } from '../network/peerManager';
import { getGameQuestions } from '../utils/questionsLoader';
import { playSound } from '../utils/audio';
import confetti from 'canvas-confetti';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  // Profil & Connexion
  const [playerPseudo, setPlayerPseudoState] = useState(() => {
    return localStorage.getItem('crack_pseudo') || 'Fidèle_' + Math.floor(Math.random() * 900 + 100);
  });
  const [opponentPseudo, setOpponentPseudo] = useState('Adversaire');

  // État de la partie
  const [gameState, setGameState] = useState('HOME'); // HOME, LOBBY, PLAYING, RESULT
  const [gameMode, setGameMode] = useState('classic'); // 'classic', 'apocalypse'
  const [isP2P, setIsP2P] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [isPeerConnecting, setIsPeerConnecting] = useState(false);

  // Questions et scores
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [opponentStreak, setOpponentStreak] = useState(0);

  // Synchronisation & Pièges
  const [opponentAnswered, setOpponentAnswered] = useState(false);
  const [isFogged, setIsFogged] = useState(false);
  const [sealsUnlocked, setSealsUnlocked] = useState(0);

  // Sauvegarder le pseudo
  const setPlayerPseudo = (name) => {
    const cleanName = name.trim() || 'Disciple';
    setPlayerPseudoState(cleanName);
    localStorage.setItem('crack_pseudo', cleanName);
  };

  // ----------------------------------------------------
  // GESTION RÉSEAU P2P
  // ----------------------------------------------------
  useEffect(() => {
    // Vérifier si la page a un paramètre ?join=
    const params = new URLSearchParams(window.location.search);
    const joinId = params.get('join');

    if (joinId) {
      console.log('🔗 URL d\'invitation détectée:', joinId);
      // Nettoyer l'URL immédiatement pour éviter les boucles si l'effet se relance
      window.history.replaceState({}, document.title, window.location.pathname);
      joinP2PGame(joinId);
    }

    // Écouter les événements PeerManager
    peerManager.on('connected', ({ isHost, peerId }) => {
      setIsP2P(true);
      setIsPeerConnecting(false);
      
      if (isHost) {
        setGameState('LOBBY');
      } else {
        // Envoyer son pseudo à l'hôte
        peerManager.send('PLAYER_INFO', { pseudo: playerPseudo });
        setGameState('LOBBY');
      }
    });

    peerManager.on('PLAYER_INFO', ({ pseudo }) => {
      console.log('👤 Pseudo de l\'adversaire reçu:', pseudo);
      setOpponentPseudo(pseudo);
      // Répondre avec son propre pseudo
      peerManager.send('PLAYER_INFO_RESPONSE', { pseudo: playerPseudo });
    });

    peerManager.on('PLAYER_INFO_RESPONSE', ({ pseudo }) => {
      setOpponentPseudo(pseudo);
    });

    peerManager.on('START_GAME', ({ questions: hostQuestions, mode }) => {
      console.log('🎮 Lancement de la partie par l\'hôte!');
      setQuestions(hostQuestions);
      setGameMode(mode);
      resetGameData();
      setGameState('PLAYING');
    });

    peerManager.on('SUBMIT_ANSWER', ({ score: oppScore, streak: oppStreak }) => {
      setOpponentScore(oppScore);
      setOpponentStreak(oppStreak);
      setOpponentAnswered(true);
    });

    peerManager.on('TRIGGER_TRAP', () => {
      console.log('🌫️ Attaque Brouillard reçue!');
      playSound.fogAttack();
      setIsFogged(true);
      setTimeout(() => setIsFogged(false), 4000); // Durée du brouillard : 4s
    });

    peerManager.on('REMATCH_REQUEST', () => {
      if (isHost) {
        startHostGame(gameMode);
      }
    });

    peerManager.on('disconnected', () => {
      console.warn('Adversaire déconnecté');
    });

  }, [playerPseudo, gameMode, isHost]);

  // 1. Démarrer en tant qu'Hôte P2P
  const createP2PGame = async () => {
    try {
      setIsPeerConnecting(true);
      setIsHost(true);
      setIsP2P(true);
      const hostId = await peerManager.initHost();
      setShareLink(peerManager.getShareableLink());
      setGameState('LOBBY');
    } catch (err) {
      alert("Impossible de créer le salon P2P. Vérifie ta connexion.");
      setIsPeerConnecting(false);
    }
  };

  // 2. Rejoindre en tant qu'Invité P2P
  const joinP2PGame = async (hostId) => {
    try {
      setIsPeerConnecting(true);
      setIsHost(false);
      setIsP2P(true);
      await peerManager.connectToHost(hostId);
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      alert("Impossible de rejoindre le salon P2P. Le lien a peut-être expiré.");
      setIsPeerConnecting(false);
      setGameState('HOME');
      // Nettoyer l'URL même en cas d'erreur
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  // 3. Lancer la partie (Hôte ou Solo)
  const startHostGame = (selectedMode = 'classic') => {
    setGameMode(selectedMode);
    const selectedQuestions = getGameQuestions({
      mode: selectedMode,
      count: selectedMode === 'apocalypse' ? 7 : 10
    });

    setQuestions(selectedQuestions);
    resetGameData();

    if (isP2P && isHost) {
      peerManager.send('START_GAME', { questions: selectedQuestions, mode: selectedMode });
    }

    setGameState('PLAYING');
  };

  // Mode Solo rapide
  const startSoloGame = (selectedMode = 'classic') => {
    setIsP2P(false);
    setIsHost(false);
    startHostGame(selectedMode);
  };

  const resetGameData = () => {
    setCurrentIndex(0);
    setScore(0);
    setOpponentScore(0);
    setStreak(0);
    setOpponentStreak(0);
    setOpponentAnswered(false);
    setIsFogged(false);
    setSealsUnlocked(0);
  };

  // Soumission d'une réponse
  const submitAnswer = (isCorrect, timeTaken) => {
    let pts = 0;
    let newStreak = streak;

    if (isCorrect) {
      pts = 100;
      // Bonus de vitesse (< 3s = +50%)
      if (timeTaken < 3) {
        pts += 50;
      }
      newStreak += 1;
      playSound.correct();

      // Mode Apocalypse : Déverrouiller un Sceau
      if (gameMode === 'apocalypse') {
        setSealsUnlocked(prev => Math.min(7, prev + 1));
      }

      // Proposer le piège Brouillard si combo >= 3
      if (newStreak >= 3 && isP2P) {
        peerManager.send('TRIGGER_TRAP', {});
      }
    } else {
      newStreak = 0;
      playSound.wrong();
    }

    const newScore = score + pts;
    setScore(newScore);
    setStreak(newStreak);

    // Synchroniser avec l'adversaire via P2P
    if (isP2P) {
      peerManager.send('SUBMIT_ANSWER', { score: newScore, streak: newStreak });
    }
  };

  // Passer à la question suivante
  const nextQuestion = () => {
    setOpponentAnswered(false);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Fin de la partie
      setGameState('RESULT');
      playSound.victory();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  // Demander une revanche
  const requestRematch = () => {
    if (isP2P) {
      peerManager.send('REMATCH_REQUEST', {});
      if (isHost) {
        startHostGame(gameMode);
      }
    } else {
      startSoloGame(gameMode);
    }
  };

  const returnHome = () => {
    if (isP2P) {
      peerManager.disconnect();
    }
    setIsP2P(false);
    setGameState('HOME');
  };

  return (
    <GameContext.Provider value={{
      playerPseudo, setPlayerPseudo,
      opponentPseudo,
      gameState, setGameState,
      gameMode, setGameMode,
      isP2P, isHost,
      shareLink, isPeerConnecting,
      questions, currentIndex,
      score, opponentScore,
      streak, opponentStreak,
      opponentAnswered, isFogged,
      sealsUnlocked,
      createP2PGame, joinP2PGame,
      startHostGame, startSoloGame,
      submitAnswer, nextQuestion,
      requestRematch, returnHome
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
