/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useEffect, useState } from "react";
// services
import { DoneCriteriaService } from "@/services/issue";
import type { TProjectDoneCriteria } from "@/services/issue";

const doneCriteriaService = new DoneCriteriaService();

type Props = {
  workspaceSlug: string;
  projectId: string;
};

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function textToHtml(value: string) {
  const lines = value
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return "<p></p>";
  return `<ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`;
}

export function DoneCriteria(props: Props) {
  const { workspaceSlug, projectId } = props;
  const [record, setRecord] = useState<TProjectDoneCriteria | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setError("");
    doneCriteriaService
      .retrieve(workspaceSlug, projectId)
      .then((data) => {
        if (!cancelled) setRecord(data);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudieron leer los criterios de hecho");
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceSlug, projectId]);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const data = await doneCriteriaService.update(workspaceSlug, projectId, textToHtml(draft));
      setRecord(data);
      setEditing(false);
    } catch {
      setError("No se pudieron guardar los criterios de hecho");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-md border border-subtle bg-layer-1 px-3 py-3" data-done-criteria="shared">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-body-sm-medium text-primary">Criterios de hecho</h3>
          <p className="text-11 text-tertiary">Compartido por épica, historia y tarea</p>
        </div>
        {editing ? (
          <div className="flex items-center gap-2">
            <button type="button" className="text-13 text-tertiary" onClick={() => setEditing(false)}>
              Cancelar
            </button>
            <button
              type="button"
              className="rounded-sm bg-accent-primary px-2 py-1 text-13 text-on-color"
              disabled={saving}
              onClick={save}
            >
              {saving ? "Guardando" : "Guardar"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="text-13 text-accent-primary"
            disabled={!record}
            onClick={() => {
              setDraft(record?.description_stripped ?? "");
              setEditing(true);
              setError("");
            }}
          >
            Editar
          </button>
        )}
      </div>
      {error ? <p className="mb-2 text-11 text-danger-primary">{error}</p> : null}
      {editing ? (
        <textarea
          className="min-h-[120px] w-full rounded-md border border-subtle bg-surface-1 p-2 text-13 text-primary"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
      ) : (
        <div
          className="text-13 text-primary [&_li]:ml-4 [&_li]:list-disc"
          dangerouslySetInnerHTML={{ __html: record?.description_html ?? "<p></p>" }}
        />
      )}
    </section>
  );
}
