export class Client {
  subscribe(arg0: string, arg1: (message: any) => void) {
    throw new Error('Method not implemented.');
  }
  activate() {
    throw new Error('Method not implemented.');
  }
  constructor(
    public id?: number,
    public nom?: string,
    public prenom?: string,
    public email?: string,
    public mp?: string,
    public telephone?: string,
    public age?: number,
    public etat?: boolean
  ) {}
}
