export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-xl rounded-2xl border border-edge bg-surface p-8">
        <h1 className="text-3xl font-semibold text-ink">
          نظام تعلم الذكاء الاصطناعي
        </h1>
        <p className="mt-3 text-ink-2">
          واجهة قيد الإنشاء — سيُستبدل هذا المحتوى بلوحة التحكم الكاملة في
          مرحلة لاحقة.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="rounded-lg bg-accent px-4 py-2 font-medium text-app transition-colors hover:bg-accent-hover"
          >
            زر تجريبي
          </button>
          <span className="text-sm text-muted">
            <span className="font-mono" dir="ltr">
              37
            </span>{" "}
            أسبوعًا من التعلم المنظم
          </span>
        </div>
      </section>
    </main>
  );
}
