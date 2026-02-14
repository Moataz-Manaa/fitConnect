import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from '../service/crud.service';
import { Client } from '../Entity/Client.Entity';
import { Coach } from '../Entity/Coach.Entity';
import { SalleDeSport } from '../Entity/SalleDeSport.Entity';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
})
export class EditProfileComponent implements OnInit {
  profileForm: FormGroup;
  userType: string | null = null;
  userId: number | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private service: CrudService) {
    this.profileForm = this.fb.group({
      // Common fields for all user types
      currentPassword: [''],
      mp: [''],
      email: ['', [Validators.email]],
      telephone: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.userType = this.service.getUserType();
    this.userId = this.service.getUserId();

    if (!this.userType || !this.userId) {
      this.errorMessage = 'User information not found. Please log in again.';
      return;
    }

    // Initialize form based on user type
    this.initializeForm();

    // Load user data
    this.loadUserData();
  }

  initializeForm(): void {
    // Create base form with common fields
    this.profileForm = this.fb.group({
      // Common fields for all user types
      currentPassword: [''],
      mp: [''],
      email: ['', [Validators.email]],
      telephone: ['', [Validators.required]],
    });

    // Add specific fields based on user type
    if (this.userType === 'client') {
      this.profileForm.addControl(
        'nom',
        this.fb.control('', [Validators.required])
      );
      this.profileForm.addControl(
        'prenom',
        this.fb.control('', [Validators.required])
      );
      this.profileForm.addControl(
        'age',
        this.fb.control('', [Validators.required])
      );
    } else if (this.userType === 'coach') {
      this.profileForm.addControl(
        'nom',
        this.fb.control('', [Validators.required])
      );
      this.profileForm.addControl(
        'prenom',
        this.fb.control('', [Validators.required])
      );
    } else if (this.userType === 'salle') {
      this.profileForm.addControl(
        'nom',
        this.fb.control('', [Validators.required])
      );
      this.profileForm.addControl(
        'adresse',
        this.fb.control('', [Validators.required])
      );
    }
  }

  loadUserData(): void {
    this.service.getUserDetails().subscribe({
      next: (userData) => {
        // For clients
        if (this.userType === 'client') {
          this.profileForm.patchValue({
            nom: userData.nom,
            prenom: userData.prenom,
            age: userData.age,
            telephone: userData.telephone,
            email: userData.email,
          });
        }
        // For coaches
        else if (this.userType === 'coach') {
          this.profileForm.patchValue({
            nom: userData.nom,
            prenom: userData.prenom,
            telephone: userData.telephone,
            email: userData.email,
          });
        }
        // For salles (gyms)
        else if (this.userType === 'salle') {
          this.profileForm.patchValue({
            nom: userData.nom,
            adresse: userData.adresse,
            telephone: userData.telephone,
            email: userData.email,
          });
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load user data: ' + error.message;
      },
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    // Clear previous messages
    this.successMessage = null;
    this.errorMessage = null;

    const formData = this.profileForm.value;
    const currentPassword = formData.currentPassword;

    // Remove current password from data to be sent
    delete formData.currentPassword;

    // Only include password if a new one was provided
    if (!formData.mp) {
      delete formData.mp;
    }

    if (!this.userId) {
      this.errorMessage = 'User ID not found';
      return;
    }

    // Update profile based on user type
    if (this.userType === 'client') {
      this.service
        .updateClient(this.userId, formData, currentPassword)
        .subscribe({
          next: () => {
            this.successMessage = 'Profile updated successfully!';
            // Reset the password fields
            this.profileForm.get('currentPassword')?.reset();
            this.profileForm.get('mp')?.reset();
          },
          error: (error) => {
            if (
              error.error &&
              error.error.message === 'Current password is incorrect'
            ) {
              this.errorMessage = 'Current password is incorrect';
            } else {
              this.errorMessage = 'Failed to update profile: ' + error.message;
            }
          },
        });
    } else if (this.userType === 'coach') {
      this.service
        .updateCoach(this.userId, formData, currentPassword)
        .subscribe({
          next: () => {
            this.successMessage = 'Profile updated successfully!';
            // Reset the password fields
            this.profileForm.get('currentPassword')?.reset();
            this.profileForm.get('mp')?.reset();
          },
          error: (error) => {
            if (
              error.error &&
              error.error.message === 'Current password is incorrect'
            ) {
              this.errorMessage = 'Current password is incorrect';
            } else {
              this.errorMessage = 'Failed to update profile: ' + error.message;
            }
          },
        });
    } else if (this.userType === 'salle') {
      this.service
        .updateSalle(this.userId, formData, currentPassword)
        .subscribe({
          next: () => {
            this.successMessage = 'Profile updated successfully!';
            // Reset the password fields
            this.profileForm.get('currentPassword')?.reset();
            this.profileForm.get('mp')?.reset();
          },
          error: (error) => {
            if (
              error.error &&
              error.error.message === 'Current password is incorrect'
            ) {
              this.errorMessage = 'Current password is incorrect';
            } else {
              this.errorMessage = 'Failed to update profile: ' + error.message;
            }
          },
        });
    }
  }
}
