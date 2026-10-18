import { useApiResource } from "../hooks/useApiResource";
import { ErrorState } from "../components/ContentState";
export default function CatalogPage({ type }) {
  const { data, loading, error } = useApiResource(`/catalog/${type}`, []);
  const title = type === "services" ? "Services" : "Achievements";
  const server =
    import.meta.env.VITE_SERVER_URL ||
    (import.meta.env.DEV ? "http://localhost:3000" : "");
  return (
    <div className="container-page py-12 sm:py-16">
      <p className="eyebrow">Professional profile</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
        {type === "services"
          ? "Ways we can discuss building practical technology together."
          : "Published milestones, workshops, awards, certifications, and leadership activities."}
      </p>
      <div className="mt-8">
        {loading ? (
          <p>Loading…</p>
        ) : error ? (
          <ErrorState message={error} />
        ) : data.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {data.map((item) => (
              <article className="surface p-5" key={item.id}>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                  {item.type || item.availability || "Available for discussion"}
                </p>
                <h2 className="mt-2 text-xl font-bold">{item.title}</h2>
                {item.issuer && (
                  <p className="mt-1 text-sm text-slate-500">{item.issuer}</p>
                )}
                <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {item.description}
                </p>
                {item.credential_url && (
                  <a
                    className="mt-4 inline-block text-sm font-semibold text-brand-600"
                    href={
                      item.credential_url.startsWith("/")
                        ? `${server}${item.credential_url}`
                        : item.credential_url
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    View credential
                  </a>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="surface p-10 text-center text-slate-500">
            No published {type} yet.
          </div>
        )}
      </div>
    </div>
  );
}
