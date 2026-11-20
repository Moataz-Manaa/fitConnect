import { saveSession } from '../service/session';
import { Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Client } from '../Entity/Client.Entity';
import { CrudService } from '../service/crud.service';
import { SalleDeSport } from '../Entity/SalleDeSport.Entity';

@Component({
  selector: 'app-login-salle-de-sport',
  templateUrl: './login-salle-de-sport.component.html',
  styleUrls: ['./login-salle-de-sport.component.css'],
})
export class LoginSalleDeSportComponent {
  messageCommande = '';
  loginForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private service: CrudService,
    private router: Router
  ) {
    let formControls = {
      email: new FormControl('', [Validators.required, Validators.email]),
      mp: new FormControl('', [Validators.required]),
    };

    this.loginForm = this.fb.group(formControls);
  }

  get email() {
    return this.loginForm.get('email');
  }
  get mp() {
    return this.loginForm.get('mp');
  }

  login() {
    let data = this.loginForm.value;

    let salleDeSport = new SalleDeSport(
      null,
      null,
      data.email,
      null,
      data.mp,
      null,
      null
    );

    if (data.email == 0 || data.mp == 0) {
      this.messageCommande = `<div class="alert alert-danger" role="alert">
        remplir votre champs
      </div>`;
    } else {
      this.service.loginSalleDeSport(salleDeSport).subscribe(
        (res) => {

          this.messageCommande = `<div class="alert alert-success" role="alert">
        avec success
      </div>`;
          let token = res.token;
          saveSession('salle', token);
          void this.router.navigate(['/espace-salle']);
        },
        (err) => {

          this.messageCommande = `<div class="alert alert-danger" role="alert">
            mot de passe ou email incorrect
          </div>`;
        }
      );
    }
  }
}
