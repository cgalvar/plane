# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from rest_framework import serializers

from plane.db.models.done_criteria import ProjectDoneCriteria
from plane.utils.content_validator import validate_html_content

from .base import BaseSerializer


class ProjectDoneCriteriaSerializer(BaseSerializer):
    class Meta:
        model = ProjectDoneCriteria
        fields = [
            "id",
            "project",
            "description_html",
            "description_stripped",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "project",
            "description_stripped",
            "updated_at",
        ]

    def validate_description_html(self, value):
        is_valid, error_message, clean_html = validate_html_content(value or "")
        if not is_valid:
            raise serializers.ValidationError(error_message)
        return clean_html or "<p></p>"
