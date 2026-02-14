import { Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CrudService } from '../service/crud.service';
import { Coach } from '../Entity/Coach.Entity';

@Component({
  selector: 'app-login-coach',
  templateUrl: './login-coach.component.html',
  styleUrls: ['./login-coach.component.css'],
})
export class LoginCoachComponent {
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
    console.log(data);
    let coach = new Coach(
      null,
      null,
      null,
      data.email,
      data.mp,
      null,
      null,
      null
    );
    console.log(coach);
    if (data.email == 0 || data.mp == 0) {
      this.messageCommande = `<div class="alert alert-danger" role="alert">
        remplir votre champs
      </div>`;
    } else {
      this.service.loginCoach(coach).subscribe(
        (res) => {
          console.log(res);
          this.messageCommande = `<div class="alert alert-success" role="alert">
        avec success
      </div>`;
          let token = res.token;
          localStorage.setItem('myTokenCoach', token);
          this.router.navigate(['']).then(() => {
            window.location.reload();
          });
        },
        (err) => {
          console.log(err);
          this.messageCommande = `<div class="alert alert-danger" role="alert">
            mot de passe ou email incorrect
          </div>`;
        }
      );
    }
  }
}
