import { Pack } from './Pack.Entity';

export interface Abonnement {
  id: number;
  pack?: Pack;
  prix?: number;
  dateActivation?: string;
  etat?: 'actif' | 'inactif' | 'en_attente';
}
