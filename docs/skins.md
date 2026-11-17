# Catálogo de skins

Rutas publicadas en inglés y español:

- `/skins` y `/es/skins`: catálogo, búsqueda, rareza, colección y favoritos.
- `/skins/[champion]`: todas las skins del campeón.
- `/skins/[champion]/[skin]`: ilustración, historia, rareza, colección, chromas y legado.
- `/skins/shop`: guía de ofertas semanales, tienda mítica y Tu tienda. **No es una rotación en directo.**

## Actualizar los datos

Ejecuta `npm run update:skins` al actualizarse el parche. Requiere acceso a Data Dragon y CommunityDragon. El script fija el mismo parche de assets para ambas fuentes, valida que la descarga esté completa y solo escribe el JSON después de terminar todas las peticiones. Si los datos no cambian, conserva la fecha anterior. No requiere claves privadas ni cuentas de jugadores.

El catálogo se guarda en `lib/skins/catalog.json`. La web lo renderiza desde el servidor y no depende de peticiones externas para entregar el texto y los enlaces indexables. Las imágenes se sirven desde el CDN de Riot a través de Next Image. Las fichas de skins se generan bajo demanda.

## SEO

Cada página tiene un H1, canonical, títulos y descripciones propios, Open Graph y alternancias recíprocas en español e inglés. El sitemap incluye las galerías y solo las fichas con una descripción de al menos 80 caracteres en el idioma correspondiente. Las fichas sin historia suficiente permanecen disponibles con `noindex, follow`; así no se publican miles de fichas vacías como destinos SEO. Los filtros no generan URLs indexables duplicadas. Se incluyen datos estructurados de galerías, imágenes y migas de pan, sin ofertas ni valoraciones ficticias.

## Límites de los datos

- La clasificación de legado no confirma que una skin se pueda comprar actualmente.
- Los favoritos se guardan en el navegador, sin sincronización con Riot.
- Los datos de chromas indican si existen; no se presentan como una galería de chromas.
- No se inventan precios, descuentos, fechas de lanzamiento ni rotaciones. Para publicar ofertas en directo hace falta añadir una fuente verificable con fecha, región, moneda, precio anterior y actual y caducidad.
- No se presenta una página de «nuevas skins» ordenada por ID: los IDs no son fechas de lanzamiento.

Validación: `npm run test:skins`.
