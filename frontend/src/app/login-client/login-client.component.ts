import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from '../service/crud.service'; // Adjust path if needed
import { Client } from '../Entity/Client.Entity';
import { HttpClient } from '@angular/common/http';
import {
  GoogleLoginProvider,
  SocialAuthService,
} from '@abacritt/angularx-social-login';
declare var google: any;

@Component({
  selector: 'app-login-client',
  templateUrl: './login-client.component.html',
  styleUrls: ['./login-client.component.css'],
})
export class LoginClientComponent implements OnInit {
  messageCommande: string = '';
  forgotPasswordMessage: string = '';
  loginForm: FormGroup;
  forgotPasswordForm: FormGroup;
  activeTab: string = 'login';
  passwordVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private service: CrudService,
    private router: Router,
    private http: HttpClient,
    private route: ActivatedRoute,
    private socialAuthService: SocialAuthService
  ) {
    let loginControls = {
      email: new FormControl('', [Validators.required, Validators.email]),
      mp: new FormControl('', [Validators.required]),
    };
    this.loginForm = this.fb.group(loginControls);

    let forgotPasswordControls = {
      email: new FormControl('', [Validators.required, Validators.email]),
    };
    this.forgotPasswordForm = this.fb.group(forgotPasswordControls);
  }

  get loginEmail() {
    return this.loginForm.get('email');
  }
  get mp() {
    return this.loginForm.get('mp');
  }

  get forgotPasswordEmail() {
    return this.forgotPasswordForm.get('email');
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    this.messageCommande = '';
    this.forgotPasswordMessage = '';
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  login() {
    if (this.loginForm.invalid) {
      this.messageCommande = `<div class="alert alert-danger" role="alert">
        Remplir tous les champs correctement
      </div>`;
      return;
    }

    let data = this.loginForm.value;
    let client = new Client(
      null,
      null,
      null,
      null,
      null,
      data.email,
      data.mp,
      null
    );

    this.service.loginClient(client).subscribe({
      next: (res) => {
        this.messageCommande = `<div class="alert alert-success" role="alert">
          Connexion réussie
        </div>`;
        let token = res.token;
        localStorage.setItem('myTokenClient', token);
        this.router.navigate(['/']).then(() => {
          window.location.reload();
        });
      },
      error: (err) => {
        this.messageCommande = `<div class="alert alert-danger" role="alert">
          Mot de passe ou email incorrect
        </div>`;
      },
    });
  }

  forgotPassword() {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordMessage = `<div class="alert alert-danger" role="alert">
        Veuillez entrer un email valide
      </div>`;
      return;
    }

    let email = this.forgotPasswordForm.get('email')?.value;
    this.service.forgotPassword(email).subscribe({
      next: (res) => {
        this.forgotPasswordMessage = `<div class="alert alert-success" role="alert">
          Un lien de réinitialisation a été envoyé à votre email
        </div>`;
        this.forgotPasswordForm.reset();
      },
      error: (err) => {
        this.forgotPasswordMessage = `<div class="alert alert-danger" role="alert">
          ${err.error || "Erreur lors de l'envoi du lien de réinitialisation"}
        </div>`;
      },
    });
  }

  signInWithGoogle() {
    this.socialAuthService
      .signIn(GoogleLoginProvider.PROVIDER_ID)
      .then((user) => {
        const idToken = user.idToken;
        this.http
          .post('http://localhost:8080/api/auth/google', { idToken })
          .subscribe({
            next: (res: any) => {
              localStorage.setItem('token', res.token);
              console.log('Login successful');
            },
            error: (err) => {
              console.error('Login failed', err);
            },
          });
      });
  }

  ngOnInit(): void {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      google.accounts.id.initialize({
        client_id:
          '46828070655-9cof32efubaq0sj90u5ntlqcj7eafc7q.apps.googleusercontent.com',
        callback: this.handleCredentialResponse.bind(this),
      });

      google.accounts.id.renderButton(document.getElementById('g_id_signin'), {
        theme: 'outline',
        size: 'medium',
        shape: 'pill',
        text: 'continue_with',
      });

      google.accounts.id.prompt();
    };
  }

  handleCredentialResponse(response: any): void {
    const idToken = response.credential;
    console.log('ID Token:', idToken);

    this.service.signInWithGoogle(idToken).subscribe(
      (res) => {
        console.log('Connexion réussie via Google!', res);
        localStorage.setItem('myTokenClient', res.token);
        this.router.navigate(['']).then(() => window.location.reload());
      },
      (err) => {
        console.error('Erreur de connexion Google:', err);
        this.messageCommande = `
          <div class="alert alert-danger" role="alert">
            Erreur lors de la connexion avec Google.
          </div>`;
      }
    );
  }
}
