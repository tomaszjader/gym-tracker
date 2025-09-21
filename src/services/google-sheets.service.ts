import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Exercise, WorkoutEntry } from '../models/exercise.model';

@Injectable({
  providedIn: 'root'
})
export class GoogleSheetsService {
  private readonly APPS_SCRIPT_URL = this.getEnvironmentVariable('APPS_SCRIPT_URL', 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE');
  private isInitialized = false;
  
  private exercisesSubject = new BehaviorSubject<Exercise[]>([
    { id: '1', name: 'Wyciskanie sztangi na ławce płaskiej' },
    { id: '2', name: 'Przysiad ze sztangą' },
    { id: '3', name: 'Martwy ciąg' },
    { id: '4', name: 'Wyciskanie sztangi nad głowę' },
    { id: '5', name: 'Podciąganie' }
  ]);
  
  private workoutEntriesSubject = new BehaviorSubject<WorkoutEntry[]>([]);

  exercises$ = this.exercisesSubject.asObservable();
  workoutEntries$ = this.workoutEntriesSubject.asObservable();

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    try {
      if (this.APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
        console.warn('Google Apps Script URL nie jest skonfigurowany. Używam danych testowych.');
        this.loadMockData();
        return;
      }

      // Załaduj dane z Google Apps Script
      await this.loadDataFromAppsScript();
      this.isInitialized = true;
    } catch (error) {
      console.error('Błąd podczas inicjalizacji serwisu:', error);
      this.loadMockData();
    }
  }

  private loadMockData() {
    // Mock data for demonstration
    const mockEntries: WorkoutEntry[] = [
      {
        id: '1',
        exerciseId: '1',
        exerciseName: 'Wyciskanie sztangi na ławce płaskiej',
        repetitions: 10,
        weight: 80,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        exerciseId: '1',
        exerciseName: 'Wyciskanie sztangi na ławce płaskiej',
        repetitions: 8,
        weight: 85,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        exerciseId: '2',
        exerciseName: 'Przysiad ze sztangą',
        repetitions: 12,
        weight: 100,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ];
    
    this.workoutEntriesSubject.next(mockEntries);
  }

  async addExercise(exercise: Omit<Exercise, 'id'>): Promise<void> {
    const exercises = this.exercisesSubject.value;
    
    try {
      // Wyślij do Google Apps Script
      const response = await this.callAppsScript('addExercise', { exercise });
      const newExercise = response.data;
      
      // Aktualizuj lokalnie
      this.exercisesSubject.next([...exercises, newExercise]);
    } catch (error) {
      console.error('Błąd podczas dodawania ćwiczenia:', error);
      throw error;
    }
  }

  async updateExercise(exerciseId: string, updatedExercise: Partial<Omit<Exercise, 'id'>>): Promise<void> {
    const exercises = this.exercisesSubject.value;
    const exerciseIndex = exercises.findIndex(ex => ex.id === exerciseId);
    
    if (exerciseIndex === -1) {
      throw new Error(`Ćwiczenie o ID ${exerciseId} nie zostało znalezione`);
    }
    
    const oldExercises = [...exercises];
    
    try {
      // Wyślij do Google Apps Script
      await this.callAppsScript('updateExercise', { exerciseId, updatedExercise });
      
      // Aktualizuj lokalnie
      const updatedExercises = [...exercises];
      updatedExercises[exerciseIndex] = {
        ...updatedExercises[exerciseIndex],
        ...updatedExercise
      };
      this.exercisesSubject.next(updatedExercises);
    } catch (error) {
      console.error('Błąd podczas aktualizacji ćwiczenia:', error);
      throw error;
    }
  }

  async deleteExercise(exerciseId: string): Promise<void> {
    const exercises = this.exercisesSubject.value;
    const exerciseExists = exercises.some(ex => ex.id === exerciseId);
    
    if (!exerciseExists) {
      throw new Error(`Ćwiczenie o ID ${exerciseId} nie zostało znalezione`);
    }
    
    const oldExercises = [...exercises];
    const oldEntries = [...this.workoutEntriesSubject.value];
    
    try {
      // Wyślij do Google Apps Script
      await this.callAppsScript('deleteExercise', { exerciseId });
      
      // Usuń ćwiczenie lokalnie
      const updatedExercises = exercises.filter(ex => ex.id !== exerciseId);
      this.exercisesSubject.next(updatedExercises);
      
      // Usuń wszystkie powiązane wpisy treningowe lokalnie
      const updatedEntries = this.workoutEntriesSubject.value.filter(entry => entry.exerciseId !== exerciseId);
      this.workoutEntriesSubject.next(updatedEntries);
    } catch (error) {
      console.error('Błąd podczas usuwania ćwiczenia:', error);
      // Rollback lokalnych zmian
      this.exercisesSubject.next(oldExercises);
      this.workoutEntriesSubject.next(oldEntries);
      throw error;
    }
  }

  async addWorkoutEntry(entry: Omit<WorkoutEntry, 'id' | 'date'>): Promise<void> {
    const entries = this.workoutEntriesSubject.value;
    
    try {
      // Wyślij do Google Apps Script
      const response = await this.callAppsScript('addWorkoutEntry', { entry });
      const newEntry = response.data;
      
      // Aktualizuj lokalnie
      this.workoutEntriesSubject.next([...entries, {
        ...newEntry,
        date: new Date(newEntry.date)
      }]);
    } catch (error) {
      console.error('Błąd podczas dodawania wpisu treningowego:', error);
      throw error;
    }
  }

  async updateWorkoutEntry(entryId: string, updatedEntry: Partial<Omit<WorkoutEntry, 'id' | 'date'>>): Promise<void> {
    const entries = this.workoutEntriesSubject.value;
    const entryIndex = entries.findIndex(entry => entry.id === entryId);
    
    if (entryIndex === -1) {
      throw new Error(`Wpis treningowy o ID ${entryId} nie został znaleziony`);
    }
    
    const oldEntries = [...entries];
    
    try {
      // Wyślij do Google Apps Script
      await this.callAppsScript('updateWorkoutEntry', { entryId, updatedEntry });
      
      // Aktualizuj lokalnie
      const updatedEntries = [...entries];
      updatedEntries[entryIndex] = {
        ...updatedEntries[entryIndex],
        ...updatedEntry
      };
      this.workoutEntriesSubject.next(updatedEntries);
    } catch (error) {
      console.error('Błąd podczas aktualizacji wpisu treningowego:', error);
      throw error;
    }
  }

  async deleteWorkoutEntry(entryId: string): Promise<void> {
    const entries = this.workoutEntriesSubject.value;
    const entryExists = entries.some(entry => entry.id === entryId);
    
    if (!entryExists) {
      throw new Error(`Wpis treningowy o ID ${entryId} nie został znaleziony`);
    }
    
    const oldEntries = [...entries];
    
    try {
      // Wyślij do Google Apps Script
      await this.callAppsScript('deleteWorkoutEntry', { entryId });
      
      // Usuń lokalnie
      const updatedEntries = entries.filter(entry => entry.id !== entryId);
      this.workoutEntriesSubject.next(updatedEntries);
    } catch (error) {
      console.error('Błąd podczas usuwania wpisu treningowego:', error);
      // Rollback lokalnej zmiany
      this.workoutEntriesSubject.next(oldEntries);
      throw error;
    }
  }

  async clearAllData(): Promise<void> {
    const oldExercises = [...this.exercisesSubject.value];
    const oldEntries = [...this.workoutEntriesSubject.value];
    
    try {
      // Wyślij do Google Apps Script
      await this.callAppsScript('clearAllData', {});
      
      // Wyczyść wszystkie wpisy treningowe lokalnie
      this.workoutEntriesSubject.next([]);
      
      // Przywróć domyślne ćwiczenia lokalnie
      const defaultExercises: Exercise[] = [
        { id: '1', name: 'Wyciskanie sztangi na ławce płaskiej' },
        { id: '2', name: 'Przysiad ze sztangą' },
        { id: '3', name: 'Martwy ciąg' },
        { id: '4', name: 'Wyciskanie sztangi nad głowę' },
        { id: '5', name: 'Podciąganie' }
      ];
      
      this.exercisesSubject.next(defaultExercises);
    } catch (error) {
      console.error('Błąd podczas czyszczenia danych:', error);
      // Rollback lokalnych zmian
      this.exercisesSubject.next(oldExercises);
      this.workoutEntriesSubject.next(oldEntries);
      throw error;
    }
  }
  getEntriesForExercise(exerciseId: string): WorkoutEntry[] {
    return this.workoutEntriesSubject.value
      .filter(entry => entry.exerciseId === exerciseId)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  getExerciseById(exerciseId: string): Exercise | null {
    return this.exercisesSubject.value.find(exercise => exercise.id === exerciseId) || null;
  }

  
  // Nowe metody do komunikacji z Google Apps Script
  private async loadDataFromAppsScript(): Promise<void> {
    try {
      // Załaduj ćwiczenia
      const exercisesResponse = await this.callAppsScript('getExercises', {});
      if (exercisesResponse.success && exercisesResponse.data) {
        this.exercisesSubject.next(exercisesResponse.data);
      }

      // Załaduj wpisy treningowe
      const entriesResponse = await this.callAppsScript('getWorkoutEntries', {});
      if (entriesResponse.success && entriesResponse.data) {
        const entries = entriesResponse.data.map((entry: any) => ({
          ...entry,
          date: new Date(entry.date)
        }));
        this.workoutEntriesSubject.next(entries);
      }
    } catch (error) {
      console.error('Błąd podczas ładowania danych z Apps Script:', error);
      throw error;
    }
  }

  private async callAppsScript(action: string, data: any): Promise<any> {
    if (this.APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
      throw new Error('Google Apps Script URL nie jest skonfigurowany');
    }

    try {
      const response = await fetch(this.APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action,
          ...data
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Nieznany błąd Apps Script');
      }

      return result;
    } catch (error: any) {
      console.error(`Błąd podczas wywołania Apps Script (${action}):`, error);
      throw new Error(`Nie udało się wykonać operacji ${action}: ${error.message}`);
    }
  }

  /**
   * Pobiera zmienną środowiskową lub zwraca wartość domyślną
   */
  private getEnvironmentVariable(key: string, defaultValue: string): string {
    // W środowisku przeglądarki sprawdzamy globalny obiekt konfiguracji
    if (typeof window !== 'undefined' && (window as any).ENV) {
      return (window as any).ENV[key] || defaultValue;
    }
    
    // Fallback do wartości domyślnej
    return defaultValue;
  }
}