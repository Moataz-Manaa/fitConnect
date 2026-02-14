import { SalleDeSport } from './SalleDeSport.Entity';

export class CoachSalle {
  constructor(
    public id?: number,
    public nom?: string,
    public prenom?: string,
    public age?: number,
    public activity?: string,
    public image?: string,
    public salle?: SalleDeSport
  ) {}
}
