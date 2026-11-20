import { Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { SalleDeSport } from '../Entity/SalleDeSport.Entity';
import { CrudService } from '../service/crud.service';
import { Coach } from '../Entity/Coach.Entity';

@Component({
  selector: 'app-register-coach',
  templateUrl: './register-coach.component.html',
  styleUrls: ['./register-coach.component.css'],
})
export class RegisterCoachComponent {
  messageCommande = '';
  coachForm: FormGroup;
  userFile: any;
  public imagePath: any;
  emailURL: any;
  newProduit = new Coach();
  public message!: string;
  imgURL: any;

  constructor(
    private services: CrudService,
    private router: Router,
    private fb: FormBuilder
  ) {
    let formControls = {
      nom: new FormControl('', [Validators.required]),
      prenom: new FormControl('', [Validators.required]),
      telephone: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      mp: new FormControl('', [Validators.required]),
      image: new FormControl('', [Validators.required]),
    };
    this.coachForm = this.fb.group(formControls);
  }

  get nom() {
    return this.coachForm.get('nom');
  }
  get prenom() {
    return this.coachForm.get('prenom');
  }
  get telephone() {
    return this.coachForm.get('telephone');
  }
  get email() {
    return this.coachForm.get('email');
  }
  get mp() {
    return this.coachForm.get('mp');
  }

  addNewCoach() {
    let data = this.coachForm.value;
    let coach = new Coach(
      undefined,
      data.nom,
      data.prenom,
      data.email,
      data.mp,
      data.telephone,
      data.image,
      undefined
    );

    if (
      data.nom == 0 ||
      data.prenom == 0 ||
      data.telephone == 0 ||
      data.email == 0 ||
      data.mp == 0 ||
      data.image == 0
    ) {
      this.messageCommande = `<div class="alert alert-danger" role="alert">
      remplir votre champs
    </div>`;
    } else {
      this.services.registerCoach(coach).subscribe(
        (res) => {
          console.log(res);
          this.messageCommande = `<div class="alert alert-success" role="alert">
        avec success
      </div>`;

          this.router.navigate(['/loginCoach']).then(() => {
            window.location.reload();
          });
        },
        (err) => {
          this.messageCommande = `<div class="alert alert-warning" role="alert">
        EMAIL EXISTE déja!
      </div>`;
        }
      );
      setTimeout(() => {
        this.messageCommande = '';
      }, 3000);
    }
  }

  ngOnInit(): void {}

  onSelectFile(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.userFile = file;
      var mimeType = event.target.files[0].type;
      if (mimeType.match(/image\/*/) == null) {
        this.message = 'Only images are supported.';
        return;
      }
      var reader = new FileReader();
      this.imagePath = file;
      reader.readAsDataURL(file);
      reader.onload = (_event) => {
        this.imgURL = reader.result;
        // Update the image form control with the Base64 string
        this.coachForm.get('image')?.setValue(this.imgURL);
      };
    }
  }
}
