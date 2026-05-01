export interface WisdomCard {
  id: string;
  arabic: string;
  source: string;
  french: string;
  philosophy: string;
  philosophyAuthor: string;
  theme: Theme;
  sourceType: SourceType;
  backgroundImage: string;
  premium: boolean;
}

export type Theme =
  | 'Patience'
  | 'Amour'
  | 'Sagesse'
  | 'Gratitude'
  | 'Dieu'
  | 'Espoir'
  | 'Force'
  | 'Foi'
  | 'Paix'
  | 'Beauté'
  | 'Générosité'
  | 'Humilité'
  | 'Justice'
  | 'Pardon'
  | 'Acceptation';

export type SourceType =
  | 'Coran'
  | 'Hadith'
  | 'Rumi'
  | 'Marc Aurèle'
  | 'Épictète'
  | 'Ibn Arabi'
  | 'Avicenne'
  | 'Al-Ghazali'
  | 'Hafez'
  | 'Omar Khayyam'
  | 'Sénèque'
  | 'Upanishads'
  | 'Bhagavad Gita'
  | 'Bouddha'
  | 'Confucius'
  | 'Lao Tzu';
