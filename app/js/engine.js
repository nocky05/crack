/**
 * Crack Béréen - Game Engine
 * Gère la logique de jeu, le score, les équipes, les chronomètres et la progression.
 */

class GameEngine {
  constructor() {
    this.mode = 'home'; // 'home', 'solo', 'presenter', 'matching'
    this.currentQuestions = [];
    this.currentQuestionIdx = 0;
    
    // Solo State
    this.soloScore = 0;
    this.soloTimerVal = 30;
    this.soloTimerInterval = null;
    this.hasAnswered = false;

    // Presenter State
    this.presenterConfig = {
      categories: [],
      difficulties: [],
      teams: [
        { id: 1, name: 'Équipe Éphèse', score: 0, jokers: { '50': false, 'pub': false, 'double': false } },
        { id: 2, name: 'Équipe Philadelphie', score: 0, jokers: { '50': false, 'pub': false, 'double': false } },
        { id: 3, name: 'Équipe Smyrne', score: 0, jokers: { '50': false, 'pub': false, 'double': false } }
      ],
      activeTeamIdx: 0,
      questionCount: 15
    };
    this.presenterTimerVal = 45;
    this.presenterTimerInterval = null;
    this.isTimerPaused = false;
    this.isAnswerRevealed = false;

    // Matching State
    this.currentSeries = null;
    this.selectedLeft = null;
    this.selectedRight = null;
    this.matchedPairsCount = 0;
    this.matchingAttempts = 0;
    this.matchingScore = 0;

    // Relais State
    this.currentRelais = null;
    this.relaisScore = 0;
  }

  /**
   * Initialise une partie Solo.
   */
  startSoloGame(categories, difficulties) {
    this.mode = 'solo';
    this.soloScore = 0;
    this.currentQuestionIdx = 0;
    this.hasAnswered = false;
    
    this.currentQuestions = window.db.getQuestions({
      categories: categories,
      difficulties: difficulties,
      count: 10,
      randomize: true
    });

    if (this.currentQuestions.length === 0) {
      alert("Aucune question ne correspond aux critères sélectionnés. Chargement par défaut.");
      this.currentQuestions = window.db.getQuestions({ count: 10 });
    }
  }

  /**
   * Lance une question Solo (démarre le timer).
   */
  loadSoloQuestion(callbackUpdateUI) {
    this.hasAnswered = false;
    const q = this.currentQuestions[this.currentQuestionIdx];
    this.soloTimerVal = q.difficulty === 'facile' ? 20 : (q.difficulty === 'moyen' ? 30 : 45);
    
    if (this.soloTimerInterval) clearInterval(this.soloTimerInterval);
    
    this.soloTimerInterval = setInterval(() => {
      if (this.soloTimerVal > 0) {
        this.soloTimerVal--;
        playSound('timer');
        callbackUpdateUI({ type: 'tick', value: this.soloTimerVal });
      } else {
        clearInterval(this.soloTimerInterval);
        this.hasAnswered = true;
        playSound('wrong');
        callbackUpdateUI({ type: 'timeout' });
      }
    }, 1000);
  }

  /**
   * Vérifie la réponse choisie en mode Solo.
   */
  submitSoloAnswer(selectedOption) {
    if (this.hasAnswered) return null;
    this.hasAnswered = true;
    clearInterval(this.soloTimerInterval);
    
    const q = this.currentQuestions[this.currentQuestionIdx];
    const isCorrect = selectedOption === q.answer;
    
    if (isCorrect) {
      // Bonus de temps
      const basePoints = q.difficulty === 'facile' ? 10 : (q.difficulty === 'moyen' ? 20 : 30);
      const timeBonus = Math.floor(this.soloTimerVal / 2);
      this.soloScore += basePoints + timeBonus;
      playSound('correct');
    } else {
      playSound('wrong');
    }

    return {
      isCorrect,
      correctAnswer: q.answer,
      score: this.soloScore
    };
  }

  /**
   * Passe à la question solo suivante.
   */
  nextSoloQuestion() {
    this.currentQuestionIdx++;
    return this.currentQuestionIdx < this.currentQuestions.length;
  }

  /**
   * Initialise le mode Présentateur.
   */
  startPresenterGame(categories, difficulties, teamNames) {
    this.mode = 'presenter';
    this.currentQuestionIdx = 0;
    this.isAnswerRevealed = false;
    this.isTimerPaused = false;
    
    // Configurer les équipes
    this.presenterConfig.teams = teamNames.map((name, idx) => ({
      id: idx + 1,
      name: name || `Équipe ${idx + 1}`,
      score: 0,
      jokers: { '50': false, 'pub': false, 'double': false }
    }));
    this.presenterConfig.activeTeamIdx = 0;

    // Charger les questions
    this.currentQuestions = window.db.getQuestions({
      categories: categories,
      difficulties: difficulties,
      count: 20, // Plus de questions en réserve
      randomize: true
    });

    if (this.currentQuestions.length === 0) {
      this.currentQuestions = window.db.getQuestions({ count: 20 });
    }
  }

  /**
   * Lance une question en mode Présentateur.
   */
  loadPresenterQuestion(callbackUpdateUI) {
    this.isAnswerRevealed = false;
    const q = this.currentQuestions[this.currentQuestionIdx];
    
    // Déterminer le temps
    this.presenterTimerVal = q.difficulty === 'facile' ? 30 : (q.difficulty === 'moyen' ? 45 : 60);
    
    if (this.presenterTimerInterval) clearInterval(this.presenterTimerInterval);
    
    this.presenterTimerInterval = setInterval(() => {
      if (!this.isTimerPaused) {
        if (this.presenterTimerVal > 0) {
          this.presenterTimerVal--;
          playSound('timer');
          callbackUpdateUI({ type: 'tick', value: this.presenterTimerVal });
        } else {
          clearInterval(this.presenterTimerInterval);
          playSound('wrong');
          callbackUpdateUI({ type: 'timeout' });
        }
      }
    }, 1000);
  }

  /**
   * Ajuste manuellement le score d'une équipe.
   */
  adjustTeamScore(teamId, amount) {
    const team = this.presenterConfig.teams.find(t => t.id === teamId);
    if (team) {
      team.score = Math.max(0, team.score + amount); // Ne pas descendre sous 0
      return team.score;
    }
    return 0;
  }

  /**
   * Utilise un joker pour une équipe.
   */
  useTeamJoker(teamId, jokerType) {
    const team = this.presenterConfig.teams.find(t => t.id === teamId);
    if (team && !team.jokers[jokerType]) {
      team.jokers[jokerType] = true;
      return true;
    }
    return false;
  }

  /**
   * Alterne l'équipe active.
   */
  nextTeamTurn() {
    const count = this.presenterConfig.teams.length;
    this.presenterConfig.activeTeamIdx = (this.presenterConfig.activeTeamIdx + 1) % count;
    return this.presenterConfig.activeTeamIdx;
  }

  /**
   * Pause / Relance le chronomètre du mode Présentateur.
   */
  toggleTimer() {
    this.isTimerPaused = !this.isTimerPaused;
    return this.isTimerPaused;
  }

  /**
   * Démarre une série de correspondance.
   */
  startMatchingGame(seriesId) {
    this.mode = 'matching';
    this.currentSeries = window.db.getMatchingSeriesById(seriesId);
    this.selectedLeft = null;
    this.selectedRight = null;
    this.matchedPairsCount = 0;
    this.matchingAttempts = 0;
    this.matchingScore = 0;
    
    // Préparer les cartes mélangées de chaque colonne
    const leftElements = this.currentSeries.pairs.map(p => p.left);
    const rightElements = this.currentSeries.pairs.map(p => p.right);
    
    return {
      title: this.currentSeries.title,
      left: window.db.shuffleArray(leftElements),
      right: window.db.shuffleArray(rightElements)
    };
  }

  /**
   * Enregistre la sélection et vérifie si une liaison est correcte.
   */
  selectMatchElement(side, value) {
    if (side === 'left') {
      this.selectedLeft = value;
    } else {
      this.selectedRight = value;
    }

    if (this.selectedLeft && this.selectedRight) {
      this.matchingAttempts++;
      // Trouver la vraie paire dans les données d'origine
      const pair = this.currentSeries.pairs.find(p => p.left === this.selectedLeft);
      
      const isCorrect = pair && pair.right === this.selectedRight;
      
      const result = {
        isCorrect,
        left: this.selectedLeft,
        right: this.selectedRight,
        ref: pair ? pair.ref : ''
      };

      // Reset des sélections
      this.selectedLeft = null;
      this.selectedRight = null;

      if (isCorrect) {
        this.matchedPairsCount++;
        this.matchingScore += 10; // 10 points par bonne réponse
        playSound('correct');
      } else {
        playSound('wrong');
      }

      return result;
    }

    return null; // En attente de la seconde sélection
  }

  /**
   * Démarre un jeu de type Relais Apocalypse.
   */
  startRelaisGame(relaisId) {
    this.mode = 'relais';
    this.currentRelais = window.db.getRelaisSeriesById(relaisId);
    this.relaisScore = 0;
    return this.currentRelais;
  }

  /**
   * Valide la réponse pour un membre du relais.
   */
  validateRelaisAnswer(memberIndex) {
    this.relaisScore++;
    playSound('correct');
    return this.relaisScore;
  }
}

// Instance globale accessible par les autres fichiers
window.engine = new GameEngine();
