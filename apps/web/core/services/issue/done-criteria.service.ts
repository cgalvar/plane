/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { API_BASE_URL } from "@plane/constants";
// services
import { APIService } from "@/services/api.service";

export type TProjectDoneCriteria = {
  id: string;
  project: string;
  description_html: string;
  description_stripped: string | null;
  updated_at: string;
};

export class DoneCriteriaService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async retrieve(workspaceSlug: string, projectId: string): Promise<TProjectDoneCriteria> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/done-criteria/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async update(
    workspaceSlug: string,
    projectId: string,
    descriptionHtml: string
  ): Promise<TProjectDoneCriteria> {
    return this.patch(`/api/workspaces/${workspaceSlug}/projects/${projectId}/done-criteria/`, {
      description_html: descriptionHtml,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
