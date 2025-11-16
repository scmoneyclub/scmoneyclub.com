export default function TermsContent() {
  return (
    <section className="py-12">
      <div className="max-w-3xl mx-auto space-y-8 text-gray-300">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
          <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Introduction</h2>
        </div>
      </div>
    </section>
  )
}