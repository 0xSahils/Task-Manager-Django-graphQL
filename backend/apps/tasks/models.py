from django.db import models
from django.core.validators import EmailValidator
from apps.projects.models import Project


class Task(models.Model):
    """
    Task model that belongs to a project.
    Inherits multi-tenancy through project -> organization relationship.
    """
    
    TASK_STATUS_CHOICES = [
        ('TODO', 'To Do'),
        ('IN_PROGRESS', 'In Progress'),
        ('DONE', 'Done'),
    ]

    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    ]

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='tasks',
        help_text="Project this task belongs to"
    )
    title = models.CharField(
        max_length=200,
        help_text="Task title"
    )
    description = models.TextField(
        blank=True,
        help_text="Task description"
    )
    status = models.CharField(
        max_length=20,
        choices=TASK_STATUS_CHOICES,
        default='TODO',
        help_text="Current task status"
    )
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='MEDIUM',
        help_text="Task priority"
    )
    assignee_email = models.EmailField(
        blank=True,
        validators=[EmailValidator()],
        help_text="Email of the person assigned to this task"
    )
    due_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Task due date and time"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When the task was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="When the task was last updated"
    )

    class Meta:
        db_table = 'tasks'
        ordering = ['-created_at']
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'

    def __str__(self):
        return f"{self.project.name} - {self.title}"

    @property
    def organization(self):
        """Get the organization this task belongs to through project."""
        return self.project.organization

    @property
    def is_overdue(self):
        """Check if the task is overdue."""
        if not self.due_date:
            return False
        from django.utils import timezone
        return timezone.now() > self.due_date and self.status != 'DONE'

    @property
    def comment_count(self):
        """Get the number of comments on this task."""
        return self.comments.count()


class TaskComment(models.Model):
    """
    Comment model for tasks.
    Inherits multi-tenancy through task -> project -> organization relationship.
    """
    
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='comments',
        help_text="Task this comment belongs to"
    )
    content = models.TextField(
        help_text="Comment content"
    )
    author_email = models.EmailField(
        validators=[EmailValidator()],
        help_text="Email of the comment author"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When the comment was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="When the comment was last updated"
    )

    class Meta:
        db_table = 'task_comments'
        ordering = ['created_at']
        verbose_name = 'Task Comment'
        verbose_name_plural = 'Task Comments'

    def __str__(self):
        return f"Comment on {self.task.title} by {self.author_email}"

    @property
    def organization(self):
        """Get the organization this comment belongs to through task -> project."""
        return self.task.project.organization
