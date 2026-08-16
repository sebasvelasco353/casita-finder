import { AuthPage } from './AuthPage'
import { CasaUploader } from './CasaUploader'
import { MisCasas } from './MisCasas'
import { useAuth } from './auth'

const CENTER =
  'flex flex-grow flex-col items-center justify-center gap-6 px-5 py-8 text-center md:px-0'

function FirebasePage() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <section className={CENTER}>
        <p className="text-orange-42">Cargando…</p>
      </section>
    )
  }

  if (!user) {
    return (
      <section className={CENTER}>
        <AuthPage />
      </section>
    )
  }

  return (
    <section className={CENTER}>
      <h1 className="text-4xl font-bold text-orange-18">Bienvenido</h1>
      <p className="text-orange-42">Sesión iniciada como {user.email}</p>
      <button
        type="button"
        onClick={() => void signOut()}
        className="cursor-pointer rounded-full border border-orange-47 bg-transparent px-6 py-3 text-sm font-semibold text-orange-47 hover:bg-orange-91"
      >
        Cerrar sesión
      </button>
      <CasaUploader />
      <MisCasas />
    </section>
  )
}

export default FirebasePage
