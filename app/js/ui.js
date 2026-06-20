/**
 * Crack Béréen - UI Controller
 * Gère l'affichage des écrans, les clics d'interface et les animations.
 */

// Global helper pour changer d'écran
function showScreen(screenId) {
  playSound('click');
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`screen-${screenId}`);
  if (target) {
    target.classList.add('active');
    window.engine.mode = screenId;
  }
}

// Global helpers pour les contrôles du présentateur
window.adjustScore = function(teamId, amount) {
  playSound('click');
  const newScore = window.engine.adjustTeamScore(teamId, amount);
  document.getElementById(`team-score-${teamId}`).textContent = newScore;
};

window.useJoker = function(teamId, jokerType) {
  const success = window.engine.useTeamJoker(teamId, jokerType);
  if (success) {
    playSound('correct');
    const badge = document.getElementById(`joker-${teamId}-${jokerType}`);
    badge.classList.add('used');
    
    // Application de l'effet visuel sur la question
    if (jokerType === '50' && window.engine.mode === 'presenter') {
      apply5050Joker();
    } else if (jokerType === 'pub') {
      alert(`Joker Public activé pour l'Équipe ${teamId} ! L'animateur consulte l'audience.`);
    } else if (jokerType === 'double') {
      alert(`Joker Double Chance activé pour l'Équipe ${teamId} ! Deux tentatives de réponse autorisées.`);
    }
  }
};

function apply5050Joker() {
  const q = window.engine.currentQuestions[window.engine.currentQuestionIdx];
  const correctAnswer = q.answer;
  const optionButtons = document.querySelectorAll('#pres-options .option-btn');
  
  let countRemoved = 0;
  optionButtons.forEach(btn => {
    const text = btn.querySelector('.option-text').textContent.trim();
    if (text !== correctAnswer.trim() && countRemoved < 2) {
      btn.style.opacity = '0.2';
      btn.disabled = true;
      countRemoved++;
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  // Charger la base de données
  const loadingSuccess = await window.db.loadDatabase();
  if (!loadingSuccess) {
    console.warn("Base de données JSON non trouvée. Utilisation de la base interne de secours.");
  }

  // --- NAVIGATION ÉVÉNEMENTS ---
  document.getElementById('nav-btn-home').addEventListener('click', () => showScreen('home'));
  document.getElementById('logo-home').addEventListener('click', () => showScreen('home'));
  document.getElementById('nav-btn-rules').addEventListener('click', () => showScreen('rules'));
  document.getElementById('nav-btn-about').addEventListener('click', () => showScreen('about'));

  // --- MENU PRINCIPAL ---
  document.getElementById('btn-start-solo').addEventListener('click', () => {
    openSetup('solo');
  });

  document.getElementById('card-mode-presenter').addEventListener('click', () => {
    openSetup('presenter');
  });

  document.getElementById('card-mode-matching').addEventListener('click', () => {
    loadMatchingSeriesSelect();
    showScreen('matching-select');
  });

  document.getElementById('card-mode-relais').addEventListener('click', () => {
    loadRelaisSeriesSelect();
    showScreen('relais-select');
  });

  // --- SETUP GAME ---
  let activeSetupMode = 'solo'; // 'solo' ou 'presenter'

  // Gérer la sélection des catégories (multi-sélection premium)
  document.querySelectorAll('.category-select-card').forEach(card => {
    card.addEventListener('click', () => {
      playSound('click');
      card.classList.toggle('selected');
    });
  });

  function openSetup(mode) {
    activeSetupMode = mode;
    document.getElementById('setup-title').textContent = mode === 'solo' ? 'Entraînement Solo' : 'Configuration Animateur';
    
    // Afficher la section d'équipes si mode présentateur
    const teamsSection = document.getElementById('setup-teams-section');
    teamsSection.style.display = mode === 'presenter' ? 'block' : 'none';
    
    showScreen('setup');
  }

  document.getElementById('btn-setup-back').addEventListener('click', () => showScreen('home'));

  document.getElementById('btn-setup-start').addEventListener('click', () => {
    // Collecter les catégories sélectionnées
    const selectedCats = [];
    document.querySelectorAll('.category-select-card.selected').forEach(card => {
      selectedCats.push(card.dataset.cat);
    });

    if (selectedCats.length === 0) {
      alert("Veuillez sélectionner au moins une catégorie.");
      return;
    }

    // Collecter les difficultés sélectionnées
    const selectedDiffs = [];
    if (document.getElementById('diff-easy').checked) selectedDiffs.push('facile');
    if (document.getElementById('diff-medium').checked) selectedDiffs.push('moyen');
    if (document.getElementById('diff-hard').checked) selectedDiffs.push('difficile');

    if (selectedDiffs.length === 0) {
      alert("Veuillez sélectionner au moins un niveau de difficulté.");
      return;
    }

    if (activeSetupMode === 'solo') {
      window.engine.startSoloGame(selectedCats, selectedDiffs);
      loadSoloQuestionUI();
      showScreen('solo');
    } else {
      const teamNames = [
        document.getElementById('input-team1').value,
        document.getElementById('input-team2').value,
        document.getElementById('input-team3').value
      ];
      window.engine.startPresenterGame(selectedCats, selectedDiffs, teamNames);
      
      // Mettre à jour l'interface des équipes
      for (let i = 1; i <= 3; i++) {
        document.getElementById(`team-name-${i}`).textContent = window.engine.presenterConfig.teams[i-1].name;
        document.getElementById(`team-score-${i}`).textContent = '0';
        document.querySelectorAll(`.jokers-row #joker-${i}-50, .jokers-row #joker-${i}-pub, .jokers-row #joker-${i}-double`).forEach(btn => {
          btn.classList.remove('used');
        });
      }
      
      updatePresenterTurnHighlight();
      loadPresenterQuestionUI();
      showScreen('presenter');
    }
  });

  // --- LOGIQUE MODE SOLO ---
  function loadSoloQuestionUI() {
    const engine = window.engine;
    const q = engine.currentQuestions[engine.currentQuestionIdx];
    
    // Mettre à jour l'en-tête
    document.getElementById('solo-category').textContent = q.category;
    document.getElementById('solo-progress').textContent = `Question ${engine.currentQuestionIdx + 1}/${engine.currentQuestions.length}`;
    
    const diffBadge = document.getElementById('solo-difficulty');
    diffBadge.textContent = q.difficulty;
    diffBadge.className = `difficulty-badge ${q.difficulty}`;

    // Mettre à jour la question
    document.getElementById('solo-question-text').textContent = q.question;
    document.getElementById('solo-question-meta').textContent = q.reference ? `Référence : ${q.reference}` : '';

    // Cacher l'explication et le bouton suivant
    document.getElementById('solo-explanation').style.display = 'none';
    document.getElementById('solo-btn-next').style.display = 'none';

    // Rendre les options (mélangées pour éviter que la bonne réponse soit toujours en A)
    const optionsGrid = document.getElementById('solo-options');
    optionsGrid.innerHTML = '';
    
    const shuffledOptions = window.db.shuffleArray([...q.options]);
    shuffledOptions.forEach((opt, idx) => {
      const letter = String.fromCharCode(65 + idx); // A, B, C, D
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `<span class="option-prefix">${letter}</span><span class="option-text">${opt}</span>`;
      btn.addEventListener('click', () => submitSoloOption(opt, btn));
      optionsGrid.appendChild(btn);
    });

    // Lancer le timer
    engine.loadSoloQuestion((update) => {
      const timerCircle = document.getElementById('solo-timer');
      if (update.type === 'tick') {
        timerCircle.textContent = update.value;
        if (update.value <= 5) {
          timerCircle.classList.add('warning');
        } else {
          timerCircle.classList.remove('warning');
        }
      } else if (update.type === 'timeout') {
        timerCircle.textContent = '0';
        timerCircle.classList.remove('warning');
        revealSoloCorrectAnswer();
      }
    });
  }

  function submitSoloOption(selectedOpt, btnElement) {
    const result = window.engine.submitSoloAnswer(selectedOpt);
    if (!result) return; // Déjà répondu ou temps écoulé

    // Désactiver toutes les options
    document.querySelectorAll('#solo-options .option-btn').forEach(btn => {
      btn.disabled = true;
    });

    if (result.isCorrect) {
      btnElement.classList.add('correct');
    } else {
      btnElement.classList.add('wrong');
      // Mettre en vert la bonne réponse
      document.querySelectorAll('#solo-options .option-btn').forEach(btn => {
        if (btn.querySelector('.option-text').textContent.trim() === result.correctAnswer.trim()) {
          btn.classList.add('correct');
        }
      });
    }

    document.getElementById('solo-score-val').textContent = result.score;
    showSoloExplanation();
  }

  function revealSoloCorrectAnswer() {
    const q = window.engine.currentQuestions[window.engine.currentQuestionIdx];
    document.querySelectorAll('#solo-options .option-btn').forEach(btn => {
      btn.disabled = true;
      if (btn.querySelector('.option-text').textContent.trim() === q.answer.trim()) {
        btn.classList.add('correct');
      }
    });
    showSoloExplanation();
  }

  function showSoloExplanation() {
    const q = window.engine.currentQuestions[window.engine.currentQuestionIdx];
    document.getElementById('solo-explanation-text').textContent = q.explanation || "Aucune explication supplémentaire fournie.";
    document.getElementById('solo-explanation-ref').textContent = q.reference ? `Source : ${q.reference}` : '';
    document.getElementById('solo-explanation').style.display = 'block';
    document.getElementById('solo-btn-next').style.display = 'block';
  }

  document.getElementById('solo-btn-next').addEventListener('click', () => {
    if (window.engine.nextSoloQuestion()) {
      loadSoloQuestionUI();
    } else {
      // Fin de partie solo
      playSound('victory');
      document.getElementById('results-score-display').textContent = `${window.engine.soloScore} pts`;
      document.getElementById('results-comment').textContent = `Félicitations pour avoir complété ce quiz d'entraînement ! Réessayez pour améliorer votre score.`;
      showScreen('results');
    }
  });

  // --- LOGIQUE MODE PRÉSENTATEUR ---
  function loadPresenterQuestionUI() {
    const engine = window.engine;
    const q = engine.currentQuestions[engine.currentQuestionIdx];
    
    // Mettre à jour l'en-tête
    document.getElementById('pres-category').textContent = q.category;
    document.getElementById('pres-progress').textContent = `Question ${engine.currentQuestionIdx + 1}/${engine.currentQuestions.length}`;
    
    const diffBadge = document.getElementById('pres-difficulty');
    diffBadge.textContent = q.difficulty;
    diffBadge.className = `difficulty-badge ${q.difficulty}`;

    // Mettre à jour la question
    document.getElementById('pres-question-text').textContent = q.question;
    document.getElementById('pres-question-meta').textContent = q.reference ? `Référence : ${q.reference}` : '';

    // Cacher l'explication
    document.getElementById('pres-explanation').style.display = 'none';

    // Rendre les options (non interactives pour les spectateurs, révélables par l'animateur)
    const optionsGrid = document.getElementById('pres-options');
    optionsGrid.innerHTML = '';
    
    // Mélanger les options pour le mode présentateur aussi
    const shuffledPresOptions = window.db.shuffleArray([...q.options]);
    shuffledPresOptions.forEach((opt, idx) => {
      const letter = String.fromCharCode(65 + idx);
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `<span class="option-prefix">${letter}</span><span class="option-text">${opt}</span>`;
      btn.disabled = true; // L'animateur gère la validation
      optionsGrid.appendChild(btn);
    });

    // Lancer le timer
    engine.loadPresenterQuestion((update) => {
      const timerCircle = document.getElementById('pres-timer');
      if (update.type === 'tick') {
        timerCircle.textContent = update.value;
        if (update.value <= 5) {
          timerCircle.classList.add('warning');
        } else {
          timerCircle.classList.remove('warning');
        }
      } else if (update.type === 'timeout') {
        timerCircle.textContent = '0';
        timerCircle.classList.remove('warning');
        revealPresenterAnswer();
      }
    });
  }

  function revealPresenterAnswer() {
    if (window.engine.isAnswerRevealed) return;
    window.engine.isAnswerRevealed = true;
    clearInterval(window.engine.presenterTimerInterval);

    const q = window.engine.currentQuestions[window.engine.currentQuestionIdx];
    
    // Colorer les options
    document.querySelectorAll('#pres-options .option-btn').forEach(btn => {
      const text = btn.querySelector('.option-text').textContent.trim();
      if (text === q.answer.trim()) {
        btn.classList.add('correct');
      } else {
        btn.classList.add('wrong');
      }
    });

    // Afficher l'explication
    document.getElementById('pres-explanation-text').textContent = q.explanation || "Aucune note additionnelle.";
    document.getElementById('pres-explanation-ref').textContent = q.reference ? `Source : ${q.reference}` : '';
    document.getElementById('pres-explanation').style.display = 'block';
    playSound('correct');
  }

  function updatePresenterTurnHighlight() {
    const activeIdx = window.engine.presenterConfig.activeTeamIdx;
    for (let i = 1; i <= 3; i++) {
      const card = document.getElementById(`team-card-${i}`);
      if (i - 1 === activeIdx) {
        card.classList.add('active-turn');
      } else {
        card.classList.remove('active-turn');
      }
    }
  }

  document.getElementById('pres-btn-reveal').addEventListener('click', revealPresenterAnswer);

  document.getElementById('pres-btn-skip').addEventListener('click', () => {
    playSound('click');
    clearInterval(window.engine.presenterTimerInterval);
    goToNextPresenterQuestion();
  });

  document.getElementById('pres-btn-next').addEventListener('click', () => {
    playSound('click');
    clearInterval(window.engine.presenterTimerInterval);
    goToNextPresenterQuestion();
  });

  function goToNextPresenterQuestion() {
    if (window.engine.nextSoloQuestion()) {
      loadPresenterQuestionUI();
    } else {
      // Déterminer l'équipe gagnante
      playSound('victory');
      const teams = window.engine.presenterConfig.teams;
      let winnerText = "Match nul !";
      let highestScore = -1;
      let winner = null;
      
      teams.forEach(t => {
        if (t.score > highestScore) {
          highestScore = t.score;
          winner = t;
        }
      });
      
      if (winner) {
        winnerText = `Victoire de l'${winner.name} avec ${winner.score} points !`;
      }

      document.getElementById('results-score-display').textContent = winnerText;
      document.getElementById('results-comment').textContent = `Classement final :\n` + teams.map(t => `${t.name} : ${t.score} pts`).join('\n');
      showScreen('results');
    }
  }

  document.getElementById('btn-next-turn').addEventListener('click', () => {
    window.engine.nextTeamTurn();
    updatePresenterTurnHighlight();
  });

  document.getElementById('btn-timer-toggle').addEventListener('click', () => {
    const isPaused = window.engine.toggleTimer();
    document.getElementById('btn-timer-toggle').innerHTML = isPaused ? '<span>▶️</span> Reprendre le Timer' : '<span>⏸️</span> Pause / Relancer Timer';
    playSound('click');
  });

  document.getElementById('btn-reset-presenter').addEventListener('click', () => {
    if (confirm("Voulez-vous réinitialiser complètement cette partie animateur ?")) {
      clearInterval(window.engine.presenterTimerInterval);
      showScreen('home');
    }
  });

  // --- MINI DUELS (DÉFIS RAPIDES) ---
  document.getElementById('btn-trigger-duel').addEventListener('click', () => {
    triggerQuickDuel();
  });

  function triggerQuickDuel() {
    playSound('click');
    clearInterval(window.engine.presenterTimerInterval);

    // Choisir une question difficile aléatoire
    const duelQuestions = window.db.getQuestions({
      difficulties: ['moyen', 'difficile'],
      count: 1,
      randomize: true
    });

    if (duelQuestions.length === 0) return;

    const q = duelQuestions[0];
    
    // Créer et ouvrir un overlay modal pour le duel
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-content glass" style="max-width: 650px;">
        <button class="modal-close" id="btn-close-duel">×</button>
        <h3 class="title-gold" style="font-size: 1.8rem; margin-bottom: 20px;">⚔️ DÉFI RAPIDE (DUEL) ⚔️</h3>
        <p style="color: var(--color-text-muted); margin-bottom: 20px;">Le premier joueur qui buzze a la main pour répondre !</p>
        
        <div id="duel-question-area" style="padding: 20px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid rgba(255,191,0,0.1); margin-bottom: 30px;">
          <h4 style="font-size: 1.4rem; line-height: 1.5;" id="duel-question-text">Préparation...</h4>
        </div>

        <div style="display: flex; gap: 15px; justify-content: center; margin-bottom: 30px;">
          <button class="btn-gold" style="background: #e74c3c; color: white;" onclick="triggerBuzzer(1)">🚨 Équipe 1</button>
          <button class="btn-gold" style="background: #3498db; color: white;" onclick="triggerBuzzer(2)">🚨 Équipe 2</button>
          <button class="btn-gold" style="background: #2ecc71; color: white;" onclick="triggerBuzzer(3)">🚨 Équipe 3</button>
        </div>

        <div id="duel-actions" style="display: none; justify-content: center; gap: 15px;">
          <button class="btn-nav" style="border-color: var(--color-correct); color: var(--color-correct);" id="duel-btn-correct">Bonne Réponse (+15 pts)</button>
          <button class="btn-nav" style="border-color: var(--color-wrong); color: var(--color-wrong);" id="duel-btn-wrong">Mauvaise Réponse (-10 pts)</button>
        </div>

        <div id="duel-explanation" style="display: none; padding: 15px; border-left: 3px solid var(--color-gold); text-align: left; margin-top: 20px; font-size: 0.9rem;">
          <strong>Réponse correcte :</strong> <span id="duel-correct-answer"></span><br>
          <span id="duel-explanation-text"></span>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    let activeBuzzedTeam = null;

    // Fermer le duel
    document.getElementById('btn-close-duel').addEventListener('click', () => {
      modal.remove();
      // Relancer le timer principal
      loadPresenterQuestionUI();
    });

    // Révéler la question après 2 secondes
    setTimeout(() => {
      document.getElementById('duel-question-text').textContent = q.question;
      playSound('victory');
    }, 1500);

    window.triggerBuzzer = function(teamId) {
      if (activeBuzzedTeam) return; // Déjà buzzé
      activeBuzzedTeam = teamId;
      playSound('wrong');
      
      const teamName = window.engine.presenterConfig.teams[teamId-1].name;
      document.getElementById('duel-question-area').style.borderColor = 'var(--color-gold)';
      document.getElementById('duel-question-text').innerHTML = `🚨 <span class="title-gold">${teamName}</span> a buzzé ! <br><br> ${q.question}`;
      
      // Afficher les contrôles de points
      document.getElementById('duel-actions').style.display = 'flex';
    };

    document.getElementById('duel-btn-correct').addEventListener('click', () => {
      window.engine.adjustTeamScore(activeBuzzedTeam, 15);
      document.getElementById(`team-score-${activeBuzzedTeam}`).textContent = window.engine.presenterConfig.teams[activeBuzzedTeam-1].score;
      revealDuelAnswer();
    });

    document.getElementById('duel-btn-wrong').addEventListener('click', () => {
      window.engine.adjustTeamScore(activeBuzzedTeam, -10);
      document.getElementById(`team-score-${activeBuzzedTeam}`).textContent = window.engine.presenterConfig.teams[activeBuzzedTeam-1].score;
      revealDuelAnswer();
    });

    function revealDuelAnswer() {
      document.getElementById('duel-actions').style.display = 'none';
      document.getElementById('duel-correct-answer').textContent = q.answer;
      document.getElementById('duel-explanation-text').textContent = q.explanation || "";
      document.getElementById('duel-explanation').style.display = 'block';
      playSound('correct');
    }
  }

  // --- LOGIQUE QUESTIONS DE CORRESPONDANCE ---
  function loadMatchingSeriesSelect() {
    const grid = document.getElementById('matching-series-grid');
    grid.innerHTML = '';

    window.db.matchingSeries.forEach((series, idx) => {
      const card = document.createElement('div');
      card.className = 'category-select-card glass';
      card.innerHTML = `
        <span style="font-size: 2rem;">🔗</span>
        <h4 style="margin-top: 10px;">${series.title}</h4>
      `;
      card.addEventListener('click', () => {
        startMatchingGameUI(series.id);
      });
      grid.appendChild(card);
    });
  }

  document.getElementById('btn-matching-select-back').addEventListener('click', () => showScreen('home'));
  document.getElementById('btn-matching-back').addEventListener('click', () => showScreen('matching-select'));

  function startMatchingGameUI(seriesId) {
    const data = window.engine.startMatchingGame(seriesId);
    
    document.getElementById('matching-title').textContent = data.title;
    document.getElementById('matching-attempts').textContent = '0';
    document.getElementById('matching-score').textContent = '0 / 10';
    document.getElementById('btn-matching-next').style.display = 'none';

    // Remplir la colonne de gauche (Items)
    const leftCol = document.getElementById('match-left-col');
    leftCol.innerHTML = '<div class="matching-column-title">Élément</div>';
    data.left.forEach(val => {
      const card = document.createElement('div');
      card.className = 'match-card';
      card.dataset.val = val;
      card.innerHTML = `
        <span>${val}</span>
        <span class="match-badge">L</span>
      `;
      card.addEventListener('click', () => selectLeftMatch(card, val));
      leftCol.appendChild(card);
    });

    // Remplir la colonne de droite (Targets)
    const rightCol = document.getElementById('match-right-col');
    rightCol.innerHTML = '<div class="matching-column-title">Message / Caractéristique</div>';
    data.right.forEach(val => {
      const card = document.createElement('div');
      card.className = 'match-card';
      card.dataset.val = val;
      card.innerHTML = `
        <span>${val}</span>
        <span class="match-badge">R</span>
      `;
      card.addEventListener('click', () => selectRightMatch(card, val));
      rightCol.appendChild(card);
    });

    showScreen('matching-play');
  }

  function selectLeftMatch(card, val) {
    playSound('click');
    document.querySelectorAll('#match-left-col .match-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    checkMatchPair('left', val);
  }

  function selectRightMatch(card, val) {
    playSound('click');
    document.querySelectorAll('#match-right-col .match-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    checkMatchPair('right', val);
  }

  function checkMatchPair(side, val) {
    const result = window.engine.selectMatchElement(side, val);
    
    if (result) {
      document.getElementById('matching-attempts').textContent = window.engine.matchingAttempts;

      const leftCard = Array.from(document.querySelectorAll('#match-left-col .match-card')).find(c => c.dataset.val === result.left);
      const rightCard = Array.from(document.querySelectorAll('#match-right-col .match-card')).find(c => c.dataset.val === result.right);

      if (result.isCorrect) {
        // Marquer en correct
        leftCard.className = 'match-card matched';
        rightCard.className = 'match-card matched';
        
        leftCard.querySelector('.match-badge').textContent = '✓';
        rightCard.querySelector('.match-badge').textContent = '✓';

        document.getElementById('matching-score').textContent = `${window.engine.matchedPairsCount} / ${window.engine.currentSeries.pairs.length}`;

        // Si tout est associé
        if (window.engine.matchedPairsCount === window.engine.currentSeries.pairs.length) {
          playSound('victory');
          document.getElementById('btn-matching-next').style.display = 'block';
        }
      } else {
        // Secouer et rouge
        leftCard.classList.add('matched-wrong');
        rightCard.classList.add('matched-wrong');
        setTimeout(() => {
          leftCard.classList.remove('matched-wrong', 'selected');
          rightCard.classList.remove('matched-wrong', 'selected');
        }, 1000);
      }
    }
  }

  // Série suivante dans la correspondance
  document.getElementById('btn-matching-next').addEventListener('click', () => {
    const currentIdx = window.db.matchingSeries.findIndex(s => s.id === window.engine.currentSeries.id);
    const nextIdx = (currentIdx + 1) % window.db.matchingSeries.length;
    startMatchingGameUI(window.db.matchingSeries[nextIdx].id);
  });

  // --- LOGIQUE RELAIS APOCALYPSE ---
  function loadRelaisSeriesSelect() {
    const grid = document.getElementById('relais-series-grid');
    grid.innerHTML = '';

    window.db.relaisSeries.forEach((series, idx) => {
      const card = document.createElement('div');
      card.className = 'category-select-card glass';
      card.innerHTML = `
        <span style="font-size: 2rem;">🏃</span>
        <h4 style="margin-top: 10px;">${series.title}</h4>
      `;
      card.addEventListener('click', () => {
        startRelaisGameUI(series.id);
      });
      grid.appendChild(card);
    });
  }

  document.getElementById('btn-relais-select-back').addEventListener('click', () => showScreen('home'));
  document.getElementById('btn-relais-back').addEventListener('click', () => showScreen('relais-select'));

  function startRelaisGameUI(seriesId) {
    const data = window.engine.startRelaisGame(seriesId);
    
    document.getElementById('relais-title').textContent = data.title;
    document.getElementById('relais-score').textContent = '0';
    document.getElementById('btn-relais-next').style.display = 'none';

    const grid = document.getElementById('relais-cards-grid');
    grid.innerHTML = '';

    data.questions.forEach((q, idx) => {
      const card = document.createElement('div');
      card.className = 'relais-card glass';
      card.innerHTML = `
        <div class="relais-member-title">Membre ${idx + 1}</div>
        <div class="relais-q-box" id="relais-q-${idx}">???</div>
        <div class="relais-a-box" id="relais-a-${idx}">${q.answer} <br><small>(${q.reference})</small></div>
        <div class="relais-actions">
          <button class="btn-nav" id="btn-show-q-${idx}">Afficher Question</button>
          <button class="btn-nav" id="btn-show-a-${idx}" style="display:none; color:var(--color-correct); border-color:var(--color-correct);">Valider Réponse</button>
        </div>
      `;
      grid.appendChild(card);

      const btnShowQ = card.querySelector(`#btn-show-q-${idx}`);
      const btnShowA = card.querySelector(`#btn-show-a-${idx}`);
      const qBox = card.querySelector(`#relais-q-${idx}`);
      const aBox = card.querySelector(`#relais-a-${idx}`);

      btnShowQ.addEventListener('click', () => {
        playSound('click');
        qBox.innerHTML = q.question;
        btnShowQ.style.display = 'none';
        btnShowA.style.display = 'block';
      });

      btnShowA.addEventListener('click', () => {
        const score = window.engine.validateRelaisAnswer(idx);
        document.getElementById('relais-score').textContent = score;
        
        aBox.style.display = 'flex';
        btnShowA.style.display = 'none';
        card.style.borderColor = 'var(--color-correct)';
        
        if (score === 4) {
          playSound('victory');
          document.getElementById('btn-relais-next').style.display = 'block';
        }
      });
    });

    showScreen('relais-play');
  }

  document.getElementById('btn-relais-next').addEventListener('click', () => {
    const currentIdx = window.db.relaisSeries.findIndex(s => s.id === window.engine.currentRelais.id);
    const nextIdx = (currentIdx + 1) % window.db.relaisSeries.length;
    startRelaisGameUI(window.db.relaisSeries[nextIdx].id);
  });

  // --- ÉCRAN DE FIN ---
  document.getElementById('btn-results-home').addEventListener('click', () => {
    showScreen('home');
  });

  document.getElementById('btn-results-retry').addEventListener('click', () => {
    if (window.engine.mode === 'solo') {
      openSetup('solo');
    } else if (window.engine.mode === 'presenter') {
      openSetup('presenter');
    } else if (window.engine.mode === 'matching') {
      showScreen('matching-select');
    } else if (window.engine.mode === 'relais') {
      showScreen('relais-select');
    }
  });

});
