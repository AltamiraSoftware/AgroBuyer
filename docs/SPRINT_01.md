# Sprint 01 — Base del motor de inteligencia

## Objetivo

Demostrar, con una primera muestra de Córdoba, que el sistema puede almacenar empresas con identidad trazable, evidencia comercial y un Buyer Score explicable. Este sprint no intenta automatizar todavía la captación.

## Alcance entregado

- Proyecto Next.js 16, React 19 y TypeScript estricto.
- Dashboard responsive con búsqueda, filtro por segmento, ficha y evidencias.
- Buyer Score v1 determinista y desglose por componentes.
- Dataset inicial de seis registros, incluido un control negativo.
- Esquema Supabase multiempresa con PostGIS y RLS.
- Contratos para generación de consultas y resolución de entidades.
- Pruebas unitarias de scoring, consultas y deduplicación.

## Criterios de aceptación

- `npm run typecheck`, `npm test`, `npm run lint` y `npm run build` finalizan correctamente.
- Una empresa sin evidencia no se presenta como lead prioritario.
- Toda afirmación comercial visible conserva URL, fecha y confianza.
- El score siempre puede reconstruirse desde sus seis componentes.
- Un CUIT repetido se considera coincidencia inequívoca.
- Coincidir solo por nombre nunca fusiona empresas automáticamente.

## Decisiones

1. La IA extraerá señales, pero el score será código determinista.
2. Fuentes y evidencias son tablas propias, no columnas de texto dentro de `companies`.
3. Los resultados crudos se conservan antes de resolver identidades.
4. Contactos personales quedan fuera del Sprint 01.
5. Places, SIFeGA, COMPR.AR y ARCA quedan detrás de adaptadores para no acoplar el dominio.

## Pendiente para cerrar la validación manual

El CSV inicial prueba el formato, no sustituye el objetivo de 50 empresas. Antes de medir precisión del buscador se deben completar, revisar y etiquetar al menos 30–50 filas, incluyendo falsos positivos.

## Siguiente sprint recomendado

**Discovery V1:** conectar Google Places, persistir `raw_search_results`, normalizar dominios/teléfonos, ejecutar deduplicación y medir cuántas empresas del gold dataset recupera el motor.
