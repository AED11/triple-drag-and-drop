import TripleAccordion from './components/TripleAccordion';

const initialData = [
  {
    id: "lesson1",
    title: "Урок 1",
    orderId: 1,
    categories: [
      {
        id: "category1",
        title: "Категория 1",
        orderId: 1,
        topics: [
          { id: "topic1", title: "Тема 1", orderId: 1 },
          { id: "topic2", title: "Тема 2", orderId: 2 },
        ],
      },
      {
        id: "category2",
        title: "Категория 2",
        orderId: 2,
        topics: [
          { id: "topic3", title: "Тема 3", orderId: 1 },
          { id: "topic4", title: "Тема 4", orderId: 2 },
        ],
      },
    ],
  },
  {
    id: "lesson2",
    title: "Урок 2",
    orderId: 2,
    categories: [
      {
        id: "category3",
        title: "Категория 3",
        orderId: 1,
        topics: [
          { id: "topic5", title: "Тема 5", orderId: 1 },
          { id: "topic6", title: "Тема 6", orderId: 2 },
        ],
      },
    ],
  },
];

export default function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Тройной аккордеон с перетаскиванием</h1>
      <TripleAccordion initialData={initialData} />
    </div>
  );
}
