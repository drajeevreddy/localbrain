import Link from 'next/link'

const providers = [
  'NVIDIA NIM', 'Groq', 'Google Gemini', 'OpenRouter',
  'Mistral', 'Together AI', 'Cohere', 'Cerebras', 'Hugging Face', 'Ollama',
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#fcfdff]">
      <nav className="flex items-center justify-between px-8 h-16 border-b border-[rgba(255,255,255,0.06)]">
        <span className="text-lg font-semibold tracking-tight">LocalMind</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-[#a1a4a5] hover:text-[#fcfdff] transition-colors">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="h-9 px-4 text-sm font-medium bg-white text-black rounded-md inline-flex items-center hover:bg-[#f1f7fe] transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      <section className="px-8 py-32 max-w-[1200px] mx-auto">
        <h1 className="text-[96px] leading-[1.0] tracking-[-0.96px] font-normal mb-6">
          Your knowledge,<br />
          connected.
        </h1>
        <p className="text-xl text-[rgba(252,253,255,0.86)] max-w-lg mb-10 leading-relaxed">
          LocalMind turns your notes into a living knowledge graph with AI-powered search and chat.
          Bring your own LLM keys — we support 10+ providers with free tiers.
        </p>
        <Link
          href="/signup"
          className="inline-flex h-11 px-6 text-sm font-medium bg-white text-black rounded-lg items-center hover:bg-[#f1f7fe] transition-colors"
        >
          Start for free
        </Link>
      </section>

      <section className="px-8 py-24 max-w-[1200px] mx-auto">
        <h2 className="text-3xl font-medium mb-12 tracking-tight">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)] rounded-xl p-8">
            <div className="w-10 h-10 rounded-lg bg-[#101012] flex items-center justify-center mb-4 text-[#3b9eff] text-lg">
              1
            </div>
            <h3 className="text-lg font-medium mb-2">Write notes</h3>
            <p className="text-sm text-[rgba(252,253,255,0.86)] leading-relaxed">
              Write in Markdown. Import PDFs. Your content is chunked and embedded into vectors.
            </p>
          </div>
          <div className="bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)] rounded-xl p-8">
            <div className="w-10 h-10 rounded-lg bg-[#101012] flex items-center justify-center mb-4 text-[#a855f7] text-lg">
              2
            </div>
            <h3 className="text-lg font-medium mb-2">Build the graph</h3>
            <p className="text-sm text-[rgba(252,253,255,0.86)] leading-relaxed">
              AI extracts concepts and entities, connecting them into a visual knowledge graph.
            </p>
          </div>
          <div className="bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)] rounded-xl p-8">
            <div className="w-10 h-10 rounded-lg bg-[#101012] flex items-center justify-center mb-4 text-[#11ff99] text-lg">
              3
            </div>
            <h3 className="text-lg font-medium mb-2">Chat & search</h3>
            <p className="text-sm text-[rgba(252,253,255,0.86)] leading-relaxed">
              Ask questions in natural language. Get answers grounded in your notes with source citations.
            </p>
          </div>
        </div>
      </section>

      <section className="px-8 py-24 max-w-[1200px] mx-auto">
        <h2 className="text-3xl font-medium mb-12 tracking-tight">Supported providers</h2>
        <div className="flex flex-wrap gap-3">
          {providers.map((p) => (
            <span
              key={p}
              className="px-4 py-2 bg-[#101012] text-[rgba(252,253,255,0.86)] rounded-full text-sm border border-[rgba(255,255,255,0.06)]"
            >
              {p}
            </span>
          ))}
        </div>
      </section>

      <footer className="px-8 py-16 border-t border-[rgba(255,255,255,0.04)] text-center text-sm text-[#888e90]">
        <p>LocalMind — Your data stays yours. Self-hosted AI knowledge graph.</p>
      </footer>
    </div>
  )
}
