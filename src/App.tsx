import { Navigate, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DailyForecast } from './pages/DailyForecast';
import { MonthlyCalendar } from './pages/MonthlyCalendar';
import { todayISO } from './utils/date';

export function App() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to={`/day/${todayISO()}`} replace />} />
          <Route path="/day/:date" element={<DailyForecast />} />
          <Route path="/calendar/:year/:month" element={<MonthlyCalendar />} />
          <Route path="*" element={<Navigate to={`/day/${todayISO()}`} replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
