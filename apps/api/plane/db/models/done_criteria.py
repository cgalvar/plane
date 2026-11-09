# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

import re

from django.db import models
from django.utils.html import strip_tags

from .project import ProjectBaseModel


def plain_text(html):
    if not html:
        return ""
    with_breaks = re.sub(r"</(li|p|div|h[1-6])>", "\n", html, flags=re.IGNORECASE)
    with_breaks = re.sub(r"<br\s*/?>", "\n", with_breaks, flags=re.IGNORECASE)
    lines = [line.strip() for line in strip_tags(with_breaks).splitlines()]
    return "\n".join(line for line in lines if line)

DEFAULT_DONE_CRITERIA_HTML = (
    "<ul>"
    "<li>PR o commit enlazado</li>"
    "<li>CI en verde</li>"
    "<li>pruebas pasan</li>"
    "<li>criterios de aceptación</li>"
    "<li>evidencia verificable</li>"
    "</ul>"
)


class ProjectDoneCriteria(ProjectBaseModel):
    """One shared done-criteria text per project, shown on every work item."""

    description_html = models.TextField(blank=True, default="<p></p>")
    description_stripped = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Project done criteria"
        verbose_name_plural = "Project done criteria"
        db_table = "project_done_criteria"
        constraints = [
            models.UniqueConstraint(
                fields=["project"],
                condition=models.Q(deleted_at__isnull=True),
                name="project_done_criteria_unique_active_project",
            )
        ]

    def save(self, *args, **kwargs):
        self.description_stripped = plain_text(self.description_html)
        return super().save(*args, **kwargs)

    @classmethod
    def for_project(cls, project):
        criteria = cls.objects.filter(project=project).first()
        if criteria:
            return criteria
        return cls.objects.create(
            project=project,
            description_html=DEFAULT_DONE_CRITERIA_HTML,
        )
