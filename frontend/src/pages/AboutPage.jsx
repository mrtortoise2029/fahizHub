import { ErrorState } from "../components/ContentState";
import { useApiResource } from "../hooks/useApiResource";
export default function AboutPage() {
  const { data, loading, error } = useApiResource("/content/profile");
  return (
    <div className="container-page py-12 sm:py-16">
      <p className="eyebrow">About</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
        Growing through practical software development
      </h1>
      <div className="mt-8 max-w-3xl">
        {loading ? (
          <p className="text-slate-500">Loading profile…</p>
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <div className="space-y-5 text-base leading-8 text-slate-600 dark:text-slate-300">
            <p>{data.long_bio}</p>
            <section className="surface p-5 sm:p-6">
              <h2 className="font-bold text-slate-950 dark:text-white">
                Current focus
              </h2>
              <p className="mt-2">{data.current_focus}</p>
            </section>
            <p>
              Aspiring AI and Data Scientist with a strong software engineering foundation and a passion for research, machine learning, and data-driven problem solving. Focused on strengthening expertise through practical development, system design, testing, and real-world projects, while pursuing opportunities to conduct research and develop innovative AI-driven solutions to complex problems.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
