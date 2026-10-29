# TeamVal Web — Roadmap por etapas

Actualizado: **29/10/2026**.

## Estado y regla de trabajo

**W1–W4 y W4.5 implementadas y verificadas.** Diseño de W3 aprobado; W4 pendiente de revisión visual. W4.5 añade páginas legales (`/privacidad`, `/terminos`), pie con aviso de Riot y enlaces compartidos. W5 permanece pendiente de autorización.

Antes de cada etapa, consultar este roadmap, [ARCHITECTURE_WEB.md](ARCHITECTURE_WEB.md) y [ANALISIS_ANDROID_WEB.md](ANALISIS_ANDROID_WEB.md). Implementar únicamente la etapa autorizada, verificar, registrar avances/pendientes y detenerse. El proyecto Android se mantiene de solo lectura.

| Etapa | Estado | Dependencias |
| --- | --- | --- |
| W1 — Análisis y arquitectura | Completada | Proyecto Android local |
| W2 — Identidad visual y navegación | Implementada y verificada; revisión visual del usuario pendiente | W1 |
| W3 — Buscar equipo y perfiles | Completada; diseño visual aprobado por el usuario | W2 |
| W4 — Equipos, scrims y comunidad | Implementada y verificada; revisión visual pendiente | W3 |
| W4.5 — Preparación legal para Riot | Implementada y verificada; revisión visual pendiente | W4 |
| W5 — Tienda, monedas e inventario | Pendiente | W3 + W4 para cosméticos de equipo |
| W6 — Backend y persistencia compartida | Pendiente de revisión de arquitectura | W3–W5 |
| W7 — Sitio público y preparación Riot | Pendiente | Funciones reales y datos legales/contacto |
| W8 — Verificación final | Pendiente | Etapas autorizadas anteriores |

La autorización de W6 no incluye integración Riot ni pagos. W7 prepara la presentación para Riot; RSO y estadísticas verificadas requieren una fase posterior autorizada. Ninguna etapa autoriza publicar, hacer commits o pushes automáticamente.

## W1 — Análisis y arquitectura

- [x] Leer `PROJECT_SPEC.md` y `ROADMAP.md` completos.
- [x] Revisar composición Kotlin/Compose, navegación, dominio, repositorios y almacenamiento.
- [x] Analizar Inicio, Buscar equipo, Perfil/Apariencia, Equipos/Scrims y Tienda 2.0.
- [x] Extraer identidad visual y comportamientos vigentes, resolviendo diferencias históricas.
- [x] Diferenciar funciones locales operativas, demostraciones y ausencias reales.
- [x] Crear mapa Android → rutas/componentes web y reglas a preservar.
- [x] Proponer estructura, persistencia, backend, modelo de datos y límites de seguridad.
- [x] Documentar fases, dependencias y criterios de aceptación.

Entregables: este roadmap, `ANALISIS_ANDROID_WEB.md` y `ARCHITECTURE_WEB.md`.

## W2 — Identidad visual y navegación

Alcance, en orden:

1. Configurar React/TypeScript/Vite/Tailwind/React Router, versiones compatibles, lockfile y checks básicos.
2. Incorporar fuentes locales/licencias, tokens fieles a Android y componentes accesibles.
3. Construir AppLayout responsive: lateral en escritorio y cinco destinos inferiores en móvil.
4. Implementar Oscuro/Claro/Sistema, presets, HEX, fondos Liso/Aurora/Estrellas, miniaturas y borrador con guardado persistente.
5. Recrear Inicio (marca, héroe y accesos) y navegación a destinos con estado de etapa explícito.

Aceptación:
- [x] Build, TypeScript y lint correctos.
- [x] Navegación directa/Atrás/404, selección de sección y diseño a 320–1440 px.
- [x] Tema sistema responde a cambios; Guardar persiste y salir descarta; confirmación solo tras éxito.
- [x] Fondos distintos y preview compartido; sin Cuadrícula global. Categorías de búsqueda corresponden a W3.
- [x] Teclado/foco, ampliación tipográfica al 200 %, contraste automatizado y `prefers-reduced-motion` comprobados.
- [x] Capturas web de escritorio/móvil revisadas y límites de comparación registrados abajo.

## W3 — Buscar equipo y perfiles

- [x] Fixtures coherentes e identificados como demo; aviso de datos locales y reinicio de sesión.
- [x] Categorías Dúo/Trío/Stack, filtros combinados, alcance propio/ajeno y vacíos diferenciados.
- [x] Crear publicación, detalle, solicitudes enviadas/recibidas, simulación y aceptación/rechazo.
- [x] Cupos/integrantes/aportación a cinco con semántica Android y validación de dominio.
- [x] Perfil propio editable/persistente y perfiles ajenos demo enlazables por ID.
- [x] Riot ID declarado/no verificado, agente/región e información competitiva demo o no disponible.
- [x] Inicio con resumen personal y publicaciones destacadas demo; nuevos respecto a Android.
- [x] Reutilizar `ProfileHero`/avatar y opciones gratuitas; cosméticos de tienda quedan vinculados al catálogo de W5.

Aceptación: creación visible con filtros restablecidos, límites correctos, no duplicados/sobrecupos, enlaces directos y estados not-found, datos personales guardados y etiquetas demo inequívocas. Pruebas de reglas y flujos críticos.

## W4 — Equipos, scrims y comunidad

- [x] Crear/explorar equipos, detalle e integrantes con roles.
- [x] Concretar reglas de gestión de plantilla (ampliación web) e implementar flujo demo de invitación, decisión, roles y retirada con permisos.
- [x] Editor sencillo de identidad solicitado: formas, colores, letras, fondos, imagen validada, recorte proporcional y vista previa.
- [x] Renderizador de identidad compartido: distribución y estilo de integrantes también aplicados al detalle final.
- [x] Publicar búsquedas y proponer, aceptar, rechazar, cancelar y completar scrims; filtros Premier e historial.
- [x] Valoración tras scrim completada, cinco categorías, señal de toxicidad, reseña, denuncia y reputación demo.

Aceptación: un equipo por jugador, permisos de capitán, transiciones terminales y sin duplicados, resultados demo válidos, valoración única, sin recompensa por opinión positiva, Guardar/Cancelar consistente e imágenes sin deformar. No mostrar moderación ni presencia real inexistentes.

## W5 — Tienda, monedas e inventario

- [ ] Conservar catálogo de 35 artículos y 11 categorías, IDs, precios, paquete y vínculos.
- [ ] Bono único 500 TC, ledger, inventario y misiones persistentes con transacciones IndexedDB.
- [ ] Compra confirmada, precio canónico, saldo suficiente, propiedad única y manejo de errores.
- [ ] Equipar/desequipar sobre los campos existentes; cosméticos de equipo mediante su editor.
- [ ] Probador de los seis nuevos marcos estáticos sobre perfil guardado y comparación sin escritura/cargo.
- [ ] Renderizador único preparado para PNG/WebP originales con transparencia.
- [ ] Recompensas demo explícitas; misiones verificadas bloqueadas y cuatro premium solo informativos.

Aceptación: persistencia al recargar, operaciones entre pestañas coherentes, rollback, paquete parcial/completo, compra separada de equipado, cierre del probador sin cambios y saldo exacto. Total demo disponible de hasta 875 TC; no introducir créditos artificiales. No pagos reales.

## W6 — Backend y persistencia compartida

Comenzar por revisión del modelo propuesto y permisos antes de conectar servicios.

- [ ] Confirmar Supabase/PostgreSQL, región de alojamiento, costos/cuotas y entorno de pruebas.
- [ ] Auth TeamVal por correo, recuperación, sesión y rutas privadas.
- [ ] Migraciones SQL, restricciones, RLS, DTO y repositorios remotos.
- [ ] Perfiles y publicaciones compartidas, solicitudes concurrentes y equipos/scrims persistentes.
- [ ] Compras/recompensas/equipado autorizados en servidor y claves de idempotencia.
- [ ] Storage con políticas; denuncias y circuito real mínimo de revisión antes de habilitar contenido público multiusuario.
- [ ] Separación estricta demo/remoto, sin importar saldo/inventario local como legítimo.
- [ ] Contratos versionados para futura conexión Android; estrategia de conflictos y recuperación.

Aceptación: dos cuentas distintas pueden colaborar y no acceder a datos privados ajenos; servidor rechaza precios, créditos, roles y propiedad manipulados; concurrencia sin sobrecupos/doble cobro; ninguna clave privada en build frontend. Revisar privacidad antes de habilitar uso multiusuario público. RSO permanece deshabilitado.

## W7 — Sitio público y requisitos de Riot

- [ ] Presentación pública del proyecto y funciones reales, con acceso claro a la aplicación.
- [ ] Capturas reales Android disponibles/autorizadas; indicar demos y arte provisional.
- [ ] Privacidad/términos fieles al almacenamiento activo, responsable y contacto reales.
- [ ] Aviso de independencia, inventario de recursos propios/licencias y revisión de políticas oficiales vigentes.
- [x] Preparar ruta estática `riot.txt`; insertar exclusivamente contenido oficial cuando se proporcione (implementado y verificado; contenido oficial facilitado por Riot). *Resto de W7 pendiente.*
- [ ] Documentar arquitectura RSO futura y estadísticas con consentimiento/procedencia, sin activarlas.
- [ ] Preparar build, prerender público si procede, fallback SPA y cabeceras para Cloudflare Pages.

Aceptación: visitante entiende qué funciona, qué es demo y qué requiere autorización Riot; páginas públicas navegables y legibles; ningún falso login Riot, estadística verificada inventada, contacto ficticio ni token de verificación simulado. Preparación de despliegue sin publicar.

## W8 — Verificación final

- [ ] Build de producción, typecheck, lint y pruebas de dominio/servidor pertinentes.
- [ ] E2E de búsqueda → solicitud; perfil → guardar; scrim → valorar; probar marco → comprar → equipar.
- [ ] Responsive, teclado, lector de pantalla, zoom, fondos, contrastes y movimiento reducido.
- [ ] Chrome/Edge/Firefox y WebKit cuando el entorno lo permita; registrar cobertura real.
- [ ] Navegación directa, recarga, 404, estados de error/vacío y recuperación de fallos de persistencia/red.
- [ ] Rendimiento de rutas, fuentes/imágenes, carga diferida y ausencia de trabajo gráfico continuo innecesario.
- [ ] Revisar permisos, secretos, procedencia de estadísticas y coherencia entre documentación e implementación.
- [ ] Instrucciones de configuración/despliegue/rollback y listado final de pendientes.

Aceptación: resultados reproducibles, bloqueos y limitaciones explícitos, candidato preparado para producción. Publicación sujeta a autorización aparte.

## Registro de W1 — 27/10/2026

**Completado:** inspección del proyecto real, mapa de equivalencias y arquitectura documentados. Se detectaron ampliaciones necesarias: perfiles públicos, detalle de publicación, destacados de Inicio y gestión de miembros. Se identificó la divergencia preview/detalle de equipos y el texto antiguo de Aqualux.

**Comprobación realizada:** contraste manual de documentos con fuentes Kotlin/Compose, rutas y repositorios; lectura de los documentos web finales y revisión de coherencia de etapas. W1 no ejecuta tests/build de una web que aún no existe. Los resultados Android citados son históricos del roadmap, no pruebas realizadas aquí.

**Archivos creados:** `ROADMAP_WEB.md`, `ANALISIS_ANDROID_WEB.md`, `ARCHITECTURE_WEB.md`, exclusivamente en TeamVal-Web.

**Entradas pendientes:** capturas Android actuales y aprobación visual de Tienda 2.0; reglas de miembros al abrir W4; aprobación del backend/economía de producción al abrir W6; dominio, contacto y datos legales al abrir W7.

**Próximo paso, tras autorización:** W2, empezando por configuración, tokens/fuentes y layout responsive; después apariencia y navegación.

**Punto de parada histórico:** W1 finalizada. W2 fue autorizada posteriormente por el usuario.

## Registro de W2 — 28/10/2026

### Implementación entregada

- React 19.3.1, TypeScript 6.0.3, Vite 8.3.5, Tailwind CSS 4.3.3 y React Router 7.18.5; versiones resueltas en `package-lock.json`. Node 24.22.0 / npm 11.19.1 en el entorno de verificación.
- Estructura real `src/app`, `features`, `domain`, `data/local`, `shared` y `styles`; sin capas remotas vacías. Repositorio de preferencias inyectado desde la raíz.
- Paleta rojo/carbón/marfil, Outfit y Exo 2 locales con sus ocho pesos y licencias OFL copiadas sin modificar desde Android. Componentes compartidos para marca, iconos, paneles/tarjetas, títulos y botones.
- Inicio basado en `HomeScreen.kt`, `FeatureCard.kt` y `strings.xml`: marca, monedero pendiente sin saldo ficticio, héroe y CTA, accesos y pie. Emblema de equipo decorativo adicional en escritorio y acceso a Apariencia.
- Lateral desde 768 px e inferior de cinco destinos en móvil; área segura, foco, enlace de salto, título por ruta, estado activo y 404. `/` lleva a `/app` hasta W7.
- Rutas `/app`, `/app/buscar-equipo`, `/app/scrims`, `/app/tienda`, `/app/perfil`, `/app/apariencia`. Los módulos pendientes explican W3/W4/W5; Perfil enlaza a la personalización ya operativa.
- Apariencia: Oscuro/Claro/Sistema reactivo, cinco presets Android, colores predefinidos/HEX/selector nativo, Liso/Aurora/Estrellas. Aurora deriva sus tonos del acento con intensidad moderada para lectura; estrellas estáticas en mosaico SVG acotado.
- Un renderizador de fondo sirve aplicación, preview y miniaturas. Borrador global temporal; salida por Volver, navegación o Atrás lo descarta; Guardar confirma solo tras éxito. Restablecer requiere Guardar. Errores de lectura/cuota visibles sin borrar automáticamente preferencias originales.
- Tokens de contraste derivados; CSS con movimiento reducido. Fondos y fuentes funcionan sin servicios externos.

### Comprobaciones realmente ejecutadas

| Comando / revisión | Resultado final |
| --- | --- |
| `npm run build` | Correcto: 41 módulos; JS 283,05 kB / 90,02 kB gzip; CSS 29,25 kB / 6,81 kB gzip, fuentes aparte |
| `npm run typecheck` | Correcto, sin errores |
| `npm run lint` | Correcto, cero avisos permitidos |
| `npm run test:e2e` | **13/13 correctas**, Chromium, dos workers, sin reintentos, ejecución final ≈1 min |
| Auditoría npm durante instalación | 0 vulnerabilidades reportadas |

La suite incluye rutas y recargas, 404, ausencia de errores JavaScript en el recorrido, guardado/reapertura, preview sin escritura, descarte y vuelta con Atrás, reset sin guardar, modo Sistema, HEX inválido, error de cuota, preferencias dañadas y navegación móvil. Matriz responsive: 320, 390, 768, 1024 y 1440 px, sin desbordamiento horizontal en Inicio/Perfil/Apariencia. Comprobación de teclado/enlace de salto, foco, reducción de movimiento, fuentes y ampliación **del texto raíz** al 200 %.

Axe: cero infracciones detectadas en los conjuntos WCAG 2 A/AA y 2.1 AA evaluados en Apariencia con oscuro/claro, tres fondos y acentos blanco/negro/rojo, y en Inicio claro/oscuro. Esto no sustituye revisión con lector de pantalla ni una auditoría WCAG completa.

Se inspeccionaron capturas web reales de Inicio a 1440 y 390 px y Apariencia clara/Estrellas a 320 px. Referencia visual contrastada con código y textos Android; no había capturas actuales Android disponibles para comparación lado a lado. Quedan para revisión del usuario la fidelidad percibida, zoom nativo del navegador, lector de pantalla y otros motores de navegador. No se atribuye cobertura Firefox/Safari a pruebas Chromium.

Artefactos locales: `playwright-report/index.html`, `test-results/` (capturas por tamaño), `dist/`. Todos ignorados por Git. La suite se ejecutó inicialmente con 13/13 y se repitió tras ajustar tonos derivados de Aurora y espaciado móvil para texto ampliado; la segunda ejecución también dio 13/13.

### Abrir y revisar

Servidor ejecutado: `npm run dev -- --port 5173 --strictPort`.

- Inicio: **http://127.0.0.1:5173/app**
- Apariencia: **http://127.0.0.1:5173/app/apariencia**
- Instrucciones reproducibles en `README.md`.

Recorrido recomendado: abrir Inicio → revisar navegación → Perfil → Apariencia → probar Claro/Aurora/Estrellas → Guardar → recargar → cambiar sin guardar → salir y comprobar descarte. Las preferencias se guardan por origen del navegador.

**Punto de parada W2:** implementación y comprobaciones completadas. Esperar revisión visual y autorización expresa antes de W3. Android solo se leyó; no se hicieron commits, pushes ni despliegues. Backend, RSO y pagos no están implementados.

### Ajuste visual posterior — Inicio sin monedero (28/10/2026)

- Eliminada la tarjeta «Tu monedero — TeamVal Coins» del Inicio y su CSS exclusivo. La cabecera de marca enlaza visualmente con el héroe conservando el espaciado responsive existente, sin hueco residual.
- El acceso a Tienda describe cosméticos y personalización, sin mostrar monedas en Inicio. TeamVal Coins y saldo quedan reservados para Tienda, Monedero e Inventario; economía e inventario siguen planificados en W5.
- `npm run build`: correcto, incluida comprobación TypeScript; 41 módulos compilados. Cambio limitado a presentación y documentación, sin modificar Android ni comenzar W3. Sin commits ni pushes.

## Registro de W3 — 28/10/2026

### Recuperación y cierre de mejoras W3 — 28/10/2026

- Se recuperaron los cambios interrumpidos: roster y selector visual de 30 agentes, `Any`, `rankMin` y `rankMax` ya estaban guardados. No se encontraron importaciones ni declaraciones duplicadas en modelos, reglas o traducciones. Faltaba conectar los nuevos rangos a la interfaz y actualizar pruebas antiguas.
- Completado: «Cualquier rango» en creación y persistencia; filtros inclusivos mínimo/máximo combinables. Las publicaciones sin restricción se incluyen en cualquier intervalo válido. Un intervalo invertido muestra aviso y no devuelve resultados.
- Corregidos los textos que confundían objetivo e integrantes: los cupos se calculan con `capacity - memberIds.length`. Verificado con cuatro integrantes y capacidad cinco: **«Falta 1 jugador»**, también tras recargar. Grupo lleno: «Equipo completo».
- Verificada la coincidencia exacta con los 30 agentes solicitados, incluidos Hush y Miks; búsqueda, filtro por rol y persistencia del main tras recarga. Se conserva el selector existente sin imágenes de Riot.
- Comprobaciones finales: `npm run typecheck` correcto; `npm run lint` correcto sin avisos; `npm run build` correcto (61 módulos, JS 346,87 kB / 105,28 kB gzip; CSS 50,52 kB / 10,42 kB gzip); `npm run test:e2e`: **42/42**, Chromium, dos workers, 33,2 s. Incluye responsive y axe.
- Durante la verificación se actualizaron pruebas obsoletas (Cypher ya es válido) y selectores. La auditoría de contraste W2 usa movimiento reducido para evitar medir colores transitorios al cambiar el acento; no se desactivó ninguna regla de axe.
- Estado: mejoras W3 terminadas; pendiente revisión visual del usuario. W4 y W5 siguen pendientes. Android no se modificó; sin commits, pushes ni publicación.
- Servidor de desarrollo: `npm run dev -- --port 5173 --strictPort`, URL **http://127.0.0.1:5173/app**.

Los resultados siguientes corresponden a la entrega inicial y se conservan como historial.

### Implementación entregada

- **Capa de dominio** (`src/domain`): modelos de comunidad (rangos, regiones, modalidades, categorías, perfiles, publicaciones, solicitudes) con listas cerradas; reglas puras en `rules/community.ts` (validación de publicación y perfil, crear/unirse/decidir, búsqueda combinable) que preservan la semántica Android: capacidad 2–5, aportación al equipo de 5, cupos sin sobrecupo, decisión solo del anfitrión, solicitudes duplicadas bloqueadas y transiciones terminales.
- **Repositorio local** (`data/local/community.ts`): snapshot único `teamval.community.demo.v1` en `localStorage`, escrituras exclusivas con Web Locks (con alternativa si el navegador no lo soporta), `storage`/`focus` para consistencia entre pestañas, validación de datos no confiables con vuelta al fixture y `reset()` para reiniciar la demo. Fixtures etiquetadas como demo en `data/demo/community.ts`.
- **Rutas nuevas**: `/app/buscar-equipo` (explorador con pestañas Dúo/Trío/Stack sin panel rectangular, alcance Explorar/Mis publicaciones, búsqueda y filtros de rango/región/modalidad combinables), `/app/buscar-equipo/crear`, `/app/buscar-equipo/solicitudes` (recibidas/enviadas, con `?publicacion=`), `/app/buscar-equipo/publicaciones/:id`, `/app/perfil`, `/app/perfil/editar` y `/app/jugadores/:id`. Títulos por ruta en la cabecera; rutas anidadas mantienen activo su destino padre.
- **Perfiles**: ficha propia editable (nombre, Riot ID declarado sin verificar, región, rango declarado, agente principal, presentación, biografía, avatar/marco/fondo/insignias gratuitos) con vista previa en directo, validación por campo, aviso de conflicto si otro origen cambió el perfil y guardado persistente. Perfil público enlazado desde avatar o nombre con estado no encontrado y sus publicaciones.
- **Sin estadísticas inventadas**: «Tu pulso en VALORANT» y el perfil público muestran estado explícito de no disponible hasta Riot Sign On; la reputación aparece como demo y rotulada.
- **Inicio**: publicaciones destacadas en el espacio que ocupaba el monedero (ya retirado en W2) más resumen personal con enlaces a perfil y creación; todo rotulado como demo local.
- **Apariencia**: `readableAccent` elevó su objetivo de contraste a 4.6:1 (margen sobre el mínimo WCAG por el redondeo HEX final); nuevos estilos W3 en `src/styles/app.css` con ajustes a 1023/767/374 px y `prefers-reduced-motion`.

### Comprobaciones realmente ejecutadas

| Comando / revisión | Resultado final |
| --- | --- |
| `npm run build` | Correcto: 59 módulos; JS 343,08 kB / 104,09 kB gzip; CSS 48,34 kB / 10,02 kB gzip, fuentes aparte |
| `npm run typecheck` | Correcto, sin errores |
| `npm run lint` | Correcto, cero avisos permitidos |
| `npm run test:e2e` | **37/37 correctas** (13 de W2 + 12 E2E de W3 + 12 de reglas de dominio), Chromium, dos workers, ≈48 s |

Las 12 E2E de W3 cubren: explorador (categorías, alcance, búsqueda, filtros combinables y vacíos), creación (validaciones, filtros restablecidos, persistencia tras recarga), solicitudes (unirse, simular, rechazar, aceptar, integrantes 2 de 3 y stack completo bloqueado), detalle con enlaces directos y not-found (publicación y solicitudes), perfil editable con Riot ID inválido → válido y persistencia, perfil público enlazado e inexistente, Inicio con destacados/resumen y sin monedero, error de datos locales con reintento sin borrar el dato roto, reinicio de la demo, y matriz responsive 320/768/1440 px sin desbordamiento en seis rutas. Las 12 de dominio (`tests/unit/community-rules.spec.ts`) validan categorías, límites de publicación, creación, permisos, duplicados, sobrecupo, decisiones terminales, búsqueda combinable, snapshot alterado y Riot ID.

Axe: cero infracciones WCAG 2 A/AA y 2.1 AA en Inicio, Buscar equipo, Crear, Solicitudes, Perfil y Editar perfil (tema oscuro por defecto) y en Inicio/Apariencia con oscuro-claro y acentos extremos. Dos correcciones derivadas de esta auditoría: `role="img"` en las estrellas de reputación y finalización de la animación de entrada antes de medir (axe medía la opacidad transitoria, no los colores reales). Esto no sustituye revisión con lector de pantalla.

### Límites y decisiones registrados

- Datos 100 % locales y ficticios por origen del navegador; el Riot ID se valida solo como formato («Nombre#Etiqueta») y se declara explícitamente que no se verifica con Riot. Sin backend, cuentas, RSO ni pagos.
- Android solo se leyó (StackExplorer/Requests, StackPostCard, ProfileScreen/ProfileHero, EditProfileScreen, strings). Nuevas respecto a Android, ya detectadas en W1: detalle de publicación, perfiles públicos por ID, destacados/resumen en Inicio y reinicio de la demo.
- La reputación demo se muestra con métricas y reseñas rotuladas; las reseñas apuntan a perfiles ficticios. Las métricas de la huella (comunicación/equipo/actitud) provienen del fixture heredado, no de datos reales.
- Cosméticos de tienda no incluidos: el editor solo ofrece avatar/marco/fondo/insignias gratuitos; los de pago quedan para W5.

### Abrir y revisar

Servidor: `npm run dev -- --port 5173 --strictPort` → **http://127.0.0.1:5173/app**.

Recorrido recomendado: Buscar equipo → filtrar Dúo/Oro/LATAM Sur → Crear publicación → Mis publicaciones → Simular solicitud → Solicitudes → Aceptar/Rechazar → detalle → avatar del anfitrión → perfil público → Perfil → Editar perfil (nombre, Riot ID, región, agente) → Guardar → recargar → Reiniciar datos de demostración.

**Punto de parada W3:** implementación, verificación y registro completados. Esperar revisión visual y autorización expresa antes de W4 (Equipos, scrims y comunidad). Android solo se leyó; no se hicieron commits, pushes ni despliegues. Backend, RSO y pagos no están implementados.

## Registro de W4 — 28/10/2026

W3 fue aprobada visualmente y W4 autorizada expresamente. El registro anterior se conserva como historial.

### Implementación entregada

- **Equipos:** crear y editar nombre, abreviatura, descripción, lema, región y rango declarado; búsqueda por nombre/abreviatura, región, rango y plazas disponibles; perfil público e integrantes enlazados a los perfiles W3 existentes.
- **Identidad:** editor local de círculo/cuadrado/escudo, cuatro símbolos, colores, letras, tres fondos, dos distribuciones y estilos de integrantes lista/cuadrícula. `TeamIdentityView` aplica la misma identidad a vista previa, detalle y tarjetas de scrim. Cancelar descarta el borrador; Guardar comprueba la revisión para evitar sobrescrituras de otra pestaña.
- **Imágenes:** JPG/PNG/WebP; validación de extensión, MIME, firma, decodificación y tamaño (1 byte–10 MB); dimensiones 64–8192 por lado, máximo 32 MP, recomendado 512×512. Re-encode WebP sin metadatos a máximo 1024 por lado, sin ampliar ni deformar; zoom 1–4 y posición X/Y para recorte visual. Se conserva imagen optimizada junto con sus parámetros. No se sube a ningún servicio ni hay moderación real.
- **Plantilla:** un equipo por jugador, máximo siete integrantes, creador capitán. Invitaciones del capitán al jugador y solicitudes de ingreso del jugador al equipo; aceptar/rechazar solo por destinatario, cancelar por remitente; bloqueo de duplicados pendientes. Aceptar cancela solicitudes pendientes alternativas para ese jugador. Transferencia de capitanía, retirada y salida; el capitán debe transferir antes de salir. Sin eliminación automática de equipos ni pérdida del historial.
- **Scrims:** publicaciones de búsqueda con fecha/hora local convertida a UTC, región, rango, división/grupo Premier, BO1/BO3/BO5 y notas; filtros combinables, publicaciones propias y cierre. Solicitudes de enfrentamiento con permisos de capitanes, duplicados bloqueados en ambos sentidos, aceptación/rechazo del anfitrión, cancelación por participantes y prevención de doble reserva a la misma hora exacta. Aceptar rechaza las otras candidaturas de esa publicación.
- **Agenda e historial:** pendientes, programadas, finalizadas, rechazadas y canceladas. Resultado manual por mapas, ganador con 1/2/3 mapas según BO1/3/5, sin empate. Puede registrarse anticipadamente para ensayar la demo; la interfaz lo declara. Ningún resultado se presenta como verificado por Riot.
- **Reputación:** cinco categorías 1–5 (comunicación, respeto, juego limpio, seriedad y puntualidad), señal independiente de comportamiento tóxico y comentario opcional; medias derivadas e historial recibido. Solo el capitán participante tras completar la scrim, una valoración por equipo/enfrentamiento, sin recompensa. Denuncia única del capitán receptor, expresamente local. Regla de comentarios heredada: 10–500 caracteres si se escribe, sin enlaces ni términos de una lista básica; no equivale a moderación real.
- **Demo y persistencia:** IndexedDB `teamval.teams.demo.v1`, snapshot versionado y transacciones atómicas; recarga, `BroadcastChannel` y refresco al recuperar foco. Errores de lectura/escritura visibles, sin éxito falso; datos inválidos no se borran automáticamente. Reinicio W4 independiente. Selector explícito de jugador demo para probar los dos lados; guardado por pestaña en `sessionStorage` (`teamval.w4.actor`). No cambia el perfil activo de W3.
- **Diseño:** tokens, fuentes, botones, tarjetas, barra lateral, temas y apariencia existentes. Estilos W4 aislados en `src/styles/teams.css`; Inicio/Buscar equipo/Perfil/Apariencia y Tienda conservan sus funciones. El contenedor de navegación conserva el montaje de W4 al cambiar entre sus rutas para mantener mensajes y contexto.

### Referencias y decisiones

- Android consultado solo en lectura: `TeamModels.kt`, `ImageFileRules.kt`, `RatingModels.kt`, además del análisis de `TeamIdentity` existente. No se compiló ni modificó Android.
- Divisiones oficiales contrastadas con [Riot Support — Premier || Divisions](https://support.riotgames.com/en-us/valorant/gameplay/premier-divisions): Open, Intermediate, Advanced y Elite con grupos 1–5; Contender e Invite sin grupo numerado. Solo metadatos declarados, sin cálculo de MMR/elegibilidad ni arte de Riot.
- Ampliaciones respecto a Android: gestión de plantilla, publicaciones de búsqueda, fecha UTC y filtros Premier. El marcador se registra por mapas para corresponder a BO1/3/5, en lugar de trasladar el marcador Android de 0–13 rondas.
- La propuesta inicial de W4 en memoria se sustituye por persistencia IndexedDB según el encargo. Las imágenes optimizadas se guardan como data URL **dentro de IndexedDB**, no en localStorage: un solo snapshot permite guardar/reemplazar logo y equipo atómicamente y evita blobs huérfanos. No se añadieron dependencias.

### Verificación realmente ejecutada

| Comando | Resultado final |
| --- | --- |
| `npm run typecheck` | Correcto, sin errores |
| `npm run lint` | Correcto, cero avisos |
| `npm run build` | Correcto, 77 módulos; JS 397,68 kB / 117,93 kB gzip; CSS 53,85 kB / 11,08 kB gzip |
| `npm run test:e2e` | **74/74 correctas**, Chromium, dos workers, 50,5 s |

Se conservan 42 pruebas anteriores y se añaden **32 W4: 15 de dominio y 17 de navegador**. Cubren creación/edición/cancelación, filtros, membresías, permisos, límites y duplicados, transferencia de capitanía y retirada, publicación Premier, solicitudes y resultados, valoración única y denuncia, persistencia de imágenes/recorte, errores de formato/dimensiones, reinicio independiente, creación concurrente desde dos pestañas, edición con borrador obsoleto, datos dañados y almacenamiento bloqueado. Axe sin infracciones en siete rutas W4 en claro y oscuro. Responsive sin desbordamiento a 320/768/1440; capturas en `test-results/`. Se revisó la captura de escritorio. La revisión visual definitiva y la evaluación manual con lector de pantalla corresponden a una revisión posterior; axe no las sustituye.

Correcciones derivadas: conservar jugador demo y contexto al navegar; dar nombre accesible a la vista previa vacía; sincronizar la prueba de publicación con la llegada a su ruta antes de seleccionar filtros homónimos. En la revisión final se fijó la revisión base del editor al abrir el borrador: un refresco externo no puede actualizar silenciosamente esa revisión y autorizar una sobrescritura antigua. Se añadió su prueba entre pestañas. Todos los fallos detectados en esas ejecuciones quedaron resueltos en la ejecución final.

### Revisión y punto de parada

Servidor local: **http://127.0.0.1:5173/app/scrims**. Equipos: **http://127.0.0.1:5173/app/scrims/equipos**.

Recorrido recomendado:
1. Equipos → Crear equipo → probar formas o imagen → Guardar → invitar a Luna.
2. Cambiar «Actuar como jugador demo» a Luna → Invitaciones e ingresos → aceptar → consultar la plantilla.
3. Cambiar a Nox (capitán de ORBIT FIVE) → Buscar scrims → solicitar a TEAM PHOENIX.
4. Cambiar a Vega (capitán de TEAM PHOENIX) → Agenda → aceptar → Programadas → registrar 2–1 → Historial → valorar.
5. Consultar ORBIT FIVE para ver reputación recibida; recargar para comprobar persistencia. Reiniciar W4 si se desea volver al fixture.

**W4 funcional local completada y verificada; pendiente aprobación visual.** No quedan funcionalidades importantes del encargo W4 sin implementar. Backend multiusuario, moderación real, autenticación, resultados oficiales e integración Riot quedan para etapas futuras. No se comenzó W5, no se modificó Tienda ni Android, y no se hicieron commits, pushes ni despliegues. Detenerse aquí hasta nueva autorización.

*(Nota: con posterioridad a ese punto de parada, el trabajo se consolidó en el repositorio `ewann777/TeamValWeb` y se publicó en Vercel; ver «Despliegue» más abajo.)*

## Registro de W4.5 — 29/10/2026

Preparación legal para la revisión de Riot Games **sin cambiar el diseño aprobado**. Contexto declarado por el usuario: web publicada en Vercel, dominio verificado y solicitud de API en estado *Pending Review* (no se afirma aprobación en ningún punto). W5 no se inició.

### Comportamiento real revisado antes de redactar

- **Almacenamiento local verificado en el código:** `localStorage` `teamval.appearance.v1` (apariencia) y `teamval.community.demo.v1` (perfiles, publicaciones y solicitudes W3); `IndexedDB` `teamval.teams.demo.v1` (equipos, logos, scrims y valoraciones W4); `sessionStorage` `teamval.w4.actor` (jugador demo por pestaña); `BroadcastChannel` `teamval.teams.demo.v1` (sincronización entre pestañas, sin persistencia).
- **Sin cookies, sin analítica, sin peticiones de red** (`fetch` ausente en `src/`) y **fuentes autoalojadas** en `/fonts` (sin Google Fonts ni CDNs).
- **Botones de gestión de datos reales:** «Reiniciar datos de demostración» en Perfil y «Reiniciar demo W4» en Scrims.
- **Único tercero:** Vercel (alojamiento), según `vercel.json` y el despliegue.

### Implementación entregada

- **`/privacidad`** (`src/features/legal/PrivacyPage.tsx`): operador del proyecto, datos del perfil, claves reales de almacenamiento, naturaleza de demostración de publicaciones/equipos/scrims, ausencia de backend y de integración Riot (solicitud *Pending Review*), futura integración RSO solo con autorización del jugador, gestión/eliminación de datos y distinción TeamVal/Vercel. Cierre con sección «Información pendiente de confirmar».
- **`/terminos`** (`src/features/legal/TermsPage.tsx`): uso adecuado, publicaciones y conducta, prohibición de acoso/toxicidad/suplantación, contenido y logos subidos por el usuario, scrims y resultados no oficiales, responsabilidad del usuario, funcionalidades de demostración y **TeamVal Coins como moneda virtual sin valor monetario real, sin pagos activos y sin sistema de monedas implantado**.
- **Pie de página compartido** (`AppLayout`): enlaces «Privacidad» y «Términos» en todas las secciones, aviso en español solicitado por el usuario y **boilerplate oficial de Riot Games en inglés**, verificado en [Políticas generales de Riot](https://developer.riotgames.com/policies/general) («You must post the following legal boilerplate…», última actualización 29/05/2025): *«TeamVal isn't endorsed by Riot Games…»*. Es una formulación adicional obligatoria detectada en la revisión exigida por el encargo; se añadió además en `/terminos`.
- **Rutas públicas** dentro del shell existente (sin login, que no existe en el proyecto), títulos de cabecera en `navigation.ts` y estilos nuevos mínimos en `app.css` (`footer-row`, `footer-links`, `footer-disclaimer`, `legal-card`, `legal-list`, `legal-official`) sobre los tokens ya aprobados.

### Decisiones y límites

- Nada de correos, teléfonos, cifrado, backups ni medidas de seguridad inventados: todo lo no existente aparece marcado como **pendiente de confirmar** en ambas páginas.
- Requisitos de Riot para apps VALORANT con RSO (opt-in del jugador y aviso de que vincular la cuenta hace públicos los datos) documentados como **pendiente de implementación futura**; no se simula RSO.
- `public/riot.txt` no se modificó y su contenido se fija con una prueba.
- Android no se tocó; W3 y W4 conservan sus 74 pruebas sin cambios.

### Verificación realmente ejecutada

| Comando | Resultado final |
| --- | --- |
| `npm run typecheck` | Correcto, sin errores |
| `npm run lint` | Correcto, cero avisos |
| `npm run build` | Correcto, 79 módulos; JS 417,25 kB / 123,10 kB gzip; CSS 54,96 kB / 11,29 kB gzip |
| `npm run test:e2e` | **88/88 correctas**, Chromium, dos workers, 56,3 s |

Se conservan las 74 pruebas previas y se añaden **14 W4.5**: rutas legales directas con recarga y sin errores JS, pie con enlaces y ambos avisos en ocho secciones, navegación cruzada legal↔app, enlace alcanzable por teclado con foco visible y área de 44 px, contenido real de Privacidad (las cuatro claves, sin `mailto:` y con `vercel.com/privacy` como único enlace externo), cobertura completa de Términos, ambos avisos de Riot en pie y en Términos, páginas públicas sin almacenamiento, `riot.txt` intacto, responsive 320/768/1440 sin desbordamiento y **axe sin infracciones en claro y oscuro**. Se revisaron capturas de escritorio y móvil de ambas páginas. Fallos detectados y corregidos durante la etapa: mayúsculas en una aserción y una aserción ubicada en la página equivocada (el estado *Pending Review* se describe en Privacidad, no en Términos).

### Despliegue

Push a `main` en `ewann777/TeamValWeb`: commit `48118d5` (*feat: add privacy policy, terms and Riot disclaimer footer (W4.5)*), `8a8554e..48118d5  main -> main`.

Comprobado en producción tras el despliegue de Vercel:

- `https://team-val-web.vercel.app/privacidad` → **200**
- `https://team-val-web.vercel.app/terminos` → **200**
- `https://team-val-web.vercel.app/app/scrims` → **200** (rutas SPA siguen funcionando)
- `https://team-val-web.vercel.app/riot.txt` → **200** con contenido oficial exacto, sin modificar
- El HTML servido referencia el bundle nuevo `index-C8LpIqfU.js` / `index-DUfCcZHn.css`, y dicho bundle contiene «Política de privacidad», «Términos y condiciones», el aviso en español y el boilerplate oficial de Riot.

### Pendientes legales (marcados en las propias páginas)

1. Identidad y datos de contacto del responsable (no hay correo oficial).
2. Legislación aplicable y jurisdicción.
3. Revisión jurídica profesional de ambos textos.
4. Condiciones para personas menores de edad.
5. Plazo de conservación de registros del alojamiento (Vercel).
6. Ámbitos de datos de la futura integración RSO y aviso de datos públicos asociado al opt-in.
7. Moderación de contenido y de imágenes (requiere backend).
8. Resto de W7 (presentación pública, inventario de recursos y licencias, cabeceras y prerender).
