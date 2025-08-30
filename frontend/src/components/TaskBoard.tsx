import React from 'react';
import { useMutation } from '@apollo/client';
import { Task, TaskStatus } from '../types';
import { UPDATE_TASK } from '../graphql/mutations';
import TaskCard from './TaskCard';
import { clsx } from 'clsx';

interface TaskBoardProps {
  tasks: Task[];
  onTaskUpdate: () => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onTaskUpdate }) => {
  const [updateTask] = useMutation(UPDATE_TASK);

  const columns: Array<{ status: TaskStatus; title: string; color: string }> = [
    { status: 'TODO', title: 'To Do', color: 'bg-gray-100 border-gray-300' },
    { status: 'IN_PROGRESS', title: 'In Progress', color: 'bg-yellow-100 border-yellow-300' },
    { status: 'DONE', title: 'Done', color: 'bg-green-100 border-green-300' },
  ];

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTask({
        variables: {
          id: taskId,
          status: newStatus,
        },
      });
      onTaskUpdate();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const task = tasks.find(t => t.id === taskId);
    
    if (task && task.status !== status) {
      handleTaskStatusChange(taskId, status);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.status);
        
        return (
          <div
            key={column.status}
            className={clsx(
              'rounded-lg border-2 border-dashed p-4 min-h-96',
              column.color
            )}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">{column.title}</h3>
              <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600">
                {columnTasks.length}
              </span>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              {columnTasks.length > 0 ? (
                columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="cursor-move"
                  >
                    <TaskCard 
                      task={task} 
                      onUpdate={onTaskUpdate}
                      showProject={true}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No tasks</p>
                  <p className="text-xs mt-1">
                    Drag tasks here or create new ones
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskBoard;
