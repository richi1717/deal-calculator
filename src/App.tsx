import { Routes, Route, Navigate } from 'react-router-dom'
import { SettingsProvider } from './context/settings'
import CalculatorPage from './pages/CalculatorPage'

export default function App() {
  return (
    <SettingsProvider>
      <Routes>
        <Route path="/" element={<CalculatorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SettingsProvider>
  )
}
