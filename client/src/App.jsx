import { Toaster } from 'react-hot-toast'
import LeadList from './components/LeadList.jsx'

export default function App() {
  return (
    <div className="app-shell flex min-h-dvh flex-col text-[var(--text-primary)]">
      <LeadList />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3200,
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-strong)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)',
            fontSize: '14px',
            fontFamily: 'var(--font-sans)',
          },
          success: {
            iconTheme: { primary: 'var(--accent)', secondary: '#0c0d12' },
          },
        }}
      />
    </div>
  )
}
