"use client"

import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { ChevronDown, ChevronRight, Play, GripVertical } from 'lucide-react'
import { Accordion, AccordionDetails, AccordionSummary, Button } from '@mui/material'


interface Lesson {
  id: string;
  order: number;
  title: string;
}

interface Category {
  id: string;
  order: number;
  title: string;
  lessons: Lesson[];
}

interface Topic {
  id: string;
  order: number;
  title: string;
  categories: Category[];
}

export async function fetchCourseData(): Promise<Topic[]> {
  try {
    const response = await fetch('https://testonline-api.omuz.tj/api/admin/course/2/topics/v1', {
      headers: {
        authorization:
          "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL29ubGluZS1hcGkub211ei50ai9hcGkvbG9naW4iLCJpYXQiOjE3MzMyOTgyMjEsImV4cCI6MTczMzczMDIyMSwibmJmIjoxNzMzMjk4MjIxLCJqdGkiOiJuV2wxQTVyTkdpUGszSWdIIiwic3ViIjoiNDIiLCJwcnYiOiIyM2JkNWM4OTQ5ZjYwMGFkYjM5ZTcwMWM0MDA4NzJkYjdhNTk3NmY3IiwidXNlcl90eXBlIjoxLCJpc19waG9uZV92ZXJpZmllZCI6dHJ1ZSwiaXNfZW1haWxfdmVyaWZpZWQiOnRydWUsImVtYWlsIjoic3VwZXJhZG1pbkBnbWFpbC5jb20iLCJuYW1lIjoibnVydWxsbyBzdXBlciBhZG1pbiAifQ.nIc3cEBaWdR_tTW9SAYCCHU_FRn5RpIpR1UzBjLxQwE",
      },
    });
    const data = await response.json();

    return data.course_topics_lessons.topics.map((topic: any, topicIndex: number) => ({
      id: `topic-${topic.id}`,
      order: topicIndex,
      title: topic.topic_name,
      categories: topic.categories.map((category: any, categoryIndex: number) => ({
        id: `category-${category.id}`,
        order: categoryIndex,
        title: category.name,
        lessons: category.lessons.map((lesson: any, lessonIndex: number) => ({
          id: `lesson-${lesson.id}`,
          order: lessonIndex,
          title: lesson.name,
        })),
      })),
    }));
  } catch (error) {
    console.error('Error fetching course data:', error);
    return [];
  }
}

export async function saveCourseData(topics: Topic[]): Promise<void> {
  try {
    const response = await fetch('https://testonline-api.omuz.tj/api/admin/course/2/topics/v1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        authorization:
          "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL29ubGluZS1hcGkub211ei50ai9hcGkvbG9naW4iLCJpYXQiOjE3MzMyOTgyMjEsImV4cCI6MTczMzczMDIyMSwibmJmIjoxNzMzMjk4MjIxLCJqdGkiOiJuV2wxQTVyTkdpUGszSWdIIiwic3ViIjoiNDIiLCJwcnYiOiIyM2JkNWM4OTQ5ZjYwMGFkYjM5ZTcwMWM0MDA4NzJkYjdhNTk3NmY3IiwidXNlcl90eXBlIjoxLCJpc19waG9uZV92ZXJpZmllZCI6dHJ1ZSwiaXNfZW1haWxfdmVyaWZpZWQiOnRydWUsImVtYWlsIjoic3VwZXJhZG1pbkBnbWFpbC5jb20iLCJuYW1lIjoibnVydWxsbyBzdXBlciBhZG1pbiAifQ.nIc3cEBaWdR_tTW9SAYCCHU_FRn5RpIpR1UzBjLxQwE",
      },
      body: JSON.stringify({
        topics: topics.map(topic => ({
          id: topic.id.split('-')[1],
          order: topic.order,
          topic_name: topic.title,
          categories: topic.categories.map(category => ({
            id: category.id.split('-')[1],
            order: category.order,
            name: category.title,
            lessons: category.lessons.map(lesson => ({
              id: lesson.id.split('-')[1],
              order: lesson.order,
              name: lesson.title,
            })),
          })),
        })),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save course data');
    }
  } catch (error) {
    console.error('Error saving course data:', error);
    throw error;
  }
}

export default function CourseStructure() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        const data = await fetchCourseData();
        setTopics(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load course data. Please try again later.');
        setLoading(false);
      }
    };

    loadCourseData();
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    let newTopics = JSON.parse(JSON.stringify(topics)) as Topic[];

    if (type === 'topic') {
      const [reorderedTopic] = newTopics.splice(source.index, 1);
      newTopics.splice(destination.index, 0, reorderedTopic);
      newTopics = newTopics.map((topic, index) => ({ ...topic, order: index }));
    } else if (type === 'category') {
      const sourceTopicIndex = newTopics.findIndex(t => t.id === source.droppableId);
      const destTopicIndex = newTopics.findIndex(t => t.id === destination.droppableId);
      
      if (sourceTopicIndex !== -1 && destTopicIndex !== -1) {
        const [reorderedCategory] = newTopics[sourceTopicIndex].categories.splice(source.index, 1);
        newTopics[destTopicIndex].categories.splice(destination.index, 0, reorderedCategory);
        newTopics[destTopicIndex].categories = newTopics[destTopicIndex].categories.map((category, index) => ({ ...category, order: index }));
      }
    } else if (type === 'lesson') {
      const [, sourceTopicId, sourceCategoryId] = source.droppableId.split('-');
      const [, destTopicId, destCategoryId] = destination.droppableId.split('-');
      
      const sourceTopicIndex = newTopics.findIndex(t => t.id === `topic-${sourceTopicId}`);
      const destTopicIndex = newTopics.findIndex(t => t.id === `topic-${destTopicId}`);
      
      if (sourceTopicIndex !== -1 && destTopicIndex !== -1) {
        const sourceCategoryIndex = newTopics[sourceTopicIndex].categories.findIndex(c => c.id === `category-${sourceCategoryId}`);
        const destCategoryIndex = newTopics[destTopicIndex].categories.findIndex(c => c.id === `category-${destCategoryId}`);
        
        if (sourceCategoryIndex !== -1 && destCategoryIndex !== -1) {
          const [movedLesson] = newTopics[sourceTopicIndex].categories[sourceCategoryIndex].lessons.splice(source.index, 1);
          newTopics[destTopicIndex].categories[destCategoryIndex].lessons.splice(destination.index, 0, movedLesson);
          
          // Update lesson orders
          newTopics[sourceTopicIndex].categories[sourceCategoryIndex].lessons = newTopics[sourceTopicIndex].categories[sourceCategoryIndex].lessons.map((lesson, index) => ({ ...lesson, order: index }));
          newTopics[destTopicIndex].categories[destCategoryIndex].lessons = newTopics[destTopicIndex].categories[destCategoryIndex].lessons.map((lesson, index) => ({ ...lesson, order: index }));
        }
      }
    }

    setTopics(newTopics);
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await saveCourseData(topics);
      setSaveStatus('success');
    } catch (error) {
      setSaveStatus('error');
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading course structure...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">C++ Course Structure</h1>
          <Button onClick={handleSave} disabled={saveStatus === 'saving'}>
            {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
        {saveStatus === 'success' && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">Changes saved successfully.</span>
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">Failed to save changes. Please try again.</span>
          </div>
        )}
        <Droppable droppableId="topics" type="topic">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {topics.map((topic, topicIndex) => (
                <Draggable key={topic.id} draggableId={topic.id} index={topicIndex}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="mb-4"
                    >
                      <Accordion type="single" collapsible>
                          <AccordionSummary className="flex items-center">
                            <div {...provided.dragHandleProps} className="mr-2">
                              <GripVertical className="w-5 h-5" />
                            </div>
                            <span className="font-semibold">{topic.title}</span>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Droppable droppableId={topic.id} type="category">
                              {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef}>
                                  {topic.categories.map((category, categoryIndex) => (
                                    <Draggable key={category.id} draggableId={category.id} index={categoryIndex}>
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          className="ml-4 mt-2"
                                        >
                                          <Accordion>
                                              <AccordionSummary className="flex items-center">
                                                <div {...provided.dragHandleProps} className="mr-2">
                                                  <GripVertical className="w-4 h-4" />
                                                </div>
                                                <span className="font-medium">{category.title}</span>
                                              </AccordionSummary>
                                              <AccordionDetails>
                                                <Droppable droppableId={`lesson-${topic.id}-${category.id}`} type="lesson">
                                                  {(provided) => (
                                                    <ul
                                                      {...provided.droppableProps}
                                                      ref={provided.innerRef}
                                                      className="ml-8 space-y-2"
                                                    >
                                                      {category.lessons.map((lesson, lessonIndex) => (
                                                        <Draggable key={lesson.id} draggableId={lesson.id} index={lessonIndex}>
                                                          {(provided) => (
                                                            <li
                                                              ref={provided.innerRef}
                                                              {...provided.draggableProps}
                                                              className="flex items-center space-x-2 bg-white p-2 rounded shadow-sm"
                                                            >
                                                              <div {...provided.dragHandleProps} className="mr-2">
                                                                <GripVertical className="w-4 h-4" />
                                                              </div>
                                                              <Play className="w-4 h-4 text-blue-500" />
                                                              <span>{lesson.title}</span>
                                                            </li>
                                                          )}
                                                        </Draggable>
                                                      ))}
                                                      {provided.placeholder}
                                                    </ul>
                                                  )}
                                                </Droppable>
                                              </AccordionDetails>
                                          </Accordion>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                            </AccordionDetails>
                      </Accordion>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  )
}

