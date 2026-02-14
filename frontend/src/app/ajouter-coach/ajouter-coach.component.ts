import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CrudService } from '../service/crud.service';
import { Router } from '@angular/router';
import { SaveCoach } from '../Entity/SaveCoach.Entity';

@Component({
  selector: 'app-ajouter-coach',
  templateUrl: './ajouter-coach.component.html',
  styleUrls: ['./ajouter-coach.component.css'],
})
export class AjouterCoachComponent {
  messageCommande = '';
  imgURL: any;
  coachForm: FormGroup;
  userFile: any;
  public imagePath: any;
  public message!: string;

  constructor(
    private services: CrudService,
    private router: Router,
    private fb: FormBuilder
  ) {
    let formControls = {
      nom: new FormControl('', [Validators.required]),
      prenom: new FormControl('', [Validators.required]),
      age: new FormControl('', [Validators.required]),
      activity: new FormControl('', [Validators.required]),
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
  get age() {
    return this.coachForm.get('age');
  }
  get activity() {
    return this.coachForm.get('activity');
  }
  get image() {
    return this.coachForm.get('image');
  }

  addNewAjouter() {
    let data = this.coachForm.value;
    let datas = this.services.userDetails();
    console.log(data);
    let model: SaveCoach = new SaveCoach();
    console.log(model);
    model.id = null;
    model.nom = data.nom;
    model.prenom = data.prenom;
    model.age = data.age;
    model.activity = data.activity;
    model.image = this.imgURL;
    model.idSalle = datas?.id;
    if (
      data.nom == 0 ||
      data.prenom == 0 ||
      data.age == 0 ||
      data.activity == 0 ||
      data.image == 0
    ) {
      this.messageCommande = `<div class="alert 
        alert-danger" role="alert">
        remplir votre champ 
      </div>`;
    } else {
      this.services.addCoach(model).subscribe(
        (res) => {
          console.log(res);
          this.router.navigate(['/mes-coach']);
        },
        (err) => {}
      );
      setTimeout(() => {
        this.messageCommande = '';
      }, 3000);
    }
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
      };
    }
  }
}
