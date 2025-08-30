import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { PaperAirplaneIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { GET_TASK_COMMENTS } from '../graphql/queries';
import { ADD_TASK_COMMENT } from '../graphql/mutations';
import { TaskComment } from '../types';
import { formatDate } from '../utils/dateUtils';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface TaskCommentsProps {
  taskId: string;
}

const TaskComments: React.FC<TaskCommentsProps> = ({ taskId }) => {
  const [newComment, setNewComment] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');

  const { data, loading, error, refetch } = useQuery(GET_TASK_COMMENTS, {
    variables: { taskId },
  });

  const [addComment, { loading: addingComment }] = useMutation(ADD_TASK_COMMENT);

  const comments: TaskComment[] = data?.taskComments || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !authorEmail.trim()) return;

    try {
      const result = await addComment({
        variables: {
          taskId,
          content: newComment.trim(),
          authorEmail: authorEmail.trim(),
        },
      });

      if (result.data?.addTaskComment?.success) {
        setNewComment('');
        refetch();
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error.message} onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-900">
        Comments ({comments.length})
      </h4>

      {/* Comments List */}
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <div className="flex-shrink-0">
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <span className="font-medium text-gray-900">
                    {comment.authorEmail}
                  </span>
                  <span className="ml-2 text-gray-500">
                    {formatDate(comment.createdAt, 'relative')}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                  {comment.content}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="authorEmail" className="sr-only">
            Your email
          </label>
          <input
            type="email"
            id="authorEmail"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            placeholder="Your email"
            required
            className="form-input text-sm"
          />
        </div>
        
        <div className="flex space-x-2">
          <div className="flex-1">
            <label htmlFor="newComment" className="sr-only">
              Add a comment
            </label>
            <textarea
              id="newComment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={2}
              required
              className="form-input text-sm resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={addingComment || !newComment.trim() || !authorEmail.trim()}
            className="btn-primary px-3 py-2 self-end"
          >
            {addingComment ? (
              <LoadingSpinner size="sm" />
            ) : (
              <PaperAirplaneIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskComments;
