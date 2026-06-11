import { Construction } from "lucide-react";

// Catch-all for modules not yet built.
// params is a Promise in Next.js 16 and must be awaited.
export default async function ModulePlaceholderPage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: slug } = await params;

  // Convert slug to a readable label (e.g. "mortgage-tools" → "Mortgage Tools")
  const label = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gold-light border border-gold/30 flex items-center justify-center mb-5">
        <Construction size={24} className="text-gold" />
      </div>
      <h2 className="text-xl font-bold text-axen-dark">{label}</h2>
      <p className="text-sm text-gray-400 mt-2 max-w-xs leading-relaxed">
        This module is under active development and will be available in an upcoming
        release of AxenOne.
      </p>
      <div className="mt-6 px-4 py-2 bg-gold-light border border-gold/30 rounded-xl">
        <span className="text-xs font-bold text-gold-dark uppercase tracking-widest">
          Coming Soon
        </span>
      </div>
    </div>
  );
}
