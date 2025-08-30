from django.db import models
from django.core.validators import EmailValidator
from apps.organizations.models import Organization


class Project(models.Model):
    """
    Project model that belongs to an organization.
    Implements multi-tenancy through organization relationship.
    """
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('ON_HOLD', 'On Hold'),
        ('CANCELLED', 'Cancelled'),
    ]

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='projects',
        help_text="Organization this project belongs to"
    )
    name = models.CharField(
        max_length=200,
        help_text="Project name"
    )
    description = models.TextField(
        blank=True,
        help_text="Project description"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='ACTIVE',
        help_text="Current project status"
    )
    due_date = models.DateField(
        null=True,
        blank=True,
        help_text="Project due date"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When the project was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="When the project was last updated"
    )

    class Meta:
        db_table = 'projects'
        ordering = ['-created_at']
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'
        unique_together = ['organization', 'name']

    def __str__(self):
        return f"{self.organization.name} - {self.name}"

    @property
    def task_count(self):
        """Get the total number of tasks in this project."""
        return self.tasks.count()

    @property
    def completed_tasks(self):
        """Get the number of completed tasks in this project."""
        return self.tasks.filter(status='DONE').count()

    @property
    def completion_rate(self):
        """Calculate the completion rate as a percentage."""
        total = self.task_count
        if total == 0:
            return 0
        return round((self.completed_tasks / total) * 100, 2)

    @property
    def is_overdue(self):
        """Check if the project is overdue."""
        if not self.due_date:
            return False
        from django.utils import timezone
        return timezone.now().date() > self.due_date and self.status != 'COMPLETED'

    def get_tasks_by_status(self):
        """Get task counts grouped by status."""
        from django.db.models import Count
        return self.tasks.values('status').annotate(count=Count('id'))
