import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-shell',
  template: `
    <app-header></app-header>
    <div class="adm-shell">
      <app-menu></app-menu>
      <main class="adm-content" id="admin-main" tabindex="-1">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class AdminShellComponent {}
