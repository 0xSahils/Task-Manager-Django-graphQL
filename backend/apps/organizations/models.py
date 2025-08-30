from django.db import models
from django.utils.text import slugify
from django.core.validators import EmailValidator


class Organization(models.Model):
    """
    Organization model for multi-tenancy support.
    Each organization represents a separate tenant with isolated data.
    """
    name = models.CharField(
        max_length=100,
        help_text="Organization name"
    )
    slug = models.SlugField(
        unique=True,
        max_length=100,
        help_text="URL-friendly organization identifier"
    )
    contact_email = models.EmailField(
        validators=[EmailValidator()],
        help_text="Primary contact email for the organization"
    )
    description = models.TextField(
        blank=True,
        help_text="Optional organization description"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether the organization is active"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When the organization was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="When the organization was last updated"
    )

    class Meta:
        db_table = 'organizations'
        ordering = ['name']
        verbose_name = 'Organization'
        verbose_name_plural = 'Organizations'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """Auto-generate slug from name if not provided."""
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def project_count(self):
        """Get the number of projects in this organization."""
        return self.projects.count()

    @property
    def active_project_count(self):
        """Get the number of active projects in this organization."""
        return self.projects.filter(status='ACTIVE').count()
