'use client'

import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { MuiCourseDragDrop } from './components/components_mui-course-drag-drop'

const theme = createTheme()

export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <MuiCourseDragDrop />
      </main>
    </ThemeProvider>
  )
}
