import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from './config'
import { createCasa, uploadCasaImage } from './casas'

export function CasaUploader() {
  const [title, setTitle] = useState('')
  const [casaId, setCasaId] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [pending, setPending] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!casaId) return
    let prevCount = 0
    return onSnapshot(doc(db, 'casas', casaId), (snap) => {
      const nextImages = (snap.data()?.images as string[] | undefined) ?? []
      const arrived = nextImages.length - prevCount
      prevCount = nextImages.length
      setImages(nextImages)
      if (arrived > 0) setPending((prev) => Math.max(0, prev - arrived))
    })
  }, [casaId])

  async function handleCreateCasa(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      setCasaId(await createCasa(title))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo salió mal')
    } finally {
      setBusy(false)
    }
  }

  async function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    if (!casaId || !e.target.files) return
    setError(null)
    const files = Array.from(e.target.files)
    setBusy(true)
    setPending((prev) => prev + files.length)
    try {
      for (const file of files) {
        await uploadCasaImage(casaId, file)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo salió mal')
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  const input =
    'w-full rounded-lg border border-gray-91 bg-white px-4 py-2.5 text-sm text-orange-18 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-orange-91 file:px-3 file:py-1.5 file:text-orange-18'
  const button =
    'cursor-pointer rounded-full bg-orange-47 px-6 py-3 text-sm font-semibold text-gray-99 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <div className="mx-auto my-12 w-full max-w-sm rounded-lg border border-orange-86 bg-gray-98 p-6 text-left">
      <h2 className="mb-4 text-xl font-bold text-orange-18">Publica tu casa</h2>

      {!casaId ? (
        <form className="flex flex-col gap-2.5" onSubmit={handleCreateCasa}>
          <input
            type="text"
            placeholder="Título de la casa"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={input}
          />
          <button type="submit" disabled={busy} className={button}>
            Crear
          </button>
        </form>
      ) : (
        <>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            disabled={busy}
            className={input}
          />
          {pending > 0 && (
            <p className="mt-3 text-sm text-orange-47">Procesando {pending} imagen(es)…</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {images.map((url) => (
              <img
                key={url}
                src={url}
                alt=""
                className="h-[100px] w-[100px] rounded-md border border-gray-91 object-cover"
              />
            ))}
          </div>
        </>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  )
}
