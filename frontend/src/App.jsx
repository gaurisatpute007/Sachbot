import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import CitizenBot  from './pages/CitizenBot'
import Pipeline    from './pages/Pipeline'
import Dashboard   from './pages/Dashboard'
import ReviewQueue from './pages/ReviewQueue'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index          element={<CitizenBot />} />
        <Route path="pipeline" element={<Pipeline />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="queue"     element={<ReviewQueue />} />
      </Route>
    </Routes>
  )
}
