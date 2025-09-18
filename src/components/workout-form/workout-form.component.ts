import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleSheetsService } from '../../services/google-sheets.service';
import { Exercise } from '../../models/exercise.model';

@Component({
  selector: 'app-workout-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="workout-form-container">
      <h2 class="form-title">Dodaj nowy wpis treningowy</h2>
      
      <form (ngSubmit)="onSubmit()" class="workout-form">
        <div class="form-group">
          <label for="exercise">Ćwiczenie:</label>
          <select 
            id="exercise" 
            [(ngModel)]="selectedExerciseId" 
            name="exercise"
            required
            class="form-select">
            <option value="">Wybierz ćwiczenie</option>
            <option *ngFor="let exercise of exercises" [value]="exercise.id">
              {{ exercise.name }}
            </option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="repetitions">Powtórzenia:</label>
            <input 
              type="number" 
              id="repetitions"
              [(ngModel)]="repetitions"
              name="repetitions"
              min="1"
              required
              class="form-input">
          </div>

          <div class="form-group">
            <label for="weight">Ciężar (kg):</label>
            <input 
              type="number" 
              id="weight"
              [(ngModel)]="weight"
              name="weight"
              min="0"
              step="0.5"
              required
              class="form-input">
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" [disabled]="!isFormValid()" class="btn btn-primary">
            Dodaj wpis
          </button>
          <button type="button" (click)="resetForm()" class="btn btn-secondary">
            Wyczyść
          </button>
        </div>
      </form>

      <div *ngIf="successMessage" class="success-message">
        {{ successMessage }}
      </div>
    </div>
  `,
  styles: [`
    .workout-form-container {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      margin-bottom: 24px;
    }

    .form-title {
      color: #1e293b;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
    }

    .workout-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    label {
      font-weight: 500;
      color: #374151;
      font-size: 14px;
    }

    .form-input, .form-select {
      padding: 10px 12px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.2s ease;
    }

    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: #2563eb;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }

    .btn-primary {
      background: #2563eb;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1d4ed8;
    }

    .btn-primary:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .success-message {
      background: #dcfce7;
      color: #166534;
      padding: 12px 16px;
      border-radius: 8px;
      margin-top: 16px;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class WorkoutFormComponent implements OnInit {
  exercises: Exercise[] = [];
  selectedExerciseId = '';
  repetitions: number | null = null;
  weight: number | null = null;
  successMessage = '';

  constructor(private googleSheetsService: GoogleSheetsService) {}

  ngOnInit() {
    this.googleSheetsService.exercises$.subscribe(exercises => {
      this.exercises = exercises;
    });
  }

  isFormValid(): boolean {
    return !!(this.selectedExerciseId && this.repetitions && this.weight);
  }

  onSubmit() {
    if (!this.isFormValid()) return;

    const selectedExercise = this.exercises.find(ex => ex.id === this.selectedExerciseId);
    if (!selectedExercise) return;

    this.googleSheetsService.addWorkoutEntry({
      exerciseId: this.selectedExerciseId,
      exerciseName: selectedExercise.name,
      repetitions: this.repetitions!,
      weight: this.weight!
    });

    this.successMessage = 'Wpis został dodany pomyślnie!';
    this.resetForm();
    
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  resetForm() {
    this.selectedExerciseId = '';
    this.repetitions = null;
    this.weight = null;
  }
}