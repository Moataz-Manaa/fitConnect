import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-workspace-image',
  imports: [CommonModule],
  template: `
    <div class="fc-list">
      <label class="fc-field">{{ required ? 'Image' : 'Remplacer l’image (facultatif)' }}
        <input type="file" accept="image/*" [disabled]="disabled" (change)="select($event)" />
      </label>
      <p *ngIf="error" class="fc-field-error" role="alert">{{ error }}</p>
      <p *ngIf="reading" class="fc-muted" role="status">Lecture de l’image…</p>
      <img *ngIf="image" class="fc-workspace-preview" [src]="image" alt="Aperçu de l’image" />
    </div>
  `,
})
export class WorkspaceImageComponent implements OnDestroy {
  @Input() image = '';
  @Input() required = false;
  @Input() disabled = false;
  @Output() imageChange = new EventEmitter<string>();
  @Output() readingChange = new EventEmitter<boolean>();

  private reader?: FileReader;
  reading = false;
  error = '';

  select(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.reader?.abort();
    this.error = '';
    if (!file.type.startsWith('image/')) {
      this.error = 'Sélectionnez un fichier image.';
      this.setReading(false);
      input.value = '';
      return;
    }
    const reader = new FileReader();
    this.reader = reader;
    this.setReading(true);
    reader.onload = () => {
      this.imageChange.emit(String(reader.result));
      this.setReading(false);
    };
    reader.onerror = () => {
      this.error = 'Impossible de lire cette image.';
      this.setReading(false);
      input.value = '';
    };
    reader.readAsDataURL(file);
  }

  ngOnDestroy(): void { this.reader?.abort(); }

  private setReading(reading: boolean): void {
    this.reading = reading;
    this.readingChange.emit(reading);
  }
}
