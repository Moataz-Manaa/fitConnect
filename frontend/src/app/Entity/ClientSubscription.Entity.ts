export class ClientSubscription {
  clientId: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  age: number;
  packNom: string;
  dateCreation: Date;
  dateActivation: Date;
  etat: string; // "actif", "inactif", "en_attente"
}
