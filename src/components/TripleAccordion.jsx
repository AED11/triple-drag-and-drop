import React, { useState, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  List,
  ListItem,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import { DraggableItem } from './DraggableItem';
import { CategoryList } from './CategoryList';
import { findItemById, updateOrderIds, formatOrder, createNewItem, getItemType } from '../utils/accordionUtils';

function TripleAccordion({ initialData }) {
  const [data, setData] = useState(initialData);
  const [activeId, setActiveId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState('lesson');
  const [parentId, setParentId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sendDataToBackend = useCallback(async (newData) => {
    setIsLoading(true);
    const lessonsOrder = formatOrder(newData);
    const categoriesOrder = formatOrder(newData.flatMap(lesson => lesson.categories || []));
    const topicsOrder = formatOrder(newData.flatMap(lesson =>
      (lesson.categories || []).flatMap(category => category.topics || [])
    ));

    try {
      const response = await fetch('/api/save-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessons: lessonsOrder,
          categories: categoriesOrder,
          topics: topicsOrder,
        }),
      });

      if (response.ok) {
        setSnackbarMessage('Changes saved successfully');
        setSnackbarOpen(true);
      } else {
        throw new Error('Failed to save changes');
      }
    } catch (error) {
      console.error('Error sending data:', error);
      setSnackbarMessage('Failed to save changes. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setData((prevData) => {
        const newData = JSON.parse(JSON.stringify(prevData));

        const [draggedItem, dragParentLesson, dragParentCategory] = findItemById(newData, active.id);
        const [overItem, overParentLesson, overParentCategory] = findItemById(newData, over.id);

        if (!draggedItem || !overItem) return newData;

        const draggedItemType = getItemType(draggedItem);
        const overItemType = getItemType(overItem);

        // Remove the dragged item from its original position
        if (draggedItemType === 'lesson') {
          const index = newData.findIndex((lesson) => lesson.id === active.id);
          if (index !== -1) newData.splice(index, 1);
        } else if (draggedItemType === 'category' && dragParentLesson) {
          const index = dragParentLesson.categories?.findIndex((category) => category.id === active.id) ?? -1;
          if (index !== -1) dragParentLesson.categories?.splice(index, 1);
        } else if (draggedItemType === 'topic' && dragParentCategory) {
          const index = dragParentCategory.topics?.findIndex((topic) => topic.id === active.id) ?? -1;
          if (index !== -1) dragParentCategory.topics?.splice(index, 1);
        }

        // Add the dragged item to its new position
        if (overItemType === 'lesson') {
          if (draggedItemType === 'lesson') {
            const index = newData.findIndex((lesson) => lesson.id === over.id);
            newData.splice(index, 0, draggedItem);
          } else if (draggedItemType === 'category') {
            overItem.categories = overItem.categories || [];
            overItem.categories.push(draggedItem);
          }
        } else if (overItemType === 'category') {
          if (draggedItemType === 'category' && overParentLesson) {
            const index = overParentLesson.categories?.findIndex((category) => category.id === over.id) ?? -1;
            if (index !== -1) overParentLesson.categories?.splice(index, 0, draggedItem);
          } else if (draggedItemType === 'topic' && dragParentCategory === overParentCategory) {
            // Only allow moving topics within the same category
            const index = overParentCategory.topics?.findIndex((topic) => topic.id === over.id) ?? -1;
            if (index !== -1) overParentCategory.topics?.splice(index, 0, draggedItem);
          } else {
            // If trying to move a topic to a different category, return the original data
            return prevData;
          }
        } else if (overItemType === 'topic' && overParentCategory) {
          if (draggedItemType === 'topic' && dragParentCategory === overParentCategory) {
            // Only allow moving topics within the same category
            const index = overParentCategory.topics?.findIndex((topic) => topic.id === over.id) ?? -1;
            if (index !== -1) overParentCategory.topics?.splice(index, 0, draggedItem);
          } else {
            // If trying to move a topic to a different category, return the original data
            return prevData;
          }
        } else {
          // If the drag operation is not allowed, return the original data
          return prevData;
        }

        // Update order IDs
        updateOrderIds(newData);
        newData.forEach((lesson) => {
          if (lesson.categories) {
            updateOrderIds(lesson.categories);
            lesson.categories.forEach((category) => {
              if (category.topics) {
                updateOrderIds(category.topics);
              }
            });
          }
        });

        // Send updated data to backend
        sendDataToBackend(newData);

        return newData;
      });
    }

    setActiveId(null);  
  }, [sendDataToBackend]);

  const handleAddItem = useCallback((type, parentId = null) => {
    setNewItemType(type);
    setParentId(parentId);
    setIsDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setNewItemTitle('');
  }, []);

  const handleDialogConfirm = useCallback(() => {
    if (newItemTitle.trim() === '') {
      setSnackbarMessage('Item title cannot be empty');
      setSnackbarOpen(true);
      return;
    }

    const newItem = createNewItem(newItemType, newItemTitle);

    setData((prevData) => {
      const newData = JSON.parse(JSON.stringify(prevData));

      if (newItemType === 'lesson') {
        newData.push(newItem);
        updateOrderIds(newData);
      } else if (newItemType === 'category' && parentId) {
        const [parentLesson] = findItemById(newData, parentId);
        if (parentLesson) {
          parentLesson.categories = parentLesson.categories || [];
          parentLesson.categories.push(newItem);
          updateOrderIds(parentLesson.categories);
        }
      } else if (newItemType === 'topic' && parentId) {
        const [parentCategory] = findItemById(newData, parentId);
        if (parentCategory) {
          parentCategory.topics = parentCategory.topics || [];
          parentCategory.topics.push(newItem);
          updateOrderIds(parentCategory.topics);
        }
      }

      // Send updated data to backend
      sendDataToBackend(newData);

      return newData;
    });

    setSnackbarMessage(`New ${newItemType} added successfully`);
    setSnackbarOpen(true);
    handleDialogClose();
  }, [newItemType, newItemTitle, parentId, handleDialogClose, sendDataToBackend]);

  const handleDeleteItem = useCallback((id) => {
    setData((prevData) => {
      const newData = JSON.parse(JSON.stringify(prevData));
      const [item, parentLesson, parentCategory] = findItemById(newData, id);

      if (!item) return newData;

      if (item.categories) {
        // Deleting a lesson
        const index = newData.findIndex((lesson) => lesson.id === id);
        if (index !== -1) {
          newData.splice(index, 1);
          updateOrderIds(newData);
        }
      } else if (item.topics) {
        // Deleting a category
        if (parentLesson) {
          const index = parentLesson.categories?.findIndex((category) => category.id === id) ?? -1;
          if (index !== -1) {
            parentLesson.categories?.splice(index, 1);
            updateOrderIds(parentLesson.categories || []);
          }
        }
      } else {
        // Deleting a topic
        if (parentCategory) {
          const index = parentCategory.topics?.findIndex((topic) => topic.id === id) ?? -1;
          if (index !== -1) {
            parentCategory.topics?.splice(index, 1);
            updateOrderIds(parentCategory.topics || []);
          }
        }
      }

      // Send updated data to backend
      sendDataToBackend(newData);

      return newData;
    });

    setSnackbarMessage('Item deleted successfully');
    setSnackbarOpen(true);
  }, [sendDataToBackend]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <List sx={{ width: '100%' }}>
        <SortableContext items={data.map(lesson => lesson.id)} strategy={verticalListSortingStrategy}>
          {data.map((lesson) => (
            <Accordion key={lesson.id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <DraggableItem item={lesson} onDelete={handleDeleteItem} />
              </AccordionSummary>
              <AccordionDetails>
                <CategoryList
                  categories={lesson.categories}
                  lessonId={lesson.id}
                  onAddItem={handleAddItem}
                  onDeleteItem={handleDeleteItem}
                />
              </AccordionDetails>
            </Accordion>
          ))}
        </SortableContext>
      </List>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => handleAddItem('lesson')}
        sx={{ marginTop: '16px', marginRight: '16px' }}
      >
        Add Lesson
      </Button>
      <DragOverlay>
        {activeId ? (
          <ListItem sx={{
            padding: '8px',
            backgroundColor: 'action.selected',
            borderRadius: '4px',
            opacity: 0.8,
          }}>
            <Typography variant="body1">
              {data.flatMap(lesson =>
                [
                  { id: lesson.id, title: lesson.title },
                  ...(lesson.categories || []).flatMap(category => [
                    { id: category.id, title: category.title },
                    ...(category.topics || []).map(topic => ({ id: topic.id, title: topic.title }))
                  ])
                ]
              ).find(item => item.id === activeId)?.title}
            </Typography>
          </ListItem>
        ) : null}
      </DragOverlay>
      <Dialog open={isDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Add New {newItemType.charAt(0).toUpperCase() + newItemType.slice(1)}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={`${newItemType.charAt(0).toUpperCase() + newItemType.slice(1)} Title`}
            type="text"
            fullWidth
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDialogConfirm}>Add</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
        }}>
          <CircularProgress />
        </div>
      )}
    </DndContext>
  );
}

export default TripleAccordion;
