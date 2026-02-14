export class SavePlan {
  constructor(
    public id?: number,
    public date?: Date,
    public debut?: string,
    public fin?: string,
    public description?: string,
    public prix?: number,
    public idCoach?: number,
    public idCategory?: number
  ) {}
}
