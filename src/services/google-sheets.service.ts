import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Exercise, WorkoutEntry } from '../models/exercise.model';

@Injectable({
  providedIn: 'root'
})
export class GoogleSheetsService {
  private readonly SHEET_ID = 'your-sheet-id-here'; // User will need to configure this
  private readonly API_KEY = 'your-api-key-here'; // User will need to configure this
  
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
    this.loadMockData();
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

  addExercise(exercise: Omit<Exercise, 'id'>): void {
    const exercises = this.exercisesSubject.value;
    const newExercise: Exercise = {
      id: Date.now().toString(),
      ...exercise
    };
    
    this.exercisesSubject.next([...exercises, newExercise]);
    // TODO: Integrate with Google Sheets API
  }

  addWorkoutEntry(entry: Omit<WorkoutEntry, 'id' | 'date'>): void {
    const entries = this.workoutEntriesSubject.value;
    const newEntry: WorkoutEntry = {
      id: Date.now().toString(),
      ...entry,
      date: new Date()
    };
    
    this.workoutEntriesSubject.next([...entries, newEntry]);
    // TODO: Integrate with Google Sheets API
  }

  getEntriesForExercise(exerciseId: string): WorkoutEntry[] {
    return this.workoutEntriesSubject.value
      .filter(entry => entry.exerciseId === exerciseId)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  deleteWorkoutEntry(entryId: string): void {
    const entries = this.workoutEntriesSubject.value;
    this.workoutEntriesSubject.next(entries.filter(entry => entry.id !== entryId));
    // TODO: Integrate with Google Sheets API
  }

  // TODO: Implement Google Sheets API integration methods
  private async initializeGoogleSheets() {
    // Implementation for Google Sheets API initialization
  }

  private async readFromSheet(range: string) {
    // Implementation for reading from Google Sheets
  }

  private async writeToSheet(range: string, values: any[][]) {
    // Implementation for writing to Google Sheets
  }
}