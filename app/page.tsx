import Link from 'next/link'

const providers = [
  'NVIDIA NIM', 'Groq', 'Google Gemini', 'OpenRouter',
  'Mistral', 'Together AI', 'Cohere', 'Cerebras', 'Hugging Face', 'Ollama',
]

const features = [
  { num: '1', color: '#3b9eff', title: 'Write notes', desc: 'Write in Markdown. Import PDFs. Your content is chunked and embedded into vectors.' },
  { num: '2', color: '#a855f7', title: 'Build the graph', desc: 'AI extracts concepts and entities, connecting them into a visual knowledge graph.' },
  { num: '3', color: '#11ff99', title: 'Chat & search', desc: 'Ask questions in natural language. Get answers grounded in your notes with source citations.' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#fcfdff] overflow-hidden">
      <nav className="animate-fade-in-down flex items-center justify-between px-4 md:px-8 h-14 md:h-16 border-b border-[rgba(255,255,255,0.06)]">
        <span className="text-base md:text-lg font-semibold tracking-tight">LocalBrain</span>
        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/login" className="text-xs md:text-sm text-[#a1a4a5] hover:text-[#fcfdff] transition-colors duration-200">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="h-8 md:h-9 px-3 md:px-4 text-xs md:text-sm font-medium bg-white text-black rounded-md inline-flex items-center hover:bg-[#f1f7fe] transition-all duration-200 hover:scale-105"
          >
            Get started
          </Link>
        </div>
      </nav>

      <section className="relative px-5 md:px-8 py-16 md:py-32 max-w-[1200px] mx-auto">
        <div className="absolute top-10 md:top-20 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[radial-gradient(circle,rgba(59,158,255,0.08)_0%,transparent_70%)] rounded-full animate-glow-pulse pointer-events-none" />
        <div className="relative">
          <h1 className="animate-fade-in-up text-[40px] md:text-[96px] leading-[1.0] tracking-tight md:tracking-[-0.96px] font-normal mb-4 md:mb-6">
            Your knowledge,<br />
            <span className="animate-fade-in-up delay-200">connected.</span>
          </h1>
          <p className="animate-fade-in-up delay-300 text-base md:text-xl text-[rgba(252,253,255,0.86)] max-w-lg mb-6 md:mb-10 leading-relaxed">
            LocalBrain turns your notes into a living knowledge graph with AI-powered search and chat.
            Bring your own LLM keys — we support 10+ providers with free tiers.
          </p>
          <Link
            href="/signup"
            className="animate-fade-in-up delay-400 inline-flex h-10 md:h-12 px-5 md:px-8 text-sm font-medium bg-white text-black rounded-lg items-center hover:bg-[#f1f7fe] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
          >
            Start for free
          </Link>
        </div>
      </section>

      <section className="px-5 md:px-8 py-16 md:py-24 max-w-[1200px] mx-auto">
        <h2 className="animate-fade-in-up text-xl md:text-3xl font-medium mb-8 md:mb-12 tracking-tight">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {features.map((f, i) => (
            <div
              key={f.num}
              className="animate-fade-in-up hover-lift bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)] rounded-xl p-5 md:p-8 cursor-default"
              style={{ animationDelay: `${200 + i * 150}ms` }}
            >
              <div
                className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-[#101012] flex items-center justify-center mb-3 md:mb-4 text-base md:text-lg font-medium"
                style={{ color: f.color }}
              >
                {f.num}
              </div>
              <h3 className="text-base md:text-lg font-medium mb-1.5 md:mb-2">{f.title}</h3>
              <p className="text-xs md:text-sm text-[rgba(252,253,255,0.86)] leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 md:px-8 py-16 md:py-24 max-w-[1200px] mx-auto">
        <h2 className="animate-fade-in-up text-xl md:text-3xl font-medium mb-8 md:mb-12 tracking-tight">Supported providers</h2>
        <div className="flex flex-wrap gap-2 md:gap-3">
          {providers.map((p, i) => (
            <span
              key={p}
              className="animate-scale-in px-3 md:px-4 py-1.5 md:py-2 bg-[#101012] text-[rgba(252,253,255,0.86)] rounded-full text-xs md:text-sm border border-[rgba(255,255,255,0.06)] hover:border-[rgba(59,158,255,0.3)] hover:bg-[#0a0a0c] transition-all duration-200 cursor-default"
              style={{ animationDelay: `${300 + i * 50}ms` }}
            >
              {p}
            </span>
          ))}
        </div>
      </section>

      <footer className="px-5 md:px-8 py-10 md:py-16 border-t border-[rgba(255,255,255,0.04)] text-center text-xs md:text-sm text-[#888e90]">
        <p>LocalBrain — Your data stays yours. Self-hosted AI knowledge graph.</p>
      </footer>
    </div>
  )
}
