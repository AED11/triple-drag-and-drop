import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { List, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DraggableItem } from './DraggableItem';

export function TopicList({ topics = [], categoryId, onAddItem, onDeleteItem }) {
  return (
    <SortableContext items={topics.map(topic => topic.id)} strategy={verticalListSortingStrategy}>
      <List>
        {topics.map((topic) => (
          <DraggableItem key={topic.id} item={topic} onDelete={onDeleteItem} />
        ))}
      </List>
      <Button
        startIcon={<AddIcon />}
        onClick={() => onAddItem('topic', categoryId)}
        size="small"
      >
        Add Topic
      </Button>
    </SortableContext>
  );
}

