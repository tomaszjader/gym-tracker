import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleSheetsService } from '../../services/google-sheets.service';
import { Exercise, WorkoutEntry } from '../../models/exercise.model';
import { ExerciseChartComponent } from '../exercise-chart/exercise-chart.component';

@Component({
  selector: 'app-progress-dashboard',
  standalone: true,
  imports: [CommonModule, ExerciseChartComponent],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h2>Twoje postępy</h2>
        <p class="dashboard-subtitle">
          Śledzenie postępów w {{ exercisesWithData.length }} ćwiczeniach
        </p>
      </div>

      <div class="charts-container" *ngIf="exercisesWithData.length > 0">
        <app-exercise-chart
          *ngFor="let exercise of exercisesWithData"
          [entries]="getEntriesForExercise(exercise.id)"
          [exerciseName]="exercise.name">
        </app-exercise-chart>
      </div>

      <div class="no-progress" *ngIf="exercisesWithData.length === 0">
        <div class="no-progress-content">
          <h3>Brak danych o postępach</h3>
          <p>Dodaj swoje pierwsze wpisy treningowe, aby zobaczyć wykresy postępów.</p>
        </div>
      </div>

      <div class="stats-summary" *ngIf="workoutEntries.length > 0">
        <h3>Podsumowanie</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ workoutEntries.length }}</div>
            <div class="stat-label">Łączna liczba wpisów</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ exercisesWithData.length }}</div>
            <div class="stat-label">Ćwiczenia z danymi</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ totalWeight }}kg</div>
            <div class="stat-label">Łączny ciężar</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ averageReps }}</div>
            <div class="stat-label">Średnie powtórzenia</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .dashboard-header h2 {
      color: #1e293b;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .dashboard-subtitle {
      color: #64748b;
      font-size: 16px;
      margin: 0;
    }

    .charts-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-bottom: 32px;
    }

    .no-progress {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      margin: 32px 0;
    }

    .no-progress-content {
      text-align: center;
      background: #f8fafc;
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      padding: 48px;
      max-width: 400px;
    }

    .no-progress-content h3 {
      color: #475569;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .no-progress-content p {
      color: #64748b;
      margin: 0;
    }

    .stats-summary {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    }

    .stats-summary h3 {
      color: #1e293b;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      text-align: center;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .stat-card {
      background: #f8fafc;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      border: 1px solid #e2e8f0;
    }

    .stat-number {
      font-size: 24px;
      font-weight: 700;
      color: #2563eb;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .dashboard-header h2 {
        font-size: 24px;
      }
    }
  `]
})
export class ProgressDashboardComponent implements OnInit {
  exercises: Exercise[] = [];
  workoutEntries: WorkoutEntry[] = [];
  exercisesWithData: Exercise[] = [];

  constructor(private googleSheetsService: GoogleSheetsService) {}

  ngOnInit() {
    this.googleSheetsService.exercises$.subscribe(exercises => {
      this.exercises = exercises;
      this.updateExercisesWithData();
    });

    this.googleSheetsService.workoutEntries$.subscribe(entries => {
      this.workoutEntries = entries;
      this.updateExercisesWithData();
    });
  }

  private updateExercisesWithData() {
    this.exercisesWithData = this.exercises.filter(exercise => 
      this.workoutEntries.some(entry => entry.exerciseId === exercise.id)
    );
  }

  getEntriesForExercise(exerciseId: string): WorkoutEntry[] {
    return this.googleSheetsService.getEntriesForExercise(exerciseId);
  }

  get totalWeight(): number {
    return this.workoutEntries.reduce((total, entry) => total + entry.weight, 0);
  }

  get averageReps(): number {
    if (this.workoutEntries.length === 0) return 0;
    const total = this.workoutEntries.reduce((sum, entry) => sum + entry.repetitions, 0);
    return Math.round(total / this.workoutEntries.length);
  }
}