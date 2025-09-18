import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleSheetsService } from '../../services/google-sheets.service';
import { Exercise } from '../../models/exercise.model';

@Component({
  selector: 'app-exercise-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="exercise-manager">
      <div class="manager-header">
        <h2>Zarządzaj ćwiczeniami</h2>
        <button 
          (click)="toggleAddForm()" 
          class="btn btn-primary">
          {{ showAddForm ? 'Anuluj' : 'Dodaj ćwiczenie' }}
        </button>
      </div>

      <div class="add-exercise-form" *ngIf="showAddForm">
        <h3>Dodaj nowe ćwiczenie</h3>
        <form (ngSubmit)="addExercise()">
          <div class="form-group">
            <label for="exerciseName">Nazwa ćwiczenia:</label>
            <input 
              type="text" 
              id="exerciseName"
              [(ngModel)]="newExerciseName"
              name="exerciseName"
              required
              placeholder="np. Wyciskanie hantli na ławce skośnej"
              class="form-input">
          </div>
          
          <div class="form-group">
            <label for="exerciseCategory">Kategoria (opcjonalnie):</label>
            <input 
              type="text" 
              id="exerciseCategory"
              [(ngModel)]="newExerciseCategory"
              name="exerciseCategory"
              placeholder="np. Klatka piersiowa"
              class="form-input">
          </div>

          <div class="form-actions">
            <button type="submit" [disabled]="!newExerciseName.trim()" class="btn btn-success">
              Dodaj ćwiczenie
            </button>
          </div>
        </form>
      </div>

      <div class="exercises-list">
        <h3>Lista ćwiczeń ({{ exercises.length }})</h3>
        <div class="exercise-grid">
          <div 
            *ngFor="let exercise of exercises" 
            class="exercise-card">
            <div class="exercise-info">
              <h4>{{ exercise.name }}</h4>
              <span class="exercise-category" *ngIf="exercise.category">
                {{ exercise.category }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="successMessage" class="success-message">
        {{ successMessage }}
      </div>
    </div>
  `,
  styles: [`
    .exercise-manager {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    }

    .manager-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .manager-header h2 {
      color: #1e293b;
      font-size: 20px;
      font-weight: 600;
      margin: 0;
    }

    .add-exercise-form {
      background: #f8fafc;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }

    .add-exercise-form h3 {
      color: #1e293b;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .form-group {
      margin-bottom: 16px;
    }

    label {
      display: block;
      font-weight: 500;
      color: #374151;
      font-size: 14px;
      margin-bottom: 6px;
    }

    .form-input {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.2s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #2563eb;
    }

    .form-actions {
      margin-top: 20px;
    }

    .btn {
      padding: 10px 16px;
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

    .btn-primary:hover {
      background: #1d4ed8;
    }

    .btn-success {
      background: #16a34a;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background: #15803d;
    }

    .btn-success:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .exercises-list h3 {
      color: #1e293b;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .exercise-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .exercise-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      transition: shadow 0.2s ease;
    }

    .exercise-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .exercise-info h4 {
      color: #1e293b;
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .exercise-category {
      background: #e0f2fe;
      color: #0369a1;
      font-size: 12px;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 4px;
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
      .manager-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }
      
      .exercise-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ExerciseManagerComponent implements OnInit {
  exercises: Exercise[] = [];
  showAddForm = false;
  newExerciseName = '';
  newExerciseCategory = '';
  successMessage = '';

  constructor(private googleSheetsService: GoogleSheetsService) {}

  ngOnInit() {
    this.googleSheetsService.exercises$.subscribe(exercises => {
      this.exercises = exercises;
    });
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  addExercise() {
    if (!this.newExerciseName.trim()) return;

    this.googleSheetsService.addExercise({
      name: this.newExerciseName.trim(),
      category: this.newExerciseCategory.trim() || undefined
    });

    this.successMessage = 'Ćwiczenie zostało dodane pomyślnie!';
    this.resetForm();
    this.showAddForm = false;

    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  private resetForm() {
    this.newExerciseName = '';
    this.newExerciseCategory = '';
  }
}