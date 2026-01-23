import { Routes, Route, Navigate } from 'react-router-dom'
import CalculatorPage from './pages/CalculatorPage'

export default function App() {
  return (
    <Routes>
      <Route path="/calc" element={<CalculatorPage />} />
      <Route path="*" element={<Navigate to="/calc" replace />} />
    </Routes>
  )
}
