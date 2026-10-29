import { PageHeading } from '../../shared/ui/PageHeading'

/**
 * W4.5 — Política de privacidad. Describe únicamente comportamiento verificado
 * en el proyecto: almacenamiento local, ausencia de backend y de peticiones de red.
 * La información legal que aún no está definida se marca como pendiente.
 */
export function PrivacyPage() {
  return <>
    <PageHeading title="Política de privacidad" description="Qué datos guarda TeamVal, dónde se guardan y cómo puedes gestionarlos o eliminarlos." />

    <section className="glass form-card legal-card">
      <h2>Qué es TeamVal y quién opera el proyecto</h2>
      <p>TeamVal es una aplicación web independiente para organizar equipos, buscar compañeros de juego y coordinar scrims de VALORANT. Es un proyecto personal sin ánimo de lucro, sin cuentas de usuario y sin servidor propio.</p>
      <p>El proyecto es operado por su desarrollador, de forma individual. <strong>Los datos de contacto y la identidad jurídica del responsable quedan pendientes de confirmar</strong> y se indican en la sección final de esta política.</p>
    </section>

    <section className="glass form-card legal-card">
      <h2>Datos que introduces en tu perfil</h2>
      <p>Al editar tu perfil local introduces de forma voluntaria los siguientes campos:</p>
      <ul className="legal-list">
        <li>Nombre de jugador y Riot ID.</li>
        <li>Presentación breve y sección «Sobre mí».</li>
        <li>Rango declarado y región.</li>
        <li>Agente principal, avatar, marco, fondo e insignias que elijas.</li>
      </ul>
      <p>Además puedes crear publicaciones de grupo (título, descripción, rango, región, modalidad y capacidad), equipos (nombre, abreviatura, descripción, lema, región, rango e identidad visual), publicaciones de scrim (región, rango, división Premier, fecha, modalidad y notas) y valoraciones de conducta (puntuaciones, marca de comportamiento tóxico y comentario opcional).</p>
      <p>Estos datos los escribes tú; no se solicitan datos de pago, ni contraseñas, ni información de identificación personal real.</p>
    </section>

    <section className="glass form-card legal-card">
      <h2>Información guardada en este navegador</h2>
      <p>TeamVal no envía tus datos a ningún servidor. Todo se guarda en el almacenamiento local de tu navegador:</p>
      <ul className="legal-list">
        <li><code>teamval.appearance.v1</code> (<strong>localStorage</strong>): preferencias de apariencia, como tema, color de acento, fondo y paleta.</li>
        <li><code>teamval.community.demo.v1</code> (<strong>localStorage</strong>): datos de demostración de la comunidad: perfiles, publicaciones de grupo y solicitudes de ingreso.</li>
        <li><code>teamval.teams.demo.v1</code> (<strong>IndexedDB</strong>): equipos, integrantes, logos optimizados, publicaciones de scrims, enfrentamientos y valoraciones.</li>
        <li><code>teamval.w4.actor</code> (<strong>sessionStorage</strong>): el jugador demo activo en la sección de scrims; se guarda por pestaña y desaparece al cerrarla.</li>
      </ul>
      <p>TeamVal no utiliza cookies, no incluye analítica ni publicidad, y no carga fuentes ni recursos de dominios externos: las tipografías se sirven desde el propio sitio.</p>
    </section>

    <section className="glass form-card legal-card">
      <h2>Publicaciones, equipos y scrims son datos de demostración</h2>
      <p>Las publicaciones de equipo, los equipos, las invitaciones, las scrims y las valoraciones funcionan con <strong>datos ficticios locales de demostración</strong>. Solo existen en este navegador, en este dispositivo.</p>
      <p>No hay servicio multiusuario: otra persona con otro navegador no verá tus datos, y tú no verás los suyos. Los perfiles, resultados y valoraciones son simulados para probar la interfaz y no representan a jugadores reales.</p>
    </section>

    <section className="glass form-card legal-card">
      <h2>Sin backend ni integración con la API de Riot</h2>
      <p>Actualmente <strong>no existe backend multiusuario, registro de cuentas ni integración con la API de Riot Games ni con Riot Sign On</strong>. La aplicación no hace peticiones de red para transmitir tus datos.</p>
      <p>La solicitud de acceso a la API de Riot Games está <strong>en revisión (Pending Review)</strong>; no ha sido aprobada y no hay ninguna integración activa. Mientras tanto, no se envía ningún dato a Riot Games.</p>
    </section>

    <section className="glass form-card legal-card">
      <h2>Posible integración futura con Riot Sign On</h2>
      <p>Si en el futuro se integra Riot Sign On (RSO), se hará <strong>únicamente con tu autorización expresa</strong> mediante el flujo de consentimiento oficial de Riot. Sin ese consentimiento, no se vincularía ninguna cuenta ni se leería ningún dato de Riot.</p>
      <p>Con tu autorización, la integración podría utilizar datos de tu cuenta y datos de juego que la API permita (por ejemplo, identificador de cuenta, estadísticas clasificatorias e historial de partidas). <strong>Los ámbitos de datos concretos quedan pendientes de definir</strong> hasta que exista la integración y se detallen en esta política.</p>
      <p>Riot exige que toda integración de este tipo incluya una advertencia clara de que vincular la cuenta hace públicos los datos del jugador y que el jugador pueda decidir si comparte esa información.</p>
    </section>

    <section className="glass form-card legal-card">
      <h2>Cómo gestionar o eliminar tus datos</h2>
      <p>Como los datos viven en tu navegador, el control es tuyo:</p>
      <ul className="legal-list">
        <li><strong>Reiniciar la comunidad:</strong> desde Perfil, botón «Reiniciar datos de demostración».</li>
        <li><strong>Reiniciar equipos y scrims:</strong> desde Scrims, botón «Reiniciar demo W4».</li>
        <li><strong>Rehacer la apariencia:</strong> desde Apariencia puedes volver a guardar tus preferencias.</li>
        <li><strong>Borrarlo todo:</strong> desde la configuración de tu navegador, elimina los datos del sitio (localStorage, sessionStorage e IndexedDB) para este dominio.</li>
      </ul>
      <p>Al no existir servidor, cuando borras los datos locales no queda copia en ningún otro lugar. Ten en cuenta que esta acción es irreversible y no afecta a datos guardados en otros sitios.</p>
    </section>

    <section className="glass form-card legal-card">
      <h2>Servicios externos: Vercel</h2>
      <p>TeamVal distingue dos tipos de información:</p>
      <ul className="legal-list">
        <li><strong>Datos que gestiona TeamVal:</strong> todo lo que escribes en la aplicación, guardado únicamente en tu navegador según se describe arriba. TeamVal no los envía a terceros.</li>
        <li><strong>Datos que procesa un tercero:</strong> el sitio se publica en Vercel, que actúa como proveedor de alojamiento y que, al servir las páginas, procesa datos técnicos de las peticiones (como dirección IP, navegador y marcas de tiempo) conforme a su propia política. TeamVal no controla esos datos ni tiene acceso a ellos.</li>
      </ul>
      <p>TeamVal no incorpora otras terceras partes: no hay analítica, publicidad, mapas de calor ni fuentes externas. Para conocer el tratamiento que hace Vercel, consulta su política de privacidad en <a href="https://vercel.com/privacy" target="_blank" rel="noreferrer noopener">vercel.com/privacy</a>.</p>
    </section>

    <section className="glass form-card legal-card">
      <h2>Información pendiente de confirmar</h2>
      <p className="notice"><span className="badge">PENDIENTE</span><span>Esta política describe el funcionamiento actual. Los siguientes puntos son legales y requieren confirmación antes de considerarla definitiva.</span></p>
      <ul className="legal-list">
        <li>Identidad y datos de contacto del responsable del proyecto: sin definir (no se facilita ningún correo porque no hay ninguno oficial).</li>
        <li>Legislación aplicable y jurisdicción competente: por determinar.</li>
        <li>Revisión jurídica profesional de este texto: no realizada.</li>
        <li>Condiciones aplicables a personas menores de edad: por definir.</li>
        <li>Plazo de conservación de los registros técnicos del alojamiento: depende de Vercel, sin dato confirmado.</li>
        <li>Ámbitos de datos de una futura integración con Riot Sign On: pendientes de definir.</li>
        <li>Estado de la solicitud de Riot Games: en revisión; no se afirma aprobación alguna.</li>
      </ul>
      <p>Última actualización: 29 de octubre de 2026.</p>
    </section>
  </>
}
