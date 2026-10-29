import { Link } from 'react-router-dom'
import { PageHeading } from '../../shared/ui/PageHeading'

/** W4.5 — Términos y condiciones de uso de la demostración local. */
export function TermsPage() {
  return <>
    <PageHeading title="Términos y condiciones" description="Reglas de uso de TeamVal, una demostración local sin pagos ni servicios oficiales." />

    <section className="glass form-card legal-card">
      <h2>Aceptación y alcance</h2>
      <p>Al usar TeamVal aceptas estas condiciones. Si no estás de acuerdo, no utilices la aplicación.</p>
      <p>TeamVal es una demostración técnica funcionando íntegramente en tu navegador, sin cuentas ni servidor. Estas condiciones se ofrecen como texto base <strong>pendiente de revisión jurídica</strong> y no constituyen aún un documento legal definitivo.</p>
    </section>

    <section className="glass form-card legal-card">
      <h2>Uso adecuado de TeamVal</h2>
      <ul className="legal-list">
        <li>Úsala para su propósito: explorar publicaciones, gestionar equipos y coordinar scrims de práctica.</li>
        <li>No la uses para actividades ilícitas, estafas, fraude o suplantación.</li>
        <li>No intentes alterar el código, el almacenamiento local de otros usuarios ni el funcionamiento del sitio.</li>
        <li>Respeta los derechos de terceros y de Riot Games.</li>
      </ul>
    </section>

    <section className="glass form-card legal-card">
      <h2>Publicaciones y comportamiento de la comunidad</h2>
      <p>Las publicaciones de grupo, equipos, scrims y comentarios deben ser veraces, respetuosos y estar relacionados con el juego. Queda prohibido:</p>
      <ul className="legal-list">
        <li>Publicar contenido ofensivo, discriminatorio, obsceno o engañoso.</li>
        <li>Suplantar a otros jugadores, equipos o entidades.</li>
        <li>Publicar datos personales ajenos o información privada sin consentimiento.</li>
        <li>Spam, publicidad no autorizada o enlaces maliciosos.</li>
        <li>Hacer pasar por oficiales resultados o publicaciones que no lo son.</li>
      </ul>
      <p><strong>La aplicación no cuenta con un sistema de moderación remota</strong>: no hay denuncias que lleguen a un revisor ni eliminación automática de contenido por terceros. Las denuncias existentes se registran solo en tu navegador y no se envían a nadie.</p>
    </section>

    <section className="glass form-card legal-card">
      <h2>Acoso, toxicidad y suplantación</h2>
      <p>Se prohíbe el acoso de cualquier tipo, las amenazas, el hostigamiento repetido, la toxicidad en el trato con otros equipos y la suplantación de identidad. TeamVal incluye indicadores de conducta en las valoraciones, pero <strong>esos indicadores son locales y no tienen efecto sancionador real</strong> sobre cuentas o jugadores.</p>
    </section>

    <section className="glass form-card legal-card">
      <h2>Contenido y logos subidos por usuarios</h2>
      <p>Puedes subir una imagen para personalizar el logo de tu equipo. Eres responsable del contenido que subes:</p>
      <ul className="legal-list">
        <li>Debes tener derecho a usar esa imagen y no puede infrinjer derechos de terceros.</li>
        <li>No debe contener contenido ilegal, ofensivo, marcas ajenas no autorizadas ni datos personales de terceros.</li>
        <li>La imagen se procesa localmente en tu navegador y no se envía a ningún servidor.</li>
      </ul>
      <p><strong>No existe moderación real de imágenes</strong>: la validación es técnica (formato y tamaño) y no revisa el contenido. Esa moderación queda pendiente hasta disponer de backend.</p>
    </section>

    <section className="glass form-card legal-card">
      <h2>Scrims y resultados no oficiales</h2>
      <p>Los resultados de scrims se registran <strong>de forma manual</strong> por los participantes. Son marcadores de demostración:</p>
      <ul className="legal-list">
        <li>No son resultados oficiales ni verificados por Riot Games.</li>
        <li>No proceden de la API de VALORANT ni de ninguna fuente oficial.</li>
        <li>Pueden registrarse antes del horario programado para probar la interfaz.</li>
        <li>Las divisiones Premier son datos declarados por el usuario, sin verificación de Riot.</li>
      </ul>
      <p>TeamVal no está afiliado, patrocinado ni respaldado por Riot Games. VALORANT y sus marcas pertenecen a Riot Games. Consulta el aviso completo en el pie de página.</p>
    </section>

    <section className="glass form-card legal-card">
      <h2>Responsabilidad sobre los datos proporcionados</h2>
      <p>Tú eres responsable de la exactitud de los datos que escribes (rango, región, Riot ID, descripciones, resultados y valoraciones). TeamVal no verifica esa información.</p>
      <p>Al no existir servidor ni copias de seguridad, <strong>la pérdida de los datos del navegador implica su pérdida definitiva</strong>. En la medida en que permita la ley, el proyecto se ofrece «tal cual», sin garantías de disponibilidad, exactitud o idoneidad.</p>
    </section>

    <section className="glass form-card legal-card">
      <h2>Funcionalidades de demostración</h2>
      <p>Perfiles, candidatos, equipos, invitaciones, scrims, valoraciones y reputación son <strong>ficticios y de demostración</strong>, creados para probar la interfaz. No simulan conexiones entre jugadores reales ni existen usuarios remotos. Puedes reiniciar los datos desde las secciones correspondientes.</p>
    </section>

    <section className="glass form-card legal-card">
      <h2>TeamVal Coins</h2>
      <p>Las TeamVal Coins se conciben como una <strong>moneda virtual de demostración sin valor monetario real</strong>:</p>
      <ul className="legal-list">
        <li>No se pueden comprar, canjear por dinero, transferir ni cobrar.</li>
        <li>No tienen precio, no se aceptan pagos y no existen recargas.</li>
        <li>Actualmente <strong>no hay sistema de monedas activo</strong>: la tienda sigue pendiente de su etapa de desarrollo.</li>
        <li>Cuando exista, será una función local de demostración con las mismas limitaciones.</li>
      </ul>
    </section>

    <section className="glass form-card legal-card">
      <h2>Aviso sobre Riot Games</h2>
      <p>TeamVal es un proyecto independiente y no está afiliado, patrocinado ni respaldado por Riot Games. VALORANT y sus marcas pertenecen a Riot Games.</p>
      <p className="legal-official">TeamVal isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.</p>
      <p>TeamVal no utiliza los logos oficiales de Riot Games. El texto anterior es el aviso legal requerido por las políticas generales de desarrollador de Riot Games y aparece también en el pie de página de todas las secciones.</p>
      <p>Si quieres conocer cómo guardamos la información, consulta la <Link to="/privacidad" className="text-link">Política de privacidad</Link>.</p>
    </section>

    <section className="glass form-card legal-card">
      <h2>Información pendiente de confirmar</h2>
      <p className="notice"><span className="badge">PENDIENTE</span><span>Estos términos requieren confirmación antes de considerarse definitivos.</span></p>
      <ul className="legal-list">
        <li>Identidad y contacto del responsable: sin definir (no hay correo oficial).</li>
        <li>Legislación aplicable y jurisdicción: por determinar.</li>
        <li>Revisión jurídica profesional: no realizada.</li>
        <li>Condiciones para menores de edad: por definir.</li>
        <li>Procedimiento y plazos de eliminación de contenido cuando exista backend: pendiente.</li>
      </ul>
      <p>Última actualización: 29 de octubre de 2026.</p>
    </section>
  </>
}
