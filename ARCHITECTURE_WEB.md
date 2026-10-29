# TeamVal Web — Arquitectura propuesta

Diseño inicial: 27/10/2026 · Actualizado: 28/10/2026 · W2–W4 implementadas; las fases siguientes continúan como propuesta.

Referencia funcional: [ANALISIS_ANDROID_WEB.md](ANALISIS_ANDROID_WEB.md). Secuencia y aceptación: [ROADMAP_WEB.md](ROADMAP_WEB.md).

## 1. Decisiones principales

| Decisión | Motivo y consecuencia |
| --- | --- |
| React + TypeScript estricto + Vite | Aplicación interactiva con compilación estática sencilla y límites tipados |
| Tailwind CSS + variables CSS semánticas | Utilidades de layout y un único sistema visual TeamVal; evitar colores sueltos por pantalla |
| React Router | Layouts anidados, URLs directas, historial y separación del sitio público y aplicación |
| Organización por funcionalidades + dominio/datos compartidos | Trasladar la separación de Compose sin replicar mecánicamente ViewModels Android |
| Repositorios asíncronos inyectados en la raíz | Cambiar demo por remoto sin reescribir componentes ni introducir llamadas HTTP en la UI |
| Estado React por módulo | Hooks/reducers para borradores y estados de interacción; contexto para dependencias/tema, evitando un contexto gigante |
| Persistencia local progresiva | Preferencias simples en localStorage; economía transaccional e imágenes en IndexedDB |
| Supabase/PostgreSQL propuesto para W6 | Auth, SQL transaccional, RLS y almacenamiento administrados; menos servicios que mantener |
| Cloudflare Pages propuesto para W7 | Servir build estático; backend independiente de la plataforma del frontend |
| RSO y estadísticas oficiales como integración posterior | Contratos y estados previstos; activación solo con autorización y credenciales oficiales |

W2 usa React 19, TypeScript 6, Vite 8, Tailwind 4 y React Router 7, con versiones exactas resueltas en `package-lock.json` y verificadas en Node 24.22.0. La configuración y comandos disponibles están en `README.md`.

Dependencias adicionales justificadas, cuando corresponda:

- `idb` en W4/W5: envoltorio pequeño de IndexedDB para blobs y transacciones.
- Validación inicial mediante funciones puras de dominio; considerar Zod en W6 para validar entradas y respuestas de red en tiempo de ejecución.
- TanStack Query en W6 para caché remota, invalidación y reintentos seguros; no usar reintentos ciegos en mutaciones económicas.
- SDK oficial de Supabase al conectar W6. Nada de SDK Riot en el navegador.
- Vitest, Testing Library y Playwright para pruebas significativas cuando lleguen las funciones; axe para controles de accesibilidad.
- Animaciones CSS primero; no añadir una biblioteca de animación ni un kit visual que sustituya la identidad TeamVal sin necesidad concreta.

## 2. Estructura objetivo

Es un árbol de destino, a crear progresivamente, no una lista de carpetas ya existentes.

```text
TeamVal-Web/
├── ROADMAP_WEB.md
├── ANALISIS_ANDROID_WEB.md
├── ARCHITECTURE_WEB.md
├── public/
│   ├── fonts/                 # Outfit/Exo 2 y licencias
│   ├── media/                 # recursos propios, capturas autorizadas
│   └── riot.txt               # solo cuando exista contenido oficial de verificación
├── src/
│   ├── app/
│   │   ├── router.tsx
│   │   ├── providers.tsx      # composición de dependencias
│   │   └── layouts/           # AppLayout y PublicLayout
│   ├── features/
│   │   ├── home/
│   │   ├── stacks/            # pages, components, hooks por módulo
│   │   ├── profiles/
│   │   ├── appearance/
│   │   ├── teams/
│   │   ├── scrims/
│   │   ├── reputation/
│   │   ├── economy/           # tienda, inventario, monedero, recompensas
│   │   ├── auth/              # W6
│   │   └── public-site/       # W7
│   ├── domain/
│   │   ├── models/
│   │   ├── rules/
│   │   └── repositories/     # contratos independientes de React/proveedor
│   ├── data/
│   │   ├── demo/              # fixtures identificados como ficticios
│   │   ├── local/             # adaptadores y migraciones del navegador
│   │   └── remote/            # W6: DTO, mapeos y llamadas autorizadas
│   ├── shared/
│   │   ├── ui/                # botones, paneles, diálogo, feedback, formularios
│   │   ├── cosmetics/         # avatar, marco y renderizadores compartidos
│   │   ├── theme/             # tokens, contraste, fondo único y presets
│   │   ├── lib/
│   │   └── i18n/              # textos españoles centralizados
│   ├── styles/
│   └── main.tsx
├── tests/e2e/
└── supabase/                  # W6: migraciones, políticas, funciones y pruebas
```

Pruebas unitarias cercanas al módulo. Evitar directorios vacíos y abstracciones sin un caso real. `domain` no importa React, Supabase ni APIs del navegador. `features` consume contratos/hooks; `data` implementa contratos. Solo `app/providers` elige implementaciones.

## 3. Estado, contratos y persistencia

Flujo: **pantalla → hook de aplicación → repositorio → adaptador local/remoto → estado actualizado**.

- Contratos previstos: `ProfileRepository`, `PreferencesRepository`, `StackRepository`, `TeamRepository`, `ScrimRepository`, `RatingRepository`, `EconomyRepository`, `MediaRepository`; `AuthRepository` y `VerifiedStatsRepository` cuando se necesiten.
- Lecturas/mutaciones asíncronas; resultados discriminados con errores como `Validation`, `NotFound`, `Forbidden`, `Conflict`, `InsufficientBalance`, `StorageUnavailable` o `Unavailable`. La UI traduce códigos, no depende de textos del proveedor.
- Listas preparadas para paginación; operaciones cancelables cuando tenga sentido. Nada de temporizadores para fingir actividad o usuarios conectados.
- Estados explícitos de carga, vacío, error, éxito y guardado. Un fallo remoto nunca se reemplaza silenciosamente por datos demo.
- Categoría, filtros y alcance de búsqueda en URL, con valores desconocidos normalizados. Borradores en memoria separados del modelo guardado.
- Mantener los IDs del catálogo y un mapeo explícito de enums Android. Fechas futuras ISO 8601 UTC, identificadores opacos estables, monedas enteras. La traducción nunca es la clave persistida.

| Etapa / dato | Almacenamiento propuesto | Comportamiento |
| --- | --- | --- |
| W2 apariencia | localStorage versionado | Persiste al recargar; validación, fallback y mensaje si no puede guardar |
| W3 comunidad demo (perfil, publicaciones, solicitudes) | Un único snapshot `teamval.community.demo.v1` en localStorage, con versión | Se revalida al leer; datos alterados vuelven al fixture sin borrar el original; escrituras exclusivas con Web Locks y aviso `storage` entre pestañas; reinicio explícito desde Perfil |
| W4 equipos/scrims/valoraciones | IndexedDB `teamval.teams.demo.v1`, snapshot v1 | Persistencia solicitada; transacciones atómicas, BroadcastChannel/foco; no implica datos compartidos |
| W4 imágenes de logos | WebP optimizado como data URL en el snapshot IndexedDB | Reemplazo atómico con la identidad, sin blobs huérfanos ni imágenes en localStorage |
| W5 compras/misiones/inventario | IndexedDB transaccional | Ledger, propiedad y reclamo cambian juntos; refrescar lectura entre pestañas |
| W6 dominio multiusuario | PostgreSQL + Storage | Servidor fuente de verdad; caché local descartable |

La apariencia se aplica con un borrador temporal en el editor. Guardar confirma tras completar la escritura; salir por cualquier ruta restaura la versión guardada. Restablecer modifica el borrador, no persiste sin Guardar. Manejar esquema antiguo/desconocido y errores de cuota sin borrar datos silenciosamente.

La compra demo usa una transacción IndexedDB para lectura de saldo, cargo y propiedad; no depende solo de deshabilitar un botón o de un mutex en una pestaña. Equipar sigue separado. Los almacenes locales son manipulables y **no se importarán como saldo, recompensas o propiedad válidos al backend**. Demo y remoto tendrán espacios de datos separados; migrar preferencias cosméticas gratuitas podrá revisarse expresamente.

## 4. Diseño React fiel a Compose

### Tokens y componentes

- Variables `--color-background`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-accent`, `--color-on-accent`, `--glass-fill`, `--glass-border`, sombras y radios.
- Colores iniciales, radios y escala tipográfica del análisis; tamaños de texto en rem y escalado responsive con `clamp`. Los dp/sp son referencias de proporción, no una conversión rígida.
- Fuentes locales con `font-display: swap`; WOFF2 si se prepara a partir de fuentes autorizadas, conservando SIL OFL. Estilo Moderno por defecto y compatibilidad cosmética Aqualux/Mono, sin selector global adicional.
- `GlassPanel`, `PrimaryButton`, `SectionHeading`, `StatusBadge`, `FilterButton`, `EmptyState`, `InlineNotice`, `FormField`, `Dialog`, `PlayerAvatar`, `ProfileHero`, `TeamIdentityView`, `AvatarFrame`.
- `ProfileHero`/`AvatarFrame` compartidos por perfil, editor, producto y probador. `TeamIdentityView` aplicará distribución/estilo de miembros en vista previa y detalle para corregir la divergencia detectada.
- Fondos mediante un único `AppBackground` reutilizado en miniaturas: Liso sin ornamentos; Aurora con gradientes radiales; Estrellas con Canvas/SVG estable y acotado, sin cientos de nodos DOM ni bucle de animación continuo.
- Glassmorphism con superficies densas como Android y desenfoque limitado; fallback sin `backdrop-filter`. Nunca perder contraste por transparencia.
- Microinteracciones de unos 150–220 ms como punto inicial; respeto a `prefers-reduced-motion`. Marcos nuevos estáticos para conservar el alcance vigente.

### Layout y navegación

- Menos de 768 px: barra inferior de cinco destinos, iconos y etiquetas legibles, Buscar equipo puede ocupar dos líneas; respetar `safe-area-inset-bottom` y reservar altura real del menú.
- Desde 768 px: navegación lateral compacta con etiquetas; desde 1024 px, lateral ampliada y composición de contenido de una o dos columnas según pantalla.
- Contenido principal máximo aproximado 1200 px; editores limitados a 720–840 px o formulario + vista previa cuando haya espacio.
- Mantener héroes y tarjetas de Android, orden de secciones y jerarquía. La adaptación de escritorio no introduce paneles de métricas genéricos.
- Categorías Dúo/Trío/Stack en flujo normal y contenedor transparente. Usar botones con `aria-pressed` porque permiten deselección, no tabs ARIA de paneles independientes.
- Navegación semántica con enlaces reales, `aria-current`, Atrás del navegador, enlaces profundos y 404. Recarga directa válida en despliegue.
- Inicio W2 conserva marca, héroe y accesos, sin tarjeta de monedero ni saldo por ajuste solicitado tras la revisión visual. TeamVal Coins y saldo se resuelven para Tienda, Monedero e Inventario en W5; el resumen personal y las publicaciones destacadas llegaron con W3. Destinos aún pendientes muestran su estado de etapa, sin aparentar funciones disponibles.

### Accesibilidad y calidad de interacción

HTML semántico, `lang="es"`, salto a contenido, foco visible, etiquetas/errores asociados, anuncios `aria-live`, navegación por teclado y retorno del foco al cerrar diálogos. Objetivos táctiles de al menos 44 px donde sea posible, sin scroll horizontal de página a 320 px ni cortes con zoom 200 %. Pruebas también a 360/390/768/1024/1440 px.

Contraste objetivo WCAG AA: 4,5:1 texto normal, 3:1 texto grande/controles relevantes. Calcular texto sobre el acento y ajustar la representación sin cambiar el HEX guardado. Comprobar también el fondo compuesto de Aurora, no solo colores aislados. Mensajes y estados no dependerán únicamente del color.

## 5. Backend recomendado para W6

**Propuesta: Supabase gestionado (PostgreSQL, Auth, Storage y funciones de servidor).** Las relaciones entre jugadores, solicitudes, equipos e inventario y las transacciones hacen apropiado PostgreSQL. Evita mantener inicialmente servidores propios. El costo dependerá de usuarios, almacenamiento, egreso y plan vigente; revisar cuotas/precios en W6, sin prometer producción gratuita.

Antes de conectar servicios se revisarán modelo, permisos y economía. Primera autenticación propuesta: cuenta TeamVal por correo con verificación, recuperación y cierre de sesión mediante Auth. La cuenta TeamVal es independiente de una futura vinculación Riot.

### Modelo relacional inicial propuesto

| Entidad | Relaciones y restricciones principales |
| --- | --- |
| `profiles` | ID ligado a usuario Auth; nombre visible, Riot ID declarado opcional, región, agente, cosmética y visibilidad |
| `user_preferences` | Una por usuario; apariencia con versión |
| `stack_posts`, `stack_members`, `join_requests` | Propietario; capacidad 2–5; miembro único por publicación; solicitud única por jugador/publicación |
| `teams`, `team_members`, `team_invitations` | Capitán, identidad; una membresía activa por jugador; invitaciones con estados terminales |
| `scrims` | Dos equipos distintos, estados y horario; fecha UTC/zona a definir para producción |
| `team_ratings`, `rating_reports` | Una valoración por equipo/scrim; solo participantes elegibles; denuncia única por autor/valoración |
| `catalog_items`, `bundle_contents` | IDs originales, precio entero, disponibilidad y binding autorizado por servidor |
| `wallet_accounts`, `coin_transactions` | Fila de cuenta para serialización; ledger inmutable, saldo derivado y claves de idempotencia |
| `owned_items` | Clave compuesta usuario/artículo; adquisición única |
| `missions`, `mission_claims` | Reglas del servidor y reclamo único usuario/misión |
| `media_assets` | Propietario, tipo, tamaño, almacenamiento y revisión |
| `riot_connections`, `verified_stat_snapshots` | Reservadas para fase autorizada, acceso privado a conexión y procedencia de estadísticas |

No crear tabla de equipado redundante: los campos canónicos del perfil/identidad siguen determinando el estado. La escritura de variantes de tienda debe validar propiedad incluso desde el editor general. Las tablas privadas y públicas se expondrán mediante vistas/DTO que no filtren correos, tokens ni información de cuenta.

### Seguridad y atomicidad

- RLS de mínimo privilegio y permisos de columnas/funciones. Lectura pública solo de perfiles/publicaciones autorizados; solicitudes visibles para solicitante y dueño; inventario/ledger privados. Rutas privadas mejoran UX, pero el servidor siempre autoriza.
- Cliente nunca puede insertar créditos, modificar precios, concederse artículos, marcar misiones verificadas ni declarar su propio rol de capitán.
- Compra: recibir `itemId` + clave de idempotencia; obtener actor de sesión, bloquear su cuenta, resolver catálogo/precio/contenido, comprobar saldo/propiedad e insertar débito y artículos dentro de una única transacción SQL. Ante error, rollback íntegro. Reintento devuelve resultado previo sin nuevo cargo.
- Solicitud aceptada: bloquear publicación, validar propietario/pendiente/cupo y actualizar solicitud + miembros en la misma transacción. Índices únicos y bloqueos protegen concurrencia entre dispositivos.
- Recompensas: determinar elegibilidad en servidor y registrar abono + reclamo atómico. El `eligible` que hoy calcula Android no será una autorización de cliente en producción.
- Identidad/equipado de equipo: verificar capitán y propiedad del cosmético en servidor. Transferencia de capitanía y pertenencia se resuelven transaccionalmente.
- Funciones privilegiadas con permisos explícitos, `search_path` controlado y privilegios mínimos; pruebas de acceso cruzado. No confiar en RLS si una clave de servicio la evita.
- Rate limiting para publicaciones, solicitudes, reclamaciones y denuncias; límites de contenido y paginación. Validación en cliente para UX y en servidor para integridad.
- Imágenes: validar bytes/tipo/decodificación y dimensiones, re-encode sin metadatos, límites de peso y almacenamiento con políticas; no aceptar HTML/SVG arbitrario como subida de usuario.
- Solo configuración pública en `VITE_*`; secretos Supabase de servicio, claves Riot y tokens de proveedor únicamente en servidor. Política CSP y escape de contenido; sin HTML sin sanear.
- Sesión gestionada por el SDK aprobado; no implementar un almacén casero de tokens. Limpiar caché privada al salir/cambiar de cuenta. Evaluar cookies HttpOnly con un BFF si el flujo RSO aprobado lo exige.

### Sincronización futura con Android

Backend común y contratos DTO versionados; no compartir Room/DataStore directamente. Mantener IDs de catálogo y mapeos de variantes; usar control de versión en ediciones para detectar conflictos. Android necesitará una etapa propia para adaptadores remotos. No se harán cambios Android como parte de estas etapas web.

Empezar con consultas/invalidez de caché; Realtime solo si hay un caso concreto. No se promete operación offline con escrituras compartidas ni resolución automática de conflictos. Datos económicos demo nunca se aceptan como prueba de propiedad.

## 6. Ampliaciones frente a Android

- **Inicio:** destacados de publicaciones elegidos de fixtures identificados y resumen del perfil; sin contadores de usuarios online.
- **Perfiles públicos:** IDs estables independientes del nombre/Riot ID, datos declarados con etiqueta de no verificados. La ruta demo no implica que una persona real haya publicado su perfil.
- **Gestión de miembros:** propuesta W4 para demo: capitán invita/retira y asigna roles; invitado acepta/rechaza; impedir doble equipo y retirar al capitán sin transferencia. Confirmar permisos, límite de plantilla y tratamiento de scrims activos al comenzar W4; no deducirlos de los stacks de cinco plazas.
- **Distribución de equipo:** una única representación para vista previa y detalle, conservando opciones Android.
- **Información competitiva:** separar `demo`, `selfReported`, `unavailable` y, únicamente con evidencia del servidor, `riotVerified`; incluir procedencia y fecha de actualización. Cero no equivale a dato desconocido.

## 7. Sitio público, Riot y despliegue

W7 incorporará presentación del proyecto, funciones realmente disponibles y sus límites, capturas Android cuando estén disponibles, privacidad, términos, contacto y aviso de independencia. No se afirmará aprobación, patrocinio ni afiliación con Riot Games.

- `/` será entrada pública con enlace claro a `/app`; las rutas públicas podrán prerenderizarse para SEO y revisión sin alterar la SPA funcional.
- Privacidad debe describir datos/local storage actuales y, al activar W6, Auth, proveedores, finalidad, conservación, eliminación y contacto del responsable. Términos describirán moneda sin valor monetario, demo, conducta y límites del servicio.
- Faltan responsable/contacto real, dominio, jurisdicción y períodos de conservación. Se solicitarán en W7; no inventar correos, entidad legal ni textos supuestamente finales.
- Contacto inicialmente mediante medio real facilitado por el usuario; un formulario solo será presentado como operativo si hay receptor backend y manejo de errores.
- Reservar `/riot.txt` para un archivo estático exacto provisto por el portal cuando corresponda. No fabricar token ni devolver HTML de la SPA en esa ruta. W1 solo reserva el diseño, no crea una verificación falsa.
- La arquitectura RSO prevé redirección y callback de servidor, consentimiento/vinculación, protección de estado OAuth, intercambio seguro y almacenamiento privado; implementar el protocolo y scopes que Riot autorice, con revisión oficial posterior.
- El navegador pedirá estadísticas a TeamVal, no a Riot con claves privadas. Backend aplicará autorización, límites, cacheado y consentimiento según la política vigente. Sin scraping de Tracker.gg.
- Consultar en W7 las políticas oficiales vigentes: `https://developer.riotgames.com/policies/general` y `https://developer.riotgames.com/docs/valorant`. Este diseño no asegura aprobación ni sustituye esa revisión.
- Cloudflare Pages: build Vite a `dist`, rutas profundas, assets cacheados por hash, HTTPS, cabeceras y excepción real para `riot.txt`. Revisar prerender/fallback/404 sin absorber recursos inexistentes.
- Preparar entorno de prueba y procedimiento de rollback, pero despliegue público, dominio, commits y pushes requieren autorización del usuario. W8 deja un candidato preparado, no publicado.

## 8. Verificación por riesgo

- W2: tema/sistema, guardado/descarte, teclado, responsive y fondos realmente distintos.
- W3: filtros combinados, límites, propietario/duplicados/cupos, creación visible y perfiles demo coherentes.
- W4: permisos, transiciones, marcadores demo, valoración única, denuncias e imágenes/recorte; equivalencia de preview/detalle.
- W5: precios canónicos, doble compra/múltiples pestañas, rollback, paquete parcial/completo, reclamos únicos, persistencia y probador sin efectos secundarios.
- W6: pruebas contra PostgreSQL real de RLS, cuentas distintas, concurrencia e idempotencia. Una prueba de UI no demuestra seguridad económica.
- W7/W8: rutas directas, documentos públicos, contenido honesto, `riot.txt`, build/typecheck/lint, E2E críticos, accesibilidad y rendimiento. Registrar resultados reales y pendientes, sin atribuir a web los tests históricos Android.

## 9. Decisiones materializadas en W2

- `AppearanceProvider` recibe `PreferencesRepository`. La implementación local tiene lectura síncrona inicial para evitar un destello de tema incorrecto y escritura con contrato asíncrono; los repositorios de negocio seguirán la propuesta asíncrona. Solo esta preferencia pequeña usa localStorage.
- `teamval.appearance.v1` guarda un sobre con versión y valores validados. Preferencias inválidas/desconocidas muestran un aviso y no se sobrescriben hasta una acción de Guardar. Aún no hay importador de preferencias Android: son almacenes independientes.
- `AppLayout` consume la apariencia efectiva. El editor mantiene el borrador, publica la vista previa por contexto y la retira al desmontarse; además el proveedor limita su aplicación a la ruta de Apariencia.
- Tailwind se integra mediante `@tailwindcss/vite`. Utilidades para disposición y espaciado, CSS semántico para componentes y tokens dinámicos en la raíz. Color de texto sobre acento y acento legible se calculan por luminancia/contraste.
- React Router utiliza BrowserRouter. Raíz redirige a `/app` de forma temporal hasta el sitio público W7. La ruta comodín presenta 404 sin redirigir silenciosamente al inicio.
- SVG original estático para iconos y estrellas; gradientes CSS para Aurora, con tonos relativos al acento. No hay librerías de iconos/animación adicionales ni bucles de partículas.
- TTF originales locales sin conversión, con licencias OFL; preload solo de Outfit regular y Exo 2 bold. Optimización a WOFF2 podrá evaluarse en W8 según mediciones.
- Playwright y axe son dependencias exclusivamente de desarrollo para verificar persistencia, errores, rutas, responsive y accesibilidad automatizada. La ampliación comprobada es de texto raíz, no una certificación del zoom nativo ni de lectores de pantalla.
- Solo se crearon módulos con funcionalidad actual. `features/upcoming` centraliza estados pendientes; no crea perfil, saldo, estadísticas ni usuarios ficticios en W2.

## 10. Decisiones materializadas en W3

- `CommunityProvider` va por separado del proveedor de apariencia y recibe un `CommunityRepository` único creado en el router. La página consume el estado con `useSyncExternalStore` sobre la publicación del repositorio; no hay estado de comunidad duplicado en React.
- El repositorio local publica `loading | error | ready`, guarda un único snapshot versionado en `teamval.community.demo.v1`, serializa escrituras con Web Locks (con alternativa si no existen) y avisa con `storage`/`focus` para que dos pestañas coincidan en cupos y decisiones. Cualquier lectura se revalida con `isCommunitySnapshot`; los datos alterados vuelven al fixture sin borrar el original y la UI ofrece reintento.
- Toda la semántica de negocio vive en `domain/rules/community.ts` como funciones puras (sin React ni almacenamiento): capacidad 2–5, aportación al equipo de 5, cupos sin sobrecupo, solicitudes duplicadas, permisos del anfitrión, transiciones terminales y búsqueda combinable con normalización de mayúsculas/acentos.
- Desviación frente a §3: pestañas, alcance y filtros del explorador viven en estado del componente (no en la URL), salvo `?publicacion=` en Solicitudes. Al salir y volver se restablecen, y el retorno desde Crear restablece filtros y activa «Mis publicaciones» mediante `location.state`. Se reevaluará en W6 si se quieren enlaces guardables.
- El editor de perfil valida por campo con las mismas funciones de dominio, muestra vista previa en directo y usa `revision` para detectar un cambio ajeno (conflicto) sin sobrescribir.
- El Riot ID se valida únicamente como formato «Nombre#Etiqueta» y se rotula como declarado/no verificado. Las estadísticas de VALORANT se muestran como no disponibles hasta Riot Sign On; la reputación procede del fixture y se etiqueta como demo.
- Ajuste de tokens derivados: `readableAccent` apunta a 4.6:1 (margen sobre 4.5:1 porque el valor final se redondea a HEX); axe confirmó el contraste efectivo una vez finalizada la animación de entrada.
- Las pruebas de reglas de dominio (`tests/unit`) se ejecutan con el mismo runner Playwright que las E2E; no se añadió Vitest porque Playwright ya transpila TypeScript y evita una dependencia adicional sin perder cobertura.

## 11. Decisiones materializadas en W4

- Contrato `TeamsRepository`, implementación `LocalTeamsRepository`, reglas puras `applyTeamCommand` y snapshot versionado. Equipos, solicitudes, publicaciones, scrims, valoraciones e imágenes se guardan conjuntamente en una transacción IndexedDB nativa. No hace falta una biblioteca adicional para un único almacén. Los errores no sustituyen datos por fixtures ni confirman guardados fallidos.
- `TeamsLayout` consume el repositorio con `useSyncExternalStore` y expone contexto de ruta con `useOutletContext`. El router crea una instancia única. La clave de animación del layout conserva W4 montada entre sus subrutas; W1–W3 conservan su comportamiento.
- Selector de actor explícitamente demo; `sessionStorage` por pestaña, separado de W3. Permite ensayar invitaciones y ambos capitanes sin fingir red o usuarios conectados. Las reglas validan de nuevo actor, pertenencia, capitanía, estados, duplicados y revisión del equipo dentro de la transacción.
- Plantilla: máximo siete, un equipo por jugador, un capitán, aceptación atómica, transferencia antes de salida del capitán. Solicitudes rechazadas/canceladas pueden volver a enviarse; no se duplican pendientes. Las solicitudes de enfrentamiento al mismo anuncio no pueden reenviarse, y no puede haber otra pendiente/aceptada para el mismo par.
- `TeamIdentityView` es el único renderizador de identidad. Subidas locales con firma/MIME/extensión, límites y decodificación; re-encode sin metadatos a WebP, máximo 1024 por lado. Recorte por cover/posición/zoom sin deformación; borrador aislado hasta Guardar. Data URL limitada a 2 millones de caracteres en IndexedDB, elección para atomicidad y ausencia de medios huérfanos. La moderación de contenido no existe en esta demo.
- Horarios futuros se convierten de `datetime-local` a UTC y se muestran en la zona local; no se infiere una zona por región. Premier usa nombres/grupos oficiales declarados. Resultado manual por mapas BO1/3/5; se permite completar anticipadamente para pruebas locales con aviso explícito, sin presentarlo como evento real verificado.
- Reputación de conducta calculada exclusivamente de valoraciones locales recibidas: cinco categorías más toxicidad separada, una por equipo/scrim completada, solo capitán. Denuncia local única por equipo receptor, sin envío remoto ni recompensas.
- Filtros locales al componente (igual que W3), no enlaces de búsqueda persistentes. IndexedDB v1 separado de W3; el reinicio W4 no afecta a comunidad ni apariencia. Las transacciones verificadas entre pestañas no equivalen a permisos de un backend real.
