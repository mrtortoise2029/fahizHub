import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../services/api";
import FileUpload from "../../components/FileUpload";
export default function CatalogAdminPage({ type }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const load = useCallback(async () => {
    const { data } = await api.get(`/catalog/admin/${type}`);
    setItems(data.data);
  }, [type]);
  useEffect(() => {
    load();
  }, [load]);
  async function save(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = {
      ...Object.fromEntries(f),
      is_published: f.get("is_published") === "on",
    };
    if (editing?.id) await api.put(`/catalog/${type}/${editing.id}`, v);
    else await api.post(`/catalog/${type}`, v);
    e.currentTarget.reset();
    setEditing(null);
    load();
  }
  async function remove(id) {
    if (confirm("Delete this item?")) {
      await api.delete(`/catalog/${type}/${id}`);
      load();
    }
  }
  const achievements = type === "achievements";
  const value = (name) => {
    const v = editing?.[name];
    if (name === "technologies" && Array.isArray(v)) return v.join(", ");
    return v ?? "";
  };
  return (
    <>
      <h1 className="text-2xl font-bold">
        {achievements ? "Achievements" : "Services"}
      </h1>
      <form
        key={editing?.id || "new"}
        className="surface mt-6 grid gap-3 p-5 md:grid-cols-2"
        onSubmit={save}
      >
        {achievements ? (
          <select
            name="type"
            defaultValue={value("type") || "achievement"}
            className="min-h-11 rounded-lg border bg-transparent px-3"
          >
            {[
              "achievement",
              "certification",
              "award",
              "workshop",
              "competition",
              "leadership",
              "event",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        ) : null}
        <Input name="title" placeholder="Title" defaultValue={value("title")} />
        {achievements ? (
          <>
            <Input
              name="issuer"
              placeholder="Issuer or organization"
              defaultValue={value("issuer")}
            />
            <Input
              name="event_date"
              type="date"
              defaultValue={
                value("event_date")
                  ? String(value("event_date")).slice(0, 10)
                  : ""
              }
            />
            <Input
              name="credential_url"
              type="text"
              required={false}
              placeholder="Credential URL"
              defaultValue={value("credential_url")}
            />
          </>
        ) : (
          <>
            <Input
              name="technologies"
              required={false}
              placeholder="Technologies, comma separated"
              defaultValue={value("technologies")}
            />
            <Input
              name="availability"
              required={false}
              placeholder="Availability"
              defaultValue={value("availability")}
            />
            <textarea
              name="process"
              defaultValue={value("process")}
              placeholder="Process"
              className="rounded-lg border bg-transparent p-3"
            />
          </>
        )}
        <Input
          name="publish_at"
          type="datetime-local"
          required={false}
          defaultValue={value("publish_at") ? new Date(value("publish_at")).toISOString().slice(0, 16) : ""}
        />
        <Input
          name="expires_at"
          type="datetime-local"
          required={false}
          defaultValue={value("expires_at") ? new Date(value("expires_at")).toISOString().slice(0, 16) : ""}
        />
        <textarea
          name="description"
          required
          minLength="10"
          defaultValue={value("description")}
          placeholder="Description"
          className="rounded-lg border bg-transparent p-3 md:col-span-2"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            name="is_published"
            type="checkbox"
            defaultChecked={editing ? Boolean(editing.is_published) : false}
          />
          Publish publicly
        </label>
        <div className="flex gap-2">
          <button className="button-primary">
            {editing ? <Pencil size={17} /> : <Plus size={17} />}{" "}
            {editing ? "Update" : "Add"}
          </button>
          {editing && (
            <button
              type="button"
              className="button-secondary"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article
            className="surface flex justify-between gap-4 p-5"
            key={item.id}
          >
            <div>
              <button className="text-left" onClick={() => setEditing(item)}>
                <h2 className="font-bold">{item.title}</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {item.is_published ? "Published" : "Draft"}
                </p>
              </button>
              {achievements && (
                <div className="mt-3">
                  <FileUpload
                    kind="certificate"
                    entityId={item.id}
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    label="Certificate"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditing(item)}>
                <Pencil size={17} />
              </button>
              <button className="text-red-600" onClick={() => remove(item.id)}>
                <Trash2 size={17} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
function Input({ required = true, ...props }) {
  return (
    <input
      required={required}
      className="min-h-11 rounded-lg border bg-transparent px-3"
      {...props}
    />
  );
}
