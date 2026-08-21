import './App.css'
import { useSyncExternalStore } from "react"
import { RouterProvider } from "react-router-dom"
import { router } from "../route.tsx"
import { Toaster } from "@/components/ui/sonner"
import PwaStatus from "@/components/pwa/PwaStatus.tsx"

function App() {
  const location = useSyncExternalStore(
    (onStoreChange) => router.subscribe(() => onStoreChange()),
    () => router.state.location,
    () => router.state.location,
  )
  const section = new URLSearchParams(location.search).get("section")
  const isStudentAttendancePage = /^\/course\/[^/]+\/evaluations\/?$/.test(location.pathname)
    && section === "attendance"

  return (
    <>
      <RouterProvider router={router} />
      <PwaStatus visible={isStudentAttendancePage} />
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App
