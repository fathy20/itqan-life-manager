import { useApp } from '../context/AppContext';

export function useWork() {
  const { state, addTask, updateTask, deleteTask, addProject, deleteProject, addCourse, updateCourse, deleteCourse } = useApp();

  const toggleTask = (id: string) => {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    updateTask(id, { status: task.status === 'completed' ? 'todo' : 'completed' });
  };

  return {
    tasks: state.tasks || [],
    projects: state.projects || [],
    courses: state.courses || [],
    addTask, updateTask, deleteTask, toggleTask,
    addProject, deleteProject,
    addCourse, updateCourse, deleteCourse,
  };
}
