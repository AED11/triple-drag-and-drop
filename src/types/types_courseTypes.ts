export interface Lesson {
  id: string;
  title: string;
}

export interface Category {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Topic {
  id: string;
  title: string;
  categories: Category[];
}

