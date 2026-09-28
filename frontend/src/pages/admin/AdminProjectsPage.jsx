import { ExternalLink, Pencil, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../services/api";
import FileUpload from "../../components/FileUpload";

const emptyProject = {
  title: "",
  slug: "",
  subtitle: "",
  short_description: "",
  overview: "",
  problem: "",
  solution: "",
  features: "",
  challenges: "",
  lessons_learned: "",
  contribution: "",
  architecture: "",
  outcomes: "",
  category: "",
  status: "Active",
  github_url: "",
  live_url: "",
  video_url: "",
  publish_at: "",
  expires_at: "",
  is_published: false,
};
const draftKey = (id) => `project-draft-${id || "new"}`;
const withDraft = (project) => {
  try {
    return { ...project, ...JSON.parse(localStorage.getItem(draftKey(project.id)) || "{}") };
  } catch {
    return project;
  }
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/projects/admin/all");
      setProjects(data.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const project = {
      ...Object.fromEntries(form),
      is_published: form.get("is_published") === "on",
    };
    try {
      if (editing.id) await api.put(`/projects/${editing.id}`, project);
      else await api.post("/projects", project);
      localStorage.removeItem(draftKey(editing.id));
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save project.");
    } finally {
      setSaving(false);
    }
  }
  async function remove(project) {
    if (!window.confirm(`Delete “${project.title}”? This cannot be undone.`))
      return;
    try {
      await api.delete(`/projects/${project.id}`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete project.");
    }
  }
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">
            Control the projects shown in your public portfolio.
          </p>
        </div>
        <button
          className="button-primary"
          onClick={() => setEditing(withDraft(emptyProject))}
        >
          <Plus size={18} />
          Add project
        </button>
      </div>
      {error && (
        <p
          className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}
      {editing && (
        <ProjectForm
          project={editing}
          saving={saving}
          onSubmit={save}
          onClose={() => setEditing(null)}
        />
      )}
      <section className="surface mt-6 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-slate-500">Loading projects…</p>
        ) : projects.length ? (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {projects.map((project) => (
              <article
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                key={project.id}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-semibold text-slate-950 dark:text-white">
                      {project.title}
                    </h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${project.is_published ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-slate-100 text-slate-600 dark:bg-ink-800 dark:text-slate-300"}`}
                    >
                      {project.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-500">
                    /{project.slug} · {project.category || "Uncategorized"}
                  </p>
                </div>
                <div className="flex items-center gap-1 self-end sm:self-auto">
                  <FileUpload
                    kind="project_image"
                    entityId={project.id}
                    accept="image/jpeg,image/png,image/webp"
                    label="Image"
                  />
                  <a
                    className="grid size-10 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-ink-800"
                    href={`/projects/${project.slug}`}
                    target="_blank"
                    aria-label={`Open ${project.title}`}
                  >
                    <ExternalLink size={17} />
                  </a>
                  <button
                    className="grid size-10 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-ink-800"
                    onClick={() => setEditing(withDraft(project))}
                    aria-label={`Edit ${project.title}`}
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    className="grid size-10 place-items-center rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    onClick={() => remove(project)}
                    aria-label={`Delete ${project.title}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="p-10 text-center text-sm text-slate-500">
            No projects yet.
          </p>
        )}
      </section>
    </>
  );
}

function ProjectForm({ project, saving, onSubmit, onClose }) {
  const [preview, setPreview] = useState(null);
  const dateValue = (value) =>
    value ? new Date(value).toISOString().slice(0, 16) : "";
  const valuesFrom = (form) => {
    const values = Object.fromEntries(new FormData(form));
    values.is_published = form.elements.is_published.checked;
    return values;
  };
  const saveDraft = (event) => localStorage.setItem(draftKey(project.id), JSON.stringify(valuesFrom(event.currentTarget)));
  return (
    <section className="surface mt-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">
          {project.id ? "Edit project" : "New project"}
        </h2>
        <button
          className="grid size-10 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-ink-800"
          onClick={onClose}
          aria-label="Close form"
        >
          <X />
        </button>
      </div>
      <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={onSubmit} onInput={saveDraft}>
        <Field
          name="title"
          label="Project name"
          value={project.title}
          required
        />
        <Field
          name="slug"
          label="URL slug"
          value={project.slug}
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          required
        />
        <Field name="subtitle" label="Subtitle" value={project.subtitle} />
        <Field name="category" label="Category" value={project.category} />
        <Field name="status" label="Status" value={project.status} />
        <Field
          name="github_url"
          label="GitHub URL"
          value={project.github_url}
          type="url"
        />
        <Field
          name="live_url"
          label="Live URL"
          value={project.live_url}
          type="url"
        />
        <Field
          name="video_url"
          label="Demo video URL"
          value={project.video_url}
          type="url"
        />
        <Field
          name="publish_at"
          label="Publish at (optional)"
          value={dateValue(project.publish_at)}
          type="datetime-local"
        />
        <Field
          name="expires_at"
          label="Expire at (optional)"
          value={dateValue(project.expires_at)}
          type="datetime-local"
        />
        <label className="flex items-center gap-3 self-end py-3 text-sm font-semibold">
          <input
            name="is_published"
            type="checkbox"
            defaultChecked={Boolean(project.is_published)}
            className="size-4"
          />
          Publish on portfolio
        </label>
        <TextArea
          name="short_description"
          label="Short description"
          value={project.short_description}
          required
          minLength="10"
        />
        <TextArea name="overview" label="Overview" value={project.overview} />
        <TextArea name="problem" label="Problem" value={project.problem} />
        <TextArea name="solution" label="Solution" value={project.solution} />
        <TextArea
          name="features"
          label="Features (one per line)"
          value={project.features}
        />
        <TextArea
          name="architecture"
          label="Architecture"
          value={project.architecture}
        />
        <TextArea
          name="outcomes"
          label="Outcomes and results"
          value={project.outcomes}
        />
        <TextArea
          name="challenges"
          label="Challenges"
          value={project.challenges}
        />
        <TextArea
          name="lessons_learned"
          label="Lessons learned"
          value={project.lessons_learned}
        />
        <TextArea
          name="contribution"
          label="Your contribution"
          value={project.contribution}
        />
        <div className="flex gap-3 md:col-span-2">
          <button className="button-primary" disabled={saving}>
            {saving ? "Saving…" : "Save project"}
          </button>
          <button className="button-secondary" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="button-secondary" type="button" onClick={(event) => setPreview(valuesFrom(event.currentTarget.form))}>
            Preview draft
          </button>
        </div>
      </form>
      {preview && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4" role="dialog" aria-modal="true" aria-label="Project preview"><article className="surface max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 sm:p-8"><div className="flex justify-between gap-4"><div><p className="eyebrow">{preview.category || "Project"}</p><h2 className="mt-2 text-3xl font-bold">{preview.title || "Untitled project"}</h2><p className="mt-2 text-slate-500">{preview.subtitle}</p></div><button className="button-secondary" onClick={() => setPreview(null)}>Close</button></div><p className="mt-6 text-lg">{preview.short_description}</p>{[["Overview",preview.overview],["Problem",preview.problem],["Solution",preview.solution],["Architecture",preview.architecture],["Outcomes",preview.outcomes]].filter(([,value]) => value).map(([title,value]) => <section className="mt-6" key={title}><h3 className="text-xl font-bold">{title}</h3><p className="mt-2 whitespace-pre-line text-slate-600 dark:text-slate-300">{value}</p></section>)}</article></div>}
    </section>
  );
}
function Field({ name, label, value = "", type = "text", ...props }) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={value || ""}
        className="min-h-11 rounded-lg border border-slate-300 bg-transparent px-3 dark:border-slate-700"
        {...props}
      />
    </label>
  );
}
function TextArea({ name, label, value = "", ...props }) {
  return (
    <label className="grid gap-2 text-sm font-semibold md:col-span-2">
      {label}
      <textarea
        name={name}
        rows="4"
        defaultValue={value || ""}
        className="rounded-lg border border-slate-300 bg-transparent p-3 dark:border-slate-700"
        {...props}
      />
    </label>
  );
}
