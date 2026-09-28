import { useCallback, useEffect, useState } from "react";
import { api } from "../../services/api";

const tabs = [
  "Search & bulk",
  "Media",
  "Analytics",
  "Email",
  "Versions",
  "Backups",
  "Security",
  "Audit",
];
export default function AdminToolsPage() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState(tabs[0]);
  const [status, setStatus] = useState("");
  const load = useCallback(
    () =>
      api
        .get("/admin-tools/overview")
        .then(({ data: response }) => setData(response.data)),
    [],
  );
  useEffect(() => {
    load();
  }, [load]);
  async function action(request, message) {
    setStatus("Working…");
    try {
      await request();
      setStatus(message);
      await load();
    } catch (error) {
      setStatus(error.response?.data?.message || "Action failed.");
    }
  }
  if (!data) return <p>Loading admin tools…</p>;
  return (
    <>
      <h1 className="text-2xl font-bold">Operations center</h1>
      <p className="mt-1 text-sm text-slate-500">
        Search, media, delivery, history, backups, analytics and security.
      </p>
      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {tabs.map((item) => (
          <button
            className={
              tab === item
                ? "button-primary shrink-0"
                : "button-secondary shrink-0"
            }
            onClick={() => setTab(item)}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>
      {status && (
        <p className="mt-3 text-sm" role="status">
          {status}
        </p>
      )}
      {tab === "Search & bulk" && <SearchBulk action={action} />}{" "}
      {tab === "Media" && (
        <Table
          title="Media library"
          headers={["File", "Kind", "Size", "Action"]}
          rows={data.media.map((item) => [
            <a href={item.url} target="_blank" rel="noreferrer">
              {item.original_name}
            </a>,
            item.kind,
            formatBytes(item.size_bytes),
            <button
              className="text-red-600"
              onClick={() =>
                action(
                  () => api.delete(`/admin-tools/media/${item.id}`),
                  "File removed.",
                )
              }
            >
              Delete
            </button>,
          ])}
        />
      )}{" "}
      {tab === "Analytics" && <Analytics data={data} />}{" "}
      {tab === "Email" && (
        <Table
          title="Email delivery"
          headers={["Recipient", "Subject", "Status", "Action"]}
          rows={data.emails.map((item) => [
            item.recipient,
            item.subject,
            item.status,
            <button
              className="text-brand-600"
              onClick={() =>
                action(
                  () => api.post(`/admin-tools/emails/${item.id}/retry`),
                  "Email retry submitted.",
                )
              }
            >
              Retry
            </button>,
          ])}
        />
      )}{" "}
      {tab === "Versions" && (
        <Table
          title="Version history"
          headers={["Content", "Record", "Saved", "Action"]}
          rows={data.versions.map((item) => [
            item.entity_type,
            item.entity_id,
            new Date(item.created_at).toLocaleString(),
            <button
              className="text-brand-600"
              onClick={() =>
                confirm("Restore this saved version?") &&
                action(
                  () => api.post(`/admin-tools/versions/${item.id}/restore`),
                  "Version restored.",
                )
              }
            >
              Restore
            </button>,
          ])}
        />
      )}{" "}
      {tab === "Backups" && (
        <section className="surface mt-5 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Backup history</h2>
            <button
              className="button-primary"
              onClick={() =>
                action(
                  () => api.post("/admin-tools/backups"),
                  "Backup started. Refresh shortly to see completion.",
                )
              }
            >
              Create backup
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {data.backups.map((item) => (
              <p
                className="rounded-lg bg-slate-100 p-3 text-sm dark:bg-ink-800"
                key={item.id}
              >
                {item.filename} · {item.status}{" "}
                {item.size_bytes ? `· ${formatBytes(item.size_bytes)}` : ""}
              </p>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Restore is intentionally command-line guided so a mistaken click
            cannot overwrite production. Follow docs/operations.md.
          </p>
        </section>
      )}{" "}
      {tab === "Security" && <Security data={data} action={action} />}{" "}
      {tab === "Audit" && (
        <Table
          title="Audit trail"
          headers={["Action", "IP", "When"]}
          rows={data.audits.map((item) => [
            item.action,
            item.ip_address,
            new Date(item.created_at).toLocaleString(),
          ])}
        />
      )}
    </>
  );
}

function SearchBulk({ action }) {
  const [results, setResults] = useState([]);
  async function search(event) {
    const q = event.target.value;
    if (q.length < 2) return setResults([]);
    const { data } = await api.get("/admin-tools/search", { params: { q } });
    setResults(data.data);
  }
  async function bulk(event) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget));
    const ids = form.ids.split(",").map(Number).filter(Boolean);
    await action(
      () =>
        api.patch("/admin-tools/bulk-publish", {
          type: form.type,
          ids,
          is_published: form.action === "publish",
        }),
      "Bulk update complete.",
    );
  }
  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      <section className="surface p-5">
        <h2 className="font-bold">Global search</h2>
        <input
          className="mt-4 min-h-11 w-full rounded-lg border bg-transparent px-3"
          placeholder="Search projects, messages, tasks, meetings…"
          onChange={search}
        />
        <div className="mt-3 divide-y dark:divide-slate-800">
          {results.map((item) => (
            <p className="py-3 text-sm" key={`${item.type}-${item.id}`}>
              <span className="font-semibold">{item.label}</span>{" "}
              <span className="text-slate-500">
                · {item.type} #{item.id}
              </span>
            </p>
          ))}
        </div>
      </section>
      <form className="surface grid content-start gap-4 p-5" onSubmit={bulk}>
        <h2 className="font-bold">Bulk publishing</h2>
        <select
          name="type"
          className="min-h-11 rounded-lg border bg-transparent px-3"
        >
          <option value="projects">Projects</option>
          <option value="achievements">Achievements</option>
          <option value="services">Services</option>
        </select>
        <input
          name="ids"
          required
          pattern="[0-9, ]+"
          placeholder="Record IDs, e.g. 1, 2, 3"
          className="min-h-11 rounded-lg border bg-transparent px-3"
        />
        <select
          name="action"
          className="min-h-11 rounded-lg border bg-transparent px-3"
        >
          <option value="publish">Publish</option>
          <option value="unpublish">Move to draft</option>
        </select>
        <button className="button-primary">Apply to records</button>
      </form>
    </div>
  );
}
function Analytics({ data }) {
  const max = Math.max(1, ...data.analytics.map((item) => Number(item.count)));
  return (
    <section className="surface mt-5 p-5">
      <h2 className="font-bold">30-day analytics trends</h2>
      <div className="mt-5 space-y-3">
        {data.analytics.map((item) => (
          <div
            className="grid grid-cols-[7rem_1fr_3rem] items-center gap-3 text-xs"
            key={`${item.day}-${item.event_type}`}
          >
            <span>
              {new Date(item.day).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
            <div>
              <p>{item.event_type}</p>
              <div className="mt-1 h-2 rounded bg-slate-200 dark:bg-ink-800">
                <div
                  className="h-2 rounded bg-brand-600"
                  style={{ width: `${(Number(item.count) / max) * 100}%` }}
                />
              </div>
            </div>
            <strong>{item.count}</strong>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm text-slate-500">
        AI feedback:{" "}
        {data.feedback
          .map((item) => `${item.rating} ${item.count}`)
          .join(" · ") || "No feedback yet"}
      </p>
    </section>
  );
}
function Security({ data, action }) {
  const [setup, setSetup] = useState(null);
  const [otp, setOtp] = useState("");
  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      <section className="surface p-5">
        <h2 className="font-bold">Two-factor authentication</h2>
        {setup ? (
          <>
            <img
              className="mt-4 size-48"
              src={setup.qr_code}
              alt="Authenticator setup QR code"
            />
            <p className="mt-2 break-all text-xs">
              Manual key: {setup.manual_key}
            </p>
            <input
              className="mt-4 min-h-11 rounded-lg border bg-transparent px-3"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              inputMode="numeric"
              placeholder="6-digit code"
            />
            <button
              className="button-primary mt-3"
              onClick={() =>
                action(
                  () => api.post("/auth/2fa/enable", { otp }),
                  "Two-factor authentication enabled.",
                )
              }
            >
              Verify and enable
            </button>
          </>
        ) : (
          <button
            className="button-primary mt-4"
            onClick={async () => {
              const { data: response } = await api.post("/auth/2fa/setup");
              setSetup(response.data);
            }}
          >
            Set up authenticator
          </button>
        )}
      </section>
      <section className="surface p-5">
        <h2 className="font-bold">Active sessions</h2>
        <div className="mt-3 divide-y dark:divide-slate-800">
          {data.sessions.map((session) => (
            <div className="py-3 text-sm" key={session.id}>
              <p className="font-semibold">
                {session.current ? "Current session" : "Signed-in device"}
              </p>
              <p className="truncate text-xs text-slate-500">
                {session.user_agent} · {session.ip_address}
              </p>
              {!session.current && (
                <button
                  className="mt-2 text-red-600"
                  onClick={() =>
                    action(
                      () => api.delete(`/auth/sessions/${session.id}`),
                      "Session revoked.",
                    )
                  }
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
function Table({ title, headers, rows }) {
  return (
    <section className="surface mt-5 overflow-x-auto p-5">
      <h2 className="font-bold">{title}</h2>
      <table className="mt-4 min-w-full text-left text-sm">
        <thead>
          <tr>
            {headers.map((item) => (
              <th className="border-b p-3 dark:border-slate-800" key={item}>
                {item}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td
                  className="border-b p-3 dark:border-slate-800"
                  key={cellIndex}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <p className="py-6 text-sm text-slate-500">No records yet.</p>
      )}
    </section>
  );
}
const formatBytes = (value) =>
  value ? `${(value / 1024 / 1024).toFixed(2)} MB` : "—";
