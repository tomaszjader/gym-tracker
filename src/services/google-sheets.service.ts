import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Exercise, WorkoutEntry } from '../models/exercise.model';
import { google } from 'googleapis';

@Injectable({
  providedIn: 'root'
})
export class GoogleSheetsService {
  private readonly SHEET_ID = 'your-sheet-id-here'; // User will need to configure this
  private readonly API_KEY = 'your-api-key-here'; // User will need to configure this
  private sheets: any;
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

  async addExercise(exercise: Omit<Exercise, 'id'>): Promise<void> {
    const exercises = this.exercisesSubject.value;
    const newExercise: Exercise = {
      id: Date.now().toString(),
      ...exercise
    };
    
    // Aktualizuj lokalnie
    this.exercisesSubject.next([...exercises, newExercise]);
    
    // Zapisz do Google Sheets
    try {
      await this.appendToSheet('Exercises!A:B', [[newExercise.id, newExercise.name]]);
    } catch (error) {
      console.error('Błąd podczas dodawania ćwiczenia do arkusza:', error);
      // Rollback lokalnej zmiany w przypadku błędu
      this.exercisesSubject.next(exercises);
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
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex] = {
      ...updatedExercises[exerciseIndex],
      ...updatedExercise
    };
    
    // Aktualizuj lokalnie
    this.exercisesSubject.next(updatedExercises);
    
    // Zapisz do Google Sheets
    try {
      const allExercisesData = updatedExercises.map(ex => [ex.id, ex.name]);
      await this.writeToSheet('Exercises!A:B', [['ID', 'Nazwa'], ...allExercisesData]);
    } catch (error) {
      console.error('Błąd podczas aktualizacji ćwiczenia w arkuszu:', error);
      // Rollback lokalnej zmiany
      this.exercisesSubject.next(oldExercises);
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
    
    // Usuń ćwiczenie lokalnie
    const updatedExercises = exercises.filter(ex => ex.id !== exerciseId);
    this.exercisesSubject.next(updatedExercises);
    
    // Usuń wszystkie powiązane wpisy treningowe lokalnie
    const updatedEntries = this.workoutEntriesSubject.value.filter(entry => entry.exerciseId !== exerciseId);
    this.workoutEntriesSubject.next(updatedEntries);
    
    // Zapisz do Google Sheets
    try {
      const exercisesData = updatedExercises.map(ex => [ex.id, ex.name]);
      await this.writeToSheet('Exercises!A:B', [['ID', 'Nazwa'], ...exercisesData]);
      
      const entriesData = updatedEntries.map(entry => [
        entry.id, entry.exerciseId, entry.exerciseName, 
        entry.repetitions, entry.weight, entry.date.toISOString()
      ]);
      await this.writeToSheet('WorkoutEntries!A:F', [
        ['ID', 'Exercise ID', 'Exercise Name', 'Repetitions', 'Weight', 'Date'], 
        ...entriesData
      ]);
    } catch (error) {
      console.error('Błąd podczas usuwania ćwiczenia z arkusza:', error);
      // Rollback lokalnych zmian
      this.exercisesSubject.next(oldExercises);
      this.workoutEntriesSubject.next(oldEntries);
      throw error;
    }
  }

  async addWorkoutEntry(entry: Omit<WorkoutEntry, 'id' | 'date'>): Promise<void> {
    const entries = this.workoutEntriesSubject.value;
    const newEntry: WorkoutEntry = {
      id: Date.now().toString(),
      ...entry,
      date: new Date()
    };
    
    // Aktualizuj lokalnie
    this.workoutEntriesSubject.next([...entries, newEntry]);
    
    // Zapisz do Google Sheets
    try {
      await this.appendToSheet('WorkoutEntries!A:F', [[
        newEntry.id, newEntry.exerciseId, newEntry.exerciseName,
        newEntry.repetitions, newEntry.weight, newEntry.date.toISOString()
      ]]);
    } catch (error) {
      console.error('Błąd podczas dodawania wpisu treningowego do arkusza:', error);
      // Rollback lokalnej zmiany
      this.workoutEntriesSubject.next(entries);
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
    const updatedEntries = [...entries];
    updatedEntries[entryIndex] = {
      ...updatedEntries[entryIndex],
      ...updatedEntry
    };
    
    // Aktualizuj lokalnie
    this.workoutEntriesSubject.next(updatedEntries);
    
    // Zapisz do Google Sheets
    try {
      const entriesData = updatedEntries.map(entry => [
        entry.id, entry.exerciseId, entry.exerciseName,
        entry.repetitions, entry.weight, entry.date.toISOString()
      ]);
      await this.writeToSheet('WorkoutEntries!A:F', [
        ['ID', 'Exercise ID', 'Exercise Name', 'Repetitions', 'Weight', 'Date'],
        ...entriesData
      ]);
    } catch (error) {
      console.error('Błąd podczas aktualizacji wpisu treningowego w arkuszu:', error);
      // Rollback lokalnej zmiany
      this.workoutEntriesSubject.next(oldEntries);
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
    const updatedEntries = entries.filter(entry => entry.id !== entryId);
    
    // Aktualizuj lokalnie
    this.workoutEntriesSubject.next(updatedEntries);
    
    // Zapisz do Google Sheets
    try {
      const entriesData = updatedEntries.map(entry => [
        entry.id, entry.exerciseId, entry.exerciseName,
        entry.repetitions, entry.weight, entry.date.toISOString()
      ]);
      await this.writeToSheet('WorkoutEntries!A:F', [
        ['ID', 'Exercise ID', 'Exercise Name', 'Repetitions', 'Weight', 'Date'],
        ...entriesData
      ]);
    } catch (error) {
      console.error('Błąd podczas usuwania wpisu treningowego z arkusza:', error);
      // Rollback lokalnej zmiany
      this.workoutEntriesSubject.next(oldEntries);
      throw error;
    }
  }

  async clearAllData(): Promise<void> {
    const oldExercises = [...this.exercisesSubject.value];
    const oldEntries = [...this.workoutEntriesSubject.value];
    
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
    
    // Zapisz do Google Sheets
    try {
      // Wyczyść wpisy treningowe w arkuszu
      await this.writeToSheet('WorkoutEntries!A:F', [
        ['ID', 'Exercise ID', 'Exercise Name', 'Repetitions', 'Weight', 'Date']
      ]);
      
      // Przywróć domyślne ćwiczenia w arkuszu
      const exercisesData = defaultExercises.map(ex => [ex.id, ex.name]);
      await this.writeToSheet('Exercises!A:B', [['ID', 'Nazwa'], ...exercisesData]);
    } catch (error) {
      console.error('Błąd podczas czyszczenia danych w arkuszu:', error);
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

  getWorkoutEntryById(entryId: string): WorkoutEntry | null {
    return this.workoutEntriesSubject.value.find(entry => entry.id === entryId) || null;
  }
  // Implementacja Google Sheets API integration methods
  private async initializeGoogleSheets(): Promise<void> {
    try {
      if (this.isInitialized) return;
      
      // Sprawdź czy konfiguracja jest ustawiona
      if (this.SHEET_ID === 'your-sheet-id-here' || this.API_KEY === 'your-api-key-here') {
        console.warn('Google Sheets API nie jest skonfigurowane. Używam trybu lokalnego.');
        return;
      }

      // Inicjalizuj Google Sheets API
      const auth = new google.auth.GoogleAuth({
        keyFile: './credentials.json', // Ścieżka do pliku z kluczami
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      this.isInitialized = true;
      
      console.log('Google Sheets API zostało zainicjalizowane pomyślnie');
      
      // Załaduj dane z arkusza przy inicjalizacji
      await this.loadDataFromSheets();
      
    } catch (error) {
      console.error('Błąd podczas inicjalizacji Google Sheets API:', error);
      throw new Error('Nie udało się połączyć z Google Sheets API');
    }
  }

  private async loadDataFromSheets(): Promise<void> {
    try {
      // Załaduj ćwiczenia
      const exercisesData = await this.readFromSheet('Exercises!A:B');
      if (exercisesData && exercisesData.length > 1) {
        const exercises: Exercise[] = exercisesData.slice(1).map((row: any[], index: number) => ({
          id: (index + 1).toString(),
          name: row[1] || ''
        }));
        this.exercisesSubject.next(exercises);
      }

      // Załaduj wpisy treningowe
      const entriesData = await this.readFromSheet('WorkoutEntries!A:F');
      if (entriesData && entriesData.length > 1) {
        const entries: WorkoutEntry[] = entriesData.slice(1).map((row: any[]) => ({
          id: row[0] || '',
          exerciseId: row[1] || '',
          exerciseName: row[2] || '',
          repetitions: parseInt(row[3]) || 0,
          weight: parseFloat(row[4]) || 0,
          date: new Date(row[5]) || new Date()
        }));
        this.workoutEntriesSubject.next(entries);
      }
    } catch (error) {
      console.error('Błąd podczas ładowania danych z arkusza:', error);
    }
  }

  private async retryApiCall<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // Nie ponawiaj dla błędów autoryzacji lub nieprawidłowych danych
        if (error?.code === 401 || error?.code === 403 || error?.code === 400) {
          throw error;
        }
        
        if (attempt === maxRetries) {
          break;
        }
        
        console.warn(`Próba ${attempt}/${maxRetries} nieudana. Ponawiam za ${delay}ms...`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
    
    throw new Error(`Operacja nie powiodła się po ${maxRetries} próbach. Ostatni błąd: ${lastError?.message || 'Nieznany błąd'}`);
  }

  private async readFromSheet(range: string): Promise<any[][] | null> {
    try {
      if (!this.isInitialized) {
        await this.initializeGoogleSheets();
      }

      if (!this.sheets) {
        console.warn('Google Sheets API nie jest dostępne. Zwracam null.');
        return null;
      }

      return await this.retryApiCall(async () => {
        const response = await this.sheets.spreadsheets.values.get({
          spreadsheetId: this.SHEET_ID,
          range: range,
        });
        return response.data.values || [];
      });
    } catch (error: any) {
      console.error(`Błąd podczas odczytu z arkusza (${range}):`, error);
      
      // Sprawdź czy to błąd konfiguracji
      if (error?.code === 404) {
        throw new Error(`Arkusz o ID ${this.SHEET_ID} nie został znaleziony. Sprawdź konfigurację.`);
      } else if (error?.code === 403) {
        throw new Error(`Brak uprawnień do arkusza. Sprawdź uprawnienia API.`);
      } else if (error?.code === 401) {
        throw new Error(`Błąd autoryzacji. Sprawdź klucze API.`);
      }
      
      throw new Error(`Nie udało się odczytać danych z zakresu ${range}: ${error.message}`);
    }
  }

  private async writeToSheet(range: string, values: any[][]): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initializeGoogleSheets();
      }

      if (!this.sheets) {
        console.warn('Google Sheets API nie jest dostępne. Pomijam zapis.');
        return;
      }

      await this.retryApiCall(async () => {
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.SHEET_ID,
          range: range,
          valueInputOption: 'RAW',
          requestBody: {
            values: values,
          },
        });
      });

      console.log(`Dane zostały zapisane do zakresu ${range}`);
    } catch (error: any) {
      console.error(`Błąd podczas zapisu do arkusza (${range}):`, error);
      
      if (error?.code === 404) {
        throw new Error(`Arkusz o ID ${this.SHEET_ID} nie został znaleziony. Sprawdź konfigurację.`);
      } else if (error?.code === 403) {
        throw new Error(`Brak uprawnień do zapisu w arkuszu. Sprawdź uprawnienia API.`);
      } else if (error?.code === 401) {
        throw new Error(`Błąd autoryzacji. Sprawdź klucze API.`);
      }
      
      throw new Error(`Nie udało się zapisać danych do zakresu ${range}: ${error.message}`);
    }
  }

  private async appendToSheet(range: string, values: any[][]): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initializeGoogleSheets();
      }

      if (!this.sheets) {
        console.warn('Google Sheets API nie jest dostępne. Pomijam dodawanie.');
        return;
      }

      await this.retryApiCall(async () => {
        await this.sheets.spreadsheets.values.append({
          spreadsheetId: this.SHEET_ID,
          range: range,
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          requestBody: {
            values: values,
          },
        });
      });

      console.log(`Dane zostały dodane do zakresu ${range}`);
    } catch (error: any) {
      console.error(`Błąd podczas dodawania do arkusza (${range}):`, error);
      
      if (error?.code === 404) {
        throw new Error(`Arkusz o ID ${this.SHEET_ID} nie został znaleziony. Sprawdź konfigurację.`);
      } else if (error?.code === 403) {
        throw new Error(`Brak uprawnień do dodawania w arkuszu. Sprawdź uprawnienia API.`);
      } else if (error?.code === 401) {
        throw new Error(`Błąd autoryzacji. Sprawdź klucze API.`);
      }
      
      throw new Error(`Nie udało się dodać danych do zakresu ${range}: ${error.message}`);
    }
  }
}