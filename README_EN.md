# 💪 GymTracker

**Modern application for tracking gym workout progress**

GymTracker is an intuitive web application built with Angular 20 that allows easy tracking of workout progress with Google Sheets integration as a database.

## 🚀 Features

### 📊 Progress Dashboard
- **Interactive charts** - visualization of progress for each exercise
- **Workout statistics** - total number of entries, exercises, weight and average repetitions
- **Trend analysis** - tracking strength and endurance development over time

### 📝 Workout Management
- **Adding workout entries** - recording exercises with repetitions and weight
- **Exercise management** - adding new exercises with categories
- **Intuitive interface** - responsive design adapted for mobile devices

### 🔗 Google Sheets Integration
- **Automatic synchronization** - data stored in Google Sheets
- **Secure configuration** - environment variables protected from committing
- **Offline fallback** - application works with sample data without configuration

## 🛠️ Technologies

- **Frontend**: Angular 20 (Standalone Components)
- **Charts**: Chart.js with ng2-charts
- **Styling**: CSS3 with modern design
- **Backend**: Google Apps Script (optional)
- **Database**: Google Sheets (optional)
- **Tools**: TypeScript, Angular CLI, RxJS

## 📦 Installation

### Requirements
- Node.js (version 18 or newer)
- npm or yarn
- Angular CLI (optional)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gym-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the application**
   ```bash
   npm start
   # or
   ng serve
   ```

4. **Open in browser**
   ```
   http://localhost:4200
   ```

## ⚙️ Configuration

### Basic usage (without Google Sheets)
The application works immediately with sample data. You can:
- Add workout entries
- View progress charts
- Manage exercises

**Note**: Data will be stored only locally in the browser.

### Advanced configuration (with Google Sheets)

To enable synchronization with Google Sheets, follow these steps:

1. **Read the detailed guide**
   ```bash
   # Open the instruction file
   README-Google-Apps-Script.md
   ```

2. **Create configuration file**
   ```bash
   # Copy the template
   cp .env.example .env
   ```

3. **Fill in data in the .env file**
   ```env
   APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   SPREADSHEET_ID=YOUR_SPREADSHEET_ID_HERE
   ```

## 📱 Usage

### Adding a workout entry
1. Go to the **"Add Entry"** tab
2. Select an exercise from the list
3. Enter the number of repetitions and weight
4. Click **"Add Entry"**

### Viewing progress
1. Go to the **"Progress"** tab
2. Browse charts for each exercise
3. Check statistics in the summary section

### Managing exercises
1. Go to the **"Exercises"** tab
2. Click **"Add Exercise"**
3. Enter name and optionally category
4. Click **"Add Exercise"**

## 🏗️ Project Structure

```
gym-tracker/
├── src/
│   ├── components/           # Angular components
│   │   ├── exercise-chart/   # Chart component
│   │   ├── exercise-manager/ # Exercise management
│   │   ├── progress-dashboard/ # Progress dashboard
│   │   └── workout-form/     # Entry form component
│   ├── services/             # Angular services
│   │   └── google-sheets.service.ts # Google Sheets integration
│   ├── models/               # Data models
│   │   └── exercise.model.ts # Type definitions
│   ├── assets/               # Static assets
│   │   └── env.json         # Default configuration
│   ├── env.js               # Environment variables loading
│   ├── global_styles.css    # Global styles
│   ├── index.html           # Main HTML file
│   └── main.ts              # Application entry point
├── google-apps-script/       # Google Apps Script code
│   └── Code.gs              # Backend for Google Sheets
├── .env.example             # Configuration template
├── .gitignore               # Files ignored by Git
├── README-Google-Apps-Script.md # Detailed configuration guide
├── angular.json             # Angular configuration
├── package.json             # npm dependencies
└── tsconfig.json            # TypeScript configuration
```

## 🔧 npm Scripts

```bash
# Run development server
npm start

# Build production application
npm run build

# Run Angular CLI
npm run ng
```

## 🎨 UI/UX Features

- **Responsive design** - works on phones, tablets and computers
- **Modern interface** - clean, minimalist design
- **Intuitive navigation** - tabs with easy switching
- **Animations and transitions** - smooth interactions
- **Accessibility** - WCAG standards compliance

## 📊 Sample Data

The application includes sample exercises:
- Bench Press
- Squat
- Deadlift
- Overhead Press
- Pull-ups

## 🔒 Security

- **Environment variables** - sensitive data in .env file (ignored by Git)
- **Data validation** - checking correctness of entered values
- **Secure API** - HTTPS communication with Google Apps Script

## 🚀 Deployment

### Production build
```bash
npm run build
```

### Hosting
The application can be hosted on:
- **Netlify** - automatic deployments from Git
- **Vercel** - optimization for Angular applications
- **GitHub Pages** - free hosting for open source projects
- **Firebase Hosting** - integration with Google ecosystem

## 🤝 Development

### Adding new features
1. Create new component: `ng generate component component-name`
2. Add routing (if needed)
3. Update services and models
4. Add unit tests

### Component structure
All components use:
- **Standalone Components** - modern Angular organization approach
- **OnPush Change Detection** - performance optimization
- **RxJS Observables** - reactive state management

## 📝 License

This project is available under the MIT license. See the `LICENSE` file for more details.

## 🆘 Support

### Frequently Asked Questions

**Q: Can I use the application without Google Sheets?**
A: Yes! The application works with local data in the browser.

**Q: How to add a new exercise?**
A: Go to the "Exercises" tab and click "Add Exercise".

**Q: Are data synchronized between devices?**
A: Only if you configure Google Sheets integration.

### Troubleshooting

1. **Application won't start**
   - Check Node.js version (required 18+)
   - Remove `node_modules` and run `npm install`

2. **Errors in browser console**
   - Check configuration in `.env` file
   - Make sure Google Apps Script is properly deployed

3. **Data is not being saved**
   - Check internet connection
   - Verify Google Apps Script URL

---

**Created with ❤️ for fitness and programming enthusiasts**