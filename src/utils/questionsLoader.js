import allQuestions from '../../data/questions.json';

/**
 * Charge et filtre les questions en mélangeant à la fois les questions ET les propositions de réponses (QCM).
 */
export function getGameQuestions(options = {}) {
  const { category = 'all', count = 10, mode = 'classic' } = options;

  let pool = allQuestions.filter(q => q.options && Array.isArray(q.options) && q.options.length >= 2);

  if (mode === 'apocalypse') {
    pool = pool.filter(q => q.category === 'Apocalypse' || q.category === 'Relais Apocalypse');
  } else if (category !== 'all') {
    pool = pool.filter(q => q.category === category);
  }

  // 1. Mélanger la liste globale des questions
  const shuffledPool = shuffleArray(pool);
  const targetCount = mode === 'apocalypse' ? 7 : count;
  const selectedQuestions = shuffledPool.slice(0, targetCount);

  // 2. Pour CHAQUE question sélectionnée, mélanger les options de réponse (A, B, C, D)
  return selectedQuestions.map(q => shuffleQuestionOptions(q));
}

// Fonction pour mélanger les options d'une question tout en conservant la bonne réponse
function shuffleQuestionOptions(question) {
  if (!question.options || !Array.isArray(question.options)) return question;

  // Trouver le texte de la bonne réponse
  const correctAnswerText = question.answer || 
    (question.answerIndex !== undefined ? question.options[question.answerIndex] : question.options[0]);

  // Mélanger le tableau des options
  const shuffledOptions = shuffleArray(question.options);
  
  // Retrouver le nouvel index de la bonne réponse
  const newAnswerIndex = shuffledOptions.indexOf(correctAnswerText);

  return {
    ...question,
    options: shuffledOptions,
    answerIndex: newAnswerIndex !== -1 ? newAnswerIndex : 0,
    answer: correctAnswerText
  };
}

// Algorithme de mélange Fisher-Yates
function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
