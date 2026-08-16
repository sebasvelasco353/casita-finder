import { useEffect, useState } from 'react'
import { useAuth } from './auth'
import { watchMyCasas, type Casa } from './casas'

export function MisCasas() {
  const { user } = useAuth()
  const [casas, setCasas] = useState<Casa[]>([])

  useEffect(() => {
    if (!user) return
    return watchMyCasas(user.uid, setCasas)
  }, [user])

  if (casas.length === 0) return null

  return (
    <div className="mx-auto my-12 w-full max-w-sm rounded-lg border border-orange-86 bg-gray-98 p-6 text-left">
      <h2 className="mb-4 text-xl font-bold text-orange-18">Mis casas</h2>
      {casas.map((casa) => (
        <div
          key={casa.id}
          className="[&+&]:mt-4 [&+&]:border-t [&+&]:border-gray-91 [&+&]:pt-4"
        >
          <p className="text-sm text-orange-18">{casa.title}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {casa.images.map((url) => (
              <img
                key={url}
                src={url}
                alt=""
                className="h-[100px] w-[100px] rounded-md border border-gray-91 object-cover"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
