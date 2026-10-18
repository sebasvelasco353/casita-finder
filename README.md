# Una Casita — sitio estático

La entrada publicada es `index.html` con `src/static.css`. Muestra el aviso de cierre definitivo por el uso comercial abusivo que desvió
el propósito solidario de la iniciativa tras el terremoto en Colombia.

No carga JavaScript,
Firebase, autenticación, formularios, analítica ni avisos desde una base de datos.
La política CSP bloquea scripts, conexiones de red y formularios.
El build usa `node scripts/build-static.cjs`, sin dependencias. Firebase ejecuta
ese mismo script directamente en el predeploy para evitar el npm integrado
de su CLI standalone. Vite se usa solo para desarrollo y vista previa.

El código React anterior se conserva en `src/` como referencia, fuera de la entrada publicada.
No se eliminan documentos ni archivos de producción.

## Desarrollo y build

```sh
pnpm install
pnpm dev
pnpm build
pnpm preview
```

El resultado está en `dist/` y se puede servir en cualquier hosting estático.
No se necesitan variables de entorno, Java ni emuladores.

## Apagado de producción (requiere acceso a Firebase)

**Los cambios locales no detienen las funciones ya desplegadas.**

1. Iniciar sesión con acceso al proyecto `una-casita`:
   `pnpm exec firebase login`.
2. Revisar el inventario: `pnpm cloud:stop`.
3. Detener todas las funciones del proyecto:
   `pnpm cloud:stop --execute` (con npm: `npm run cloud:stop -- --execute`).
   El script consulta el inventario, elimina cada función por nombre y región,
   empezando por el proceso programado de correos, y verifica que no queden funciones.
   Firebase CLI también elimina los jobs de Scheduler asociados a esas funciones.
4. Publicar la página y cerrar el acceso de los clientes anteriores a Firestore y Storage:
   `pnpm deploy:static`.
5. Si el dominio sirve desde Vercel, publicar también `dist/` allí usando el flujo
   habitual del proyecto. La configuración de Firebase Hosting no modifica Vercel.
6. Comprobar la consola de Cloud Scheduler y Resend por jobs independientes,
   correos programados previamente o en ejecución. Eliminar funciones impide nuevos
   disparos, pero no recupera mensajes ya enviados ni cancela colas externas.

`firebase.json` ya no incluye Functions. `functions/src/index.ts` no exporta
handlers y los comandos de despliegue/emulación del paquete `functions` están bloqueados.
Las reglas de Firestore y Storage deniegan lecturas y escrituras de clientes;
se aplican al ejecutar `deploy:static`, sin borrar los datos existentes.

Documentación de referencia: [administrar y eliminar funciones](https://firebase.google.com/docs/functions/manage-functions).
La documentación de mailing en `docs/` describe el sistema retirado.
