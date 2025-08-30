from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from .models import Organization


class OrganizationMiddleware(MiddlewareMixin):
    """
    Middleware to handle organization-based multi-tenancy.
    Extracts organization context from request headers or URL parameters.
    """
    
    def process_request(self, request):
        """
        Extract organization context from the request.
        Organization can be specified via:
        1. X-Organization-Slug header
        2. X-Organization-ID header
        3. organization_slug query parameter
        4. organization_id query parameter
        """
        organization = None
        
        # Try to get organization from headers
        org_slug = request.META.get('HTTP_X_ORGANIZATION_SLUG')
        org_id = request.META.get('HTTP_X_ORGANIZATION_ID')
        
        # Try to get organization from query parameters
        if not org_slug and not org_id:
            org_slug = request.GET.get('organization_slug')
            org_id = request.GET.get('organization_id')
        
        # Resolve organization
        try:
            if org_slug:
                organization = Organization.objects.get(slug=org_slug, is_active=True)
            elif org_id:
                organization = Organization.objects.get(id=org_id, is_active=True)
        except Organization.DoesNotExist:
            pass
        
        # Store organization in request
        request.organization = organization
        
        return None

    def process_response(self, request, response):
        """Add organization context to response headers if available."""
        if hasattr(request, 'organization') and request.organization:
            response['X-Organization-ID'] = str(request.organization.id)
            response['X-Organization-Slug'] = request.organization.slug
        
        return response


class RequireOrganizationMiddleware(MiddlewareMixin):
    """
    Middleware that requires organization context for API endpoints.
    Should be placed after OrganizationMiddleware.
    """
    
    EXEMPT_PATHS = [
        '/admin/',
        '/graphql/',  # GraphQL handles organization context internally
        '/api/organizations/',  # Organization endpoints don't require org context
    ]
    
    def process_request(self, request):
        """Check if organization context is required and present."""
        
        # Skip exempt paths
        for exempt_path in self.EXEMPT_PATHS:
            if request.path.startswith(exempt_path):
                return None
        
        # Skip non-API requests
        if not request.path.startswith('/api/'):
            return None
        
        # Check if organization context is present
        if not hasattr(request, 'organization') or not request.organization:
            return JsonResponse({
                'error': 'Organization context required',
                'message': 'Please provide organization via X-Organization-Slug header or organization_slug parameter'
            }, status=400)
        
        return None
