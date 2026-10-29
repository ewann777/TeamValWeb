import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const communityKey = 'teamval.community.demo.v1'
const createdTitle = 'Escuadra nocturna con calma'

test('explorador: categorías, alcance, búsqueda y filtros combinables', async ({ page }) => {
  await page.goto('/app/buscar-equipo')
  await expect(page.getByRole('heading', { name: 'Buscar equipo', level: 1 })).toBeVisible()
  await expect(page.getByText('DEMO LOCAL').first()).toBeVisible()
  // El alcance por defecto excluye las publicaciones propias.
  await expect(page.getByText('Mi equipo para esta noche')).toHaveCount(0)
  await expect(page.getByText('5 publicaciones')).toBeVisible()

  await page.getByRole('button', { name: 'Dúo', exact: true }).click()
  await expect(page.getByText('Un dúo con buena comunicación')).toBeVisible()
  await expect(page.getByText('Equipo de práctica')).toBeVisible()
  await expect(page.getByText('Rankeds de noche, cero tilt')).toHaveCount(0)
  await expect(page.getByText('2 publicaciones')).toBeVisible()
  // Pulsar la pestaña activa vuelve a mostrar todos los grupos.
  await page.getByRole('button', { name: 'Dúo', exact: true }).click()
  await expect(page.getByText('5 publicaciones')).toBeVisible()

  await page.getByPlaceholder('Título o anfitrión').fill('noche')
  await expect(page.getByText('1 publicación', { exact: true })).toBeVisible()
  await page.getByPlaceholder('Título o anfitrión').fill('zzzz-sin-resultados')
  await expect(page.getByText('Tu próximo equipo está por llegar')).toBeVisible()
  await page.locator('.state-card').getByRole('button', { name: 'Limpiar filtros' }).click()
  await expect(page.getByText('5 publicaciones')).toBeVisible()

  await page.getByRole('button', { name: /Filtrar stacks/ }).click()
  await page.getByLabel('Rango mínimo').selectOption('Gold')
  await page.getByLabel('Rango máximo').selectOption('Gold')
  await page.getByLabel('Región').selectOption('LatamSouth')
  await expect(page.getByText('1 publicación', { exact: true })).toBeVisible()
  await expect(page.getByText('Un dúo con buena comunicación')).toBeVisible()
  await page.getByRole('button', { name: 'Limpiar filtros' }).last().click()
  await expect(page.getByText('5 publicaciones')).toBeVisible()

  await page.getByRole('button', { name: 'Mis publicaciones' }).click()
  await expect(page.getByText('Mi equipo para esta noche')).toBeVisible()
  await expect(page.getByText('Un dúo con buena comunicación')).toHaveCount(0)
})

test('crear publicación: validaciones, creación visible con filtros reiniciados y persistencia', async ({ page }) => {
  await page.goto('/app/buscar-equipo/crear')
  await page.getByRole('button', { name: 'Publicar stack' }).click()
  await expect(page.getByText('El título debe tener entre 5 y 60 caracteres.')).toBeVisible()
  await expect(page.getByText('La descripción debe tener entre 10 y 300 caracteres.')).toBeVisible()
  await expect(page).toHaveURL(/\/app\/buscar-equipo\/crear$/)

  await page.getByLabel('Título de la publicación').fill(createdTitle)
  await page.getByLabel('Descripción').fill('Busco dos compañeros con buena actitud para jugar de noche.')
  await page.getByRole('button', { name: '3 jugadores Trío' }).click()
  await page.getByLabel('Rango').selectOption('Silver')
  await page.getByRole('button', { name: 'Publicar stack' }).click()

  await expect(page).toHaveURL(/\/app\/buscar-equipo$/)
  await expect(page.getByText('Publicación creada. Ya puedes simular candidatos y gestionar solicitudes.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Mis publicaciones' })).toHaveAttribute('aria-pressed', 'true')
  const created = page.locator('.stack-card').filter({ hasText: createdTitle })
  await expect(created).toBeVisible()
  await expect(created.getByText('Integrantes: 1 de 3')).toBeVisible()

  await page.reload()
  await expect(page.getByText(createdTitle)).toBeVisible()
})

test('solicitudes: unirse, simular, aceptar y rechazar con confirmación visible', async ({ page }) => {
  await page.goto('/app/buscar-equipo')
  const duo = page.locator('.stack-card').filter({ hasText: 'Un dúo con buena comunicación' })
  await duo.getByRole('button', { name: 'Solicitar unirme' }).click()
  await expect(page.getByText('Solicitud enviada. Puedes consultarla en Solicitudes → Enviadas.')).toBeVisible()
  await expect(duo.getByRole('button', { name: 'Solicitud enviada' })).toBeDisabled()

  await page.goto('/app/buscar-equipo/solicitudes')
  await page.getByRole('button', { name: 'Enviadas' }).click()
  await expect(page.getByText('Solicitud pendiente').first()).toBeVisible()

  // Las publicaciones propias se gestionan desde «Mis publicaciones».
  await page.goto('/app/buscar-equipo')
  await page.getByRole('button', { name: 'Mis publicaciones' }).click()
  const mine = page.locator('.stack-card').filter({ hasText: 'Mi equipo para esta noche' })
  await mine.getByRole('button', { name: 'Simular solicitud' }).click()
  await expect(page.getByText('Ha llegado una solicitud ficticia. Revísala en Solicitudes → Recibidas.')).toBeVisible()

  await page.goto('/app/buscar-equipo/solicitudes')
  await expect(page.getByText('Solicitud pendiente').first()).toBeVisible()
  await page.getByRole('button', { name: 'Rechazar' }).first().click()
  await expect(page.getByText('Solicitud rechazada. No se ha ocupado ninguna plaza.')).toBeVisible()

  await page.goto('/app/buscar-equipo')
  await page.getByRole('button', { name: 'Mis publicaciones' }).click()
  await page.locator('.stack-card').filter({ hasText: 'Mi equipo para esta noche' }).getByRole('button', { name: 'Simular solicitud' }).click()

  await page.goto('/app/buscar-equipo/solicitudes')
  await page.getByRole('button', { name: 'Aceptar' }).first().click()
  await expect(page.getByText('Solicitud aceptada. Un nuevo compañero ocupa una plaza.')).toBeVisible()

  await page.goto('/app/buscar-equipo')
  await page.getByRole('button', { name: 'Mis publicaciones' }).click()
  await expect(page.locator('.stack-card').filter({ hasText: 'Mi equipo para esta noche' }).getByText('Integrantes: 2 de 3')).toBeVisible()
  await page.reload()
  await page.getByRole('button', { name: 'Mis publicaciones' }).click()
  await expect(page.locator('.stack-card').filter({ hasText: 'Mi equipo para esta noche' }).getByText('Integrantes: 2 de 3')).toBeVisible()

  // Un stack completo no admite nuevas solicitudes.
  await page.getByRole('button', { name: 'Explorar' }).click()
  const full = page.locator('.stack-card').filter({ hasText: 'Equipo de práctica' })
  await expect(full.getByRole('button', { name: 'Stack completo' })).toBeDisabled()
})

test('detalle de publicación, enlaces directos y estado no encontrado', async ({ page }) => {
  await page.goto('/app/buscar-equipo/publicaciones/demo-duo')
  await expect(page.getByRole('heading', { name: 'Un dúo con buena comunicación', level: 1 })).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'Integrantes del grupo' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Vega', exact: true }).first()).toBeVisible()

  await page.goto('/app/buscar-equipo/publicaciones/no-existe')
  await expect(page.getByText('No encontramos esta publicación')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ver todas las publicaciones' })).toBeVisible()

  await page.goto('/app/buscar-equipo/solicitudes?publicacion=otra-que-no-existe')
  await expect(page.getByText('No encontramos esa publicación')).toBeVisible()
})

test('perfil propio editable con Riot ID, región y agente; persistencia tras recargar', async ({ page }) => {
  await page.goto('/app/perfil')
  await expect(page.getByRole('heading', { name: 'Tu espacio, tu identidad', level: 1 })).toBeVisible()
  await expect(page.getByText('Estadísticas no disponibles todavía')).toBeVisible()
  await expect(page.getByText(/no inventadas|cifras inventadas/)).toBeVisible()

  await page.getByRole('link', { name: 'Editar perfil' }).click()
  await expect(page).toHaveURL(/\/app\/perfil\/editar$/)
  await page.getByLabel('Riot ID').fill('sin-formato')
  await page.getByLabel('Nombre de jugador').fill('Fichas Nova')
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect(page.getByText(/formato Nombre#Etiqueta/)).toBeVisible()

  await page.getByLabel('Riot ID').fill('FichasNova#LATAM')
  await page.getByLabel('Región').selectOption('Europe')
  // El selector de agente es el roster completo: se elige pulsando la casilla.
  await page.getByRole('button', { name: /Sage/ }).click()
  await page.getByLabel('Tu presentación').fill('Apoyo con buena comunicación y ganas de aprender.')
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect(page.getByText('Cambios guardados en este dispositivo.')).toBeVisible()

  await page.goto('/app/perfil')
  await expect(page.getByRole('heading', { name: 'Fichas Nova', level: 2 })).toBeVisible()
  await expect(page.getByText('FichasNova#LATAM')).toBeVisible()
  await expect(page.getByText('Main Sage')).toBeVisible()
  await expect(page.getByText('Europa', { exact: true }).first()).toBeVisible()
})

test('agente principal: roster completo de 30 agentes, búsqueda, filtro por rol y persistencia', async ({ page }) => {
  await page.goto('/app/perfil/editar')
  const cells = page.locator('.agent-cell')
  // Roster completo de VALORANT (octubre 2026), incluidos Hush y Miks.
  await expect(cells).toHaveCount(30)
  await expect(page.getByRole('button', { name: /Hush/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Miks/ })).toBeVisible()

  // Búsqueda por nombre.
  await page.getByPlaceholder('Buscar agente…').fill('jet')
  await expect(cells).toHaveCount(1)
  await expect(page.getByRole('button', { name: /Jett/ })).toBeVisible()

  // Filtro por rol (Duelist) sobre el roster completo.
  await page.getByPlaceholder('Buscar agente…').fill('')
  await page.getByRole('button', { name: 'Duelista', exact: true }).click()
  await expect(cells).toHaveCount(9)
  await expect(page.getByRole('button', { name: /Hush/ })).toBeVisible()

  // Selección y persistencia tras recargar.
  await page.getByRole('button', { name: /Hush/ }).click()
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect(page.getByText('Cambios guardados en este dispositivo.')).toBeVisible()
  await page.goto('/app/perfil')
  await expect(page.getByText('Main Hush')).toBeVisible()
  await page.reload()
  await expect(page.getByText('Main Hush')).toBeVisible()
})

test('perfil público enlazado desde avatar o nombre, y perfil inexistente', async ({ page }) => {
  await page.goto('/app/buscar-equipo')
  const duo = page.locator('.stack-card').filter({ hasText: 'Un dúo con buena comunicación' })
  await duo.getByRole('link', { name: 'Vega', exact: true }).first().click()
  await expect(page).toHaveURL(/\/app\/jugadores\/host-1$/)
  await expect(page.getByRole('heading', { name: 'Vega', level: 1 })).toBeVisible()
  await expect(page.getByText('Un dúo con buena comunicación')).toBeVisible()
  await expect(page.getByText(/ficticio|demostración/).first()).toBeVisible()

  await page.goto('/app/buscar-equipo')
  await page.locator('.stack-card').filter({ hasText: 'Un dúo con buena comunicación' }).getByRole('link', { name: 'Ver el perfil público de Vega' }).first().click()
  await expect(page).toHaveURL(/\/app\/jugadores\/host-1$/)

  await page.goto('/app/jugadores/no-existe')
  await expect(page.getByText('Este perfil no existe')).toBeVisible()

  await page.goto('/app/jugadores/demo-me')
  await expect(page).toHaveURL(/\/app\/perfil$/)
})

test('inicio: publicaciones destacadas y resumen propio, sin tarjeta de monedero', async ({ page }) => {
  await page.goto('/app')
  await expect(page.getByRole('heading', { name: 'Publicaciones destacadas' })).toBeVisible()
  await expect(page.locator('.featured-card')).toHaveCount(2)
  await expect(page.getByText('TeamVal Coins', { exact: true })).toHaveCount(0)
  await expect(page.getByText('TU MONEDERO')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'LosFichas' })).toBeVisible()
  await expect(page.getByText('Mis publicaciones')).toBeVisible()
  await page.getByRole('link', { name: 'Ver mi perfil' }).click()
  await expect(page).toHaveURL(/\/app\/perfil$/)
})

test('error de datos locales visible con reintento y reinicio de la demo', async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, '{datos rotos'), communityKey)
  await page.goto('/app/buscar-equipo')
  await expect(page.getByRole('alert')).toContainText(/No se pudieron guardar o leer los datos locales/)
  await page.getByRole('button', { name: 'Reintentar' }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.getByText('DEMO LOCAL')).toHaveCount(0)

  await page.goto('/app/perfil')
  await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible()
  expect(await page.evaluate((key) => localStorage.getItem(key), communityKey)).toBe('{datos rotos')
})

test('reinicio de la demo descarta publicaciones creadas', async ({ page }) => {
  await page.goto('/app/buscar-equipo/crear')
  await page.getByLabel('Título de la publicación').fill(createdTitle)
  await page.getByLabel('Descripción').fill('Publicación temporal para comprobar el reinicio local de la demo.')
  await page.getByRole('button', { name: 'Publicar stack' }).click()
  await expect(page.getByText(createdTitle)).toBeVisible()

  await page.goto('/app/perfil')
  await page.getByRole('button', { name: 'Reiniciar datos de demostración' }).click()
  await page.getByRole('button', { name: 'Sí, reiniciar' }).click()
  await expect(page.getByText('Datos de demostración restablecidos. Vuelve al inicio para ver el estado inicial.')).toBeVisible()

  await page.goto('/app/buscar-equipo')
  await page.getByRole('button', { name: 'Mis publicaciones' }).click()
  await expect(page.getByText(createdTitle)).toHaveCount(0)
  await expect(page.getByText('Mi equipo para esta noche')).toBeVisible()
})

for (const width of [320, 768, 1440]) {
  test(`responsive W3 a ${width}px sin desbordamiento`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    for (const route of ['/app', '/app/buscar-equipo', '/app/buscar-equipo/crear', '/app/buscar-equipo/solicitudes', '/app/perfil', '/app/perfil/editar']) {
      await page.goto(route)
      await page.evaluate(() => document.fonts.ready)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `desborde en ${route} a ${width}px`).toBe(true)
      if (width < 768) await expect(page.getByRole('navigation', { name: 'Navegación móvil' })).toBeVisible()
    }
    await page.screenshot({ path: testInfo.outputPath(`w3-${width}.png`), fullPage: true })
  })
}

test('accesibilidad automatizada en explorador y perfil', async ({ page }) => {
  for (const route of ['/app', '/app/buscar-equipo', '/app/buscar-equipo/crear', '/app/buscar-equipo/solicitudes', '/app/perfil', '/app/perfil/editar']) {
    await page.goto(route)
    // axe debe ver los colores finales; si no, mide la opacidad de la animación de entrada.
    await page.locator('.page-enter').evaluate((element) => element.getAnimations().forEach((animation) => animation.finish()))
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(results.violations, `violaciones en ${route}`).toEqual([])
  }
})
