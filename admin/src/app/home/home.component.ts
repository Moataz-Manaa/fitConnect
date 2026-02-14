import { Component } from '@angular/core';
import { CrudService } from '../service/crud.service';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { SalleDeSport } from '../Entity/SalleDeSport.Entity';
import { forkJoin } from 'rxjs';
import { Coach } from '../Entity/Coach.Entity';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  userDetails: any;
  totalAdmin: number = 0;
  totalClient: number = 0;
  totalCoach: number = 0;
  totalSalle: number = 0;
  chart: any = [];
  sallesDeSport: SalleDeSport[] = [];
  coachs: Coach[] = [];
  myGroup: FormGroup;

  constructor(private router: Router, private service: CrudService) {
    this.userDetails = this.service.userDetails();
    this.myGroup = new FormGroup({
      firstName: new FormControl(),
    });
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    forkJoin({
      admins: this.service.getAdmin(),
      clients: this.service.getClient(),
      coaches: this.service.getCoach(),
      salles: this.service.getSalleDeSport(),
    }).subscribe(({ admins, clients, coaches, salles }) => {
      this.totalAdmin = admins.length;
      this.totalClient = clients.length;
      this.totalCoach = coaches.length;
      this.totalSalle = salles.length;

      this.sallesDeSport = salles;
      const sallesActives = this.sallesDeSport.filter(
        (salle) => salle.etat === true
      );
      const nombreSallesActives = sallesActives.length;
      const nombreTotalSalles = this.sallesDeSport.length;

      this.coachs = coaches;
      const coachsActifs = this.coachs.filter((coach) => coach.etat === true);
      const nombreCoachActives = coachsActifs.length;
      const nombreTotalCoaches = this.coachs.length;

      this.updateChart(nombreSallesActives, nombreTotalSalles);
      this.updatePercentageChart();
      this.updateChartCoach(nombreCoachActives, nombreTotalCoaches);
    });
  }

  updateChart(nombreSallesActives: number, nombreTotalSalles: number) {
    const circleChart = new Chart('canvas', {
      type: 'doughnut',
      data: {
        labels: ['Salles actives', 'Salles inactives'],
        datasets: [
          {
            label: 'nombre des salles de sport',
            data: [
              nombreSallesActives,
              nombreTotalSalles - nombreSallesActives,
            ],
            backgroundColor: ['#ff8a65', '#8B65D2'],
            borderColor: ['#ff8a65', '#8B65D2'],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                family: 'Arial',
                size: 14,
              },
            },
          },
          title: {
            display: true,
            text: 'état des salles de sport',
            font: {
              family: 'Arial',
              size: 18,
              weight: 'bold',
            },
          },
        },
        layout: {
          padding: {
            left: 20,
            right: 20,
            top: 20,
            bottom: 20,
          },
        },
      },
    });
  }

  updateChartCoach(nombreCoachActives: number, nombreTotalCoaches: number) {
    const circleChart = new Chart('canvasCoach', {
      type: 'doughnut',
      data: {
        labels: ['Coachs actives', 'Coachs inactives'],
        datasets: [
          {
            label: 'nombre des coachs',
            data: [nombreCoachActives, nombreTotalCoaches - nombreCoachActives],
            backgroundColor: ['#ff8a65', '#8B65D2'],
            borderColor: ['#ff8a65', '#8B65D2'],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                family: 'Arial',
                size: 14,
              },
            },
          },
          title: {
            display: true,
            text: 'état des coachs',
            font: {
              family: 'Arial',
              size: 18,
              weight: 'bold',
            },
          },
        },
        layout: {
          padding: {
            left: 20,
            right: 20,
            top: 20,
            bottom: 20,
          },
        },
      },
    });
  }

  updatePercentageChart() {
    const totalUsers = this.totalClient + this.totalCoach + this.totalSalle;
    const percentageClients = (this.totalClient / totalUsers) * 100;
    const percentageCoachs = (this.totalCoach / totalUsers) * 100;
    const percentageSalles = (this.totalSalle / totalUsers) * 100;
    const percentageChart = new Chart('percentageCanvas', {
      type: 'pie',
      data: {
        labels: ['Client', 'Coach', 'Salles de sport'],
        datasets: [
          {
            label: 'Pourcentage des utilisateurs',
            data: [percentageClients, percentageCoachs, percentageSalles],
            backgroundColor: ['#ff8a65', '#4bc0c0', '#8B65D2'],
            borderColor: ['#ff8a65', '#4bc0c0', '#8B65D2'],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                family: 'Arial',
                size: 14,
              },
            },
          },
          title: {
            display: true,
            text: 'pourcentage des utilisateurs sur la plateforme',
            font: {
              family: 'Arial',
              size: 18,
              weight: 'bold',
            },
          },
        },
        layout: {
          padding: {
            left: 20,
            right: 20,
            top: 20,
            bottom: 20,
          },
        },
      },
    });
  }
}
