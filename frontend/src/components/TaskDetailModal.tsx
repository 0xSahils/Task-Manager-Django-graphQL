import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Task } from '../types';
import { UPDATE_TASK } from '../graphql/mutations';
import { formatDate } from '../utils/dateUtils';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import TaskComments from './TaskComments';

interface TaskDetailModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    assigneeEmail: task.assigneeEmail || '',
    dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
  });

  const [updateTask, { loading, error }] = useMutation(UPDATE_TASK);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await updateTask({
        variables: {
          id: task.id,
          ...formData,
          dueDate: formData.dueDate || null,
        },
      });

      if (result.data?.updateTask?.success) {
        setIsEditing(false);
        onUpdate();
      }
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {isEditing ? 'Edit Task' : 'Task Details'}
            </h3>
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <ErrorMessage message={error.message} className="mb-4" />
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="form-label">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="form-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="status" className="form-label">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="priority" className="form-label">
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="assigneeEmail" className="form-label">
                    Assignee Email
                  </label>
                  <input
                    type="email"
                    id="assigneeEmail"
                    name="assigneeEmail"
                    value={formData.assigneeEmail}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div>
                  <label htmlFor="dueDate" className="form-label">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-outline"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading || !formData.title.trim()}
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Task Info */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Task Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Status:</span>
                    <span className="ml-2">{task.status.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Priority:</span>
                    <span className="ml-2">{task.priority}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Project:</span>
                    <span className="ml-2">{task.project.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Assignee:</span>
                    <span className="ml-2">{task.assigneeEmail || 'Unassigned'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Due Date:</span>
                    <span className="ml-2">{task.dueDate ? formatDate(task.dueDate) : 'No due date'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Created:</span>
                    <span className="ml-2">{formatDate(task.createdAt)}</span>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="border-t border-gray-200 pt-6">
                  <TaskComments taskId={task.id} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
