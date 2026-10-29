import { test, expect } from '@playwright/test'
import { createDemoSnapshot } from '../../src/data/demo/community'
import { agentNames } from '../../src/domain/models/agents'
import { searchPosts } from '../../src/domain/rules/community'

test('roster coincide con los 30 agentes del plan', () => {
  const expected = 'Astra,Breach,Brimstone,Chamber,Clove,Cypher,Deadlock,Fade,Gekko,Harbor,Hush,Iso,Jett,KAY/O,Killjoy,Miks,Neon,Omen,Phoenix,Raze,Reyna,Sage,Skye,Sova,Tejo,Veto,Viper,Vyse,Waylay,Yoru'.split(',')
  expect([...agentNames].sort()).toEqual(expected.sort())
})

test('intervalos inclusivos, cualquier rango e intervalo invertido', () => {
  const data = createDemoSnapshot()
  data.posts[1]!.rank = 'Any'
  const search = (rankMin?: 'Gold', rankMax?: 'Silver' | 'Gold') => searchPosts(data, { ownOnly: false, query: '', rankMin, rankMax }, 'demo-me').map((p) => p.id)
  expect(search('Gold', 'Gold')).toEqual(['demo-duo', 'demo-night'])
  expect(search('Gold')).toContain('demo-full')
  expect(search(undefined, 'Silver')).toEqual(['demo-night', 'demo-casual', 'demo-swift'])
  expect(search('Gold', 'Silver')).toEqual([])
})

test('cuatro integrantes de cinco: falta uno, también tras recargar', async ({ page }) => {
  const snapshot = createDemoSnapshot()
  const post = snapshot.posts.find((p) => p.id === 'demo-night')!
  post.memberIds.push('friend-3')
  post.rank = 'Any'
  await page.addInitScript((snapshot) => localStorage.setItem('teamval.community.demo.v1', JSON.stringify({ version: 1, snapshot })), snapshot)
  await page.goto('/app/buscar-equipo')
  const card = page.locator('.stack-card').filter({ hasText: 'Rankeds de noche, cero tilt' })
  await expect(card.getByText('Falta 1 jugador', { exact: true })).toBeVisible()
  await expect(card.getByText('Integrantes: 4 de 5')).toBeVisible()
  await page.getByRole('button', { name: 'Filtrar stacks' }).click()
  await page.getByLabel('Rango mínimo').selectOption('Radiant')
  await expect(card).toBeVisible()
  await page.reload()
  await expect(card.getByText('Falta 1 jugador', { exact: true })).toBeVisible()
})

test('crear y conservar publicación de cualquier rango', async ({ page }) => {
  await page.goto('/app/buscar-equipo/crear')
  await expect(page.getByLabel('Rango')).toHaveValue('Any')
  await page.getByLabel('Título de la publicación').fill('Jugamos todos juntos')
  await page.getByLabel('Descripción').fill('Buscamos compañeros de cualquier rango para jugar.')
  await page.getByRole('button', { name: 'Publicar stack' }).click()
  await expect(page).toHaveURL(/\/app\/buscar-equipo$/)
  await page.reload()
  const card = page.locator('.stack-card').filter({ hasText: 'Jugamos todos juntos' })
  await expect(card.getByText('Cualquier rango', { exact: true })).toBeVisible()
  await expect(card.getByText('Faltan 4 jugadores')).toBeVisible()
})
