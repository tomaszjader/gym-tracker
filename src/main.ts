import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { WorkoutFormComponent } from './components/workout-form/workout-form.component';
import { ProgressDashboardComponent } from './components/progress-dashboard/progress-dashboard.component';
import { ExerciseManagerComponent } from './components/exercise-manager/exercise-manager.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    WorkoutFormComponent, 
    ProgressDashboardComponent,
    ExerciseManagerComponent
  ],
  template: `
    <div class="app">
      <header class="app-header">
        <div class="container">
          <h1 class="app-title">
            <span class="icon">💪</span>
            GymTracker
          </h1>
          <p class="app-subtitle">Śledź swoje postępy na siłowni</p>
        </div>
      </header>

      <nav class="app-nav">
        <div class="container">
          <div class="nav-tabs">
            <button 
              *ngFor="let tab of tabs" 
              (click)="activeTab = tab.key"
              [class.active]="activeTab === tab.key"
              class="nav-tab">
              {{ tab.label }}
            </button>
          </div>
        </div>
      </nav>

      <main class="app-main">
        <div class="container">
          <div [ngSwitch]="activeTab">
            <div *ngSwitchCase="'add'">
              <app-workout-form></app-workout-form>
            </div>
            
            <div *ngSwitchCase="'progress'">
              <app-progress-dashboard></app-progress-dashboard>
            </div>
            
            <div *ngSwitchCase="'exercises'">
              <app-exercise-manager></app-exercise-manager>
            </div>
          </div>
        </div>
      </main>

      <footer class="app-footer">
        <div class="container">
          <p>&copy; 2025 GymTracker. Aplikacja do śledzenia postępów treningowych.</p>
          <p class="footer-note">
            <strong>Uwaga:</strong> Aby w pełni wykorzystać aplikację, skonfiguruj integrację z Google Sheets API.
          </p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
    }

    .app {
      min-height: 100vh;
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      display: flex;
      flex-direction: column;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .app-header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      padding: 24px 0;
      box-shadow: 0 4px 20px rgba(37, 99, 235, 0.3);
    }

    .app-title {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .icon {
      font-size: 36px;
    }

    .app-subtitle {
      font-size: 16px;
      opacity: 0.9;
      font-weight: 400;
    }

    .app-nav {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      padding: 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .nav-tabs {
      display: flex;
      gap: 0;
    }

    .nav-tab {
      background: none;
      border: none;
      padding: 16px 24px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 3px solid transparent;
      color: #64748b;
    }

    .nav-tab:hover {
      color: #2563eb;
      background: #f8fafc;
    }

    .nav-tab.active {
      color: #2563eb;
      border-bottom-color: #2563eb;
      background: #f8fafc;
    }

    .app-main {
      flex: 1;
      padding: 32px 0;
    }

    .app-footer {
      background: white;
      border-top: 1px solid #e2e8f0;
      padding: 24px 0;
      margin-top: auto;
      text-align: center;
    }

    .app-footer p {
      color: #64748b;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .footer-note {
      background: #fef3c7;
      color: #92400e;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #fbbf24;
      margin-top: 12px;
    }

    @media (max-width: 768px) {
      .app-title {
        font-size: 24px;
      }
      
      .icon {
        font-size: 28px;
      }
      
      .nav-tabs {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      
      .nav-tab {
        white-space: nowrap;
        min-width: auto;
        flex-shrink: 0;
      }
      
      .container {
        padding: 0 16px;
      }
      
      .app-main {
        padding: 24px 0;
      }
    }
  `]
})
export class App {
  activeTab = 'add';
  
  tabs = [
    { key: 'add', label: 'Dodaj wpis' },
    { key: 'progress', label: 'Postępy' },
    { key: 'exercises', label: 'Ćwiczenia' }
  ];
}

bootstrapApplication(App);