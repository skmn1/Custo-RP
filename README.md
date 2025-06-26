# Staff Scheduler Pro

A modern, responsive React application for managing staff schedules with an intuitive drag-and-drop interface.

## 🚀 Features

- **Weekly Calendar View**: Visual weekly schedule with drag-and-drop shift management
- **Staff Management**: Complete employee profiles with roles, contact info, and hour tracking
- **Real-time Analytics**: Live statistics showing total shifts, hours, and schedule optimization insights
- **Responsive Design**: Fully responsive UI that works seamlessly on desktop, tablet, and mobile devices
- **Modern UI/UX**: Clean, professional interface built with TailwindCSS v4
- **Modular Architecture**: Well-structured codebase following React best practices

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **TailwindCSS v4** - Utility-first CSS framework for styling
- **@dnd-kit** - Modern drag-and-drop library for React
- **date-fns** - Lightweight date utility library
- **PostCSS** - CSS processing tool
- **ESLint** - Code quality and consistency

## 📁 Project Structure

```
scheduler/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── StatCard.jsx
│   │   ├── scheduler/       # Scheduler-specific components
│   │   │   ├── StaffScheduler.jsx
│   │   │   ├── DraggableShift.jsx
│   │   │   ├── EmployeeRow.jsx
│   │   │   ├── CalendarHeader.jsx
│   │   │   ├── StatisticsPanel.jsx
│   │   │   └── AddShiftModal.jsx
│   │   └── Navbar.jsx       # Main navigation
│   ├── pages/
│   │   ├── Dashboard.jsx    # Landing/dashboard page
│   │   └── SchedulerPage.jsx # Main scheduler page
│   ├── hooks/
│   │   ├── useShifts.js     # Shift management logic
│   │   ├── useWeekNavigation.js # Week navigation logic
│   │   └── useDragAndDrop.js # Drag and drop logic
│   ├── utils/
│   │   ├── shiftUtils.js    # Shift calculation utilities
│   │   └── dateUtils.js     # Date formatting utilities
│   ├── data/
│   │   ├── employees.js     # Employee mock data
│   │   └── shifts.js        # Shift mock data
│   ├── constants/
│   │   └── scheduler.js     # App constants and settings
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🏗️ Architecture

The application follows a modular architecture with clear separation of concerns:

### Components
- **UI Components**: Reusable, generic components (`Button`, `Modal`, `StatCard`)
- **Scheduler Components**: Domain-specific components for the scheduling functionality
- **Layout Components**: Navigation and page structure components

### Hooks
- **Custom Hooks**: Encapsulate complex state logic and side effects
- **Separation of Concerns**: Each hook handles a specific aspect of the application

### Utils
- **Pure Functions**: Utility functions for calculations and data transformations
- **Reusable Logic**: Common operations that can be used across components

### Data & Constants
- **Mock Data**: Centralized data management for development and testing
- **Configuration**: App-wide constants and settings

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd scheduler
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🎯 Usage

### Dashboard
- Overview of the scheduling system
- Feature highlights and navigation

### Staff Scheduler
- **Weekly View**: Navigate between weeks using the arrow buttons
- **Employee Management**: View employee details in the left sidebar
- **Drag & Drop**: Drag shifts between employees and days
- **Add Shifts**: Click the "+" button to add new shifts
- **Statistics**: View real-time scheduling statistics

### Key Actions
1. **Navigate Weeks**: Use the left/right arrows in the calendar header
2. **Add Shifts**: Click the "Add Shift" button and fill in the details
3. **Move Shifts**: Drag any shift to reassign it to different employees or days
4. **View Statistics**: Check the statistics panel for scheduling insights

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

### Code Style
- Follow React functional component patterns
- Use custom hooks for complex state logic
- Maintain consistent file and folder naming
- Write descriptive component and function names

### Adding New Features

1. **New Components**: Add to appropriate folder in `src/components/`
2. **New Hooks**: Add to `src/hooks/` following the `use[Feature]` naming convention
3. **New Utilities**: Add to `src/utils/` as pure functions
4. **New Data**: Add to `src/data/` for mock data or constants

## 🌟 Key Features Explained

### Drag and Drop
- Powered by `@dnd-kit` for accessibility and performance
- Supports keyboard navigation and screen readers
- Smooth animations and visual feedback

### Responsive Design
- Mobile-first approach with TailwindCSS
- Collapsible navigation for mobile devices
- Optimized layouts for different screen sizes

### State Management
- Local state with React hooks
- Custom hooks for complex state logic
- Separation of concerns between UI and business logic

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Known Issues

- None currently identified

## 🚀 Future Enhancements

- Backend integration for data persistence
- User authentication and authorization
- Email notifications for schedule changes
- Export schedules to PDF/Excel
- Advanced scheduling algorithms
- Team management features
- Time tracking integration+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
