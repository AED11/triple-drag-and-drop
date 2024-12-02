import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { List, Button, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import { DraggableItem } from './DraggableItem';
import { TopicList } from './TopicList';

export function CategoryList({ categories = [], lessonId, onAddItem, onDeleteItem }) {
  return (
    <SortableContext items={categories.map(category => category.id)} strategy={verticalListSortingStrategy}>
      <List>
        {categories.map((category) => (
          <Accordion key={category.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <DraggableItem item={category} onDelete={onDeleteItem} />
            </AccordionSummary>
            <AccordionDetails>
              <TopicList
                topics={category.topics}
                categoryId={category.id}
                onAddItem={onAddItem}
                onDeleteItem={onDeleteItem}
              />
            </AccordionDetails>
          </Accordion>
        ))}
      </List>
      <Button
        startIcon={<AddIcon />}
        onClick={() => onAddItem('category', lessonId)}
        size="small"
      >
        Add Category
      </Button>
    </SortableContext>
  );
}
