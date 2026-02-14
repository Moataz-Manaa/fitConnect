import { Category } from './Category.Entity';
import { SalleDeSport } from './SalleDeSport.Entity';

export class Pack {
  constructor(
    public id?: number,
    public nom?: string,
    public prix?: number,
    public description?: string,
    public category?: Category, // Nested Category object
    public salle?: SalleDeSport
  ) {}
}
