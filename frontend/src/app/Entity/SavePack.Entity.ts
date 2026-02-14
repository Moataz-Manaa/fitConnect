export class SavePack {
  constructor(
    public id?: number,
    public nom?: string,
    public description?: string,
    public prix?: number,
    public idCategory?: number,
    public idSalle?: number,
    public image?: string
  ) {}
}
