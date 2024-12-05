import { Topic, Category, Lesson } from '../types/courseTypes';

export async function fetchCourseData(): Promise<Topic[]> {
  try {
    const response = await fetch('https://online-api.omuz.tj/api/admin/course/2/topics/v1', {headers: {
      authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL29ubGluZS1hcGkub211ei50ai9hcGkvbG9naW4iLCJpYXQiOjE3MzMyOTgyMjEsImV4cCI6MTczMzczMDIyMSwibmJmIjoxNzMzMjk4MjIxLCJqdGkiOiJuV2wxQTVyTkdpUGszSWdIIiwic3ViIjoiNDIiLCJwcnYiOiIyM2JkNWM4OTQ5ZjYwMGFkYjM5ZTcwMWM0MDA4NzJkYjdhNTk3NmY3IiwidXNlcl90eXBlIjoxLCJpc19waG9uZV92ZXJpZmllZCI6dHJ1ZSwiaXNfZW1haWxfdmVyaWZpZWQiOnRydWUsImVtYWlsIjoic3VwZXJhZG1pbkBnbWFpbC5jb20iLCJuYW1lIjoibnVydWxsbyBzdXBlciBhZG1pbiAifQ.nIc3cEBaWdR_tTW9SAYCCHU_FRn5RpIpR1UzBjLxQwE'
    }});
    const data = await response.json();
    
    return data.course_topics_lessons.topics.map((topic: any) => ({
      id: topic.id.toString(),
      title: topic.topic_name,
      categories: topic.categories.map((category: any) => ({
        id: category.id.toString(),
        title: category.name,
        lessons: category.lessons.map((lesson: any) => ({
          id: lesson.id.toString(),
          title: lesson.name,
        })),
      })),
    }));
  } catch (error) {
    console.error('Error fetching course data:', error);
    return [];
  }
}
