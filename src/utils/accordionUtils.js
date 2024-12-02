export const findItemById = (data, id) => {
  for (const lesson of data) {
    if (lesson.id === id) return [lesson, undefined, undefined];
    for (const category of lesson.categories || []) {
      if (category.id === id) return [category, lesson, undefined];
      for (const topic of category.topics || []) {
        if (topic.id === id) return [topic, lesson, category];
      }
    }
  }
  return [undefined, undefined, undefined];
};

export const updateOrderIds = (array) => {
  array.forEach((item, index) => {
    item.orderId = index + 1;
  });
};

export const formatOrder = (items) =>
  items.map(item => ({ [item.id]: item.orderId }));

export const createNewItem = (type, title) => ({
  id: `${type}-${Date.now()}`,
  title,
  orderId: 0,
  ...(type === 'lesson' ? { categories: [] } : {}),
  ...(type === 'category' ? { topics: [] } : {}),
});

export const getItemType = (item) => {
  if (item.categories) return 'lesson';
  if (item.topics) return 'category';
  return 'topic';
};

