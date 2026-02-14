import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
  newPassword: string = '';
  token: string = '';
  message: string = '';
  errorMessage: string = '';

  constructor(
    private crudService: CrudService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.errorMessage = 'Invalid or missing reset token';
    }
  }

  onResetPassword() {
    if (!this.newPassword || !this.token) {
      this.errorMessage =
        'Please enter a new password and ensure the token is valid';
      return;
    }

    this.crudService.resetPassword(this.token, this.newPassword).subscribe({
      next: (response: string) => {
        this.message = response; // e.g., "Le mot de passe a été réinitialisé avec succès"
        this.errorMessage = '';
        this.newPassword = ''; // Clear the input field
        setTimeout(() => this.router.navigate(['/loginClient']), 2000); // Redirect after 2 seconds
      },
      error: (error) => {
        this.errorMessage = error.error || 'Failed to reset password';
        this.message = '';
      },
    });
  }
}
