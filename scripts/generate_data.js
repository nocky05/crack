/**
 * generate_data.js
 * 
 * Script de fusion qui compile toutes les questions QCM (4 catégories) 
 * et les séries de correspondance en un seul fichier data/questions.json.
 * 
 * Usage : node scripts/generate_data.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAW_DIR = path.join(__dirname, '..', 'data', 'raw');
const SCRATCH_DIR = path.join(__dirname, '..', 'scratch');
const OUTPUT = path.join(__dirname, '..', 'data', 'questions.json');

// --- 1. Charger toutes les questions QCM ---
const qcmFiles = ['culture_generale', 'litterature', 'musique', 'apocalypse', 'apocalypse_50_niveaux'];
let allQuestions = [];

qcmFiles.forEach(name => {
  const filePath = path.join(RAW_DIR, name + '.json');
  if (!fs.existsSync(filePath)) {
    console.error(`ERREUR : Fichier introuvable → ${filePath}`);
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`✅ ${name}.json → ${data.length} questions chargées`);
  allQuestions = allQuestions.concat(data);
});

console.log(`\n📊 Total QCM : ${allQuestions.length}`);

// --- 2. Charger et nettoyer les séries de correspondance ---
const matchingPath = path.join(SCRATCH_DIR, 'matching.json');
let matchingSeries = [];

if (fs.existsSync(matchingPath)) {
  const rawMatching = JSON.parse(fs.readFileSync(matchingPath, 'utf8'));
  console.log(`\n🔗 Fichier matching.json trouvé : ${rawMatching.length} séries brutes`);

  // Nettoyer les séries : limiter à 10 paires max, supprimer les paires corrompues
  rawMatching.forEach((series, idx) => {
    const cleanPairs = [];
    const seenLeft = new Set();

    series.pairs.forEach(pair => {
      // Filtrer les paires manifestement corrompues par l'OCR
      if (!pair.left || !pair.right) return;
      if (pair.left.includes('séries') && pair.left.includes('associations')) return;
      if (pair.left.includes('PERSONNAGE') || pair.left.includes('ORDRE')) return;
      if (pair.left.includes('Rois 6') || pair.left.includes('Rois 2:11')) return;
      if (pair.left.includes('Psaumes (majorité)') && pair.ref === 'PERSONNE') return;
      if (pair.left.includes('Tim 3') && pair.ref === 'FEMME') return;
      
      // Éviter les doublons de paires
      const key = pair.left + '|||' + pair.right;
      if (seenLeft.has(key)) return;
      seenLeft.add(key);

      cleanPairs.push(pair);
    });

    // Limiter à 10 paires pour garder l'interface cohérente
    const finalPairs = cleanPairs.slice(0, 10);

    if (finalPairs.length >= 5) { // Minimum 5 paires pour être jouable
      matchingSeries.push({
        id: `match_${String(matchingSeries.length + 1).padStart(2, '0')}`,
        category: 'Correspondance',
        title: series.title,
        pairs: finalPairs
      });
      console.log(`  ✅ ${series.title} → ${finalPairs.length} paires valides`);
    } else {
      console.log(`  ⚠️ ${series.title} → ${finalPairs.length} paires — ignorée (trop peu de paires)`);
    }
  });
} else {
  console.warn('⚠️ matching.json non trouvé, intégration des correspondances manquantes');
}

// --- 3. Ajouter les 2 séries manquantes (Série 05 et Série 10) avec données fiables ---
// Ces séries étaient absentes de l'OCR ou mal parsées

const serie05 = {
  id: `match_${String(matchingSeries.length + 1).padStart(2, '0')}`,
  category: 'Correspondance',
  title: 'SÉRIE 05 Livres de la Bible → leur auteur traditionnel',
  pairs: [
    { left: 'Psaumes (majorité)', right: 'David', ref: 'Ps' },
    { left: 'Proverbes', right: 'Salomon', ref: 'Pr 1:1' },
    { left: 'Apocalypse', right: 'Jean', ref: 'Ap 1:1' },
    { left: 'Actes des Apôtres', right: 'Luc', ref: 'Ac 1:1' },
    { left: 'Hébreux', right: 'Inconnu (attribué à Paul)', ref: 'Hé' },
    { left: 'Genèse à Deutéronome', right: 'Moïse', ref: 'Gn–Dt' },
    { left: 'Romains', right: 'Paul', ref: 'Rm 1:1' },
    { left: 'Ecclésiaste', right: 'Salomon (Qohéleth)', ref: 'Ec 1:1' },
    { left: 'Job', right: 'Inconnu (tradition Moïse)', ref: 'Jb' },
    { left: "L'Évangile de Luc", right: 'Luc (même auteur que les Actes)', ref: 'Lc 1:1-4' }
  ]
};

const serie10 = {
  id: `match_${String(matchingSeries.length + 2).padStart(2, '0')}`,
  category: 'Correspondance',
  title: 'SÉRIE 10 Épîtres de Paul → leur thème principal',
  pairs: [
    { left: 'Romains', right: 'Salut par la foi seule — exposé le plus complet', ref: 'Rm' },
    { left: '1 Corinthiens', right: "Désordres à l'église / résurrection / charité", ref: '1 Co' },
    { left: 'Galates', right: 'Liberté chrétienne contre le légalisme', ref: 'Ga' },
    { left: 'Éphésiens', right: "L'Église corps du Christ / armes de Dieu", ref: 'Ép' },
    { left: 'Philippiens', right: 'Épître de la joie — "Réjouissez-vous toujours"', ref: 'Ph' },
    { left: 'Colossiens', right: 'Prééminence de Christ sur toutes choses', ref: 'Col' },
    { left: '1 Thessaloniciens', right: 'Le retour du Seigneur / encouragement', ref: '1 Th' },
    { left: '1 Timothée', right: 'Instructions pour un jeune pasteur', ref: '1 Tm' },
    { left: 'Tite', right: "Organisation de l'église en Crète", ref: 'Tt' },
    { left: 'Philémon', right: 'Intercession pour un esclave fugitif (Onésime)', ref: 'Phm' }
  ]
};

// Remplacer les séries 04 et 08 corrompues (qui contenaient des données de séries 05 et 10)
// La série 04 originale est censée être "Apôtres et disciples → leur particularité"
const serie04_corrected = {
  id: 'match_04',
  category: 'Correspondance',
  title: 'SÉRIE 04 Apôtres et disciples → leur particularité / surnom / acte',
  pairs: [
    { left: 'Pierre', right: 'Le Roc / a marché sur l\'eau', ref: 'Mt 16:18' },
    { left: 'Jean', right: "Le disciple que Jésus aimait", ref: 'Jn 21:20' },
    { left: 'Paul', right: 'Apôtre des païens / converti sur le chemin de Damas', ref: 'Ac 9' },
    { left: 'Thomas', right: 'Appelé Didyme / a douté de la résurrection', ref: 'Jn 20:25' },
    { left: 'Judas Iscariote', right: 'A trahi Jésus pour 30 pièces d\'argent', ref: 'Mt 26:15' },
    { left: 'Matthieu', right: 'Ancien publicain (collecteur d\'impôts)', ref: 'Mt 9:9' },
    { left: 'André', right: 'Frère de Pierre / premier appelé', ref: 'Jn 1:40' },
    { left: 'Jacques (fils de Zébédée)', right: 'Premier apôtre martyr', ref: 'Ac 12:2' },
    { left: 'Barnabas', right: 'Fils d\'encouragement / compagnon de Paul', ref: 'Ac 4:36' },
    { left: 'Étienne', right: 'Premier martyr chrétien', ref: 'Ac 7:59' }
  ]
};

// Série 09 corrigée
const serie09_corrected = {
  id: 'match_09',
  category: 'Correspondance',
  title: 'SÉRIE 09 Femmes de la Bible → leur rôle / identité',
  pairs: [
    { left: 'Marie (mère de Jésus)', right: 'Vierge choisie pour porter le Messie', ref: 'Lc 1:26-38' },
    { left: 'Ève', right: 'Première femme créée / mère de tous les vivants', ref: 'Gn 3:20' },
    { left: 'Sara', right: 'Épouse d\'Abraham / mère d\'Isaac à 90 ans', ref: 'Gn 21:2' },
    { left: 'Ruth', right: 'Moabite fidèle / ancêtre du roi David', ref: 'Rt 4:17' },
    { left: 'Esther', right: 'Reine qui a sauvé son peuple de l\'extermination', ref: 'Est 4:14' },
    { left: 'Déborah', right: 'Juge et prophétesse d\'Israël', ref: 'Jg 4:4' },
    { left: 'Rahab', right: 'Prostituée de Jéricho qui a caché les espions', ref: 'Jos 2:1' },
    { left: 'Marie-Madeleine', right: 'Première témoin de la résurrection', ref: 'Jn 20:18' },
    { left: 'Marthe', right: 'Sœur de Lazare / active dans le service', ref: 'Lc 10:40' },
    { left: 'Jézabel', right: 'Reine idolâtre / ennemie d\'Élie', ref: '1 R 16:31' }
  ]
};

// Reconstruire la liste finale de correspondances en utilisant les données corrigées
const finalMatchingSeries = [];

// Séries 01, 02, 03 sont correctes dans l'OCR
matchingSeries.forEach(s => {
  if (['match_01', 'match_02', 'match_03'].includes(s.id)) {
    finalMatchingSeries.push(s);
  }
});

// Ajouter la série 04 corrigée
finalMatchingSeries.push(serie04_corrected);

// Ajouter la série 05 (Livres → Auteurs)
finalMatchingSeries.push(serie05);

// Série 06 (Prophètes) — correspond à match_05 dans l'OCR (qui est titré "SÉRIE 06")
const serie06_ocr = matchingSeries.find(s => s.title.includes('SÉRIE 06') || s.title.includes('Prophètes'));
if (serie06_ocr) {
  serie06_ocr.id = 'match_06';
  finalMatchingSeries.push(serie06_ocr);
}

// Série 07 (Miracles) — correspond à match_06 dans l'OCR
const serie07_ocr = matchingSeries.find(s => s.title.includes('SÉRIE 07') || s.title.includes('Miracles'));
if (serie07_ocr) {
  serie07_ocr.id = 'match_07';
  finalMatchingSeries.push(serie07_ocr);
}

// Série 08 (Visions Apocalypse) — correspond à match_07 dans l'OCR
const serie08_ocr = matchingSeries.find(s => s.title.includes('SÉRIE 08') || s.title.includes('Visions'));
if (serie08_ocr) {
  serie08_ocr.id = 'match_08';
  finalMatchingSeries.push(serie08_ocr);
}

// Ajouter la série 09 corrigée (Femmes)
finalMatchingSeries.push(serie09_corrected);

// Ajouter la série 10 (Épîtres)
finalMatchingSeries.push(serie10);

// Renuméroter les IDs proprement
finalMatchingSeries.forEach((s, i) => {
  s.id = `match_${String(i + 1).padStart(2, '0')}`;
});

console.log(`\n🔗 Total séries de correspondance finales : ${finalMatchingSeries.length}`);
finalMatchingSeries.forEach((s, i) => {
  console.log(`  ${s.id} → "${s.title}" (${s.pairs.length} paires)`);
});

// --- 4. Charger les relais ---
let allRelais = [];
const relaisPath = path.join(RAW_DIR, 'relais_apocalypse.json');
if (fs.existsSync(relaisPath)) {
  const relaisData = JSON.parse(fs.readFileSync(relaisPath, 'utf8'));
  // S'assurer que la catégorie est bien définie
  relaisData.forEach(r => r.category = 'Relais Apocalypse');
  allRelais = relaisData;
  console.log(`\n🏃 Fichier relais_apocalypse.json trouvé : ${allRelais.length} relais chargés`);
}

// --- 5. Fusion finale ---
const finalData = [...allQuestions, ...finalMatchingSeries, ...allRelais];

console.log(`\n📦 Total éléments dans questions.json : ${finalData.length}`);
console.log(`   └─ ${allQuestions.length} QCM + ${finalMatchingSeries.length} séries de correspondance + ${allRelais.length} relais`);

// --- 6. Écrire le fichier ---
// S'assurer que le dossier data existe
const dataDir = path.dirname(OUTPUT);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(OUTPUT, JSON.stringify(finalData, null, 2), 'utf8');
console.log(`\n✅ Fichier généré : ${OUTPUT}`);
console.log(`   Taille : ${(fs.statSync(OUTPUT).size / 1024).toFixed(1)} Ko`);
