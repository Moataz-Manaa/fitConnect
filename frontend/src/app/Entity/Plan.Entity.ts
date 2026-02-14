import { Category } from './Category.Entity';
import { Client } from './Client.Entity';
import { Coach } from './Coach.Entity';

export class Plan {
  constructor(
    public id?: number,
    public date?: Date,
    public debut?: string,
    public fin?: string,
    public description?: string,
    public prix?: number,
    public coach?: Coach,
    public category?: Category
  ) {}
}
