import { Component, OnInit } from '@angular/core';
import { Admin } from '../Entity/Admin.Entity';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-mon-compte',
  templateUrl: './mon-compte.component.html',
  styleUrls: ['./mon-compte.component.css'],
})
export class MonCompteComponent implements OnInit {
  adminForm: FormGroup;
  adminId: number | undefined;

  constructor(private fb: FormBuilder, private crudService: CrudService) {
    this.adminForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mp: [''],
    });
  }

  ngOnInit(): void {
    this.loadAdminDetails();
  }

  loadAdminDetails(): void {
    const tokenData = this.crudService.userDetails();
    if (tokenData && tokenData.id) {
      this.adminId = tokenData.id;
      this.crudService.findAdminById(this.adminId).subscribe({
        next: (admin: Admin) => {
          this.adminForm.patchValue({
            nom: admin.nom,
            prenom: admin.prenom,
            email: admin.email,
            mp: '', // Password is not populated for security; user can enter a new one
          });
        },
        error: (error) => {
          console.error('Error fetching admin details', error);
        },
      });
    }
  }

  updateAdmin(): void {
    if (this.adminForm.valid && this.adminId) {
      const updatedAdmin: Admin = {
        id: this.adminId,
        nom: this.adminForm.value.nom,
        prenom: this.adminForm.value.prenom,
        email: this.adminForm.value.email,
        mp: this.adminForm.value.mp || undefined, // Send new password only if provided
      };
      this.crudService.updateAdmin(this.adminId, updatedAdmin).subscribe({
        next: (response) => {
          console.log('Admin updated successfully', response);
          // Optionally update local storage or notify user
          if (response.token) {
            localStorage.setItem('myToken', response.token); // Update token if returned
          }
        },
        error: (error) => {
          console.error('Error updating admin', error);
        },
      });
    }
  }
}
