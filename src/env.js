/**
 * Skrypt do ładowania zmiennych środowiskowych
 * Ten plik jest ładowany przed uruchomieniem aplikacji Angular
 */

// Funkcja do ładowania zmiennych środowiskowych
async function loadEnvironmentVariables() {
  try {
    // Załaduj domyślną konfigurację z pliku JSON
    const configResponse = await fetch('/assets/env.json');
    let config = {};
    
    if (configResponse.ok) {
      config = await configResponse.json();
      console.log('Załadowano domyślną konfigurację z env.json');
    } else {
      console.warn('Nie można załadować pliku env.json, używam wartości domyślnych');
      config = {
        APPS_SCRIPT_URL: 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE',
        SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE'
      };
    }
    
    // Próbuj nadpisać konfigurację zmiennymi z pliku .env (jeśli istnieje)
    try {
      const envResponse = await fetch('/.env');
      if (envResponse.ok) {
        const envText = await envResponse.text();
        
        // Parsuj plik .env i nadpisz konfigurację
        envText.split('\n').forEach(line => {
          line = line.trim();
          if (line && !line.startsWith('#') && line.includes('=')) {
            const [key, ...valueParts] = line.split('=');
            const value = valueParts.join('=').trim();
            config[key.trim()] = value;
          }
        });
        
        console.log('Konfiguracja nadpisana zmiennymi z pliku .env');
      }
    } catch (envError) {
      console.log('Plik .env nie jest dostępny, używam tylko konfiguracji z env.json');
    }
    
    window.ENV = config;
    console.log('Zmienne środowiskowe załadowane:', Object.keys(window.ENV));
    
  } catch (error) {
    console.error('Błąd podczas ładowania konfiguracji:', error);
    // Ostateczny fallback
    window.ENV = {
      APPS_SCRIPT_URL: 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE',
      SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE'
    };
    console.log('Używam awaryjnych wartości domyślnych');
  }
}

// Załaduj zmienne środowiskowe
loadEnvironmentVariables();