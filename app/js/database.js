/**
 * Crack Béréen - Database Manager
 * Gère le chargement, le filtrage et l'accès aux questions et correspondances.
 */

class DatabaseManager {
  constructor() {
    this.questions = [];
    this.matchingSeries = [];
    this.relaisSeries = [];
    this.isLoaded = false;
  }

  /**
   * Charge la base de données de questions depuis le fichier JSON.
   */
  async loadDatabase() {
    try {
      const response = await fetch('./data/questions.json');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du fichier JSON');
      }
      const data = await response.json();
      
      // Séparer les questions classiques, les séries de correspondance et les relais
      this.questions = data.filter(item => item.category !== 'Correspondance' && item.category !== 'Relais Apocalypse');
      this.matchingSeries = data.filter(item => item.category === 'Correspondance');
      this.relaisSeries = data.filter(item => item.category === 'Relais Apocalypse');
      this.isLoaded = true;
      console.log(`Base de données chargée : ${this.questions.length} questions, ${this.matchingSeries.length} séries de correspondance, ${this.relaisSeries.length} relais.`);
      return true;
    } catch (error) {
      console.error('Impossible de charger questions.json, chargement du fallback...', error);
      this.loadFallbackDatabase();
      return false;
    }
  }

  /**
   * Retourne une sélection de questions filtrées et mélangées.
   */
  getQuestions(options = {}) {
    const {
      categories = ['Culture Générale', 'Littérature', 'Musique', 'Apocalypse'],
      difficulties = ['facile', 'moyen', 'difficile'],
      count = 10,
      randomize = true
    } = options;

    // Filtrer par catégorie et difficulté
    let filtered = this.questions.filter(q => {
      // Normalisation des catégories
      const qCat = q.category.toLowerCase();
      const hasCategory = categories.some(cat => {
        if (cat === 'Culture Générale') return qCat.includes('culture') || qCat.includes('générale');
        if (cat === 'Littérature') return qCat.includes('littérature') || qCat.includes('livre');
        if (cat === 'Musique') return qCat.includes('musique') || qCat.includes('cantique');
        if (cat === 'Apocalypse') return qCat.includes('apocalypse') || q.subcategory === 'Apocalypse';
        return qCat.includes(cat.toLowerCase());
      });

      const hasDifficulty = difficulties.includes(q.difficulty.toLowerCase());
      
      return hasCategory && hasDifficulty;
    });

    // Mélanger si demandé
    if (randomize) {
      filtered = this.shuffleArray(filtered);
    }

    // Limiter le nombre de questions
    return filtered.slice(0, count);
  }

  /**
   * Retourne une série de correspondance par son ID ou index.
   */
  getMatchingSeriesById(id) {
    return this.matchingSeries.find(s => s.id === id) || this.matchingSeries[0];
  }

  /**
   * Retourne une série de relais par son ID ou le premier par défaut.
   */
  getRelaisSeriesById(id) {
    return this.relaisSeries.find(s => s.id === id) || this.relaisSeries[0];
  }

  /**
   * Mélange un tableau (Algorithme Fisher-Yates).
   */
  shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Base de données de secours (fallback) au cas où le fichier JSON serait inaccessible.
   */
  loadFallbackDatabase() {
    this.questions = [
      {
        "id": 1,
        "category": "Culture Générale",
        "subcategory": "Biblique",
        "difficulty": "facile",
        "type": "qcm",
        "question": "Combien de livres contient la Bible dans son ensemble ?",
        "options": [
          "66 livres (39 AT + 27 NT)",
          "73 livres (46 AT + 27 NT)",
          "50 livres (25 AT + 25 NT)",
          "120 livres (60 AT + 60 NT)"
        ],
        "answer": "66 livres (39 AT + 27 NT)",
        "explanation": "Le canon biblique protestant standard contient 66 livres divisés en 39 livres dans l'Ancien Testament et 27 livres dans le Nouveau Testament.",
        "reference": "Canon biblique"
      },
      {
        "id": 2,
        "category": "Culture Générale",
        "subcategory": "Biblique",
        "difficulty": "facile",
        "type": "qcm",
        "question": "Quel est le premier livre de la Bible ?",
        "options": [
          "La Genèse",
          "L'Exode",
          "Les Psaumes",
          "L'Apocalypse"
        ],
        "answer": "La Genèse",
        "explanation": "Le livre de la Genèse (du grec Génesis signifiant 'Origine' / 'Naissance') est le premier livre de l'Ancien Testament et du Pentateuque.",
        "reference": "Gn 1:1"
      },
      {
        "id": 3,
        "category": "Apocalypse",
        "subcategory": "Apocalypse",
        "difficulty": "facile",
        "type": "qcm",
        "question": "Dans quelle île l'apôtre Jean a-t-il reçu ses visions de l'Apocalypse ?",
        "options": [
          "Patmos",
          "Chypre",
          "Crète",
          "Malte"
        ],
        "answer": "Patmos",
        "explanation": "Jean a été exilé sur l'île grecque de Patmos en raison de sa prédication de la parole de Dieu, où il a écrit le livre de l'Apocalypse.",
        "reference": "Ap 1:9"
      },
      {
        "id": 4,
        "category": "Littérature",
        "subcategory": "Auteur -> Œuvre",
        "difficulty": "moyen",
        "type": "qcm",
        "question": "Quel célèbre livre John Bunyan a-t-il écrit en prison, considéré comme un chef-d'œuvre de la littérature chrétienne ?",
        "options": [
          "Le Voyage du Pèlerin",
          "Le Prix de la Grâce",
          "Les Confessions",
          "L'Imitation de Jésus-Christ"
        ],
        "answer": "Le Voyage du Pèlerin",
        "explanation": "Le Voyage du Pèlerin (The Pilgrim's Progress) est un roman allégorique de John Bunyan publié en 1678, rédigé en grande partie dans la prison de Bedford.",
        "reference": "John Bunyan, 1678"
      },
      {
        "id": 5,
        "category": "Musique",
        "subcategory": "Histoire",
        "difficulty": "moyen",
        "type": "qcm",
        "question": "Quel célèbre cantique de Noël est né en Autriche en 1818, composé par Franz Xaver Gruber ?",
        "options": [
          "Douce nuit, sainte nuit (Silent Night)",
          "Minuit, chrétiens (O Holy Night)",
          "Il est né le divin Enfant",
          "Grand Dieu nous te bénissons"
        ],
        "answer": "Douce nuit, sainte nuit (Silent Night)",
        "explanation": "Le chant 'Stille Nacht, heilige Nacht' a été interprété pour la première fois le 24 décembre 1818 dans l'église Saint-Nicolas d'Oberndorf bei Salzburg.",
        "reference": "Franz Gruber & Joseph Mohr"
      }
    ];

    this.matchingSeries = [
      {
        "id": "match_01",
        "category": "Correspondance",
        "title": "Série 01 : Les 7 Églises de l'Apocalypse & Messages",
        "pairs": [
          {"left": "Éphèse", "right": "A perdu son premier amour", "ref": "Ap 2:4"},
          {"left": "Smyrne", "right": "Sois fidèle jusqu'à la mort", "ref": "Ap 2:10"},
          {"left": "Pergame", "right": "Le trône de Satan y est établi", "ref": "Ap 2:13"},
          {"left": "Thyatire", "right": "Tolère la prophétesse Jézabel", "ref": "Ap 2:20"},
          {"left": "Sardes", "right": "A le nom de vivre, mais est morte", "ref": "Ap 3:1"},
          {"left": "Philadelphie", "right": "Une porte ouverte est devant elle", "ref": "Ap 3:8"},
          {"left": "Laodicée", "right": "Est tiède, ni froide ni bouillante", "ref": "Ap 3:16"}
        ]
      }
    ];

    this.isLoaded = true;
  }
}

// Instance globale accessible par les autres fichiers
window.db = new DatabaseManager();
