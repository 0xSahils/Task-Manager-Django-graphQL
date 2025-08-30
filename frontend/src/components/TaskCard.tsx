import React, { useState } from 'react';
import { 
  CalendarIcon, 
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon,
  UserIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import { Task } from '../types';
import { formatDate } from '../utils/dateUtils';
import { clsx } from 'clsx';
import TaskDetailModal from './TaskDetailModal';

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
  showProject?: boolean;
  className?: string;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onUpdate, 
  showProject = false,
  className = '' 
}) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'priority-low';
      case 'MEDIUM':
        return 'priority-medium';
      case 'HIGH':
        return 'priority-high';
      case 'URGENT':
        return 'priority-urgent';
      default:
        return 'priority-medium';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'Low';
      case 'MEDIUM':
        return 'Medium';
      case 'HIGH':
        return 'High';
      case 'URGENT':
        return 'Urgent';
      default:
        return priority;
    }
  };

  return (
    <>
      <div 
        className={clsx(
          'card p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer',
          className
        )}
        onClick={() => setIsDetailModalOpen(true)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">
            {task.title}
          </h4>
          <div className="flex items-center space-x-2 ml-2">
            <span className={getPriorityColor(task.priority)}>
              {getPriorityText(task.priority)}
            </span>
            {task.isOverdue && (
              <ExclamationTriangleIcon 
                className="h-4 w-4 text-red-500" 
                title="Overdue" 
              />
            )}
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Project (if shown) */}
        {showProject && (
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <FolderIcon className="h-3 w-3 mr-1" />
            <span className="truncate">{task.project.name}</span>
          </div>
        )}

        {/* Assignee */}
        {task.assigneeEmail && (
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <UserIcon className="h-3 w-3 mr-1" />
            <span className="truncate">{task.assigneeEmail}</span>
          </div>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center text-xs text-gray-500 mb-3">
            <CalendarIcon className="h-3 w-3 mr-1" />
            <span className={clsx(
              task.isOverdue ? 'text-red-600 font-medium' : ''
            )}>
              {formatDate(task.dueDate)}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-400">
            <span>#{task.id.slice(-6)}</span>
          </div>
          
          {task.commentCount > 0 && (
            <div className="flex items-center text-xs text-gray-500">
              <ChatBubbleLeftIcon className="h-3 w-3 mr-1" />
              <span>{task.commentCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={task}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onUpdate={() => {
          onUpdate();
          setIsDetailModalOpen(false);
        }}
      />
    </>
  );
};

export default TaskCard;
