import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutEntry } from '../../models/exercise.model';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

Chart.register(...registerables);

@Component({
  selector: 'app-exercise-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container" *ngIf="entries.length > 0">
      <h3 class="chart-title">{{ exerciseName }}</h3>
      <div class="chart-wrapper">
        <canvas #chartCanvas></canvas>
      </div>
      <div class="chart-stats">
        <div class="stat">
          <span class="stat-label">Ostatni wynik:</span>
          <span class="stat-value">{{ lastEntry?.weight }}kg × {{ lastEntry?.repetitions }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Najlepszy wynik:</span>
          <span class="stat-value">{{ bestEntry?.weight }}kg × {{ bestEntry?.repetitions }}</span>
        </div>
      </div>
    </div>
    <div class="no-data" *ngIf="entries.length === 0">
      <p>Brak danych dla tego ćwiczenia</p>
    </div>
  `,
  styles: [`
    .chart-container {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      margin-bottom: 24px;
    }

    .chart-title {
      color: #1e293b;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      text-align: center;
    }

    .chart-wrapper {
      position: relative;
      height: 300px;
      margin-bottom: 20px;
    }

    .chart-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }

    .stat {
      text-align: center;
    }

    .stat-label {
      display: block;
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 16px;
      font-weight: 600;
      color: #2563eb;
    }

    .no-data {
      background: #f9fafb;
      border: 2px dashed #d1d5db;
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      color: #6b7280;
      margin-bottom: 24px;
    }

    @media (max-width: 768px) {
      .chart-wrapper {
        height: 250px;
      }
      
      .chart-stats {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }
  `]
})
export class ExerciseChartComponent implements OnInit, OnDestroy {
  @Input() entries: WorkoutEntry[] = [];
  @Input() exerciseName = '';
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  get lastEntry(): WorkoutEntry | undefined {
    return this.entries[this.entries.length - 1];
  }

  get bestEntry(): WorkoutEntry | undefined {
    if (this.entries.length === 0) {
      return undefined;
    }
    
    return this.entries.reduce((best, current) => {
      const bestScore = best.weight * best.repetitions;
      const currentScore = current.weight * current.repetitions;
      return currentScore > bestScore ? current : best;
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.createChart();
    }, 0);
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private createChart() {
    if (!this.chartCanvas || this.entries.length === 0) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const sortedEntries = [...this.entries].sort((a, b) => a.date.getTime() - b.date.getTime());

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: sortedEntries.map(entry => 
          format(entry.date, 'dd.MM', { locale: pl })
        ),
        datasets: [
          {
            label: 'Ciężar (kg)',
            data: sortedEntries.map(entry => entry.weight),
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#2563eb',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
          },
          {
            label: 'Powtórzenia',
            data: sortedEntries.map(entry => entry.repetitions),
            borderColor: '#16a34a',
            backgroundColor: 'rgba(22, 163, 74, 0.1)',
            borderWidth: 3,
            fill: false,
            tension: 0.4,
            pointBackgroundColor: '#16a34a',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: '#2563eb',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              afterBody: (context) => {
                const index = context[0].dataIndex;
                const entry = sortedEntries[index];
                return [`Data: ${format(entry.date, 'dd.MM.yyyy', { locale: pl })}`];
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            border: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            border: {
              display: false
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }
}