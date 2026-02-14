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
  selector: 'app-register-salle-de-sport',
  templateUrl: './register-salle-de-sport.component.html',
  styleUrls: ['./register-salle-de-sport.component.css'],
})
export class RegisterSalleDeSportComponent {
  messageCommande = '';
  salleDeSportForm: FormGroup;
  userFile: any;
  public imagePath: any;
  emailURL: any;
  newProduit = new SalleDeSport();
  public message!: string;
  imgURL: any;

  constructor(
    private services: CrudService,
    private router: Router,
    private fb: FormBuilder
  ) {
    let formControls = {
      nom: new FormControl('', [Validators.required]),
      telephone: new FormControl('', [Validators.required]),
      adresse: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      mp: new FormControl('', [Validators.required]),
      image: new FormControl('', [Validators.required]),
    };
    this.salleDeSportForm = this.fb.group(formControls);
  }

  get nom() {
    return this.salleDeSportForm.get('nom');
  }
  get telephone() {
    return this.salleDeSportForm.get('telephone');
  }
  get adresse() {
    return this.salleDeSportForm.get('adresse');
  }
  get email() {
    return this.salleDeSportForm.get('email');
  }
  get mp() {
    return this.salleDeSportForm.get('mp');
  }
  get image() {
    return this.salleDeSportForm.get('image');
  }

  addNewSalleDeSport() {
    let data = this.salleDeSportForm.value;
    console.log(data); // Check if data.image contains the Base64 string

    // Validate form fields
    if (
      !data.nom ||
      !data.telephone ||
      !data.adresse ||
      !data.email ||
      !data.mp ||
      !data.image
    ) {
      this.messageCommande = `<div class="alert alert-danger" role="alert">
        Remplir tous les champs
      </div>`;
      return;
    }

    let salleDeSport = new SalleDeSport(
      undefined,
      data.nom,
      data.email,
      data.adresse,
      data.mp,
      data.telephone,
      data.image, // This should now be the Base64 string
      undefined
    );
    console.log(salleDeSport);

    this.services.registerSalleDeSport(salleDeSport).subscribe(
      (res) => {
        console.log(res);
        this.messageCommande = `<div class="alert alert-success" role="alert">
          Enregistré avec succès
        </div>`;
        this.router.navigate(['/loginSalleDeSport']).then(() => {
          window.location.reload();
        });
      },
      (err) => {
        this.messageCommande = `<div class="alert alert-warning" role="alert">
          Cet email existe déjà !
        </div>`;
      }
    );
    setTimeout(() => {
      this.messageCommande = '';
    }, 3000);
  }

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
        this.salleDeSportForm.get('image')?.setValue(this.imgURL);
      };
    }
  }

  ngOnInit(): void {}
}
