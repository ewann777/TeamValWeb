import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const SPANISH = "TeamVal es un proyecto independiente y no está afiliado, patrocinado ni respaldado por Riot Games. VALORANT y sus marcas pertenecen a Riot Games."
const OFFICIAL = "TeamVal isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc."
const LEGAL_ROUTES = ['/privacidad', '/terminos'] as const

test('rutas legales abren directamente al recargar, sin errores de JavaScript', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/privacidad')
  await expect(page).toHaveTitle('TeamVal · Privacidad')
  await expect(page.getByRole('heading', { level: 1, name: 'Política de privacidad' })).toBeVisible()
  await page.goto('/terminos')
  await expect(page).toHaveTitle('TeamVal · Términos')
  await expect(page.getByRole('heading', { level: 1, name: 'Términos y condiciones' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'Términos y condiciones' })).toBeVisible()
  expect(errors).toEqual([])
})

test('pie compartido con enlaces y avisos en todas las secciones', async ({ page }) => {
  for (const route of ['/app', '/app/buscar-equipo', '/app/scrims', '/app/tienda', '/app/perfil', '/app/apariencia', ...LEGAL_ROUTES]) {
    await page.goto(route)
    const footer = page.locator('footer.app-footer')
    await expect(footer.getByRole('link', { name: 'Privacidad' }), route).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Términos' }), route).toBeVisible()
    await expect(footer.getByText(SPANISH, { exact: true }), route).toBeVisible()
    await expect(footer.getByText(OFFICIAL, { exact: true }), route).toBeVisible()
  }
})

test('navegación legal desde y hacia las secciones de la aplicación', async ({ page }) => {
  await page.goto('/app')
  await page.locator('footer.app-footer').getByRole('link', { name: 'Privacidad' }).click()
  await expect(page).toHaveURL('/privacidad')
  await expect(page.getByRole('heading', { level: 1, name: 'Política de privacidad' })).toBeVisible()
  await page.locator('footer.app-footer').getByRole('link', { name: 'Términos' }).click()
  await expect(page).toHaveURL('/terminos')
  await page.locator('main').getByRole('link', { name: 'Política de privacidad' }).click()
  await expect(page).toHaveURL('/privacidad')
  await page.locator('footer.app-footer').getByRole('link', { name: 'Términos' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Términos y condiciones' })).toBeVisible()
})

test('enlaces legales alcanzables por teclado con foco visible', async ({ page }) => {
  await page.goto('/app')
  const link = page.locator('footer.app-footer').getByRole('link', { name: 'Privacidad' })
  await link.focus()
  await expect(link).toBeFocused()
  expect(parseFloat(await link.evaluate((el) => getComputedStyle(el).outlineWidth))).toBeGreaterThan(0)
  expect(await link.evaluate((el) => el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44)
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL('/privacidad')
})

test('privacidad describe únicamente datos reales, sin contacto ni seguridad inventados', async ({ page }) => {
  await page.goto('/privacidad')
  for (const key of ['teamval.appearance.v1', 'teamval.community.demo.v1', 'teamval.teams.demo.v1', 'teamval.w4.actor']) {
    await expect(page.getByText(key, { exact: true }), key).toBeVisible()
  }
  await expect(page.getByText('localStorage', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('sessionStorage', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('IndexedDB', { exact: true }).first()).toBeVisible()
  await expect(page.getByText(/no existe backend multiusuario/i)).toBeVisible()
  await expect(page.getByText(/Pending Review/)).toBeVisible()
  await expect(page.getByText(/Riot Sign On/).first()).toBeVisible()
  await expect(page.getByText(/datos de demostración/i).first()).toBeVisible()
  await expect(page.getByText(/Vercel/).first()).toBeVisible()
  await expect(page.getByText(/pendientes de confirmar/i).first()).toBeVisible()
  await expect(page.getByText(/no utilizamos? cookies|no utiliza cookies/i)).toBeVisible()
  // Sin correos inventados ni enlaces externos distintos del proveedor de alojamiento.
  expect(await page.locator('a[href^="mailto:"]').count()).toBe(0)
  expect(await page.locator('main a[href^="http"]').evaluateAll((links) => links.map((a) => a.getAttribute('href')))).toEqual(['https://vercel.com/privacy'])
})

test('términos cubren las reglas solicitadas incluidas las TeamVal Coins sin pagos', async ({ page }) => {
  await page.goto('/terminos')
  for (const heading of ['Uso adecuado de TeamVal', 'Publicaciones y comportamiento de la comunidad', 'Acoso, toxicidad y suplantación', 'Contenido y logos subidos por usuarios', 'Scrims y resultados no oficiales', 'Responsabilidad sobre los datos proporcionados', 'Funcionalidades de demostración', 'TeamVal Coins']) {
    await expect(page.getByRole('heading', { name: heading }), heading).toBeVisible()
  }
  await expect(page.getByText(/moneda virtual de demostración sin valor monetario real/)).toBeVisible()
  await expect(page.getByText(/no existen recargas/)).toBeVisible()
  await expect(page.getByText(/no hay sistema de monedas activo/)).toBeVisible()
  await expect(page.getByText(/no son resultados oficiales ni verificados por Riot Games/i)).toBeVisible()
  await expect(page.getByText(/no cuenta con un sistema de moderación remota/)).toBeVisible()
  await expect(page.getByText(/pendiente de revisión jurídica/i)).toBeVisible()
})

test('aviso de Riot Games presente en el pie y en términos, con la formulación oficial', async ({ page }) => {
  await page.goto('/app')
  const footer = page.locator('footer.app-footer')
  await expect(footer.getByText(SPANISH, { exact: true })).toBeVisible()
  await expect(footer.getByText(OFFICIAL, { exact: true })).toBeVisible()
  await page.goto('/terminos')
  await expect(page.locator('main').getByText(SPANISH, { exact: true })).toBeVisible()
  await expect(page.locator('main').getByText(OFFICIAL, { exact: true })).toBeVisible()
})

test('las páginas legales son públicas y no exigen sesión', async ({ page }) => {
  // No existe autenticación; se comprueba que carga limpiando todo el almacenamiento.
  const context = page.context()
  await context.clearCookies()
  await page.goto('/privacidad')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'Política de privacidad' })).toBeVisible()
  await expect(page.getByText(/pendientes de confirmar/i).first()).toBeVisible()
})

test('public/riot.txt conserva exactamente su contenido', async ({ page }) => {
  const response = await page.request.get('/riot.txt')
  expect(response.ok()).toBe(true)
  expect(await response.text()).toBe('c4a43159-7ed1-408e-80da-2fe3afbc9e4c')
})

for (const width of [320, 768, 1440]) test(`responsive legal ${width}px`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: 900 })
  for (const route of LEGAL_ROUTES) {
    await page.goto(route)
    await expect(page.locator('h1')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), route).toBe(true)
    if (width === 1440 || (width === 320 && route === '/privacidad')) await page.screenshot({ path: testInfo.outputPath(`legal-${route.slice(1)}-${width}.png`), fullPage: true })
  }
})

for (const theme of ['dark', 'light'] as const) test(`axe legal ${theme}`, async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme })
  await page.goto('/app/apariencia')
  await page.getByRole('radio', { name: theme === 'dark' ? 'Oscuro' : 'Claro', exact: true }).check()
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  for (const route of ['/', ...LEGAL_ROUTES]) {
    await page.goto(route === '/' ? '/app' : route)
    await expect(page.locator('h1')).toBeVisible()
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(results.violations, route).toEqual([])
  }
})
