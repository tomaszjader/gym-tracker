# 💪 GymTracker

**Nowoczesna aplikacja do śledzenia postępów treningowych na siłowni**

GymTracker to intuicyjna aplikacja webowa napisana w Angular 20, która pozwala na łatwe śledzenie postępów treningowych z integracją z Google Sheets jako bazą danych.

## 🚀 Funkcjonalności

### 📊 Dashboard postępów
- **Interaktywne wykresy** - wizualizacja postępów dla każdego ćwiczenia
- **Statystyki treningowe** - łączna liczba wpisów, ćwiczeń, ciężaru i średnich powtórzeń
- **Analiza trendów** - śledzenie rozwoju siły i wytrzymałości w czasie

### 📝 Zarządzanie treningami
- **Dodawanie wpisów treningowych** - rejestracja ćwiczeń z liczbą powtórzeń i ciężarem
- **Zarządzanie ćwiczeniami** - dodawanie nowych ćwiczeń z kategoriami
- **Intuicyjny interfejs** - responsywny design dostosowany do urządzeń mobilnych

### 🔗 Integracja z Google Sheets
- **Automatyczna synchronizacja** - dane przechowywane w Google Sheets
- **Bezpieczna konfiguracja** - zmienne środowiskowe chronione przed commitowaniem
- **Offline fallback** - aplikacja działa z przykładowymi danymi bez konfiguracji

## 🛠️ Technologie

- **Frontend**: Angular 20 (Standalone Components)
- **Wykresy**: Chart.js z ng2-charts
- **Stylowanie**: CSS3 z nowoczesnym designem
- **Backend**: Google Apps Script (opcjonalnie)
- **Baza danych**: Google Sheets (opcjonalnie)
- **Narzędzia**: TypeScript, Angular CLI, RxJS

## 📦 Instalacja

### Wymagania
- Node.js (wersja 18 lub nowsza)
- npm lub yarn
- Angular CLI (opcjonalnie)

### Kroki instalacji

1. **Sklonuj repozytorium**
   ```bash
   git clone <repository-url>
   cd gym-tracker
   ```

2. **Zainstaluj zależności**
   ```bash
   npm install
   ```

3. **Uruchom aplikację**
   ```bash
   npm start
   # lub
   ng serve
   ```

4. **Otwórz w przeglądarce**
   ```
   http://localhost:4200
   ```

## ⚙️ Konfiguracja

### Podstawowe użytkowanie (bez Google Sheets)
Aplikacja działa od razu z przykładowymi danymi. Możesz:
- Dodawać wpisy treningowe
- Przeglądać wykresy postępów
- Zarządzać ćwiczeniami

**Uwaga**: Dane będą przechowywane tylko lokalnie w przeglądarce.

### Zaawansowana konfiguracja (z Google Sheets)

Aby włączyć synchronizację z Google Sheets, wykonaj następujące kroki:

1. **Przeczytaj szczegółowy przewodnik**
   ```bash
   # Otwórz plik z instrukcjami
   README-Google-Apps-Script.md
   ```

2. **Utwórz plik konfiguracyjny**
   ```bash
   # Skopiuj szablon
   cp .env.example .env
   ```

3. **Uzupełnij dane w pliku .env**
   ```env
   APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   SPREADSHEET_ID=YOUR_SPREADSHEET_ID_HERE
   ```

## 📱 Użytkowanie

### Dodawanie wpisu treningowego
1. Przejdź do zakładki **"Dodaj wpis"**
2. Wybierz ćwiczenie z listy
3. Wprowadź liczbę powtórzeń i ciężar
4. Kliknij **"Dodaj wpis"**

### Przeglądanie postępów
1. Przejdź do zakładki **"Postępy"**
2. Przeglądaj wykresy dla każdego ćwiczenia
3. Sprawdź statystyki w sekcji podsumowania

### Zarządzanie ćwiczeniami
1. Przejdź do zakładki **"Ćwiczenia"**
2. Kliknij **"Dodaj ćwiczenie"**
3. Wprowadź nazwę i opcjonalnie kategorię
4. Kliknij **"Dodaj ćwiczenie"**

## 🏗️ Struktura projektu

```
gym-tracker/
├── src/
│   ├── components/           # Komponenty Angular
│   │   ├── exercise-chart/   # Komponent wykresów
│   │   ├── exercise-manager/ # Zarządzanie ćwiczeniami
│   │   ├── progress-dashboard/ # Dashboard postępów
│   │   └── workout-form/     # Formularz dodawania wpisów
│   ├── services/             # Usługi Angular
│   │   └── google-sheets.service.ts # Integracja z Google Sheets
│   ├── models/               # Modele danych
│   │   └── exercise.model.ts # Definicje typów
│   ├── assets/               # Zasoby statyczne
│   │   └── env.json         # Konfiguracja domyślna
│   ├── env.js               # Ładowanie zmiennych środowiskowych
│   ├── global_styles.css    # Style globalne
│   ├── index.html           # Główny plik HTML
│   └── main.ts              # Punkt wejścia aplikacji
├── google-apps-script/       # Kod Google Apps Script
│   └── Code.gs              # Backend dla Google Sheets
├── .env.example             # Szablon konfiguracji
├── .gitignore               # Pliki ignorowane przez Git
├── README-Google-Apps-Script.md # Szczegółowy przewodnik konfiguracji
├── angular.json             # Konfiguracja Angular
├── package.json             # Zależności npm
└── tsconfig.json            # Konfiguracja TypeScript
```

## 🔧 Skrypty npm

```bash
# Uruchomienie serwera deweloperskiego
npm start

# Budowanie aplikacji produkcyjnej
npm run build

# Uruchomienie Angular CLI
npm run ng
```

## 🎨 Funkcjonalności UI/UX

- **Responsywny design** - działa na telefonach, tabletach i komputerach
- **Nowoczesny interfejs** - czyste, minimalistyczne wzornictwo
- **Intuicyjna nawigacja** - zakładki z łatwym przełączaniem
- **Animacje i przejścia** - płynne interakcje
- **Dostępność** - zgodność z standardami WCAG

## 📊 Przykładowe dane

Aplikacja zawiera przykładowe ćwiczenia:
- Wyciskanie sztangi na ławce płaskiej
- Przysiad ze sztangą
- Martwy ciąg
- Wyciskanie sztangi nad głowę
- Podciąganie

## 🔒 Bezpieczeństwo

- **Zmienne środowiskowe** - wrażliwe dane w pliku .env (ignorowany przez Git)
- **Walidacja danych** - sprawdzanie poprawności wprowadzanych wartości
- **Bezpieczne API** - komunikacja przez HTTPS z Google Apps Script

## 🚀 Deployment

### Budowanie produkcyjne
```bash
npm run build
```

### Hosting
Aplikację można hostować na:
- **Netlify** - automatyczne deploymenty z Git
- **Vercel** - optymalizacja dla aplikacji Angular
- **GitHub Pages** - darmowy hosting dla projektów open source
- **Firebase Hosting** - integracja z ekosystemem Google

## 🤝 Rozwój

### Dodawanie nowych funkcjonalności
1. Utwórz nowy komponent: `ng generate component nazwa-komponentu`
2. Dodaj routing (jeśli potrzebny)
3. Zaktualizuj serwisy i modele
4. Dodaj testy jednostkowe

### Struktura komponentów
Wszystkie komponenty używają:
- **Standalone Components** - nowoczesny sposób organizacji Angular
- **OnPush Change Detection** - optymalizacja wydajności
- **RxJS Observables** - reaktywne zarządzanie stanem

## 📝 Licencja

Ten projekt jest dostępny na licencji MIT. Zobacz plik `LICENSE` po więcej szczegółów.

## 🆘 Wsparcie

### Często zadawane pytania

**Q: Czy mogę używać aplikacji bez Google Sheets?**
A: Tak! Aplikacja działa z lokalnymi danymi w przeglądarce.

**Q: Jak dodać nowe ćwiczenie?**
A: Przejdź do zakładki "Ćwiczenia" i kliknij "Dodaj ćwiczenie".

**Q: Czy dane są synchronizowane między urządzeniami?**
A: Tylko jeśli skonfigurujesz integrację z Google Sheets.

### Rozwiązywanie problemów

1. **Aplikacja nie uruchamia się**
   - Sprawdź wersję Node.js (wymagana 18+)
   - Usuń `node_modules` i uruchom `npm install`

2. **Błędy w konsoli przeglądarki**
   - Sprawdź konfigurację w pliku `.env`
   - Upewnij się, że Google Apps Script jest poprawnie wdrożony

3. **Dane nie są zapisywane**
   - Sprawdź połączenie internetowe
   - Zweryfikuj URL Google Apps Script

---

**Stworzono z ❤️ dla entuzjastów fitnessu i programowania**