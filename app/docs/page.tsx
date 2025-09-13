import { title } from "@/components/primitives";

export default function DocsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-content2">
      <div className="w-full max-w-2xl text-center">
        <h1 className={title({ class: "text-white drop-shadow-lg" })}>Documentation</h1>
        <p className="text-white/80 mt-4 text-lg">
          Comprehensive guides and API documentation for Data Cleaner.
        </p>
      </div>
    </div>
  );
}
