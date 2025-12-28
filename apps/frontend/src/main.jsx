import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext'
import { RoomProvider } from './context/RoomContext'
import {MusicProvider} from './context/MusicContext.jsx'

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <ThemeProvider>
        <MusicProvider>
        <AuthProvider>
          <RoomProvider>
            <App />
          </RoomProvider>
        </AuthProvider>
        </MusicProvider>
      </ThemeProvider>
    </BrowserRouter>
)
