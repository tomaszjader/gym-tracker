# Konfiguracja Google Apps Script dla Gym Tracker

Ten przewodnik opisuje jak skonfigurować Google Apps Script do obsługi danych treningowych w aplikacji Gym Tracker.

## Wymagania wstępne

- Konto Google
- Dostęp do Google Sheets
- Dostęp do Google Apps Script (script.google.com)

## Krok 1: Utworzenie Google Sheets

1. Przejdź do [Google Sheets](https://sheets.google.com)
2. Utwórz nowy arkusz kalkulacyjny
3. Nazwij go np. "Gym Tracker Data"
4. Utwórz dwa arkusze (karty):
   - **Exercises** - do przechowywania ćwiczeń
   - **WorkoutEntries** - do przechowywania wpisów treningowych

### Struktura arkusza "Exercises"
W pierwszym wierszu dodaj nagłówki:
- A1: `id`
- B1: `name`

### Struktura arkusza "WorkoutEntries"
W pierwszym wierszu dodaj nagłówki:
- A1: `id`
- B1: `exerciseId`
- C1: `exerciseName`
- D1: `repetitions`
- E1: `weight`
- F1: `date`

## Krok 2: Utworzenie Google Apps Script

1. Przejdź do [Google Apps Script](https://script.google.com)
2. Kliknij "Nowy projekt"
3. Usuń domyślny kod i wklej kod z pliku `google-apps-script/Code.gs`
4. Zapisz projekt (Ctrl+S) i nadaj mu nazwę np. "Gym Tracker API"

## Krok 3: Konfiguracja skryptu

1. W kodzie znajdź linię:
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   ```

2. Zastąp `YOUR_SPREADSHEET_ID_HERE` ID swojego arkusza Google Sheets:
   - Otwórz swój arkusz Google Sheets
   - Skopiuj ID z URL (część między `/d/` a `/edit`)

## Krok 4: Konfiguracja zmiennych środowiskowych w aplikacji

### Bezpieczna konfiguracja (zalecana)

1. **Skopiuj plik .env.example jako .env:**
   ```bash
   cp .env.example .env
   ```

2. **Edytuj plik .env i uzupełnij własnymi danymi:**
   ```
   APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   SPREADSHEET_ID=YOUR_SPREADSHEET_ID_HERE
   ```

3. **Plik .env jest automatycznie ignorowany przez Git** - Twoje klucze nie zostaną przypadkowo commitowane.

### Jak to działa

- Aplikacja najpierw ładuje domyślną konfigurację z `src/assets/env.json`
- Następnie próbuje nadpisać ją zmiennymi z pliku `.env` (jeśli istnieje)
- Plik `env.json` zawiera tylko bezpieczne wartości domyślne i może być commitowany
- Plik `.env` zawiera rzeczywiste klucze i jest ignorowany przez Git

### Struktura plików konfiguracyjnych

```
├── .env                    # Twoje rzeczywiste klucze (NIE commituj!)
├── .env.example           # Szablon z przykładowymi wartościami
└── src/assets/env.json    # Domyślne wartości (bezpieczne do commitowania)
```
   - Przykład: `https://docs.google.com/spreadsheets/d/1ABC123xyz/edit`
   - ID to: `1ABC123xyz`

## Krok 4: Wdrożenie jako Web App

1. W Google Apps Script kliknij "Wdróż" → "Nowe wdrożenie"
2. Wybierz typ: "Aplikacja internetowa"
3. Ustaw konfigurację:
   - **Opis**: "Gym Tracker API"
   - **Wykonaj jako**: "Ja"
   - **Kto ma dostęp**: "Wszyscy"
4. Kliknij "Wdróż"
5. Skopiuj **URL aplikacji internetowej** - będzie potrzebny w następnym kroku

## Krok 5: Konfiguracja aplikacji Angular

1. Otwórz plik `.env` w głównym katalogu projektu
2. Uzupełnij dane konfiguracyjne:
   ```
   # URL do Google Apps Script Web App (skopiowany z kroku 4)
   APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   
   # ID arkusza Google Sheets (opcjonalne - do dokumentacji)
   SPREADSHEET_ID=YOUR_SPREADSHEET_ID_HERE
   ```

3. Zapisz plik `.env`

**Uwaga:** Plik `.env` jest już dodany do `.gitignore`, więc Twoje dane konfiguracyjne nie będą commitowane do repozytorium.

## Krok 6: Testowanie

1. Uruchom aplikację Angular: `ng serve`
2. Sprawdź czy aplikacja łączy się z Google Apps Script
3. Przetestuj podstawowe operacje:
   - Dodawanie ćwiczeń
   - Dodawanie wpisów treningowych
   - Edycję i usuwanie danych

## Rozwiązywanie problemów

### Błąd "Google Apps Script URL nie jest skonfigurowany"
- Sprawdź czy poprawnie uzupełniłeś plik `.env`
- Upewnij się, że URL nie zawiera dodatkowych znaków lub spacji
- Sprawdź czy plik `.env` znajduje się w głównym katalogu projektu

### Błąd "HTTP error! status: 403"
- Sprawdź uprawnienia w Google Apps Script
- Upewnij się, że wdrożenie ma dostęp "Wszyscy"

### Błąd "Spreadsheet not found"
- Sprawdź czy ID arkusza jest poprawne
- Upewnij się, że arkusz jest dostępny dla konta Google używanego w Apps Script

### Dane nie są zapisywane
- Sprawdź czy arkusze mają poprawne nazwy: "Exercises" i "WorkoutEntries"
- Sprawdź czy nagłówki kolumn są poprawnie ustawione

## Aktualizacja skryptu

Jeśli wprowadzisz zmiany w kodzie Google Apps Script:

1. Zapisz zmiany w edytorze
2. Przejdź do "Wdróż" → "Zarządzaj wdrożeniami"
3. Kliknij ikonę ołówka przy istniejącym wdrożeniu
4. Zmień wersję na "Nowa wersja"
5. Kliknij "Wdróż"

## Bezpieczeństwo

- Nie udostępniaj URL aplikacji internetowej publicznie
- Regularnie sprawdzaj logi wykonania w Google Apps Script
- Rozważ ograniczenie dostępu do konkretnych domen w przyszłości

## Wsparcie

W przypadku problemów:
1. Sprawdź logi w Google Apps Script (Wykonanie → Logi)
2. Sprawdź konsolę przeglądarki w aplikacji Angular
3. Upewnij się, że wszystkie kroki konfiguracji zostały wykonane poprawnie