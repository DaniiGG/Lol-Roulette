# Plan de 30 días y prompt para el blog

Este plan busca aumentar las visitas con contenido útil y sostenible. No garantiza rankings ni tráfico: Google puede tardar en indexar y evaluar páginas nuevas. La prioridad es responder búsquedas reales, mejorar lo que ya existe y medir qué funciona.

## Plan de trabajo

| Días | Trabajo |
| --- | --- |
| 1-3 | En Google Search Console, guarda una línea base de los últimos 28 días: clics, impresiones, CTR, posición, consultas y páginas del blog. Comprueba también si las páginas importantes están indexadas. No inventes datos si no tienes acceso. |
| 4-6 | Revisa las consultas reales y los resultados de búsqueda. Elige dos temas distintos que completen el contenido existente. El hueco más claro es jungla; ideas iniciales: una guía de pathing, ganks y objetivos, y otra de visión y wards. Confirma que no repitan la misma intención de búsqueda. |
| 7-12 | Redacta y publica el primer artículo en inglés y una versión localizada al español. Revísalo, añade una portada propia o autorizada y enlázalo desde 2-3 artículos relacionados. Comprueba que el artículo se vea bien en móvil y que sus metadatos sean correctos. |
| 13-16 | Comparte el artículo donde haya jugadores interesados y las reglas permitan enlaces. Prioriza una respuesta útil en comunidades, redes o canales propios; no publiques enlaces repetidos como spam. Revisa Search Console por errores de indexación. |
| 17-23 | Redacta y publica el segundo artículo solo si puedes mantener la calidad. Enlázalo con el primero y con guías antiguas relevantes. Traduce al español con revisión humana, no palabra por palabra. |
| 24-27 | Añade portadas primero a 3-5 artículos existentes con más impresiones o importancia según Search Console. Mejora títulos, introducciones y enlaces internos cuando haya una razón concreta; no cambies páginas solo para insertar palabras clave. |
| 28-30 | Compara las métricas con la línea base. Anota qué consultas nuevas aparecen, qué páginas reciben impresiones y qué temas merecen seguimiento. Decide el siguiente mes a partir de esos datos; no esperes que 30 días basten para medir el efecto SEO completo. |

**Ritmo recomendado:** dos artículos completos en el mes, no publicar a diario. Cada artículo nuevo debería tener una portada relevante; para el archivo existente, prioriza las páginas con datos antes de intentar cubrirlas todas.

**Métricas útiles:** clics e impresiones orgánicas, consultas que muestran la página, CTR, indexación y clics desde el artículo hacia League Roulette. Separa los resultados por URL y país cuando haya suficientes datos.

## Prompt para copiar en una IA

```text
Actúa como estratega editorial SEO y redactor especializado en League of Legends. Ayúdame a aumentar las visitas orgánicas de League Roulette con contenido útil, original y sostenible. No prometas posiciones ni tráfico garantizados.

CONTEXTO DEL SITIO
- Producto: League Roulette, una web que ayuda a jugadores de League of Legends a elegir campeones aleatorios y probar nuevos picks.
- Idiomas principales del blog: inglés y español. El inglés es el contenido fuente; el español debe ser una localización natural y completa.
- El objetivo de cada artículo es resolver una búsqueda real y, cuando encaje de forma honesta, llevar al lector a una herramienta o página relevante del sitio.
- El blog ya cubre estos temas. Evita crear otro artículo con la misma intención de búsqueda y avísame si una idea se solapa:
  - what-champion-should-i-play: cómo elegir qué campeón jugar y qué rol encaja con cada estilo.
  - lol-random-challenge, fun-lol-challenges y fun-lol-challenges-with-friends: retos aleatorios y retos con amigos.
  - what-is-my-main: cómo encontrar tu main.
  - best-champions-for-top-lane, mid-lane-champions-guide, adc-champions-guide, best-support-champions: campeones por rol, excepto una guía específica de jungla.
  - aram-champion-pool: pool de campeones para ARAM.
  - champions-that-counter y understanding-lane-matchups: counters y matchups.
  - how-to-improve-at-league, how-to-climb-ranked y how-to-farm-in-league: mejora, ranked y farmeo.
  - champion-rotation-guide: rotación de campeones gratuitos.
  - best-champions-for-beginners: campeones para principiantes.
  - lol-tier-list-current-patch: tier list del parche.
- Oportunidades iniciales, sujetas a validar con datos: jungla (pathing, ganks y objetivos) y visión/wards. No asumas que son las mejores palabras clave sin revisar las consultas o resultados disponibles.

REGLAS DE INVESTIGACIÓN Y CALIDAD
1. Primero revisa los títulos, slugs, contenido existente y, si te los doy, los datos de Search Console. Si no puedes acceder a ellos, dilo y trabaja con hipótesis explícitas; no finjas haber investigado.
2. No inventes volúmenes de búsqueda, dificultad, estadísticas, porcentajes, datos de win rate, cambios del parche, citas ni hechos actuales. Para información que cambie con los parches, pide una fuente reciente o marca qué debe verificarse y la fecha del parche.
3. Antes de redactar, define la intención de búsqueda, el lector y cómo se diferencia el artículo de las páginas existentes. Si hay riesgo de canibalización, propón actualizar/enlazar una página existente en vez de crear otra.
4. Escribe para personas: título claro, apertura que responda pronto a la pregunta, subtítulos descriptivos, ejemplos prácticos, párrafos breves y conclusiones accionables. Evita relleno, clickbait, keyword stuffing y frases genéricas de IA. No repitas la misma idea en varias secciones.
5. Usa únicamente enlaces internos y rutas que te proporcione o que puedas verificar en el proyecto. No inventes funciones de League Roulette. Devuelve por separado una lista de enlaces sugeridos y el lugar del texto donde encajan; el contenido del artículo se almacena como texto simple y no admite enlaces Markdown dentro de los párrafos.
6. Recomienda una portada que represente el tema. Usa una imagen original, autorizada o un diagrama propio; no des por hecho que se pueden usar imágenes oficiales de Riot. Devuelve una descripción para crear/encargar la imagen, un texto alt descriptivo y el nombre sugerido del archivo. No la presentes como un factor que garantice mejor ranking.
7. Prepara el artículo en inglés y una localización al español con la misma estructura y sentido, adaptando expresiones y consultas al idioma. No traduzcas keywords literalmente si no suenan naturales.
8. Produce un artículo por vez. No generes una gran cantidad de páginas superficiales para llenar un calendario.

FORMATO REAL DEL BLOG
El archivo de contenido por idioma está en locales/en/blog-content.json y locales/es/blog-content.json. Cada entrada debe respetar este esquema y ser JSON válido:
{
  "slug": "lowercase-words-separated-by-hyphens",
  "title": "...",
  "description": "...",
  "keywords": ["..."],
  "excerpt": "...",
  "ctaLabel": "...",
  "ctaHref": "/",
  "heroIntro": ["..."],
  "sections": [
    { "heading": "...", "paragraphs": ["..."], "bullets": ["..."] },
    { "heading": "...", "paragraphs": ["..."], "table": { "headers": ["..."], "rows": [["..."]] } }
  ],
  "faq": [{ "q": "...", "a": "..." }]
}

En lib/blog/meta.ts existe un registro por slug. La imagen de portada se configura ahí con image: "/images/blog/slug.webp" e imageAlt: "...". La imagen debe guardarse en public/images/blog/. Los campos de metadatos obligatorios incluyen publishedAt, author, category, lane, keywords, translatedIn y related. Los valores permitidos para category son champions, guides, tier-lists, beginners, ranked, mechanics y league-roulette. Usa related solo con slugs existentes. No inventes una fecha de publicación; usa [FECHA_POR_CONFIRMAR] si no te la doy. Para las traducciones existentes, translatedIn normalmente es ["en", "es"].

PLAN DE 30 DÍAS
Con los datos disponibles, prepara un calendario realista para 30 días: auditoría inicial, selección de dos temas como máximo, investigación, redacción y revisión en EN/ES, portada, enlaces internos, publicación, distribución permitida y revisión de métricas. No recomiendes publicar a diario. Si Search Console no está disponible, indica qué datos tendría que copiarte y separa claramente hipótesis de hechos.

ENTREGA PARA EL PRIMER ARTÍCULO
1. Tema y lector objetivo, intención de búsqueda, diferenciación frente al contenido existente y por qué merece una página nueva.
2. Consultas/keywords candidatas, sin afirmar volúmenes o dificultad no verificados.
3. Outline breve y fuentes actuales que debo verificar, si el tema depende del parche.
4. Artículo completo EN como un objeto JSON válido, sin comentarios ni propiedades fuera del esquema.
5. Versión ES como otro objeto JSON válido con el mismo slug y estructura.
6. Bloque sugerido para lib/blog/meta.ts con categoría válida, lane, keywords, related existentes, seoTitle, seoDescription, image e imageAlt. Deja la fecha como [FECHA_POR_CONFIRMAR].
7. Concepto de portada, texto alt y nombre de archivo dentro de public/images/blog/.
8. De 3 a 5 enlaces internos sugeridos, cada uno con slug/ruta existente y punto de inserción; si no puedes verificarlos, marca la ruta como pendiente en vez de inventarla.
9. Lista corta de revisión antes de publicar: exactitud, originalidad, traducción, JSON válido, enlaces, imagen, móvil e indexación.

Empieza usando la información que te haya dado. Si falta Search Console o una fuente actual, no detengas todo el trabajo: señala la limitación y entrega una propuesta provisional que podamos validar.
```