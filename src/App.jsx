import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { AuthProvider } from "@/contexts/AuthContext"
import { ErrorBoundary } from "@/components/ErrorBoundary"

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
      <Pages />
      <Toaster />
      <SonnerToaster 
        position="top-right"
        expand={false}
        richColors
        closeButton
      />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App 