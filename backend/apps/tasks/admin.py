from django.contrib import admin
from .models import Task, TaskComment


class TaskCommentInline(admin.TabularInline):
    model = TaskComment
    extra = 0
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'status', 'priority', 'assignee_email', 'due_date', 'created_at']
    list_filter = ['status', 'priority', 'project__organization', 'created_at', 'due_date']
    search_fields = ['title', 'description', 'assignee_email', 'project__name']
    readonly_fields = ['created_at', 'updated_at', 'organization', 'comment_count']
    inlines = [TaskCommentInline]
    
    fieldsets = (
        (None, {
            'fields': ('project', 'title', 'description', 'status', 'priority')
        }),
        ('Assignment', {
            'fields': ('assignee_email', 'due_date')
        }),
        ('Metadata', {
            'fields': ('organization', 'comment_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def organization(self, obj):
        return obj.organization.name
    organization.short_description = 'Organization'

    def comment_count(self, obj):
        return obj.comment_count
    comment_count.short_description = 'Comments'


@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ['task', 'author_email', 'content_preview', 'created_at']
    list_filter = ['task__project__organization', 'created_at']
    search_fields = ['content', 'author_email', 'task__title']
    readonly_fields = ['created_at', 'updated_at', 'organization']
    
    fieldsets = (
        (None, {
            'fields': ('task', 'author_email', 'content')
        }),
        ('Metadata', {
            'fields': ('organization',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content Preview'

    def organization(self, obj):
        return obj.organization.name
    organization.short_description = 'Organization'
