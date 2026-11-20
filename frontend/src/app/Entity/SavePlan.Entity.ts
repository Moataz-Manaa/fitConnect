export class SavePlan {
  constructor(
    public id?: number,
    public date?: Date | string,
    public debut?: string,
    public fin?: string,
    public description?: string,
    public prix?: number,
    public idCoach?: number,
    public idCategory?: number
  ) {}
}
