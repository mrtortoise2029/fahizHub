import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../services/api";
export default function AdminContentPage({ type }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const load = useCallback(async () => {
    const { data } = await api.get(`/admin-content/${type}`);
    setItems(data.data);
    if (type === "skills") {
      const c = await api.get("/admin-content/meta/categories");
      setCategories(c.data.data);
    }
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
    if (type === "education") {
      v.credits_completed = v.credits_completed
        ? Number(v.credits_completed)
        : null;
      v.cgpa = v.cgpa ? Number(v.cgpa) : null;
    }
    if (type === "skills") v.category_id = Number(v.category_id);
    if (editing?.id) await api.put(`/admin-content/${type}/${editing.id}`, v);
    else await api.post(`/admin-content/${type}`, v);
    e.currentTarget.reset();
    setEditing(null);
    load();
  }
  async function remove(id) {
    if (confirm("Delete this record?")) {
      await api.delete(`/admin-content/${type}/${id}`);
      load();
    }
  }
  const value = (name) => editing?.[name] ?? "";
  return (
    <>
      <h1 className="text-2xl font-bold">
        {type[0].toUpperCase() + type.slice(1)}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Create, edit, publish, and remove public portfolio content.
      </p>
      <form
        key={editing?.id || "new"}
        className="surface mt-6 grid gap-3 p-5 md:grid-cols-2"
        onSubmit={save}
      >
        {type === "education" ? (
          <>
            <Input
              name="institution"
              placeholder="Institution"
              defaultValue={value("institution")}
            />
            <Input
              name="degree"
              placeholder="Degree"
              defaultValue={value("degree")}
            />
            <Input
              name="status"
              placeholder="Status"
              defaultValue={value("status")}
            />
            <Input
              name="credits_completed"
              type="number"
              placeholder="Credits completed"
              defaultValue={value("credits_completed")}
            />
            <Input
              name="cgpa"
              type="number"
              step="0.01"
              placeholder="CGPA"
              defaultValue={value("cgpa")}
            />
            <textarea
              name="description"
              defaultValue={value("description")}
              placeholder="Description"
              className="rounded-lg border bg-transparent p-3"
            />
          </>
        ) : type === "experience" ? (
          <>
            <Input
              name="organization"
              placeholder="Organization"
              defaultValue={value("organization")}
            />
            <Input
              name="title"
              placeholder="Title"
              defaultValue={value("title")}
            />
            <Input
              name="previous_title"
              placeholder="Previous title"
              defaultValue={value("previous_title")}
            />
            <textarea
              name="description"
              defaultValue={value("description")}
              placeholder="Description"
              className="rounded-lg border bg-transparent p-3"
            />
          </>
        ) : (
          <>
            <Input
              name="name"
              placeholder="Skill name"
              defaultValue={value("name")}
            />
            <select
              name="category_id"
              defaultValue={value("category_id") || categories[0]?.id}
              className="min-h-11 rounded-lg border bg-transparent px-3"
            >
              {categories.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </>
        )}
        <label className="flex items-center gap-2 text-sm">
          <input
            name="is_published"
            type="checkbox"
            defaultChecked={editing ? Boolean(editing.is_published) : true}
          />
          Published
        </label>
        <div className="flex gap-2">
          <button className="button-primary">
            {editing ? <Pencil size={17} /> : <Plus size={17} />}{" "}
            {editing ? "Update" : "Add"} record
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
      <div className="surface mt-6 divide-y dark:divide-slate-800">
        {items.map((item) => (
          <div className="flex items-center justify-between p-4" key={item.id}>
            <button
              className="min-w-0 text-left"
              onClick={() => setEditing(item)}
            >
              <p className="font-medium">
                {item.name || item.degree || item.title}
              </p>
              <p className="text-xs text-slate-500">
                {item.category || item.institution || item.organization} ·{" "}
                {item.is_published ? "Published" : "Draft"}
              </p>
            </button>
            <div className="flex gap-3">
              <button onClick={() => setEditing(item)} aria-label="Edit">
                <Pencil size={17} />
              </button>
              <button
                className="text-red-600"
                onClick={() => remove(item.id)}
                aria-label="Delete"
              >
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
function Input(props) {
  return (
    <input
      required
      className="min-h-11 rounded-lg border bg-transparent px-3"
      {...props}
    />
  );
}
