from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'organization', 'status', 'task_count', 'completion_rate', 'due_date', 'created_at']
    list_filter = ['status', 'organization', 'created_at', 'due_date']
    search_fields = ['name', 'description', 'organization__name']
    readonly_fields = ['created_at', 'updated_at', 'task_count', 'completed_tasks', 'completion_rate']
    
    fieldsets = (
        (None, {
            'fields': ('organization', 'name', 'description', 'status', 'due_date')
        }),
        ('Statistics', {
            'fields': ('task_count', 'completed_tasks', 'completion_rate'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def task_count(self, obj):
        return obj.task_count
    task_count.short_description = 'Tasks'

    def completion_rate(self, obj):
        return f"{obj.completion_rate}%"
    completion_rate.short_description = 'Completion'
