# Presupuesto de uso de Vercel

Al diseñar, implementar y revisar cambios en este repositorio, ten en cuenta los siete presupuestos de uso de Vercel. La tabla recoge la referencia facilitada por el propietario del proyecto. El consumo puede variar durante el ciclo de facturación.

| Métrica | Consumo de referencia | Presupuesto |
| --- | ---: | ---: |
| ISR Writes | 381K | 200K |
| ISR Reads | 1,2M | 1M |
| Image Optimization Transformations | 4,1K | 5K |
| Fast Origin Transfer | 17,48 GB | 30 GB |
| Fluid Active CPU | 4 h 21 min | 12 h |
| CDN Requests | 600K | 3M |
| Function Invocations | 367K | 3M |

Da prioridad a reducir las lecturas y escrituras ISR, que ya superan los presupuestos de referencia. Evita añadir carga ISR para una funcionalidad nueva si se puede resolver con los datos y la caché existentes o en el navegador. Para las imágenes, reutiliza recursos y tamaños existentes cuando sirvan para el mismo propósito.

Para cambios que puedan afectar a estas métricas, revisa qué solicitudes se ejecutan al cargar una página, qué trabajo se repite por usuario o visita y qué solicitudes dependen de una acción explícita. Considera también las invocaciones, la CPU y la transferencia al elegir una estrategia de caché. Indica en el resumen cualquier impacto relevante y distingue el impacto previsto del consumo observado en Vercel.
