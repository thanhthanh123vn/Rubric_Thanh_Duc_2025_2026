import './App.css'
import { RouterProvider } from "react-router-dom"
import { router } from "../route"
import { Toaster } from "@/components/ui/sonner"

const App: React.FC = () => {
    return (
        <>
            <RouterProvider router={router} />
            <Toaster position="top-right" richColors />
        </>
    )
}

export default App