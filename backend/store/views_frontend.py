from django.conf import settings
from django.http import FileResponse
from django.views import View
import os


class FrontendView(View):
    def get(self, request, *args, **kwargs):
        index_path = os.path.join(settings.BASE_DIR, 'frontend_build', 'index.html')
        return FileResponse(open(index_path, 'rb'), content_type='text/html')
