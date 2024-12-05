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

interface Lesson {
  id: string;
  order: string;
  title: string;
}

interface Category {
  id: string;
  order: string;
  title: string;
  lessons: Lesson[];
}

interface Topic {
  id: string;
  order: string;
  title: string;
  categories: Category[];
}

export function MuiCourseDragDrop() {
  const [topics, setTopics] = useState<Topic[]>([])
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

    const newTopics = [...topics]

    if (type === 'topic') {
      const [reorderedTopic] = newTopics.splice(source.index, 1)
      newTopics.splice(destination.index, 0, reorderedTopic)
    } else if (type === 'category') {
      const sourceTopicIndex = newTopics.findIndex(t => `topic-${t.id}` === source.droppableId)
      const destTopicIndex = newTopics.findIndex(t => `topic-${t.id}` === destination.droppableId)
      
      const [reorderedCategory] = newTopics[sourceTopicIndex].categories.splice(source.index, 1)
      newTopics[destTopicIndex].categories.splice(destination.index, 0, reorderedCategory)
    } else if (type === 'lesson') {
      const [, sourceTopicId, sourceCategoryId] = source.droppableId.split('-')
      const [, destTopicId, destCategoryId] = destination.droppableId.split('-')

      const sourceTopicIndex = newTopics.findIndex(t => t.id === sourceTopicId)
      const destTopicIndex = newTopics.findIndex(t => t.id === destTopicId)

      const sourceCategoryIndex = newTopics[sourceTopicIndex].categories.findIndex(c => c.id === sourceCategoryId)
      const destCategoryIndex = newTopics[destTopicIndex].categories.findIndex(c => c.id === destCategoryId)

      const [movedLesson] = newTopics[sourceTopicIndex].categories[sourceCategoryIndex].lessons.splice(source.index, 1)
      newTopics[destTopicIndex].categories[destCategoryIndex].lessons.splice(destination.index, 0, movedLesson)
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
  console.log(topics)
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="topics" type="topic">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {topics.map((topic, topicIndex) => (
              <Draggable key={topic.id} draggableId={`topic-${topic.id}`} index={topicIndex}>
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
                      <Droppable droppableId={`topic-${topic.id}`} type="category">
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.droppableProps}>
                            {topic.categories.map((category, categoryIndex) => (
                              <Draggable key={category.id} draggableId={`category-${category.id}`} index={categoryIndex}>
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
                                      <Droppable droppableId={`lesson-${topic.id}-${category.id}`} type="lesson">
                                        {(provided) => (
                                          <div ref={provided.innerRef} {...provided.droppableProps}>
                                            {category.lessons.map((lesson, lessonIndex) => (
                                              <Draggable key={lesson.id} draggableId={`lesson-${lesson.id}`} index={lessonIndex}>
                                                {(provided) => (
                                                  <Card
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    sx={{ mb: 1 }}
                                                  >
                                                    <CardContent>
                                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <DragIndicatorIcon sx={{ mr: 1 }} />
                                                        <Typography variant="body2">{lesson.title}</Typography>
                                                      </Box>
                                                    </CardContent>
                                                  </Card>
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
  )
}
