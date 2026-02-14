import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../Entity/Category.Entity';
import { CrudService } from '../service/crud.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-liste-category',
  templateUrl: './liste-category.component.html',
  styleUrls: ['./liste-category.component.css'],
})
export class ListeCategoryComponent {
  p: number = 1;
  collection: any[];
  listeCategory: Category[];
  categoryForm: FormGroup;
  messageCommande = '';

  constructor(
    private service: CrudService,
    private router: Router,
    private fb: FormBuilder
  ) {
    let formControls = {
      nom: new FormControl('', [Validators.required]),
    };
    this.categoryForm = this.fb.group(formControls);
  }

  get nom() {
    return this.categoryForm.get('nom');
  }

  ngOnInit(): void {
    this.service.getCategory().subscribe((category) => {
      this.listeCategory = category;
    });
  }

  DeleteCategory(category: Category) {
    if (
      confirm(
        "Voulez vous supprimer ce message de category avec l'ID " +
          category.id +
          '?'
      )
    ) {
      this.service.onDeleteCategory(category.id).subscribe(() => {
        this.router.navigate(['/listeCategory']).then(() => {
          window.location.reload();
        });
      });
    }
  }

  addNewCategory() {
    let data = this.categoryForm.value;
    console.log(data);
    let category = new Category(undefined, data.nom);

    if (!data.nom) {
      this.messageCommande = `<div class="alert alert-danger" role="alert">
        remplir votre champs
      </div>`;
    } else {
      this.service.addCategory(category).subscribe(
        (res: any) => {
          console.log(res);
          this.messageCommande = `<div class="alert alert-success" role="alert">
            Catégorie ajoutée avec succès!
          </div>`;

          this.listeCategory.push(res);

          this.categoryForm.reset();

          setTimeout(() => {
            this.messageCommande = '';
          }, 3000);
        },
        (err) => {
          this.messageCommande = `<div class="alert alert-warning" role="alert">
            EMAIL EXISTE déjà!
          </div>`;
        }
      );
    }
  }
}
