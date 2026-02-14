import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { CrudService } from '../service/crud.service';
import { BaseChartDirective } from 'ng2-charts';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-revenue',
  templateUrl: './revenue.component.html',
  styleUrls: ['./revenue.component.css'],
})
export class RevenueComponent implements OnInit {
  @ViewChild('barChart') barChart: BaseChartDirective | undefined;
  @ViewChild('pieChart') pieChart: BaseChartDirective | undefined;
  @ViewChild('lineChart') lineChart: BaseChartDirective | undefined;

  salleId: number | null = null;
  selectedYear: number = new Date().getFullYear();
  years: number[] = [2023, 2024, 2025];
  totalRevenue: number = 0;

  // Bar Chart (Monthly Revenue)
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [
      'Jan',
      'Fév',
      'Mar',
      'Avr',
      'Mai',
      'Juin',
      'Juil',
      'Août',
      'Sep',
      'Oct',
      'Nov',
      'Déc',
    ],
    datasets: [
      {
        data: new Array(12).fill(0),
        label: "Chiffre d'affaires mensuel",
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Chiffre d'affaires " },
      },
      x: { title: { display: true, text: 'Mois' } },
    },
    plugins: {
      legend: { display: true },
      tooltip: { callbacks: { label: (context) => `${context.parsed.y} ` } },
    },
  };

  // Pie Chart (Revenue by Pack)
  public pieChartType: ChartType = 'pie';
  public pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
        ],
      },
    ],
  };
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed} `,
        },
      },
    },
  };

  // Line Chart (Year-over-Year Revenue)
  public lineChartType: ChartType = 'line';
  public lineChartData: ChartData<'line'> = {
    labels: this.years.map((year) => year.toString()),
    datasets: [
      {
        data: new Array(this.years.length).fill(0),
        label: "Chiffre d'affaires annuel",
        borderColor: '#36A2EB',
        fill: false,
        tension: 0.3,
      },
    ],
  };
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Chiffre d'affaires " },
      },
      x: { title: { display: true, text: 'Année' } },
    },
    plugins: {
      legend: { display: true },
      tooltip: { callbacks: { label: (context) => `${context.parsed.y}` } },
    },
  };

  constructor(private service: CrudService, private cdr: ChangeDetectorRef) {
    this.loadSalleIdFromToken();
  }

  ngOnInit(): void {
    if (this.salleId) {
      this.loadRevenueData();
    } else {
      console.error('No salle ID found. Please log in.');
    }
  }

  onYearChange(): void {
    if (this.salleId) {
      this.loadRevenueData();
    }
  }

  private loadSalleIdFromToken(): void {
    const token = localStorage.getItem('myTokenSalle');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.salleId = decoded.data.id;
        console.log('Decoded salleId:', this.salleId);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else {
      console.error('No token found in localStorage');
    }
  }

  private loadRevenueData(): void {
    if (!this.salleId) {
      console.error('Cannot load revenue data: salleId is null');
      return;
    }

    // Fetch Monthly Revenue
    this.service.getMonthlyRevenue(this.salleId, this.selectedYear).subscribe({
      next: (data) => {
        const monthlyData = new Array(12).fill(0);
        Object.keys(data).forEach((monthKey) => {
          const month = parseInt(monthKey);
          const amount = Number(data[month]);
          if (!isNaN(month) && !isNaN(amount) && month >= 1 && month <= 12) {
            monthlyData[month - 1] = amount;
          }
        });
        this.barChartData = {
          ...this.barChartData,
          datasets: [
            { ...this.barChartData.datasets[0], data: [...monthlyData] },
          ],
        };
        this.cdr.detectChanges();
        if (this.barChart) this.barChart.update();
      },
      error: (err) => console.error('Error fetching monthly revenue:', err),
    });

    // Fetch Total Yearly Revenue
    this.service
      .getTotalYearlyRevenue(this.salleId, this.selectedYear)
      .subscribe({
        next: (total) => {
          this.totalRevenue = Number(total);
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error fetching total revenue:', err),
      });

    // Fetch Revenue by Pack
    this.service.getRevenueByPack(this.salleId, this.selectedYear).subscribe({
      next: (data) => {
        const labels = data.map((item) => item.packName);
        const amounts = data.map((item) => Number(item.revenue));
        this.pieChartData = {
          labels,
          datasets: [
            {
              data: amounts,
              backgroundColor: this.pieChartData.datasets[0].backgroundColor,
            },
          ],
        };
        this.cdr.detectChanges();
        if (this.pieChart) this.pieChart.update();
      },
      error: (err) => console.error('Error fetching revenue by pack:', err),
    });

    // Fetch Year-over-Year Revenue
    const yearlyData = new Array(this.years.length).fill(0);
    let completedRequests = 0;
    this.years.forEach((year, index) => {
      this.service.getTotalYearlyRevenue(this.salleId!, year).subscribe({
        next: (total) => {
          yearlyData[index] = Number(total);
          completedRequests++;
          if (completedRequests === this.years.length) {
            this.lineChartData = {
              ...this.lineChartData,
              datasets: [
                { ...this.lineChartData.datasets[0], data: [...yearlyData] },
              ],
            };
            this.cdr.detectChanges();
            if (this.lineChart) this.lineChart.update();
          }
        },
        error: (err) => {
          console.error(`Error fetching revenue for ${year}:`, err);
          completedRequests++;
          if (completedRequests === this.years.length) {
            this.lineChartData = {
              ...this.lineChartData,
              datasets: [
                { ...this.lineChartData.datasets[0], data: [...yearlyData] },
              ],
            };
            this.cdr.detectChanges();
            if (this.lineChart) this.lineChart.update();
          }
        },
      });
    });
  }
}
