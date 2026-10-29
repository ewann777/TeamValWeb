import { labels } from '../../shared/i18n/community'
import type { PlayerProfile } from '../../domain/models/community'
import { Avatar } from '../../shared/ui/Avatar'
import { Icon } from '../../shared/ui/Icon'

/** Tarjeta de jugador basada en ProfileHero de Android: fondo, avatar, identidad e insignias. */
export function ProfileCard({ profile, own }: { profile: PlayerProfile; own?: boolean }) {
  return <section className={`profile-card profile-bg-${profile.background.toLowerCase()}`} aria-label={`Ficha de ${profile.name}`}>
    <div className="profile-card-orb profile-card-orb-one" aria-hidden="true" />
    <div className="profile-card-orb profile-card-orb-two" aria-hidden="true" />
    <div className="profile-card-inner">
      <p className="profile-eyebrow">TEAMVAL / PLAYER CARD{own ? '' : ' · DEMO'}</p>
      <div className="profile-identity">
        <Avatar profile={profile} size="lg" />
        <div className="profile-names">
          <h2>{profile.name}</h2>
          <p className="profile-riot">{profile.riotId}</p>
          <div className="chip-row">
            <span className="chip chip-light">{labels[profile.region]}</span>
            <span className="chip chip-light">Main {profile.agent}</span>
            <span className="chip chip-light">{labels[profile.rank]}</span>
          </div>
        </div>
      </div>
      {profile.headline && <p className="profile-headline">{profile.headline}</p>}
      <div className="chip-row">
        {profile.badges.map((badge) => <span className="chip chip-light" key={badge}><Icon name="star" className="chip-icon" />{labels[badge]}</span>)}
      </div>
    </div>
  </section>
}
