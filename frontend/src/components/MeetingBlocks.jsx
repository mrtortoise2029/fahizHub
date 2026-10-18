import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
export default function MeetingBlocks() {
  const [data, setData] = useState({ dates: [], slots: [] });
  const load = useCallback(async () => {
    const { data: r } = await api.get("/meetings/blocks");
    setData(r.data);
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  async function addDate(e) {
    e.preventDefault();
    await api.post(
      "/meetings/unavailable-dates",
      Object.fromEntries(new FormData(e.currentTarget)),
    );
    e.currentTarget.reset();
    load();
  }
  async function addSlot(e) {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(e.currentTarget));
    const start = new Date(v.start_time);
    const end = new Date(v.end_time);
    await api.post("/meetings/blocked-slots", {
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      reason: v.reason,
    });
    e.currentTarget.reset();
    load();
  }
  async function remove(path) {
    await api.delete(path);
    load();
  }
  return (
    <section className="surface mt-6 p-5">
      <h2 className="font-bold">Unavailable dates and blocked slots</h2>
      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        <form className="grid gap-3" onSubmit={addDate}>
          <input
            name="date"
            type="date"
            required
            className="min-h-11 rounded-lg border bg-transparent px-3"
          />
          <input
            name="reason"
            placeholder="Reason"
            className="min-h-11 rounded-lg border bg-transparent px-3"
          />
          <button className="button-secondary">
            <Plus size={16} />
            Block date
          </button>
        </form>
        <form className="grid gap-3" onSubmit={addSlot}>
          <input
            name="start_time"
            type="datetime-local"
            required
            className="min-h-11 rounded-lg border bg-transparent px-3"
          />
          <input
            name="end_time"
            type="datetime-local"
            required
            className="min-h-11 rounded-lg border bg-transparent px-3"
          />
          <input
            name="reason"
            placeholder="Reason"
            className="min-h-11 rounded-lg border bg-transparent px-3"
          />
          <button className="button-secondary">
            <Plus size={16} />
            Block time
          </button>
        </form>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {data.dates.map((d) => (
          <span
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm dark:bg-ink-800"
            key={`d${d.id}`}
          >
            {String(d.date).slice(0, 10)} · {d.reason}
            <button
              className="ml-2 text-red-600"
              onClick={() => remove(`/meetings/unavailable-dates/${d.id}`)}
            >
              <Trash2 size={14} />
            </button>
          </span>
        ))}
        {data.slots.map((s) => (
          <span
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm dark:bg-ink-800"
            key={`s${s.id}`}
          >
            {new Date(s.start_time_utc).toLocaleString()} · {s.reason}
            <button
              className="ml-2 text-red-600"
              onClick={() => remove(`/meetings/blocked-slots/${s.id}`)}
            >
              <Trash2 size={14} />
            </button>
          </span>
        ))}
      </div>
    </section>
  );
}
