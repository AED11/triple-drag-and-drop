'use client'

import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { MuiTopicCategoryLessonAccordion } from './components/mui-topic-category-lesson-accordion'

const theme = createTheme()

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <MuiTopicCategoryLessonAccordion />
      </main>
    </ThemeProvider>
  )
}
