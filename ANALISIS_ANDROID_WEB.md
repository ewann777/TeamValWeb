# TeamVal Web — Análisis Android y mapa de equivalencias

Fecha: 27/10/2026. Etapa: **W1 completada** mediante inspección documental y de código.

## 1. Referencia y método

- Proyecto consultado en modo solo lectura: `C:\Users\evanc\AndroidStudioProjects\TeamVal`.
- Se leyeron completos `PROJECT_SPEC.md` (1193 líneas) y `ROADMAP.md` (1417 líneas), incluida Tienda 2.0 y sus últimas correcciones.
- Se contrastaron con navegación, composición raíz, modelos, repositorios, persistencia, pantallas y componentes Compose. Las referencias Kotlin de este documento son relativas a `app/src/main/java/com/example/teamval/`.
- La carpeta `C:\Users\evanc\Desktop\TeamVal-Web` estaba vacía: no existe implementación web previa que reutilizar.
- La referencia es el código local actual, que incluye Tienda 2.0 en revisión; no se presupone que todo esté publicado o aprobado visualmente.
- No se ejecutó Android ni se compilaron sus fuentes. Esta revisión no certifica aspecto en dispositivo, accesibilidad ni pruebas nuevas.
- No se localizaron capturas de pantallas en las búsquedas de imágenes del proyecto y `app/build/reports`. Los WebP encontrados en recursos son iconos de launcher. Las mediciones de capturas mencionadas en el roadmap no equivalen a disponer de esas capturas para la web.

## 2. Arquitectura real

Un módulo `app`, Kotlin, Jetpack Compose, Material 3 y Navigation Compose. `TeamValApp.kt` compone repositorios y ViewModels, observa `StateFlow`, aplica apariencia y conecta callbacks a las pantallas. Hay separación `domain/model`, `domain/repository`, `data`, `ui/components`, `ui/screens`, `ui/theme` y `navigation`.

La navegación actual tiene cinco destinos: **Inicio, Buscar equipo, Scrims, Tienda y Perfil**. Scrims contiene tanto equipos como enfrentamientos. La apariencia está dentro de Perfil; el inventario se abre desde Tienda.

| Información | Implementación Android | Persistencia y realidad |
| --- | --- | --- |
| Perfil propio y apariencia | `LocalPreferencesRepository`, DataStore Preferences | Local persistente; no es una cuenta |
| Publicaciones y solicitudes | `InMemoryStackRepository` | Demo en memoria, se reinicia con el proceso |
| Equipos, identidad y scrims | `InMemoryTeamRepository` | Demo en memoria |
| Logos subidos | `data/storage/TeamLogoStorage` | Copia WebP privada persistente; la referencia del equipo sigue en memoria |
| Valoraciones y denuncias de equipos | `InMemoryRatingRepository` | Demo en memoria; no hay moderación real |
| Estadísticas y reputación personal | `DemoProfileData` | Valores ficticios de solo lectura |
| Catálogo y misiones | `DemoShopCatalog`, `DemoRewardData` | Definiciones locales |
| Monedas, propiedad y progreso/reclamos | `LocalEconomyRepository`, `EconomyDatabase` | Room: `coin_transactions`, `owned_items`, `mission_status` |
| Cosméticos equipados | Campos del perfil/apariencia o identidad de equipo | DataStore para personales; memoria para equipo |

`AndroidManifest.xml` no declara permiso INTERNET. La composición raíz conecta repositorios locales, sin autenticación, backend, Riot API ni Tracker. Que una operación funcione y persista localmente no la convierte en multiusuario.

## 3. Mapa funcional Android → Web

Las rutas siguientes son propuestas; aún no están implementadas. `/app` contendrá la aplicación y `/` la presentación pública de W7. En la tabla, las rutas de pantallas (`home/`, `stacks/`, `profile/`, etc.) se abrevian respecto de `ui/screens/`; los componentes se encuentran en `ui/components/`.

| Android / evidencia | Estado encontrado | Equivalencia web propuesta | Etapa |
| --- | --- | --- | --- |
| `home/HomeScreen.kt` | Marca, héroe, CTA, saldo y accesos a búsqueda/scrims/tienda | `/app`: marca, héroe y accesos; monedero excluido del Inicio web por ajuste posterior solicitado por el usuario | W2 |
| Inicio: usuario y publicaciones destacadas | No existen en el Inicio actual | Añadir resumen del perfil y selección explícita de publicaciones demo | W3 |
| `stacks/StackExplorerScreen.kt` | Dúo/Trío/Stack, alcance propio/ajeno, filtros, contador y vacíos | `/app/buscar-equipo`, filtros en estado del componente (ver §10 de ARCHITECTURE_WEB.md) | W3 |
| `stacks/CreateStackScreen.kt` | Crear publicación validada | `/app/buscar-equipo/crear` | W3 |
| `stacks/StackRequestsScreen.kt` | Recibidas/enviadas, aceptar/rechazar, simulación | `/app/buscar-equipo/solicitudes?publicacion=…` | W3 |
| `StackPostCard` | Publicación completa dentro del listado; no hay ruta de detalle | `/app/buscar-equipo/publicaciones/:postId`, nueva vista compartible | W3 |
| `profile/ProfileScreen.kt` | Solo perfil propio, biografía, métricas y reputación demo | `/app/perfil` | W3 |
| Perfiles ajenos | No hay destino público por jugador ni enlace desde las tarjetas | `/app/jugadores/:playerId`, fichas demo; lectura pública real en W6 | W3/W6 |
| `profile/EditProfileScreen.kt` | Nombre, presentación, biografía, agente, región y cosmética | `/app/perfil/editar` con borrador y vista previa | W3 |
| `profile/AppearanceScreen.kt` | Tema/presets/acento/fondo, vista previa y guardado | `/app/apariencia` | W2 |
| `teams/TeamsHubScreen.kt` | Segmentos Equipos/Scrims y filtros | `/app/scrims?seccion=equipos` o `/app/scrims?seccion=scrims` | W4 |
| `teams/CreateTeamScreen.kt` | Crear equipo y capitán, un equipo por jugador | `/app/equipos/crear` | W4 |
| `teams/TeamDetailScreen.kt` | Identidad, integrantes/roles, historial, reputación | `/app/equipos/:teamId` | W4 |
| Gestión de plantilla | Se muestran roles e integrantes; no hay operaciones de invitación, expulsión o cambio de rol en `TeamRepository` | `/app/equipos/:teamId/integrantes`, ampliación web con reglas explicitadas | W4/W6 |
| `teams/TeamProfileEditorScreen.kt` | Identidad, colores, banner, fondo, marcos e insignias | `/app/equipos/:teamId/identidad` | W4 |
| `teams/LogoEditorScreen.kt`, `ImageCropScreen.kt` | Logo propio o imagen con recorte/zoom | Subrutas `identidad/logo` y `identidad/logo/recortar` | W4 |
| `scrims/CreateScrimScreen.kt` | Propuesta y simulación de propuesta entrante | `/app/scrims/crear` | W4 |
| `scrims/ScrimDetailScreen.kt` | Aceptar/rechazar/cancelar, marcador, acceso a valoración | `/app/scrims/:scrimId` | W4 |
| `ratings/RateScrimScreen.kt` | Cinco categorías, comentario y prevención de duplicados | `/app/scrims/:scrimId/valorar` | W4 |
| `shop/ShopScreen.kt` y diálogos | Destacados, 11 categorías, detalle y confirmación | `/app/tienda`, detalle como diálogo accesible | W5 |
| `shop/FrameFittingDialog.kt` | Perfil guardado con marco candidato y comparación | Probador compartido por tienda e inventario | W5 |
| `inventory/InventoryScreen.kt` | Propiedad, filtros, equipar/desequipar | `/app/tienda/inventario` | W5 |
| `wallet/WalletScreen.kt` | Saldo, ingresos/gastos e historial | `/app/tienda/monedero` | W5 |
| `rewards/RewardsScreen.kt` | Reclamos únicos, simulación y verificación pendiente | `/app/tienda/recompensas` | W5 |
| Comunidad | Reputación y comentarios sobre scrims; sin foro, chat ni feed social general | Conservar esos flujos, sin inventar comunidad conectada | W4/W6 |
| Sitio público, legales y contacto | No implementados en Android | `/`, `/proyecto`, `/privacidad`, `/terminos`, `/contacto` | W7 |
| Identidad/estadísticas Riot | No implementadas | Contratos futuros deshabilitados, sin cifras verificadas | W6/W7; integración posterior |

## 4. Reglas que deben conservarse

### Buscar equipo

Fuentes: `domain/model/StackModels.kt`, `data/repository/InMemoryStackRepository.kt`.

- Título recortado: 5–60 caracteres; descripción: 10–300; capacidad: 2–5, anfitrión incluido.
- Dúo = capacidad 2; Trío = 3; Stack = 4 o 5. No clasificar por cupos libres.
- Integrantes = miembros; cupos = capacidad − miembros; fuera del grupo para completar cinco = 5 − capacidad. Son cifras distintas cuya suma es cinco.
- Categoría + rango + región + modalidad + alcance se combinan con AND. Sin categoría activa se ven todas; pulsar la activa la deselecciona. Limpiar los tres filtros no limpia la categoría.
- Explorar muestra publicaciones ajenas. Crear activa Mis publicaciones y la categoría del nuevo grupo, quitando filtros que lo ocultarían.
- Solicitar no ocupa plaza. Se bloquean propietario, miembro, grupo lleno y cualquier solicitud anterior al mismo grupo, incluso rechazada.
- Solo el propietario resuelve pendientes; aceptar añade miembro y cambia estado atómicamente, sin superar cupo. Las decisiones son terminales. Otras solicitudes pueden quedar pendientes al llenarse.
- Candidatos y anfitriones son ficticios. Las enviadas a anfitriones demo permanecen pendientes.
- Hay diez categorías de rango sin divisiones, siete regiones y cinco modalidades. No hay Premier ni validación de matchmaking oficial.

### Perfiles y apariencia

Fuentes: `Personalization.kt`, `LocalPreferencesRepository.kt`, `ProfileScreen.kt`.

- Nombre 3–24, presentación hasta 80, biografía hasta 300; región y seis agentes favoritos definidos localmente.
- El campo `name` contiene una cadena parecida a Riot ID; no hay `gameName`/`tagLine`, PUUID ni vinculación verificada. El perfil por defecto del código es `LosFichas#777`; documentación histórica menciona `Nova#TEAM` en el repositorio de stacks. La raíz propaga el nombre guardado a stacks/equipos.
- Estadísticas personales y reseñas son ficticias; no existe envío de valoraciones a jugadores.
- Apariencia: oscuro por defecto, acento `FF4655`, fondo Plain, paleta Classic y fuente Modern (Outfit + Exo 2).
- Tema Oscuro/Claro/Sistema; cinco presets gratuitos; acento HEX de seis dígitos. Vista previa global solo mientras el editor está abierto; toda salida descarta lo no guardado. Confirmación únicamente tras persistir con éxito.
- No hay selector visible de tipografía. Identificadores históricos siguen válidos; Aqualux todavía activa Mono y Stars.
- La lectura antigua `Grid` → `Stars` aplica al **fondo global**, no a los fondos/banners de equipo que aún admiten Grid.

### Equipos, scrims y reputación

Fuentes: `TeamRepository.kt`, `InMemoryTeamRepository.kt`, `TeamIdentity.kt`, `RatingModels.kt`.

- Crear equipo: nombre 3–24, abreviatura alfanumérica 2–5, lema hasta 80, descripción 10–300. Creador capitán; un equipo por jugador.
- Solo se crean equipos y se consultan plantillas: gestión real de miembros será una ampliación, no una migración ya resuelta.
- Scrim: rival distinto, horario como texto de 5–60 caracteres; no es calendario ni fecha UTC. No duplicar propuestas pendientes entre el mismo par de equipos.
- Propuesta → Confirmada o Cancelada; Confirmada → Completada o Cancelada. Solo destinatario acepta/rechaza; una parte participante cancela o completa según estado.
- Marcador demo: enteros 0–13 y distintos; no exige que uno llegue a 13. No representa reglas oficiales completas ni confirma que se jugó una partida.
- Cinco categorías de conducta de 1–5 estrellas; una valoración por equipo/scrim completada, representación del capitán, sin autovaloración. Comentario opcional; si existe, 10–500 caracteres, sin enlaces y con lista local de términos bloqueados.
- Insignias de reputación derivadas de las valoraciones; sin monedas por opiniones positivas. Denunciar registra un estado local, no envía el caso a moderadores reales.
- Logo: JPG/PNG/WebP, máximo 10 MB, 512 px recomendado; copia WebP de lado máximo 1024 sin ampliar; recorte proporcional y zoom 1–4.
- Permisos de identidad se comprueban en el ViewModel; `updateTeamIdentity` del repositorio no impone por sí mismo ese permiso. En remoto debe validarse en servidor.

### Economía y Tienda 2.0

Fuentes: `DemoShopCatalog.kt`, `LocalEconomyRepository.kt`, `EconomyModels.kt`, `CosmeticBindings.kt`, `FrameFittingDialog.kt`.

- **35 artículos / 11 categorías: 31 con precio TC y 4 premium CLP bloqueados**. Mantener los cosméticos anteriores, paquete e IDs.
- Bono inicial idempotente de 500 TC. Saldo, ingresos y gastos derivados de movimientos; compras serializadas y transaccionales.
- Precio resuelto por ID en catálogo; propiedad única; sin saldo negativo ni doble cobro. Paquete cobra su precio completo si falta contenido; concede solo lo que falta; si ya está comprado o todo su contenido se posee, no vuelve a cobrarse.
- Comprar concede propiedad; equipar es una acción independiente. Fallar al equipar no repite ni revierte silenciosamente la compra.
- Estado equipado derivado de los campos canónicos, sin tabla paralela. Desequipar marco vuelve a Halo; fondo a Nebula; banner/sticker/mascota a None; tarjeta a Base; marco/fondo de equipo a Ring/Dusk. Insignias se agregan o retiran individualmente.
- Cosméticos de equipo pasan por su editor y Guardar/Cancelar con permiso de capitán. Propiedad comprada persiste, aplicación al equipo no sobrevive al reinicio del proceso Android.
- Recompensa de perfil: 100 TC si difiere del perfil predeterminado; misiones demo: 50 + 75 + 150 TC. Máximo disponible actual: 875 TC. Sesiones/valoraciones verificadas permanecen bloqueadas.
- Marcos nuevos: Rosas Carmesí 200, Lavanda Mística 250, Sombra Espectral 350, Radiante Dorado 450, Constelación Azul 600, Energía Suprema 800 TC. Los seis son estáticos.
- Probador clona el perfil guardado y cambia únicamente el marco; comparar/cerrar no escribe ni cobra. Saldo insuficiente deja previsualizar. Compra con confirmación; equipar después.
- Un renderizador `AvatarFrameArt` sirve perfil/editor/catálogo/probador. Registro preparado para PNG/WebP transparente de 512×512; coordenadas normalizadas 100×100, centro 50/50, ornamentos entre radios 38–49.
- Las garantías locales de coherencia no impiden manipulación del dispositivo; no deben usarse como autorización de una economía compartida.

## 5. Identidad visual vigente y diferencias documentales

| Referencia | Especificación a trasladar |
| --- | --- |
| `Color.kt`, `Theme.kt` | Rojo `#FF4655`, carbón `#0F1923`, marfil `#ECE8E1`; secundario oscuro `#C4CDD5`; claro `#F7F4EF`, texto carbón y secundario `#46535E` |
| `Visuals.kt` | Vidrio denso 0,92–0,96, borde degradado con acento, sombras suaves y brillos controlados |
| `Shape.kt` | Radios 10/14/18/26/34 dp como referencia para tokens CSS |
| `Type.kt` | Outfit cuerpo/controles, Exo 2 títulos; pesos 400/500/600/700; título principal 34/40, secundario 28/34, sección 22/28, cuerpo 16/25 o 14/21 |
| `HomeScreen.kt` | Marca con icono y punto de acento, saldo, héroe, CTA y tarjetas; padding 24, secciones 28, ancho máximo 840 dp |
| `TeamValNavigationBar.kt` | Cinco iconos con etiquetas, vidrio, filete superior y píldora activa |
| `AppBackdrop.kt` | Liso uniforme; Aurora de cuatro resplandores derivados del acento; Estrellas deterministas estáticas, suaves en claro |
| `StackExplorerScreen.kt` | Tres botones iguales, alto 46 y radio 18; contenedor transparente, dentro del flujo, **no sticky** |

Discrepancias relevantes resueltas leyendo código más reciente:

1. Lavanda, Cuadrícula global, selector de fuentes y categorías sticky de secciones históricas ya no describen la interfaz por defecto.
2. `TeamIdentityPreview` utiliza `sectionOrder()` y `memberStyle`; `TeamDetailScreen` presenta orden fijo y filas de miembros. En web se propone un renderizador compartido que aplique esas opciones también al detalle.
3. Aqualux conserva una descripción textual antigua que dice «cuadrícula», pero `CosmeticBindings` aplica Stars y Mono. La web describirá su comportamiento real.
4. «Perfil completado» hoy significa cualquier diferencia frente al predeterminado, incluso cosmética. Conservarlo en demo; revisar elegibilidad de producción en W6.
5. La documentación reconoce contraste de texto directo sobre zonas brillantes de Aurora de aproximadamente 3,3:1. La web preservará la estética ajustando superficie/intensidad donde haga falta para alcanzar contraste accesible.
6. Energía Suprema tiene movimiento futuro reservado; no está animado actualmente.

## 6. Evidencia de calidad y recursos pendientes

El roadmap registra 109 unitarias correctas y Lint con 0 errores/8 avisos tras los últimos ajustes. La instrumentación tiene ejecuciones focalizadas, fallos de foco y desconexiones; el último registro narra una corrección de Atrás sin certificar después una batería completa actual. No se presenta como una suite integral aprobada por esta auditoría.

Fuentes locales Outfit/Exo 2 con licencias SIL OFL en `app/src/main/assets/licenses/`; se podrán incorporar legalmente a la web conservando licencias. Iconos, logos provisionales y marcos están dibujados con recursos propios según código/documentación. Falta un logotipo oficial definitivo. No se copiarán emblemas, agentes ni arte protegido de Riot.

Pendientes antes de la comparación visual: capturas Android actuales de Inicio, Buscar equipo, Perfil, Apariencia, Equipos y probador, en claro/oscuro; aprobación visual de Tienda 2.0. Son entradas para W2–W5/W7, no pruebas ya realizadas.

Plan y decisiones: [ROADMAP_WEB.md](ROADMAP_WEB.md) y [ARCHITECTURE_WEB.md](ARCHITECTURE_WEB.md).
