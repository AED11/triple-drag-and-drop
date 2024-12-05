'use client'

import React, { useEffect, useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { 
  Accordion, 
  AccordionDetails, 
  AccordionSummary, 
  Box, 
  Card, 
  CardContent, 
  Typography 
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import axios from 'axios'

interface Lesson {
  id: string
  title: string
}

interface Category {
  id: string
  title: string
  lessons: Lesson[]
}

interface Topic {
  id: string
  title: string
  categories: Category[]
}



export async function MuiTopicCategoryLessonAccordion() {
  const [topics, setTopics] = useState([])

  async function  getTopics() {
    try{
      const {data} = await axios.get("https://online-api.omuz.tj/api/admin/course/2/topics/v1", {headers: {
        "Authorization" : "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL29ubGluZS1hcGkub211ei50ai9hcGkvbG9naW4iLCJpYXQiOjE3MzMyOTgyMjEsImV4cCI6MTczMzczMDIyMSwibmJmIjoxNzMzMjk4MjIxLCJqdGkiOiJuV2wxQTVyTkdpUGszSWdIIiwic3ViIjoiNDIiLCJwcnYiOiIyM2JkNWM4OTQ5ZjYwMGFkYjM5ZTcwMWM0MDA4NzJkYjdhNTk3NmY3IiwidXNlcl90eXBlIjoxLCJpc19waG9uZV92ZXJpZmllZCI6dHJ1ZSwiaXNfZW1haWxfdmVyaWZpZWQiOnRydWUsImVtYWlsIjoic3VwZXJhZG1pbkBnbWFpbC5jb20iLCJuYW1lIjoibnVydWxsbyBzdXBlciBhZG1pbiAifQ.nIc3cEBaWdR_tTW9SAYCCHU_FRn5RpIpR1UzBjLxQwE"
      }})
      setTopics(data?.course_topics_lessons?.topics)
    }catch(error){
      console.log(error)
    }
  }
  console.log(topics)

  useEffect(() => {
    getTopics()
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

      const sourceTopic = newTopics.find(topic => topic.id === sourceTopicId)
      const destTopic = newTopics.find(topic => topic.id === destTopicId)

      if (sourceTopic && destTopic) {
        const sourceCategories = [...sourceTopic.categories]
        const destCategories = sourceTopicId === destTopicId ? sourceCategories : [...destTopic.categories]

        const [movedCategory] = sourceCategories.splice(source.index, 1)
        destCategories.splice(destination.index, 0, movedCategory)

        newTopics = newTopics?.map(topic => {
          if (topic.id === sourceTopicId) {
            return { ...topic, categories: sourceCategories }
          }
          if (topic.id === destTopicId) {
            return { ...topic, categories: destCategories }
          }
          return topic
        })
      }
    } else if (type === 'lesson') {
      const [sourceTopicId, sourceCategoryId] = source.droppableId.split('.')
      const [destTopicId, destCategoryId] = destination.droppableId.split('.')

      const sourceTopic = newTopics.find(topic => topic.id === sourceTopicId)
      const destTopic = newTopics.find(topic => topic.id === destTopicId)

      if (sourceTopic && destTopic) {
        const sourceCategory = sourceTopic.categories.find(category => category.id === sourceCategoryId)
        const destCategory = destTopic.categories.find(category => category.id === destCategoryId)

        if (sourceCategory && destCategory) {
          const sourceLessons = [...sourceCategory.lessons]
          const destLessons = source.droppableId === destination.droppableId ? sourceLessons : [...destCategory.lessons]

          const [movedLesson] = sourceLessons.splice(source.index, 1)
          destLessons.splice(destination.index, 0, movedLesson)

          newTopics = newTopics.map(topic => {
            if (topic.id === sourceTopicId) {
              return {
                ...topic,
                categories: topic.categories.map(category => 
                  category.id === sourceCategoryId ? { ...category, lessons: sourceLessons } : category
                )
              }
            }
            if (topic.id === destTopicId) {
              return {
                ...topic,
                categories: topic.categories.map(category => 
                  category.id === destCategoryId ? { ...category, lessons: destLessons } : category
                )
              }
            }
            return topic
          })
        }
      }
    }

    setTopics(newTopics)
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '800px', margin: 'auto', padding: 2 }}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="topics" type="topic">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {topics?.map((topic, index) => (
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
                          <Typography variant="h6">{topic?.topic_name}</Typography>
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
                                          <Typography variant="subtitle1">{category.name}</Typography>
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
                                                          <Typography variant="body2">{lesson.name}</Typography>
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
