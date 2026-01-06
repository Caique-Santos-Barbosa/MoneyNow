import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/AuthContext"
import { ErrorBoundary } from "@/components/ErrorBoundary"

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Pages />
        <Toaster />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App 