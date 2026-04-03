import { useState, useEffect } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import Head from 'next/head' // ✅ ADDED

export default function Home() {
  const [topic, setTopic] = useState('')
  const [result, setResult] = useState('')
  const [tool, setTool] = useState('titles')
  const [loading, setLoading] = useState(false)
  const [generationCount, setGenerationCount] = useState(0)
  const [isPro, setIsPro] = useState(false)

  const { data: session, status } = useSession()

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/check-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email }),
      })
      const data = await res.json()
      setIsPro(data.isPro)
    } catch {
      setIsPro(false)
    }
  }

  useEffect(() => {
    if (session) fetchUser()
  }, [session])

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('clipfuelData'))
      const today = new Date().toDateString()

      if (saved && saved.date === today) {
        setGenerationCount(saved.count || 0)
      } else {
        localStorage.setItem(
          'clipfuelData',
          JSON.stringify({ count: 0, date: today })
        )
        setGenerationCount(0)
      }
    } catch {
      setGenerationCount(0)
    }
  }, [])

  const getPrompt = () => {
    switch (tool) {
      case 'titles':
        return `Create 5 viral video titles about: ${topic}`
      case 'hooks':
        return `Write 3 viral hooks about: ${topic}`
      case 'captions':
        return `Write 3 captions with emojis about: ${topic}`
      case 'scripts':
        return `Create a short viral script about: ${topic}`
      default:
        return topic
    }
  }

  const generate = async () => {
    if (!topic) return alert("Enter a topic")

    if (!isPro && generationCount >= 3) {
      alert("Upgrade to PRO 🚀")
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: getPrompt() }),
      })

      const data = await res.json()
      setResult(data.text || "No result")

      setGenerationCount((prev) => {
        const updated = prev + 1
        localStorage.setItem(
          'clipfuelData',
          JSON.stringify({
            count: updated,
            date: new Date().toDateString(),
          })
        )
        return updated
      })
    } catch {
      alert("Error generating")
    }

    setLoading(false)
  }

  const handleUpgrade = async () => {
    if (!session?.user?.email) {
      alert("Login first")
      return
    }

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: session.user.email }),
    })

    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  if (status === "loading") return null

  return (
    <>
      {/* ✅ ADDED GOOGLE + SEO */}
      <Head>
        <title>ClipFuel – AI Viral Content Generator</title>
        <meta name="description" content="ClipFuel helps creators generate viral titles, hooks, captions, and scripts instantly." />
        <meta name="google-site-verification" content="wRbFRQEKqPidi6gvBxNd1GpJ0JdRKmhDrG8e4rxf1As" />
      </Head>

      <div style={{
        background: 'radial-gradient(circle at top, #1a0a00, #000)',
        color: '#fff',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>

        <div style={{
          width: '100%',
          maxWidth: '520px',
          padding: '35px',
          borderRadius: '22px',
          background: '#0d0d0d',
          boxShadow: '0 0 60px rgba(255,100,0,0.2)',
          textAlign: 'center',
          border: '1px solid rgba(255,100,0,0.15)'
        }}>

          <div style={{ marginBottom: 10 }}>
            {session ? (
              <button onClick={() => signOut()} style={{ opacity: 0.7 }}>
                Sign out ({session.user.email})
              </button>
            ) : (
              <button onClick={() => signIn()}>
                Sign In 🔐
              </button>
            )}
          </div>

          <img src="/clipfuel-logo.png" style={{ width: 80, marginBottom: 10 }} />

          <h1 style={{
            fontSize: '2.2rem',
            marginBottom: 5,
            fontWeight: 'bold',
            textShadow: '0 0 15px rgba(255,100,0,0.5)'
          }}>
            Go Viral On Demand 🚀
          </h1>

          <p style={{ opacity: 0.6, fontSize: 14 }}>
            Turn ideas into viral content instantly
          </p>

          {isPro && (
            <div style={{
              marginTop: 10,
              marginBottom: 10,
              color: '#ff7a18',
              fontWeight: 'bold'
            }}>
              🚀 PRO UNLOCKED
            </div>
          )}

          <select
            value={tool}
            onChange={(e) => setTool(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              marginTop: '15px',
              background: '#000',
              color: '#fff',
              border: '1px solid #333'
            }}
          >
            <option value="titles">Titles</option>
            <option value="hooks">Hooks</option>
            <option value="captions">Captions</option>
            <option value="scripts">Scripts</option>
          </select>

          <input
            placeholder="Enter your idea..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid #333',
              marginTop: '10px',
              background: '#000',
              color: '#fff'
            }}
          />

          <button
            onClick={generate}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '999px',
              marginTop: '15px',
              background: 'linear-gradient(90deg,#ff7a18,#ff3c00)',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 0 25px rgba(255,100,0,0.4)'
            }}
          >
            {loading ? 'Cooking something viral...' : 'Generate 🔥'}
          </button>

          {loading && (
            <p style={{ marginTop: 10, color: '#ff7a18' }}>
              Generating viral content...
            </p>
          )}

          {!isPro && (
            <>
              <p style={{ marginTop: 10, opacity: 0.6 }}>
                {Math.max(0, 3 - generationCount)} free generations left
              </p>

              <button
                onClick={handleUpgrade}
                style={{
                  marginTop: 10,
                  width: '100%',
                  padding: '12px',
                  borderRadius: '999px',
                  background: '#ff3c00',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 'bold'
                }}
              >
                Unlock Pro 🚀
              </button>
            </>
          )}

          {result && (
            <div style={{
              marginTop: 20,
              padding: '18px',
              borderRadius: '14px',
              background: '#000',
              border: '1px solid rgba(255,100,0,0.2)',
              textAlign: 'left',
              whiteSpace: 'pre-wrap'
            }}>
              <p style={{ color: '#ff7a18', marginBottom: 10 }}>
                🔥 Generated for you:
              </p>

              {result}

              <button
                onClick={() => navigator.clipboard.writeText(result)}
                style={{
                  marginTop: 10,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: '#111',
                  border: '1px solid #333',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                Copy ✂️
              </button>

              <p style={{ marginTop: 10, opacity: 0.6 }}>
                Not good enough? Generate again 🔥
              </p>

            </div>
          )}

        </div>
      </div>
    </>
  )
}