'use client'

import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { 
  Accordion, 
  AccordionDetails, 
  AccordionSummary, 
  Box, 
  Card, 
  CardContent, 
  Typography,
  CircularProgress 
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import { fetchCourseData } from '../utils/utils_fetchCourseData'

export function MuiCourseDragDrop() {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourseData().then((data) => {
      setTopics(data)
      setLoading(false)
    })
  }, [])

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result

    if (!destination) return

    let newTopics = [...topics]

    if (type === 'topic') {
      const [reorderedTopic] = newTopics.splice(source.index, 1)
      newTopics.splice(destination.index, 0, reorderedTopic)
    } else if (type === 'category') {
      const [sourceTopicId, sourceContentId] = source.droppableId.split('.')
      const [destTopicId, destContentId] = destination.droppableId.split('.')

      const sourceTopicIndex = newTopics.findIndex(topic => topic.id === sourceTopicId)
      const destTopicIndex = newTopics.findIndex(topic => topic.id === destTopicId)

      const sourceCategories = [...newTopics[sourceTopicIndex].categories]
      const destCategories = sourceTopicIndex === destTopicIndex ? sourceCategories : [...newTopics[destTopicIndex].categories]

      const [movedCategory] = sourceCategories.splice(source.index, 1)
      destCategories.splice(destination.index, 0, movedCategory)

      newTopics[sourceTopicIndex] = { ...newTopics[sourceTopicIndex], categories: sourceCategories }
      if (sourceTopicIndex !== destTopicIndex) {
        newTopics[destTopicIndex] = { ...newTopics[destTopicIndex], categories: destCategories }
      }
    } else if (type === 'lesson') {
      const [sourceTopicId, sourceCategoryId] = source.droppableId.split('.')
      const [destTopicId, destCategoryId] = destination.droppableId.split('.')

      const sourceTopicIndex = newTopics.findIndex(topic => topic.id === sourceTopicId)
      const destTopicIndex = newTopics.findIndex(topic => topic.id === destTopicId)

      const sourceCategoryIndex = newTopics[sourceTopicIndex].categories.findIndex(category => category.id === sourceCategoryId)
      const destCategoryIndex = newTopics[destTopicIndex].categories.findIndex(category => category.id === destCategoryId)

      const sourceLessons = [...newTopics[sourceTopicIndex].categories[sourceCategoryIndex].lessons]
      const destLessons = sourceTopicIndex === destTopicIndex && sourceCategoryIndex === destCategoryIndex
        ? sourceLessons
        : [...newTopics[destTopicIndex].categories[destCategoryIndex].lessons]

      const [movedLesson] = sourceLessons.splice(source.index, 1)
      destLessons.splice(destination.index, 0, movedLesson)

      newTopics[sourceTopicIndex].categories[sourceCategoryIndex].lessons = sourceLessons
      newTopics[destTopicIndex].categories[destCategoryIndex].lessons = destLessons
    }

    setTopics(newTopics)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '800px', margin: 'auto', padding: 2 }}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="topics" type="topic">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {topics.map((topic, index) => (
                <Draggable key={topic.id} draggableId={topic.id} index={index}>
                  {(provided) => (
                    <Accordion
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      sx={{ mb: 1 }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`panel${topic.id}-content`}
                        id={`panel${topic.id}-header`}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Box {...provided.dragHandleProps} sx={{ mr: 1 }}>
                            <DragIndicatorIcon />
                          </Box>
                          <Typography variant="h6">{topic.title}</Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Droppable droppableId={topic.id} type="category">
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps}>
                              {topic.categories.map((category, categoryIndex) => (
                                <Draggable key={category.id} draggableId={category.id} index={categoryIndex}>
                                  {(provided) => (
                                    <Accordion
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      sx={{ mb: 1 }}
                                    >
                                      <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls={`panel${category.id}-content`}
                                        id={`panel${category.id}-header`}
                                      >
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                          <Box {...provided.dragHandleProps} sx={{ mr: 1 }}>
                                            <DragIndicatorIcon />
                                          </Box>
                                          <Typography variant="subtitle1">{category.title}</Typography>
                                        </Box>
                                      </AccordionSummary>
                                      <AccordionDetails>
                                        <Card variant="outlined">
                                          <CardContent>
                                            <Droppable droppableId={`${topic.id}.${category.id}`} type="lesson">
                                              {(provided) => (
                                                <div ref={provided.innerRef} {...provided.droppableProps}>
                                                  {category.lessons.map((lesson, lessonIndex) => (
                                                    <Draggable key={lesson.id} draggableId={lesson.id} index={lessonIndex}>
                                                      {(provided) => (
                                                        <Box
                                                          ref={provided.innerRef}
                                                          {...provided.draggableProps}
                                                          {...provided.dragHandleProps}
                                                          sx={{
                                                            p: 1,
                                                            mb: 1,
                                                            bgcolor: 'background.paper',
                                                            borderRadius: 1,
                                                            border: '1px solid',
                                                            borderColor: 'divider',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                          }}
                                                        >
                                                          <DragIndicatorIcon sx={{ mr: 1 }} />
                                                          <Typography variant="body2">{lesson.title}</Typography>
                                                        </Box>
                                                      )}
                                                    </Draggable>
                                                  ))}
                                                  {provided.placeholder}
                                                </div>
                                              )}
                                            </Droppable>
                                          </CardContent>
                                        </Card>
                                      </AccordionDetails>
                                    </Accordion>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  )
}
