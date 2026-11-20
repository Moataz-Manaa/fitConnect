import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { BehaviorSubject, Observable, forkJoin, map, of, shareReplay, switchMap } from 'rxjs';
import { CustomerData, customerData } from '../customer/customer-data';
import { PageStateComponent } from '../customer/page-state.component';
import { LayoutModule } from '../layout.module';
import { WorkspaceNavComponent } from '../management/workspace-nav.component';
import { CrudService } from '../service/crud.service';
import { activeSession } from '../service/session';

const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

interface RevenueReport {
  total: number;
  monthly: { label: string; amount: number }[];
  annual: { year: number; amount: number }[];
  packs: { packId: number; packName: string; revenue: number }[];
  monthlyChart: ChartData<'bar'>;
  annualChart: ChartData<'line'>;
  packChart: ChartData<'pie'>;
}

@Component({
  selector: 'app-revenue',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutModule, NgChartsModule, PageStateComponent, WorkspaceNavComponent],
  templateUrl: './revenue.component.html',
})
export class RevenueComponent implements OnInit {
  selectedYear = new Date().getFullYear();
  readonly years = Array.from({ length: Math.max(1, this.selectedYear - 2023 + 1) }, (_, index) => this.selectedYear - index);
  readonly trendOptions: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };
  readonly packOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };
  private readonly yearChanges = new BehaviorSubject(this.selectedYear);
  data$!: Observable<CustomerData<RevenueReport>>;

  constructor(private service: CrudService) {}

  ngOnInit(): void {
    const session = activeSession();
    if (session?.role !== 'salle') {
      this.data$ = of({ loading: false, error: 'Connectez-vous pour consulter vos revenus.', value: null });
      return;
    }
    const id = session.claims.data.id;
    const annual = forkJoin([...this.years].reverse().map(year => this.service.getTotalYearlyRevenue(id, year).pipe(
      map(amount => ({ year, amount: Number(amount) }))
    ))).pipe(shareReplay({ bufferSize: 1, refCount: true }));
    this.data$ = this.yearChanges.pipe(switchMap(year => customerData(forkJoin({
      annual,
      monthly: this.service.getMonthlyRevenue(id, year),
      packs: this.service.getRevenueByPack(id, year),
    }).pipe(map(result => this.report(year, result.annual, result.monthly, result.packs))),
    'Impossible de charger les revenus pour cette période.')));
  }

  loadYear(year = this.selectedYear): void {
    this.selectedYear = year;
    this.yearChanges.next(year);
  }

  private report(year: number, annual: RevenueReport['annual'], totals: Record<number, number>, packs: RevenueReport['packs']): RevenueReport {
    const monthly = months.map((label, index) => ({ label, amount: Number(totals[index + 1] ?? 0) }));
    return {
      total: annual.find(item => item.year === year)?.amount ?? 0,
      monthly,
      annual,
      packs,
      monthlyChart: {
        labels: months,
        datasets: [{ label: 'Revenus par mois', data: monthly.map(item => item.amount), backgroundColor: '#5b825d', borderRadius: 4 }],
      },
      annualChart: {
        labels: annual.map(item => String(item.year)),
        datasets: [{ label: 'Revenus par année', data: annual.map(item => item.amount), borderColor: '#335840', backgroundColor: '#92b579', tension: .25 }],
      },
      packChart: {
        labels: packs.map(item => item.packName),
        datasets: [{ data: packs.map(item => Number(item.revenue)), backgroundColor: ['#335840', '#7da05b', '#e8aa58', '#52798c', '#c8ca66'] }],
      },
    };
  }
}
