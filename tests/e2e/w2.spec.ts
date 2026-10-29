import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const key = 'teamval.appearance.v1'

test('rutas, navegación, enlaces profundos y 404 sin errores de JavaScript', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page).toHaveURL(/\/app$/)
  await expect(page.getByRole('heading', { name: 'Tu próximo equipo empieza aquí.' })).toBeVisible()
  const navigation = page.getByRole('navigation', { name: 'Navegación principal', exact: true })
  const routes = [
    { label: 'Buscar equipo', path: 'buscar-equipo', heading: 'Buscar equipo', upcoming: false },
    { label: 'Scrims', path: 'scrims', heading: 'Scrims', upcoming: false },
    { label: 'Tienda', path: 'tienda', heading: 'Tienda', upcoming: true },
    { label: 'Perfil', path: 'perfil', heading: 'Tu espacio, tu identidad', upcoming: false },
  ] as const
  for (const route of routes) {
    await navigation.getByRole('link', { name: route.label, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`/app/${route.path}$`))
    await expect(page.getByRole('heading', { name: route.heading, level: 1 })).toBeVisible()
    if (route.upcoming) await expect(page.getByText(/Su funcionalidad llegará/)).toBeVisible()
    else await expect(page.getByText(/Su funcionalidad llegará/)).toHaveCount(0)
    await page.reload()
    await expect(navigation.getByRole('link', { name: route.label, exact: true })).toHaveAttribute('aria-current', 'page')
  }
  await page.getByRole('link', { name: 'Apariencia de la aplicación', exact: true }).last().click()
  await expect(page.getByRole('heading', { name: 'Apariencia', exact: true })).toBeVisible()
  await page.goto('/app/no-existe')
  await expect(page.getByRole('heading', { name: 'Esta ruta no está en el mapa.' })).toBeVisible()
  expect(errors).toEqual([])
})

test('vista previa, guardado persistente y descarte al navegar y volver', async ({ page }) => {
  await page.goto('/app/apariencia')
  await page.getByRole('radio', { name: 'Claro', exact: true }).check()
  await page.getByRole('button', { name: 'Estrellas Tu pequeño universo' }).click()
  await page.getByLabel('Color personalizado · HEX').fill('#69C8FF')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  expect(await page.evaluate((k) => localStorage.getItem(k), key)).toBeNull()
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect(page.getByText('¡Apariencia actualizada!')).toBeVisible()
  await page.reload()
  await expect(page.getByRole('radio', { name: 'Claro', exact: true })).toBeChecked()
  await expect(page.locator('.global-background')).toHaveAttribute('data-background', 'stars')
  await page.getByRole('radio', { name: 'Oscuro', exact: true }).check()
  await page.getByRole('button', { name: 'Aurora Luz con tu acento' }).click()
  await page.getByRole('navigation', { name: 'Navegación principal', exact: true }).getByRole('link', { name: 'Inicio', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.locator('.global-background')).toHaveAttribute('data-background', 'stars')
  await page.goBack()
  await expect(page.getByRole('radio', { name: 'Claro', exact: true })).toBeChecked()
  await expect(page.getByText('¡Apariencia actualizada!')).toHaveCount(0)
  await page.getByRole('button', { name: 'Restablecer valores predeterminados' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})

test('Sistema reacciona a cambios del dispositivo y HEX inválido no se guarda', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/app/apariencia')
  await page.getByRole('radio', { name: 'Sistema' }).check()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.getByLabel('Color personalizado · HEX').fill('#XYZ')
  await expect(page.getByLabel('Color personalizado · HEX')).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByRole('button', { name: 'Guardar', exact: true })).toBeDisabled()
  expect(await page.evaluate((k) => localStorage.getItem(k), key)).toBeNull()
})

test('un error de almacenamiento no produce una confirmación falsa', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('No disponible', 'QuotaExceededError') } })
  await page.goto('/app/apariencia')
  await page.getByRole('radio', { name: 'Claro', exact: true }).check()
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect(page.getByText(/No se pudo guardar/)).toBeVisible()
  await expect(page.getByText('¡Apariencia actualizada!')).toHaveCount(0)
  await page.getByRole('link', { name: 'Volver', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})

test('preferencias dañadas se recuperan sin borrar el dato original', async ({ page }) => {
  await page.addInitScript((k) => localStorage.setItem(k, '{dato roto'), key)
  await page.goto('/app')
  await expect(page.getByText(/No se pudo leer la apariencia guardada/)).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  expect(await page.evaluate((k) => localStorage.getItem(k), key)).toBe('{dato roto')
})

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`responsive ${width}px, navegación y capturas reales`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    for (const route of ['/app', '/app/perfil', '/app/apariencia']) {
      await page.goto(route)
      await page.evaluate(() => document.fonts.ready)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      if (width < 768) await expect(page.getByRole('navigation', { name: 'Navegación móvil' })).toBeVisible()
    }
    await page.getByRole('radio', { name: 'Claro', exact: true }).check()
    await page.getByRole('button', { name: 'Estrellas Tu pequeño universo' }).click()
    await page.screenshot({ path: testInfo.outputPath(`appearance-${width}.png`), fullPage: true })
    await page.goto('/app')
    await page.screenshot({ path: testInfo.outputPath(`home-${width}.png`), fullPage: true })
    if (width < 768) {
      await page.getByRole('navigation', { name: 'Navegación móvil' }).getByRole('link', { name: 'Tienda', exact: true }).click()
      await expect(page.getByRole('heading', { name: 'Tienda', exact: true })).toBeVisible()
    }
  })
}

for (const mode of ['Oscuro', 'Claro']) {
  test(`accesibilidad automatizada en ${mode}, fondos y acentos extremos`, async ({ page }) => {
    // Medir colores finales, no transiciones intermedias entre acentos.
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/app/apariencia')
    await page.getByRole('radio', { name: mode, exact: true }).check()
    for (const [background, accent] of [['Aurora Luz con tu acento', '#FFFFFF'], ['Estrellas Tu pequeño universo', '#000000'], ['Liso Simple y esencial', '#FF4655']]) {
      await page.getByRole('button', { name: background }).click()
      await page.getByLabel('Color personalizado · HEX').fill(accent!)
      // axe debe ver los colores finales; si no, mide la opacidad de la animación de entrada.
      await page.locator('.page-enter').evaluate((element) => element.getAnimations().forEach((animation) => animation.finish()))
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      expect(results.violations).toEqual([])
    }
    await page.getByRole('button', { name: 'Guardar', exact: true }).click()
    await page.goto('/app')
    await page.locator('.page-enter').evaluate((element) => element.getAnimations().forEach((animation) => animation.finish()))
    const home = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(home.violations).toEqual([])
  })
}

test('teclado, movimiento reducido, fuentes locales y ampliación 200 %', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/app')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
  expect(await page.locator('.page-enter').evaluate((el) => getComputedStyle(el).animationName)).toBe('none')
  await page.evaluate(() => document.fonts.ready)
  expect(await page.evaluate(() => document.fonts.check('16px Outfit') && document.fonts.check('700 24px "Exo 2"'))).toBe(true)
  await page.goto('/app/apariencia')
  await page.setViewportSize({ width: 640, height: 900 })
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
