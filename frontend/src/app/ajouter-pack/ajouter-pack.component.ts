import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Contact } from '../Entity/Contact.Entity';
import { Router } from '@angular/router';
import { CrudService } from '../service/crud.service';
import { SavePack } from '../Entity/SavePack.Entity';
import { Category } from '../Entity/Category.Entity';

@Component({
  selector: 'app-ajouter-pack',
  templateUrl: './ajouter-pack.component.html',
  styleUrls: ['./ajouter-pack.component.css'],
})
export class AjouterPackComponent {
  messageCommande = '';
  imgURL: any;
  packForm: FormGroup;
  userFile: any;
  public imagePath: any;
  listeCategory: Category[];

  newProduit = new Contact();
  public message!: string;

  constructor(
    private services: CrudService,
    private router: Router,
    private fb: FormBuilder
  ) {
    let formControls = {
      nom: new FormControl('', [Validators.required, Validators.minLength(4)]),
      description: new FormControl('', [Validators.required]),
      prix: new FormControl('', [Validators.required]),
      category: new FormControl('', [Validators.required]),
      image: new FormControl('', [Validators.required]),
    };
    this.packForm = this.fb.group(formControls);
  }

  get nom() {
    return this.packForm.get('nom');
  }
  get description() {
    return this.packForm.get('description');
  }
  get prix() {
    return this.packForm.get('prix');
  }
  get category() {
    return this.packForm.get('category');
  }

  addNewAjouter() {
    let data = this.packForm.value;
    let datas = this.services.userDetails();
    console.log(data);
    let model: SavePack = new SavePack();
    console.log(model);
    model.id = null;
    model.nom = data.nom;
    model.description = data.description;
    model.prix = data.prix;
    model.idCategory = +data.category;
    model.idSalle = datas?.id;
    model.image = this.imgURL;
    if (
      data.nom == 0 ||
      data.description == 0 ||
      data.prix == 0 ||
      data.image == 0 ||
      data.category == 0
    ) {
      this.messageCommande = `<div class="alert 
      alert-danger" role="alert">
      remplir votre champ 
    </div>`;
    } else {
      this.services.addPack(model).subscribe(
        (res) => {
          console.log(res);

          this.router.navigate(['/mesPacks']);
        },
        (err) => {}
      );
      setTimeout(() => {
        this.messageCommande = '';
      }, 3000);
    }
  }

  ngOnInit(): void {
    this.services.getCategory().subscribe((categorie) => {
      this.listeCategory = categorie;
      console.log(categorie);
    });
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
