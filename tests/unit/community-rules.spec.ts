import { test, expect } from '@playwright/test'
import { categoryOf, currentPlayerId, slotsAvailable, type StackDraft, type PlayerProfile } from '../../src/domain/models/community'
import { createPost, isCommunitySnapshot, requestJoin, resolveJoin, searchPosts, validateProfile, validateStack } from '../../src/domain/rules/community'
import { createDemoSnapshot } from '../../src/data/demo/community'

const validDraft: StackDraft = { title: 'Equipo sereno', description: 'Buscamos dos compañeros para jugar con calma.', rank: 'Gold', region: 'LatamSouth', mode: 'Competitive', capacity: 3 }

test.describe('reglas de publicaciones', () => {
  test('categoría por capacidad: 2 dúo, 3 trío, 4–5 stack', () => {
    expect(categoryOf(2)).toBe('Duo')
    expect(categoryOf(3)).toBe('Trio')
    expect(categoryOf(4)).toBe('Stack')
    expect(categoryOf(5)).toBe('Stack')
  })

  test('validación de publicación: límites de texto, capacidad y listas cerradas', () => {
    expect(validateStack(validDraft)).toEqual({})
    expect(validateStack({ ...validDraft, title: 'abc' }).title).toContain('5 y 60')
    expect(validateStack({ ...validDraft, title: 'x'.repeat(61) }).title).toContain('5 y 60')
    expect(validateStack({ ...validDraft, description: 'corta' }).description).toContain('10 y 300')
    expect(validateStack({ ...validDraft, capacity: 1 }).capacity).toBeTruthy()
    expect(validateStack({ ...validDraft, capacity: 6 }).capacity).toBeTruthy()
    expect(validateStack({ ...validDraft, capacity: 2.5 }).capacity).toBeTruthy()
    expect(validateStack({ ...validDraft, rank: 'Ultra' as StackDraft['rank'] }).rank).toBeTruthy()
    expect(validateStack({ ...validDraft, region: 'Atlantis' as StackDraft['region'] }).region).toBeTruthy()
    expect(validateStack({ ...validDraft, mode: 'Clash' as StackDraft['mode'] }).mode).toBeTruthy()
  })

  test('crear publicación: el anfitrión ocupa la primera plaza y recorta textos', () => {
    const state = createDemoSnapshot()
    const result = createPost(state, currentPlayerId, { ...validDraft, title: '  Equipo con margen  ' }, 'nueva-1')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const post = result.value.posts.find((candidate) => candidate.id === 'nueva-1')!
    expect(post.title).toBe('Equipo con margen')
    expect(post.memberIds).toEqual([currentPlayerId])
    expect(slotsAvailable(post)).toBe(2)
    expect(result.value.posts[0]!.id).toBe('nueva-1')
  })

  test('crear publicación rechaza borradores inválidos y actores desconocidos', () => {
    const state = createDemoSnapshot()
    expect(createPost(state, currentPlayerId, { ...validDraft, title: 'x' }, 'id-1')).toEqual({ ok: false, error: 'Invalid' })
    expect(createPost(state, 'nadie', validDraft, 'id-1')).toEqual({ ok: false, error: 'Forbidden' })
  })
})

test.describe('reglas de solicitudes', () => {
  test('unirse: bloquea anfitrión, duplicado, no miembro inexistente y stack lleno', () => {
    const state = createDemoSnapshot()
    expect(requestJoin(state, 'host-1', 'demo-duo', 'r1').ok).toBe(false)
    expect(requestJoin(state, 'nadie', 'demo-duo', 'r1')).toEqual({ ok: false, error: 'Forbidden' })
    expect(requestJoin(state, 'candidate-4', 'demo-duo', 'r1').ok).toBe(true)
    expect(requestJoin(state, 'candidate-1', 'demo-owned', 'r2')).toEqual({ ok: false, error: 'DuplicateRequest' })
    expect(requestJoin(state, 'candidate-4', 'demo-full', 'r3')).toEqual({ ok: false, error: 'Full' })
    expect(requestJoin(state, 'candidate-4', 'no-existe', 'r4')).toEqual({ ok: false, error: 'NotFound' })
  })

  test('aceptar ocupa cupo y queda terminal; rechazar mantiene el cupo', () => {
    const state = createDemoSnapshot()
    const accepted = resolveJoin(state, currentPlayerId, 'demo-request-1', true)
    expect(accepted.ok).toBe(true)
    if (!accepted.ok) return
    const post = accepted.value.posts.find((candidate) => candidate.id === 'demo-owned')!
    expect(post.memberIds).toContain('candidate-1')
    expect(slotsAvailable(post)).toBe(1)
    expect(accepted.value.requests.find((request) => request.id === 'demo-request-1')!.status).toBe('Accepted')
    // Una decisión ya tomada no se puede repetir.
    expect(resolveJoin(accepted.value, currentPlayerId, 'demo-request-1', false)).toEqual({ ok: false, error: 'Resolved' })

    const rejected = resolveJoin(state, currentPlayerId, 'demo-request-1', false)
    expect(rejected.ok).toBe(true)
    if (!rejected.ok) return
    const rejectedPost = rejected.value.posts.find((candidate) => candidate.id === 'demo-owned')!
    expect(rejectedPost.memberIds).not.toContain('candidate-1')
    expect(slotsAvailable(rejectedPost)).toBe(2)
  })

  test('solo el anfitrión decide y no puede sobrecupo el grupo', () => {
    const state = createDemoSnapshot()
    expect(resolveJoin(state, 'candidate-3', 'demo-request-1', true)).toEqual({ ok: false, error: 'Forbidden' })
    expect(resolveJoin(state, currentPlayerId, 'no-existe', true)).toEqual({ ok: false, error: 'NotFound' })
    // Fuerza un escenario con un único cupo y dos solicitudes pendientes.
    const tight = {
      ...state,
      posts: state.posts.map((post) => post.id === 'demo-owned' ? { ...post, capacity: 3, memberIds: ['demo-me', 'friend-1'] } : post),
      requests: [...state.requests, { id: 'extra', postId: 'demo-owned', applicantId: 'candidate-4', status: 'Pending' as const }],
    }
    const first = resolveJoin(tight, currentPlayerId, 'demo-request-1', true)
    expect(first.ok).toBe(true)
    if (!first.ok) return
    expect(resolveJoin(first.value, currentPlayerId, 'extra', true)).toEqual({ ok: false, error: 'Full' })
  })
})

test.describe('búsqueda combinable', () => {
  const state = createDemoSnapshot()
  const search = (overrides: Partial<Parameters<typeof searchPosts>[1]> = {}) => searchPosts(state, { ownOnly: false, query: '', ...overrides }, currentPlayerId)

  test('por defecto excluye las publicaciones propias', () => {
    const results = search()
    expect(results).toHaveLength(5)
    expect(results.some((post) => post.ownerId === currentPlayerId)).toBe(false)
  })

  test('categoría, rango, región, modalidad, texto y alcance se combinan', () => {
    expect(search({ category: 'Duo' }).map((post) => post.id)).toEqual(['demo-duo', 'demo-full'])
    expect(search({ category: 'Stack' }).map((post) => post.id)).toEqual(['demo-night', 'demo-casual'])
    expect(search({ rankMin: 'Gold', rankMax: 'Gold' }).map((post) => post.id)).toEqual(['demo-duo'])
    expect(search({ region: 'LatamNorth' }).map((post) => post.id)).toEqual(['demo-night'])
    expect(search({ mode: 'Swiftplay' }).map((post) => post.id)).toEqual(['demo-swift'])
    expect(search({ rankMin: 'Gold', rankMax: 'Gold', region: 'LatamSouth', mode: 'Competitive' }).map((post) => post.id)).toEqual(['demo-duo'])
    expect(search({ query: 'NOCHE' }).map((post) => post.id)).toEqual(['demo-night'])
    expect(search({ query: 'nox#norte' }).map((post) => post.id)).toEqual(['demo-night'])
    expect(search({ ownOnly: true }).map((post) => post.id)).toEqual(['demo-owned'])
    expect(search({ query: 'sin-coincidencias' })).toHaveLength(0)
  })
})

test.describe('datos locales no confiables', () => {
  test('acepta el fixture y lo rechaza si se altera', () => {
    expect(isCommunitySnapshot(createDemoSnapshot())).toBe(true)
    const state = createDemoSnapshot()
    expect(isCommunitySnapshot({ ...state, posts: 'no' })).toBe(false)
    expect(isCommunitySnapshot(null)).toBe(false)

    const brokenMember = { ...state, posts: state.posts.map((post) => post.id === 'demo-duo' ? { ...post, memberIds: ['host-1', 'desconocido'] } : post) }
    expect(isCommunitySnapshot(brokenMember)).toBe(false)

    const oversize = { ...state, posts: state.posts.map((post) => post.id === 'demo-duo' ? { ...post, memberIds: ['host-1', 'candidate-1', 'candidate-2'] } : post) }
    expect(isCommunitySnapshot(oversize)).toBe(false)

    const ownerRequest = { ...state, requests: [{ id: 'mala', postId: 'demo-duo', applicantId: 'host-1', status: 'Pending' as const }] }
    expect(isCommunitySnapshot(ownerRequest)).toBe(false)

    const duplicated = { ...state, posts: [...state.posts, { ...state.posts[0]!, id: 'demo-duo' }] }
    expect(isCommunitySnapshot(duplicated)).toBe(false)
  })
})

test.describe('validación de perfil', () => {
  const me = createDemoSnapshot().profiles.find((profile) => profile.id === currentPlayerId)!

  test('acepta el perfil demo y valida Riot ID declarado', () => {
    expect(validateProfile(me)).toEqual({})
    expect(validateProfile({ ...me, riotId: 'sinformato' }).riotId).toBeTruthy()
    expect(validateProfile({ ...me, riotId: '#Etiqueta' }).riotId).toBeTruthy()
    expect(validateProfile({ ...me, riotId: 'Nombre#' }).riotId).toBeTruthy()
    expect(validateProfile({ ...me, riotId: 'Nombre#Etiqueta' })).toEqual({})
    expect(validateProfile({ ...me, name: 'ab' }).name).toBeTruthy()
    expect(validateProfile({ ...me, headline: 'x'.repeat(81) }).headline).toBeTruthy()
    expect(validateProfile({ ...me, biography: 'x'.repeat(301) }).biography).toBeTruthy()
    expect(validateProfile({ ...me, agent: 'Agente inexistente' as PlayerProfile['agent'] }).agent).toBeTruthy()
    expect(validateProfile({ ...me, avatar: 'Panda' as PlayerProfile['avatar'] }).cosmetics).toBeTruthy()
  })
})
