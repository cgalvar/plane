# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from rest_framework import status
from rest_framework.response import Response

from plane.api.serializers.done_criteria import ProjectDoneCriteriaSerializer
from plane.app.permissions import ROLE, allow_permission
from plane.app.views.base import BaseAPIView
from plane.db.models import Project
from plane.db.models.done_criteria import ProjectDoneCriteria


class ProjectDoneCriteriaEndpoint(BaseAPIView):
    """Session endpoint for the shared done criteria shown on issue detail."""

    def _project(self, slug, project_id):
        return Project.objects.get(id=project_id, workspace__slug=slug)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER, ROLE.GUEST])
    def get(self, request, slug, project_id):
        project = self._project(slug, project_id)
        criteria = ProjectDoneCriteria.for_project(project)
        return Response(ProjectDoneCriteriaSerializer(criteria).data, status=status.HTTP_200_OK)

    @allow_permission([ROLE.ADMIN, ROLE.MEMBER])
    def patch(self, request, slug, project_id):
        project = self._project(slug, project_id)
        criteria = ProjectDoneCriteria.for_project(project)
        serializer = ProjectDoneCriteriaSerializer(criteria, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
