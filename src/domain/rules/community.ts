import { agents, anyRank, avatars, badges, categoryOf, frames, gameModes, profileBackgrounds, rankIndexOf, rankPreferences, ranks, regions, slotsAvailable, type CommunitySnapshot, type FieldErrors, type PlayerProfile, type Rank, type Result, type StackDraft, type StackPost, type StackSearch } from '../models/community'

const inList = (values: readonly string[], value: unknown) => typeof value === 'string' && values.includes(value)
const textLength = (value: unknown) => typeof value === 'string' ? value.trim().length : -1
export function validateStack(draft: StackDraft): FieldErrors {
  const errors: FieldErrors = {}
  if (textLength(draft.title) < 5 || textLength(draft.title) > 60) errors.title = 'El título debe tener entre 5 y 60 caracteres.'
  if (textLength(draft.description) < 10 || textLength(draft.description) > 300) errors.description = 'La descripción debe tener entre 10 y 300 caracteres.'
  if (!Number.isInteger(draft.capacity) || draft.capacity < 2 || draft.capacity > 5) errors.capacity = 'El grupo debe tener entre 2 y 5 jugadores.'
  if (!inList(rankPreferences, draft.rank)) errors.rank = 'Selecciona un rango válido o «Cualquier rango».'
  if (!inList(regions, draft.region)) errors.region = 'Selecciona una región válida.'
  if (!inList(gameModes, draft.mode)) errors.mode = 'Selecciona una modalidad válida.'
  return errors
}
export function validateProfile(profile: PlayerProfile): FieldErrors {
  const errors: FieldErrors = {}
  if (textLength(profile.name) < 3 || textLength(profile.name) > 24) errors.name = 'El nombre debe tener entre 3 y 24 caracteres.'
  // A local display format, not an assertion of Riot account ownership or official eligibility.
  if (typeof profile.riotId !== 'string' || !/^[^#\s][^#]{1,23}#[^#\s]{1,10}$/.test(profile.riotId.trim())) errors.riotId = 'Usa el formato Nombre#Etiqueta (nombre de 2–24 y etiqueta de 1–10 caracteres).'
  if (textLength(profile.headline) < 0 || textLength(profile.headline) > 80) errors.headline = 'La presentación admite hasta 80 caracteres.'
  if (textLength(profile.biography) < 0 || textLength(profile.biography) > 300) errors.biography = 'La biografía admite hasta 300 caracteres.'
  if (!inList(regions, profile.region)) errors.region = 'Selecciona una región válida.'
  if (!inList(ranks, profile.rank)) errors.rank = 'Selecciona un rango válido.'
  if (!inList(agents, profile.agent)) errors.agent = 'Selecciona un agente válido.'
  if (!inList(avatars, profile.avatar) || !inList(frames, profile.frame) || !inList(profileBackgrounds, profile.background) || !Array.isArray(profile.badges) || profile.badges.some((badge) => !inList(badges, badge))) errors.cosmetics = 'Selecciona una personalización gratuita válida.'
  return errors
}
export const normalizeProfile = (p: PlayerProfile): PlayerProfile => ({ ...p, name: p.name.trim(), riotId: p.riotId.trim(), headline: p.headline.trim(), biography: p.biography.trim(), badges: [...new Set(p.badges)] })

const fold = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es')

/** Un rango concreto cae dentro del rango filtrado; «Cualquier rango» acepta a todos. */
function matchesRankRange(post: StackPost, min?: Rank, max?: Rank): boolean {
  if (min && max && rankIndexOf(min) > rankIndexOf(max)) return false
  if (!min && !max) return true
  if (post.rank === anyRank) return true
  const index = rankIndexOf(post.rank as Rank)
  const minIndex = min ? rankIndexOf(min) : -1
  const maxIndex = max ? rankIndexOf(max) : ranks.length - 1
  return index >= minIndex && index <= maxIndex
}

export function searchPosts(state: CommunitySnapshot, search: StackSearch, playerId: string) {
  const query = fold(search.query.trim())
  return state.posts.filter((post) => {
    const owner = state.profiles.find((p) => p.id === post.ownerId)
    return (search.ownOnly ? post.ownerId === playerId : post.ownerId !== playerId) &&
      (!search.category || categoryOf(post.capacity) === search.category) &&
      matchesRankRange(post, search.rankMin, search.rankMax) && (!search.region || post.region === search.region) &&
      (!search.mode || post.mode === search.mode) && (!query || fold(`${post.title} ${post.description} ${owner?.name} ${owner?.riotId}`).includes(query))
  })
}
export function createPost(state: CommunitySnapshot, actor: string, draft: StackDraft, id: string): Result<CommunitySnapshot> {
  if (Object.keys(validateStack(draft)).length) return { ok: false, error: 'Invalid' }
  if (!state.profiles.some((p) => p.id === actor)) return { ok: false, error: 'Forbidden' }
  const post: StackPost = { ...draft, title: draft.title.trim(), description: draft.description.trim(), id, ownerId: actor, memberIds: [actor] }
  return { ok: true, value: { ...state, posts: [post, ...state.posts] } }
}
export function requestJoin(state: CommunitySnapshot, actor: string, postId: string, id: string): Result<CommunitySnapshot> {
  const post = state.posts.find((p) => p.id === postId)
  if (!post) return { ok: false, error: 'NotFound' }
  if (post.ownerId === actor || !state.profiles.some((p) => p.id === actor)) return { ok: false, error: 'Forbidden' }
  if (post.memberIds.includes(actor)) return { ok: false, error: 'AlreadyMember' }
  if (state.requests.some((r) => r.postId === postId && r.applicantId === actor)) return { ok: false, error: 'DuplicateRequest' }
  if (slotsAvailable(post) === 0) return { ok: false, error: 'Full' }
  return { ok: true, value: { ...state, requests: [{ id, postId, applicantId: actor, status: 'Pending' }, ...state.requests] } }
}
export function resolveJoin(state: CommunitySnapshot, actor: string, requestId: string, accept: boolean): Result<CommunitySnapshot> {
  const request = state.requests.find((r) => r.id === requestId)
  const post = state.posts.find((p) => p.id === request?.postId)
  if (!request || !post) return { ok: false, error: 'NotFound' }
  if (post.ownerId !== actor) return { ok: false, error: 'Forbidden' }
  if (request.status !== 'Pending') return { ok: false, error: 'Resolved' }
  if (accept && slotsAvailable(post) === 0) return { ok: false, error: 'Full' }
  if (accept && post.memberIds.includes(request.applicantId)) return { ok: false, error: 'AlreadyMember' }
  return { ok: true, value: { ...state,
    posts: state.posts.map((p) => accept && p.id === post.id ? { ...p, memberIds: [...p.memberIds, request.applicantId] } : p),
    requests: state.requests.map((r) => r.id === requestId ? { ...r, status: accept ? 'Accepted' : 'Rejected' } : r),
  } }
}

/** Validate untrusted local data before allowing it into the UI or a mutation. */
export function isCommunitySnapshot(value: unknown): value is CommunitySnapshot {
  if (!value || typeof value !== 'object') return false
  const state = value as CommunitySnapshot
  if (!Array.isArray(state.profiles) || !Array.isArray(state.posts) || !Array.isArray(state.requests)) return false
  if (state.profiles.some((p) => !p || typeof p.id !== 'string' || !p.id || !Number.isInteger(p.revision) || p.revision < 0 || Object.keys(validateProfile(p)).length)) return false
  const profileIds = new Set(state.profiles.map((p) => p.id))
  if (profileIds.size !== state.profiles.length) return false
  if (state.posts.some((p) => !p || typeof p.id !== 'string' || !p.id || Object.keys(validateStack(p)).length || !Array.isArray(p.memberIds) || !p.memberIds.includes(p.ownerId) || p.memberIds.length > p.capacity || p.memberIds.length !== new Set(p.memberIds).size || p.memberIds.some((id) => !profileIds.has(id)))) return false
  const postIds = new Set(state.posts.map((p) => p.id))
  if (postIds.size !== state.posts.length) return false
  const requestIds = new Set<string>(), pairs = new Set<string>()
  for (const r of state.requests) {
    if (!r || typeof r.id !== 'string' || !r.id || !postIds.has(r.postId) || !profileIds.has(r.applicantId) || !['Pending', 'Accepted', 'Rejected'].includes(r.status)) return false
    const post = state.posts.find((p) => p.id === r.postId)!
    const pair = `${r.postId}/${r.applicantId}`
    if (post.ownerId === r.applicantId || requestIds.has(r.id) || pairs.has(pair) || (r.status === 'Accepted' && !post.memberIds.includes(r.applicantId))) return false
    requestIds.add(r.id); pairs.add(pair)
  }
  return true
}
