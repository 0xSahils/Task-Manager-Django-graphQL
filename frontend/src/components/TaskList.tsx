import React, { useState } from 'react';
import { 
  CalendarIcon, 
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon,
  UserIcon,
  FolderIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Task, TaskStatus, TaskPriority } from '../types';
import { formatDate } from '../utils/dateUtils';
import { clsx } from 'clsx';
import TaskDetailModal from './TaskDetailModal';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: () => void;
}

type SortField = 'title' | 'status' | 'priority' | 'dueDate' | 'project' | 'assignee';
type SortDirection = 'asc' | 'desc';

const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskUpdate }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'priority':
        const priorityOrder = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'URGENT': 4 };
        aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
        bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
        break;
      case 'dueDate':
        aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        break;
      case 'project':
        aValue = a.project.name.toLowerCase();
        bValue = b.project.name.toLowerCase();
        break;
      case 'assignee':
        aValue = a.assigneeEmail?.toLowerCase() || '';
        bValue = b.assigneeEmail?.toLowerCase() || '';
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getStatusBadgeClass = (status: TaskStatus) => {
    switch (status) {
      case 'TODO':
        return 'status-todo';
      case 'IN_PROGRESS':
        return 'status-in-progress';
      case 'DONE':
        return 'status-done';
      default:
        return 'status-badge bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeClass = (priority: TaskPriority) => {
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

  const SortButton: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left font-medium text-gray-900 hover:text-gray-600"
    >
      <span>{children}</span>
      {sortField === field && (
        sortDirection === 'asc' ? 
          <ChevronUpIcon className="h-4 w-4" /> : 
          <ChevronDownIcon className="h-4 w-4" />
      )}
    </button>
  );

  return (
    <>
      <div className="card overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-3">
              <SortButton field="title">Task</SortButton>
            </div>
            <div className="col-span-2">
              <SortButton field="project">Project</SortButton>
            </div>
            <div className="col-span-1">
              <SortButton field="status">Status</SortButton>
            </div>
            <div className="col-span-1">
              <SortButton field="priority">Priority</SortButton>
            </div>
            <div className="col-span-2">
              <SortButton field="assignee">Assignee</SortButton>
            </div>
            <div className="col-span-2">
              <SortButton field="dueDate">Due Date</SortButton>
            </div>
            <div className="col-span-1">Comments</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {sortedTasks.length > 0 ? (
            sortedTasks.map((task) => (
              <div
                key={task.id}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedTask(task)}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Task */}
                  <div className="col-span-3">
                    <div className="flex items-start space-x-2">
                      {task.isOverdue && (
                        <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-gray-500 truncate">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Project */}
                  <div className="col-span-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <FolderIcon className="h-4 w-4 mr-1 text-gray-400" />
                      <span className="truncate">{task.project.name}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <span className={getStatusBadgeClass(task.status)}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Priority */}
                  <div className="col-span-1">
                    <span className={getPriorityBadgeClass(task.priority)}>
                      {task.priority}
                    </span>
                  </div>

                  {/* Assignee */}
                  <div className="col-span-2">
                    {task.assigneeEmail ? (
                      <div className="flex items-center text-sm text-gray-600">
                        <UserIcon className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="truncate">{task.assigneeEmail}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Unassigned</span>
                    )}
                  </div>

                  {/* Due Date */}
                  <div className="col-span-2">
                    {task.dueDate ? (
                      <div className="flex items-center text-sm">
                        <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                        <span className={clsx(
                          task.isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'
                        )}>
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No due date</span>
                    )}
                  </div>

                  {/* Comments */}
                  <div className="col-span-1">
                    {task.commentCount > 0 ? (
                      <div className="flex items-center text-sm text-gray-600">
                        <ChatBubbleLeftIcon className="h-4 w-4 mr-1 text-gray-400" />
                        <span>{task.commentCount}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">0</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No tasks found</p>
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={() => {
            onTaskUpdate();
            setSelectedTask(null);
          }}
        />
      )}
    </>
  );
};

export default TaskList;
