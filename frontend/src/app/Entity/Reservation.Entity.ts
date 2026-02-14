import { Client } from './Client.Entity';
import { Plan } from './Plan.Entity';

export class Reservation {
  constructor(public id?: number, public client?: Client, public plan?: Plan) {}
}
