import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";

export default function GpaPanel() {
  const [rules, setRules] = useState([]);
  const [grades, setGrades] = useState({
    entries: [],
    total_credits: 0,
    gpa: null,
  });
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      const [r, g] = await Promise.all([
        api.get("/student/grading-rules"),
        api.get("/student/grades"),
      ]);
      setRules(r.data.data);
      setGrades(g.data.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load GPA data.");
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  async function addRule(e) {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api.post("/student/grading-rules", {
        ...v,
        min_mark: Number(v.min_mark),
        max_mark: Number(v.max_mark),
        grade_point: Number(v.grade_point),
        display_order: rules.length,
      });
      e.currentTarget.reset();
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save grading rule.");
    }
  }
  async function addGrade(e) {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const payload = {
        course_name: v.course_name,
        credit: Number(v.credit),
        grade_label: "",
        mark: rules.length ? Number(v.mark) : null,
        grade_point: rules.length ? null : Number(v.grade_point),
      };
      await api.post("/student/grades", payload);
      e.currentTarget.reset();
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to calculate the grade.");
    }
  }
  async function remove(path) {
    try {
      await api.delete(path);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete item.");
    }
  }
  return (
    <section className="mt-6 grid gap-6 xl:grid-cols-2">
      <div className="surface p-5">
        <h2 className="font-bold">Configurable grading rules</h2>
        <p className="mt-1 text-xs text-slate-500">
          Ranges cannot overlap. Marks are converted automatically using these
          rules.
        </p>
        {error && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <form
          className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5"
          onSubmit={addRule}
        >
          <input
            name="label"
            required
            placeholder="Grade (A)"
            className="min-h-11 rounded-lg border bg-transparent px-3"
          />
          <input
            name="min_mark"
            required
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="Min mark"
            className="min-h-11 rounded-lg border bg-transparent px-3"
          />
          <input
            name="max_mark"
            required
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="Max mark"
            className="min-h-11 rounded-lg border bg-transparent px-3"
          />
          <input
            name="grade_point"
            required
            type="number"
            min="0"
            max="5"
            step="0.01"
            placeholder="Point"
            className="min-h-11 rounded-lg border bg-transparent px-3"
          />
          <button className="button-primary col-span-2 sm:col-span-1">
            <Plus size={16} />
            Rule
          </button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {rules.map((r) => (
            <span
              className="rounded-lg bg-slate-100 px-3 py-2 text-sm dark:bg-ink-800"
              key={r.id}
            >
              {r.label}: {Number(r.min_mark)}–{Number(r.max_mark)} →{" "}
              {Number(r.grade_point).toFixed(2)}
              <button
                className="ml-2 text-red-600"
                onClick={() => remove(`/student/grading-rules/${r.id}`)}
                aria-label={`Delete ${r.label} rule`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
      <div className="surface p-5">
        <div className="flex justify-between">
          <h2 className="font-bold">GPA calculator</h2>
          <strong className="text-brand-600">
            GPA: {grades.gpa === null ? "—" : Number(grades.gpa).toFixed(2)}
          </strong>
        </div>
        <form className="mt-4 grid gap-3 sm:grid-cols-4" onSubmit={addGrade}>
          <input
            name="course_name"
            required
            placeholder="Course"
            className="min-h-11 rounded-lg border bg-transparent px-3"
          />
          <input
            name="credit"
            required
            type="number"
            min="0.5"
            max="20"
            step="0.5"
            placeholder="Credit"
            className="min-h-11 rounded-lg border bg-transparent px-3"
          />
          {rules.length ? (
            <input
              name="mark"
              required
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="Mark"
              className="min-h-11 rounded-lg border bg-transparent px-3"
            />
          ) : (
            <input
              name="grade_point"
              required
              type="number"
              min="0"
              max="5"
              step="0.01"
              placeholder="Grade point"
              className="min-h-11 rounded-lg border bg-transparent px-3"
            />
          )}
          <button className="button-primary">
            <Plus size={16} />
            Add
          </button>
        </form>
        <div className="mt-4 divide-y dark:divide-slate-800">
          {grades.entries.map((g) => (
            <div className="flex justify-between py-2 text-sm" key={g.id}>
              <span>
                {g.course_name} · {Number(g.credit)} credits
                {g.mark !== null ? ` · ${Number(g.mark)} marks` : ""} ·{" "}
                {g.grade_label || Number(g.grade_point).toFixed(2)}
              </span>
              <button
                className="text-red-600"
                onClick={() => remove(`/student/grades/${g.id}`)}
                aria-label={`Delete ${g.course_name} grade`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
