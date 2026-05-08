export type ExerciceType =
  | 'qcm'
  | 'texte_a_trous'
  | 'question_ouverte'
  | 'calcul'
  | 'vrai_faux'
  | 'association'
  | 'legende'
  | 'conjugaison';

export interface Exercice {
  numero: number;
  type: ExerciceType;
  consigne: string;
  enonce: string;
  points?: number;
  options?: string[];       // pour qcm : liste des choix
  blancs?: string[];        // pour texte_a_trous : mots attendus dans les blancs
  reponse_correcte: string | string[];
  explication_corrige?: string;
}

export interface Evaluation {
  matiere: string;
  titre: string;
  consignes_generales?: string;
  duree_estimee?: string;
  total_points?: number;
  exercices: Exercice[];
}

export interface UploadedFile {
  id: string;
  name: string;
  mimeType: string;
  data: string;         // base64 sans préfixe data:...;base64,
  previewUrl?: string;  // URL blob pour les images
  isImage: boolean;
}
