import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ListItem, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getItemType } from '../utils/accordionUtils';

export function DraggableItem({ item, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        padding: '8px',
        backgroundColor: 'action.hover',
        borderRadius: '4px',
        cursor: 'move',
        marginBottom: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Typography variant="body1">{item.title} ({getItemType(item)})</Typography>
      <IconButton
        edge="end"
        aria-label="delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(item.id);
        }}
        sx={{ ml: 2 }}
      >
        <DeleteIcon />
      </IconButton>
    </ListItem>
  );
}

