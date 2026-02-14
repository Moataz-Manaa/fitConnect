import { Component, OnInit } from '@angular/core';
import { CrudService } from '../service/crud.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../Entity/Category.Entity';
import { Contact } from '../Entity/Contact.Entity';
import { Pack } from '../Entity/Pack.Entity';
import { SavePack } from '../Entity/SavePack.Entity';

@Component({
  selector: 'app-edit-pack',
  templateUrl: './edit-pack.component.html',
  styleUrls: ['./edit-pack.component.css'],
})
// edit-pack.component.ts
export class EditPackComponent {
  packId!: number;
  packForm!: FormGroup;
  imagePreview!: string;
  categories: Category[] = []; // Add categories array

  constructor(
    private route: ActivatedRoute,
    private crudService: CrudService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.packId = +this.route.snapshot.paramMap.get('id')!;
    this.initForm();
    this.loadCategories(); // Load categories
    this.loadPackDetails();
  }

  initForm() {
    this.packForm = this.fb.group({
      nom: ['', Validators.required],
      prix: ['', Validators.required],
      description: ['', Validators.required],
      idCategory: ['', Validators.required],
      idSalle: ['', Validators.required],
      image: [''],
    });
  }

  loadCategories() {
    this.crudService.getCategory().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => console.error('Error loading categories:', err),
    });
  }

  loadPackDetails() {
    this.crudService.getPacks().subscribe({
      next: (packs) => {
        const pack = packs.find((p) => p.id === this.packId);
        if (pack) {
          this.packForm.patchValue({
            nom: pack.nom,
            prix: pack.prix,
            description: pack.description,
            idCategory: pack.category.id,
            idSalle: pack.salle.id,
            image: pack.image,
          });
          this.imagePreview = pack.image; // Set initial image preview
        }
        console.log('Form Values:', this.packForm.value);
      },
      error: (err) => console.error('Error loading pack:', err),
    });
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = reader.result as string;
        this.packForm.patchValue({ image: this.imagePreview });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.packForm.invalid) return;

    const updatedPack = this.packForm.value;
    this.crudService.updatePack(this.packId, updatedPack).subscribe({});

    this.router.navigate(['/mesPacks']).then(() => {
      window.location.reload();
    });
  }
}
