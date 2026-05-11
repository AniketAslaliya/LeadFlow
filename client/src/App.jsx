import { Toaster } from 'react-hot-toast'
import LeadList from './components/LeadList.jsx'

export default function App() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-[var(--text-primary)]">
      <LeadList />
      <Toaster
        toastOptions={{
          className: '',
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          },
        }}
      />
    </div>
  )
}
