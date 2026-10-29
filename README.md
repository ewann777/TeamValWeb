# TeamVal Web

Aplicación web de TeamVal · **W4: equipos, scrims y reputación local**.

## Abrir en desarrollo

Requiere Node.js 22.12+ (verificado con 24.22.0) y npm.

```powershell
npm ci
npm run dev -- --port 5173 --strictPort
```

Abre **http://127.0.0.1:5173/app**. El servidor escucha solo en el equipo local. Si el puerto está ocupado, detén la instancia anterior o elige otro puerto. En VS Code se debe abrir la carpeta `C:\Users\evanc\Desktop\TeamVal-Web`, no el archivo `TeamValWeb`.

## Disponible

- Inicio basado en los textos, tarjetas y jerarquía de Android, más resumen personal y publicaciones destacadas.
- Navegación lateral de escritorio e inferior móvil; enlaces directos y 404.
- Apariencia: Oscuro/Claro/Sistema, cinco presets, acento HEX y selector de color.
- Fondos Liso/Aurora/Estrellas, preview global y miniaturas compartidas.
- Guardado local versionado; volver, cambiar de sección o usar Atrás descarta cambios sin guardar.
- **Buscar equipo:** pestañas Dúo/Trío/Stack, búsqueda y filtros de rango/región/modalidad combinables, creación con validaciones, detalle, solicitudes recibidas/enviadas con simular, aceptar y rechazar.
- **Perfiles:** ficha propia editable (nombre, Riot ID declarado, región, rango, agente, presentación y cosmética gratuita) con vista previa en directo, y perfiles públicos enlazados desde avatar o nombre.
- Fuentes Outfit/Exo 2 locales, iconos originales y accesibilidad de teclado.

- **Equipos:** crear/editar, logo de formas o imagen validada con recorte, identidad con vista previa, integrantes y capitanía, invitaciones e ingresos, perfiles públicos y filtros.
- **Scrims:** publicaciones, filtros Premier, solicitudes con permisos, agenda, resultados manuales por mapas e historial; reputación de conducta y denuncias locales.

Tienda permanece pendiente de W5. El saldo no se simula, y no hay cuentas, backend, Riot Sign On ni pagos. Las estadísticas de VALORANT se muestran como no disponibles; la reputación y todos los datos de comunidad/equipos son de demostración local.

## Comprobaciones

```powershell
npm run typecheck
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright inicia un servidor local si hace falta. Reporte HTML: `playwright-report/index.html`; capturas responsive: `test-results/`. Estos artefactos están ignorados por Git. `npm run preview` permite inspeccionar localmente el build de `dist`.

## Apariencia y almacenamiento

Clave `teamval.appearance.v1` en localStorage. Solo guarda tema, paleta, acento y fondo. Un fallo de lectura muestra aviso y usa valores predeterminados sin borrar el original; un fallo al guardar nunca muestra éxito. Restaurar valores modifica el borrador hasta pulsar Guardar.

Clave `teamval.community.demo.v1` en localStorage. Contiene el snapshot completo de la demo de comunidad (perfiles, publicaciones, solicitudes) con versión; se revalida al leer y se restaura el fixture si los datos están alterados. Las escrituras se serializan con Web Locks para mantener cupos y solicitudes coherentes entre pestañas. **Reiniciar datos de demostración** (en Perfil) devuelve el estado inicial. Los datos están asociados al origen del navegador: `localhost` y `127.0.0.1` tienen preferencias independientes.

## Rutas

W4 guarda equipos, imágenes optimizadas, scrims y valoraciones en IndexedDB `teamval.teams.demo.v1`. El selector **Actuar como jugador demo** permite probar ambas partes de los flujos y persiste por pestaña en `sessionStorage`; no cambia el perfil W3. **Reiniciar demo W4** reinicia solo ese módulo. Los resultados son manuales y ninguna denuncia llega a moderadores reales.

| Ruta | Contenido |
| --- | --- |
| `/app` | Inicio |
| `/app/buscar-equipo` | Explorador de publicaciones |
| `/app/buscar-equipo/crear` | Crear publicación |
| `/app/buscar-equipo/solicitudes` | Solicitudes recibidas/enviadas |
| `/app/buscar-equipo/publicaciones/:id` | Detalle de publicación |
| `/app/perfil`, `/app/perfil/editar` | Ficha propia y editor |
| `/app/jugadores/:id` | Perfil público de demostración |
| `/app/scrims` | Publicaciones y búsqueda de scrims |
| `/app/scrims/equipos`, `/app/scrims/equipos/crear` | Explorar y crear equipos |
| `/app/scrims/equipos/:id`, `/app/scrims/equipos/:id/editar` | Perfil público, plantilla, reputación y editor |
| `/app/scrims/invitaciones` | Invitaciones y solicitudes de ingreso |
| `/app/scrims/publicar`, `/app/scrims/agenda` | Publicar, solicitudes, programadas e historial |
| `/app/tienda` | Estado de etapa W5 |
| `/app/apariencia` | Personalización |

## Recursos y licencias

Los ocho TTF de `public/fonts/` se copiaron sin modificar desde los recursos Android de referencia. Outfit y Exo 2 se distribuyen con sus textos SIL OFL 1.1 en `public/licenses/`. No se solicitan fuentes a servicios externos. El símbolo de equipo adapta el vector original de TeamVal; los demás iconos son trazos SVG propios. No se incluye arte de Riot Games.

## Documentación

- [ROADMAP_WEB.md](ROADMAP_WEB.md): alcance, resultados y próximos pasos.
- [ARCHITECTURE_WEB.md](ARCHITECTURE_WEB.md): decisiones y evolución.
- [ANALISIS_ANDROID_WEB.md](ANALISIS_ANDROID_WEB.md): referencias Android y equivalencias.

W4 implementada y verificada: 74 pruebas correctas. Pendiente revisión visual del usuario. W5 requiere autorización expresa. No hay despliegue público.
