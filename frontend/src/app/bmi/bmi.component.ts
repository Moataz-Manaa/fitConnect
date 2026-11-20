import { Component } from '@angular/core';

export function calculateBmi(weight: number | null, height: number | null): number | null {
  if (weight == null || height == null || weight <= 0 || height <= 0) return null;
  const result = weight / (height / 100) ** 2;
  return Number.isFinite(result) && result > 0 ? result : null;
}

@Component({ selector: 'app-bmi', templateUrl: './bmi.component.html' })
export class BmiComponent {
  weight: number | null = null;
  height: number | null = null;
  result: number | null = null;
  submitted = false;

  calculate(): void {
    this.result = calculateBmi(this.weight, this.height);
    this.submitted = true;
  }
}
