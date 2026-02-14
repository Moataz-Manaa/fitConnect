import { Category } from './Category.Entity';
import { SalleDeSport } from './SalleDeSport.Entity';

export class Pack {
  constructor(
    public id?: number,
    public nom?: string,
    public description?: string,
    public prix?: number,
    public category?: Category,
    public salle?: SalleDeSport,
    public image?: string
  ) {}
}
