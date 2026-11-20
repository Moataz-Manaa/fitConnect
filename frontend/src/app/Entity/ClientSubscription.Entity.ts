export interface ClientSubscription {
  clientId: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  age: number;
  packNom: string;
  dateCreation: string | null;
  dateActivation: string | null;
  etat: 'actif' | 'inactif' | 'en_attente';
}
