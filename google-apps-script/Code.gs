/**
 * Gym Tracker - Google Apps Script Backend
 * 
 * Ten skrypt obsługuje operacje na danych treningowych w Google Sheets
 * poprzez Web App endpoint, eliminując potrzebę bezpośredniego dostępu do API.
 */

// Konfiguracja arkusza
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Należy zastąpić właściwym ID arkusza
const EXERCISES_SHEET = 'Exercises';
const WORKOUT_ENTRIES_SHEET = 'WorkoutEntries';

/**
 * Główna funkcja obsługująca żądania HTTP
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    switch (action) {
      case 'getExercises':
        return createResponse(getExercises());
      case 'getWorkoutEntries':
        return createResponse(getWorkoutEntries());
      case 'addExercise':
        return createResponse(addExercise(data.exercise));
      case 'updateExercise':
        return createResponse(updateExercise(data.exerciseId, data.updatedExercise));
      case 'deleteExercise':
        return createResponse(deleteExercise(data.exerciseId));
      case 'addWorkoutEntry':
        return createResponse(addWorkoutEntry(data.entry));
      case 'updateWorkoutEntry':
        return createResponse(updateWorkoutEntry(data.entryId, data.updatedEntry));
      case 'deleteWorkoutEntry':
        return createResponse(deleteWorkoutEntry(data.entryId));
      case 'clearAllData':
        return createResponse(clearAllData());
      default:
        throw new Error('Nieznana akcja: ' + action);
    }
  } catch (error) {
    console.error('Błąd w doPost:', error);
    return createErrorResponse(error.message);
  }
}

/**
 * Obsługa żądań OPTIONS dla CORS preflight
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': 'http://localhost:4200',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    });
}

/**
 * Obsługa żądań GET (opcjonalne, dla testowania)
 */
function doGet(e) {
  const action = e.parameter.action;
  
  try {
    switch (action) {
      case 'getExercises':
        return createResponse(getExercises());
      case 'getWorkoutEntries':
        return createResponse(getWorkoutEntries());
      default:
        return createResponse({ message: 'Gym Tracker API działa poprawnie!' });
    }
  } catch (error) {
    console.error('Błąd w doGet:', error);
    return createErrorResponse(error.message);
  }
}

/**
 * Pobiera wszystkie ćwiczenia
 */
function getExercises() {
  const sheet = getSheet(EXERCISES_SHEET);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return initializeDefaultExercises();
  }
  
  const exercises = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][1]) {
      exercises.push({
        id: data[i][0].toString(),
        name: data[i][1]
      });
    }
  }
  
  return exercises;
}

/**
 * Pobiera wszystkie wpisy treningowe
 */
function getWorkoutEntries() {
  const sheet = getSheet(WORKOUT_ENTRIES_SHEET);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return [];
  }
  
  const entries = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      entries.push({
        id: data[i][0].toString(),
        exerciseId: data[i][1].toString(),
        exerciseName: data[i][2],
        repetitions: parseInt(data[i][3]) || 0,
        weight: parseFloat(data[i][4]) || 0,
        date: new Date(data[i][5]).toISOString()
      });
    }
  }
  
  return entries;
}

/**
 * Dodaje nowe ćwiczenie
 */
function addExercise(exercise) {
  const sheet = getSheet(EXERCISES_SHEET);
  const newId = generateId();
  
  sheet.appendRow([newId, exercise.name]);
  
  return {
    id: newId,
    name: exercise.name
  };
}

/**
 * Aktualizuje ćwiczenie
 */
function updateExercise(exerciseId, updatedExercise) {
  const sheet = getSheet(EXERCISES_SHEET);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === exerciseId) {
      if (updatedExercise.name) {
        sheet.getRange(i + 1, 2).setValue(updatedExercise.name);
      }
      return { success: true };
    }
  }
  
  throw new Error('Ćwiczenie nie zostało znalezione');
}

/**
 * Usuwa ćwiczenie i wszystkie powiązane wpisy treningowe
 */
function deleteExercise(exerciseId) {
  const exercisesSheet = getSheet(EXERCISES_SHEET);
  const entriesSheet = getSheet(WORKOUT_ENTRIES_SHEET);
  
  // Usuń ćwiczenie
  const exercisesData = exercisesSheet.getDataRange().getValues();
  for (let i = 1; i < exercisesData.length; i++) {
    if (exercisesData[i][0].toString() === exerciseId) {
      exercisesSheet.deleteRow(i + 1);
      break;
    }
  }
  
  // Usuń wszystkie powiązane wpisy treningowe
  const entriesData = entriesSheet.getDataRange().getValues();
  for (let i = entriesData.length - 1; i >= 1; i--) {
    if (entriesData[i][1].toString() === exerciseId) {
      entriesSheet.deleteRow(i + 1);
    }
  }
  
  return { success: true };
}

/**
 * Dodaje nowy wpis treningowy
 */
function addWorkoutEntry(entry) {
  const sheet = getSheet(WORKOUT_ENTRIES_SHEET);
  const newId = generateId();
  const date = new Date().toISOString();
  
  sheet.appendRow([
    newId,
    entry.exerciseId,
    entry.exerciseName,
    entry.repetitions,
    entry.weight,
    date
  ]);
  
  return {
    id: newId,
    exerciseId: entry.exerciseId,
    exerciseName: entry.exerciseName,
    repetitions: entry.repetitions,
    weight: entry.weight,
    date: date
  };
}

/**
 * Aktualizuje wpis treningowy
 */
function updateWorkoutEntry(entryId, updatedEntry) {
  const sheet = getSheet(WORKOUT_ENTRIES_SHEET);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === entryId) {
      if (updatedEntry.exerciseId !== undefined) {
        sheet.getRange(i + 1, 2).setValue(updatedEntry.exerciseId);
      }
      if (updatedEntry.exerciseName !== undefined) {
        sheet.getRange(i + 1, 3).setValue(updatedEntry.exerciseName);
      }
      if (updatedEntry.repetitions !== undefined) {
        sheet.getRange(i + 1, 4).setValue(updatedEntry.repetitions);
      }
      if (updatedEntry.weight !== undefined) {
        sheet.getRange(i + 1, 5).setValue(updatedEntry.weight);
      }
      return { success: true };
    }
  }
  
  throw new Error('Wpis treningowy nie został znaleziony');
}

/**
 * Usuwa wpis treningowy
 */
function deleteWorkoutEntry(entryId) {
  const sheet = getSheet(WORKOUT_ENTRIES_SHEET);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === entryId) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  
  throw new Error('Wpis treningowy nie został znaleziony');
}

/**
 * Czyści wszystkie dane i przywraca domyślne ćwiczenia
 */
function clearAllData() {
  // Wyczyść wpisy treningowe
  const entriesSheet = getSheet(WORKOUT_ENTRIES_SHEET);
  entriesSheet.clear();
  entriesSheet.appendRow(['ID', 'Exercise ID', 'Exercise Name', 'Repetitions', 'Weight', 'Date']);
  
  // Przywróć domyślne ćwiczenia
  const exercisesSheet = getSheet(EXERCISES_SHEET);
  exercisesSheet.clear();
  exercisesSheet.appendRow(['ID', 'Nazwa']);
  
  const defaultExercises = [
    ['1', 'Wyciskanie sztangi na ławce płaskiej'],
    ['2', 'Przysiad ze sztangą'],
    ['3', 'Martwy ciąg'],
    ['4', 'Wyciskanie sztangi nad głowę'],
    ['5', 'Podciąganie']
  ];
  
  defaultExercises.forEach(exercise => {
    exercisesSheet.appendRow(exercise);
  });
  
  return { success: true };
}

/**
 * Inicjalizuje domyślne ćwiczenia
 */
function initializeDefaultExercises() {
  const sheet = getSheet(EXERCISES_SHEET);
  sheet.clear();
  sheet.appendRow(['ID', 'Nazwa']);
  
  const defaultExercises = [
    { id: '1', name: 'Wyciskanie sztangi na ławce płaskiej' },
    { id: '2', name: 'Przysiad ze sztangą' },
    { id: '3', name: 'Martwy ciąg' },
    { id: '4', name: 'Wyciskanie sztangi nad głowę' },
    { id: '5', name: 'Podciąganie' }
  ];
  
  defaultExercises.forEach(exercise => {
    sheet.appendRow([exercise.id, exercise.name]);
  });
  
  return defaultExercises;
}

/**
 * Pomocnicze funkcje
 */

function getSheet(sheetName) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    
    // Dodaj nagłówki dla nowych arkuszy
    if (sheetName === EXERCISES_SHEET) {
      sheet.appendRow(['ID', 'Nazwa']);
    } else if (sheetName === WORKOUT_ENTRIES_SHEET) {
      sheet.appendRow(['ID', 'Exercise ID', 'Exercise Name', 'Repetitions', 'Weight', 'Date']);
    }
  }
  
  return sheet;
}

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 5);
}

function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, data: data }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': 'http://localhost:4200',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true'
    });
}

function createErrorResponse(message) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: false, error: message }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': 'http://localhost:4200',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true'
    });
}

/**
 * Funkcja testowa - można uruchomić w edytorze Apps Script
 */
function testScript() {
  console.log('Test: Pobieranie ćwiczeń');
  const exercises = getExercises();
  console.log(exercises);
  
  console.log('Test: Pobieranie wpisów treningowych');
  const entries = getWorkoutEntries();
  console.log(entries);
}