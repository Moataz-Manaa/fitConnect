import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from '../service/crud.service';

@Component({
  selector: 'app-edit-coach',
  templateUrl: './edit-coach.component.html',
  styleUrls: ['./edit-coach.component.css'],
})
export class EditCoachComponent implements OnInit {
  coachId!: number;
  coachForm!: FormGroup;
  imagePreview!: string;

  constructor(
    private route: ActivatedRoute,
    private crudService: CrudService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.coachId = +this.route.snapshot.paramMap.get('id')!;
    this.initForm();
    this.loadCoachDetails();
  }

  initForm() {
    this.coachForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      age: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      activity: ['', Validators.required],
      image: [''],
    });
  }

  loadCoachDetails() {
    this.crudService.getCoachsSalle().subscribe({
      next: (coachs) => {
        const coach = coachs.find((c) => c.id === this.coachId);
        if (coach) {
          this.coachForm.patchValue({
            nom: coach.nom,
            prenom: coach.prenom,
            age: coach.age,
            activity: coach.activity,
            image: coach.image,
          });
          this.imagePreview = coach.image;
          console.log('Form Valid:', this.coachForm.valid);
          console.log('Form Values:', this.coachForm.value);
        } else {
          console.error('Coach not found for ID:', this.coachId);
        }
      },
      error: (err) => console.error('Error loading coach:', err),
    });
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = reader.result as string;
        this.coachForm.patchValue({ image: this.imagePreview });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.coachForm.invalid) return;

    // Get the logged-in SalleDeSport's ID
    const userDetails = this.crudService.userDetails();
    if (!userDetails || !userDetails.id) {
      console.error('No logged-in SalleDeSport found');
      return;
    }

    const updatedCoach: any = {
      ...this.coachForm.value,
      idSalle: userDetails.id, // Set idSalle from logged-in SalleDeSport
    };

    this.crudService.updateCoachSalle(this.coachId, updatedCoach).subscribe({
      next: () => {
        this.router.navigate(['/mes-coach']).then(() => {
          window.location.reload();
        });
      },
      error: (err) => console.error('Error updating coach:', err),
    });
  }
}
