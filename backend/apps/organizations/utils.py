from django.core.exceptions import PermissionDenied
from .models import Organization


class MultiTenantQuerySet:
    """
    Utility class to filter querysets based on organization context.
    """
    
    @staticmethod
    def filter_by_organization(queryset, organization):
        """
        Filter queryset by organization based on the model type.
        """
        model = queryset.model
        
        # Direct organization relationship
        if hasattr(model, 'organization'):
            return queryset.filter(organization=organization)
        
        # Through project relationship
        elif hasattr(model, 'project'):
            return queryset.filter(project__organization=organization)
        
        # Through task relationship (for comments)
        elif hasattr(model, 'task'):
            return queryset.filter(task__project__organization=organization)
        
        # If no organization relationship found, return empty queryset
        return queryset.none()


class OrganizationPermissionMixin:
    """
    Mixin to add organization-based permission checking to views and resolvers.
    """
    
    def check_organization_permission(self, user, organization, action='read'):
        """
        Check if user has permission to perform action on organization.
        For now, this is a simple implementation - in production you'd want
        more sophisticated permission checking.
        """
        if not organization:
            raise PermissionDenied("Organization context required")
        
        if not organization.is_active:
            raise PermissionDenied("Organization is not active")
        
        # Add more permission logic here as needed
        return True
    
    def get_organization_from_context(self, info):
        """
        Extract organization from GraphQL context.
        """
        request = info.context
        return getattr(request, 'organization', None)
    
    def filter_queryset_by_organization(self, queryset, organization):
        """
        Filter queryset by organization.
        """
        return MultiTenantQuerySet.filter_by_organization(queryset, organization)


def require_organization_context(func):
    """
    Decorator to require organization context in GraphQL resolvers.
    """
    def wrapper(self, info, *args, **kwargs):
        organization = getattr(info.context, 'organization', None)
        if not organization:
            raise PermissionDenied("Organization context required")
        return func(self, info, *args, **kwargs)
    return wrapper


def get_organization_from_request(request):
    """
    Helper function to get organization from request.
    """
    return getattr(request, 'organization', None)


def validate_organization_access(organization, user=None):
    """
    Validate that the organization is accessible.
    """
    if not organization:
        raise PermissionDenied("Organization not found")
    
    if not organization.is_active:
        raise PermissionDenied("Organization is not active")
    
    # Add user-specific validation here if needed
    return True
