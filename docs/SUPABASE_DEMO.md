# Supabase para la demo sin login

La prueba pública utiliza una organización fija: `AgroBuyer Demo`, con ID
`113037d0-f952-4ae2-a90d-71614131e656`. No requiere usuarios ni membresías.

## Clientes disponibles

- `utils/supabase/admin.ts`: cliente privilegiado para operaciones del servidor
  sin sesión de usuario. Exporta `createAdminClient` y `DEMO_ORGANIZATION_ID`.
  La importación `server-only` impide usar este módulo en componentes de cliente.
- `utils/supabase/server.ts`: cliente SSR con clave pública y cookies, que todavía
  utiliza la página principal para consultar `todos`.
- `utils/supabase/client.ts`: cliente de navegador con clave pública, sujeto a RLS.

El helper `utils/supabase/middleware.ts` no está conectado a un middleware/proxy.
El nuevo cliente no necesita ese helper ni renovación de sesiones.

## Configuración manual

Configurar en `.env.local` para desarrollo y en las variables del servidor para
la instancia alojada, sin guardar secretos en Git:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
SUPABASE_SECRET_KEY=REEMPLAZAR_POR_LA_CLAVE_SECRETA
```

Obtener la clave secreta en Settings → API Keys del proyecto Supabase.
No darle el prefijo `NEXT_PUBLIC_`, enviarla al navegador ni pegarla en el chat.
La página actual sigue necesitando `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` para
su consulta de `todos`; conservar esa configuración existente.
Reiniciar el servidor de desarrollo después de configurar las variables.

El cliente valida que URL y clave estén presentes cuando se crea, no durante
la importación. No imprime los valores en los errores de configuración.

## Organización y RLS

RLS permanece habilitado y las políticas de membresía se conservan. La clave
secreta omite RLS: la constante de organización no impone por sí sola aislamiento.
Cada operación del servidor debe aplicar el alcance correspondiente:

- Lecturas de tablas con `organization_id`: filtrar por `DEMO_ORGANIZATION_ID`.
- Inserciones en esas tablas: asignar `DEMO_ORGANIZATION_ID` desde el servidor.
- Tablas dependientes: comprobar que la empresa o el trabajo de búsqueda padre
  pertenezca a esa organización antes de leer o escribir.
- No aceptar organizaciones ni consultas arbitrarias enviadas por el navegador.

Los futuros endpoints de la demo serán accesibles sin login. Antes de permitir
búsquedas reales deben incorporar límites de consumo en el servidor.

## Estado del paso 2

El cliente privilegiado está preparado. Todavía no lo consume la interfaz y no
se ha validado la conexión remota con él. No se crean tablas, organizaciones ni
políticas al importarlo o construirlo. La lectura de empresas corresponde al
paso 12; la migración 0002 es el siguiente paso del sprint.
