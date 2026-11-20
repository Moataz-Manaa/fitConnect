import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-page-state',
  template: `
    <div class="fc-state" [class.fc-state-error]="kind === 'error'">
      <p [attr.role]="kind === 'error' ? 'alert' : 'status'">
        <span *ngIf="kind === 'loading'" class="fc-spinner" aria-hidden="true"></span>
        {{ message }}
      </p>
      <button *ngIf="retryable" type="button" class="fc-button fc-button-outline" (click)="retry.emit()">Réessayer</button>
    </div>
  `,
})
export class PageStateComponent {
  @Input() kind: 'loading' | 'error' | 'empty' = 'empty';
  @Input() message = '';
  @Input() retryable = false;
  @Output() retry = new EventEmitter<void>();
}
