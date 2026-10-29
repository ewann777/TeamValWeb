import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppearanceProvider } from './providers'
import { CommunityProvider } from './community-provider'
import { localPreferencesRepository } from '../data/local/preferences'
import { createBrowserCommunityRepository } from '../data/local/community'
import { AppLayout } from './layouts/AppLayout'
import { HomePage } from '../features/home/HomePage'
import { AppearancePage } from '../features/appearance/AppearancePage'
import { UpcomingPage } from '../features/upcoming/UpcomingPage'
import { NotFoundPage } from '../features/upcoming/NotFoundPage'
import { StackExplorerPage } from '../features/stacks/StackExplorerPage'
import { CreateStackPage } from '../features/stacks/CreateStackPage'
import { StackRequestsPage } from '../features/stacks/StackRequestsPage'
import { StackDetailPage } from '../features/stacks/StackDetailPage'
import { ProfilePage } from '../features/profile/ProfilePage'
import { EditProfilePage } from '../features/profile/EditProfilePage'
import { PublicProfilePage } from '../features/profile/PublicProfilePage'
import { LocalTeamsRepository } from '../data/local/teams'
import { TeamsLayout } from '../features/teams/TeamsLayout'
import { TeamsPage } from '../features/teams/TeamsPage'
import { TeamEditorPage } from '../features/teams/TeamEditorPage'
import { TeamDetailPage } from '../features/teams/TeamDetailPage'
import { MembershipsPage } from '../features/teams/MembershipsPage'
import { ScrimsPage } from '../features/scrims/ScrimsPage'
import { CreateScrimPage } from '../features/scrims/CreateScrimPage'
import { ScrimAgendaPage } from '../features/scrims/ScrimAgendaPage'
import { PrivacyPage } from '../features/legal/PrivacyPage'
import { TermsPage } from '../features/legal/TermsPage'

const communityRepository = createBrowserCommunityRepository()
const teamsRepository = new LocalTeamsRepository()

export function AppRouter() {
  return <BrowserRouter><AppearanceProvider repository={localPreferencesRepository}><CommunityProvider repository={communityRepository}><Routes>
    <Route element={<AppLayout />}>
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="/app" element={<HomePage />} />
      <Route path="/app/buscar-equipo" element={<StackExplorerPage />} />
      <Route path="/app/buscar-equipo/crear" element={<CreateStackPage />} />
      <Route path="/app/buscar-equipo/solicitudes" element={<StackRequestsPage />} />
      <Route path="/app/buscar-equipo/publicaciones/:id" element={<StackDetailPage />} />
      <Route path="/app/scrims" element={<TeamsLayout repository={teamsRepository} />}>
        <Route index element={<ScrimsPage />} />
        <Route path="equipos" element={<TeamsPage />} />
        <Route path="equipos/crear" element={<TeamEditorPage />} />
        <Route path="equipos/:id" element={<TeamDetailPage />} />
        <Route path="equipos/:id/editar" element={<TeamEditorPage />} />
        <Route path="invitaciones" element={<MembershipsPage />} />
        <Route path="publicar" element={<CreateScrimPage />} />
        <Route path="agenda" element={<ScrimAgendaPage />} />
      </Route>
      <Route path="/app/tienda" element={<UpcomingPage title="Tienda" description="Pequeños detalles. Una identidad que es solo tuya." icon="shop" stage="W5" planned={['TeamVal Coins de demostración', 'Marcos y probador de perfil', 'Inventario y recompensas']} />} />
      <Route path="/app/perfil" element={<ProfilePage />} />
      <Route path="/app/perfil/editar" element={<EditProfilePage />} />
      <Route path="/app/jugadores/:id" element={<PublicProfilePage />} />
      <Route path="/app/apariencia" element={<AppearancePage />} />
      <Route path="/privacidad" element={<PrivacyPage />} />
      <Route path="/terminos" element={<TermsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes></CommunityProvider></AppearanceProvider></BrowserRouter>
}
