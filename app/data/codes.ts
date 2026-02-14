// =============================================================================
// HTTP Cobalto 60 — Catalogo completo de codigos HTTP
// Los codigos HTTP explicados desde lo mas oscuro, crudo y real de Mexico.
// =============================================================================

export interface HTTPCode {
  code: number;
  title: string;
  mexicanContext: string;
  category: 'info' | 'success' | 'redirect' | 'client-error' | 'server-error';
  description: string;
  mexican: string;
  image?: string;
  examples: {
    javascript: string;
    python: string;
    phpLaravel: string;
    rust: string;
    cpp: string;
  };
  bestPractice: string;
  antiPattern?: string;
  relatedCodes?: number[];
  headers?: string[];
}

// =============================================================================
// Importar ejemplos de código por lenguaje
// =============================================================================
import { javascriptExamples } from '~/data/examples/javascript';
import { pythonExamples } from '~/data/examples/python';
import { phpLaravelExamples } from '~/data/examples/php-laravel';
import { rustExamples } from '~/data/examples/rust';
import { cppExamples } from '~/data/examples/cpp';

function getExamples(code: number) {
  return {
    javascript: javascriptExamples[code] || '',
    python: pythonExamples[code] || '',
    phpLaravel: phpLaravelExamples[code] || '',
    rust: rustExamples[code] || '',
    cpp: cppExamples[code] || '',
  };
}

const emptyExamples = {
  javascript: '',
  python: '',
  phpLaravel: '',
  rust: '',
  cpp: '',
};

// =============================================================================
// CATALOGO COMPLETO — 43 codigos HTTP
// =============================================================================

export const codes: HTTPCode[] = [
  // ===========================================================================
  // 1xx — INFORMATIVOS
  // ===========================================================================
  {
    code: 100,
    title: 'Continue',
    mexicanContext: 'La Espera en el IMSS',
    category: 'info',
    description:
      'El servidor ha recibido los encabezados de la solicitud y el cliente debe proceder a enviar el cuerpo de la peticion. Permite al cliente verificar si el servidor aceptara la solicitud antes de enviar datos potencialmente grandes. Se usa en conjunto con el encabezado Expect: 100-continue.',
    mexican:
      'Llegas al IMSS a las 5 de la manana para alcanzar ficha. Te dicen "espere, lo vamos a atender". Eso no significa que te van a atender pronto, ni que hay doctor, ni que hay medicinas. Solo significa que tu solicitud fue recibida y que debes seguir esperando. Las filas del sistema de salud publico mexicano son la representacion perfecta del 100 Continue: un acuse de recibo que no garantiza absolutamente nada. Millones de mexicanos viven atrapados en esa espera perpetua, con enfermedades que avanzan mientras el sistema les dice "continue aguardando".',
    examples: { ...emptyExamples },
    bestPractice:
      'Usa Expect: 100-continue cuando envies payloads grandes para evitar transferencias innecesarias. El servidor debe responder con 100 antes de que el cliente envie el cuerpo, o con un error si va a rechazar la peticion. No lo implementes manualmente en la mayoria de frameworks modernos — lo manejan automaticamente.',
    antiPattern:
      'No envies payloads grandes sin verificar primero si el servidor los aceptara. No ignores el mecanismo 100-continue en uploads pesados — desperdiciaras ancho de banda.',
    relatedCodes: [101, 417],
    headers: ['Expect'],
  },
  {
    code: 101,
    title: 'Switching Protocols',
    mexicanContext: 'Cambio de Mando Presidencial',
    category: 'info',
    description:
      'El servidor acepta cambiar el protocolo de comunicacion segun lo solicito el cliente mediante el encabezado Upgrade. Se usa comunmente para cambiar de HTTP a WebSocket. El servidor debe responder con el encabezado Upgrade indicando el nuevo protocolo.',
    mexican:
      'Cada seis años, Mexico cambia de protocolo. El viejo presidente le pone la banda al nuevo en una ceremonia solemne y el pais entero "cambia" de reglas del juego. La transicion entre sexenios es un ritual donde se promete que ahora si todo sera diferente, que el nuevo protocolo funcionara mejor. Pero la infraestructura es la misma, los problemas son los mismos, y el unico cambio real es quien da las ordenes. Un cambio de protocolo que cambia todo y no cambia nada, como upgradar de HTTP/1.1 a WebSocket: la conexion se mantiene, solo cambian las reglas de comunicacion.',
    examples: { ...emptyExamples },
    bestPractice:
      'Usa el header Upgrade solo cuando necesites un cambio genuino de protocolo, como WebSocket. El servidor debe responder 101 solo si soporta el protocolo solicitado. Tras el switch, ambas partes deben comunicarse exclusivamente en el nuevo protocolo.',
    antiPattern:
      'No uses Switching Protocols como hack para cambiar el comportamiento de tu API. No solicites un upgrade a un protocolo que el servidor no soporta sin manejar el rechazo.',
    relatedCodes: [100, 426],
    headers: ['Upgrade', 'Connection'],
  },
  {
    code: 102,
    title: 'Processing',
    mexicanContext: 'Tramite en la SEP',
    category: 'info',
    description:
      'Respuesta provisional definida en WebDAV (RFC 2518) que indica que el servidor ha recibido la solicitud completa pero aun no la ha completado. Evita que el cliente asuma un timeout mientras el servidor procesa operaciones que toman mucho tiempo. Es una senal de vida, no una respuesta final.',
    mexican:
      'Apostillar un titulo universitario en la SEP es entrar a un agujero negro burocratico. Entregas tus documentos, te dan un numero de folio, y te dicen "esta en proceso". Semanas despues, sigues en proceso. Meses despues, sigues en proceso. Llamas por telefono y la respuesta es la misma: "su tramite esta siendo procesado". No hay fecha estimada, no hay responsable identificable, no hay forma de acelerar nada. El sistema no se cayo — simplemente se toma todo el tiempo del mundo mientras tu vida queda en pausa esperando un papel que certifique lo que ya estudiaste.',
    examples: { ...emptyExamples },
    bestPractice:
      'Envia 102 Processing en operaciones WebDAV que tarden mas de lo esperado para evitar timeouts del cliente. Consideralo para operaciones batch o reportes pesados. No abuses de este codigo — si tu operacion tarda demasiado, evalua procesamiento asincrono con 202 Accepted.',
    antiPattern:
      'No uses 102 como excusa para endpoints lentos. Si un proceso tarda minutos, usa 202 Accepted y un mecanismo de polling o webhooks. No lo uses fuera del contexto WebDAV a menos que sea estrictamente necesario.',
    relatedCodes: [100, 202],
    headers: [],
  },
  {
    code: 103,
    title: 'Early Hints',
    mexicanContext: 'La Alerta Sismica',
    category: 'info',
    description:
      'Respuesta informativa definida en RFC 8297 que permite al servidor enviar encabezados preliminares antes de la respuesta final. Comunmente usada para que el cliente comience a precargar recursos (hojas de estilo, scripts) mientras el servidor prepara la respuesta completa. Optimiza significativamente los tiempos de carga.',
    mexican:
      'El 19 de septiembre es una fecha marcada en la memoria colectiva de Mexico. La alerta sismica — ese sonido grave y escalofriante que se activa segundos antes de que la tierra tiemble — es informacion temprana que puede salvar vidas. No es la respuesta completa, no te dice la magnitud ni la duracion, pero te da un aviso critico para que actues antes de que llegue lo fuerte. Cuando funciona, esos segundos de anticipacion son la diferencia entre la vida y la muerte. Asi es el 103 Early Hints: informacion preliminar que te permite prepararte mientras llega la respuesta definitiva.',
    examples: { ...emptyExamples },
    bestPractice:
      'Usa 103 Early Hints con headers Link para precargar CSS, fuentes y JS criticos. Es especialmente util cuando tu servidor tarda en generar la respuesta final (consultas a base de datos, llamadas a APIs externas). Asegurate de que el cliente los soporte antes de depender de ellos.',
    antiPattern:
      'No dependas exclusivamente de Early Hints para cargar recursos criticos — no todos los navegadores los soportan. No envies demasiados hints que saturen la conexion antes de la respuesta real.',
    relatedCodes: [100, 200],
    headers: ['Link'],
  },

  // ===========================================================================
  // 2xx — EXITO
  // ===========================================================================
  {
    code: 200,
    title: 'OK',
    mexicanContext: 'El Maiz Llego a la Milpa',
    category: 'success',
    description:
      'La solicitud se ha completado exitosamente. El significado exacto depende del metodo HTTP: para GET, el recurso se ha obtenido y se transmite en el cuerpo; para POST, el recurso que describe el resultado de la accion se transmite en el cuerpo. Es la respuesta exitosa mas comun y generica.',
    mexican:
      'Cuando el maiz llega a la milpa, Mexico come. La milpa no es solo un campo de cultivo — es un sistema de supervivencia milenario que sostiene a comunidades enteras. El maiz, el frijol, la calabaza, el chile: todo crece junto, todo se complementa. Una cosecha exitosa significa que la familia pasara el ano sin hambre. Un 200 OK es eso: la operacion que alimenta todo lo demas. Sin ella, nada funciona. Pero asi como la milpa necesita lluvia, tierra fertil y trabajo constante, un buen 200 necesita datos limpios y una respuesta sin envolturas innecesarias.',
    examples: { ...emptyExamples },
    bestPractice:
      'Devuelve los datos directamente en el body — sin envolturas tipo { data, message, status, success }. El 200 ya dice que todo salio bien. Para GET, devuelve el recurso o coleccion. Para POST que no crea recurso, devuelve el resultado de la accion. Incluye headers de cache cuando sea apropiado.',
    antiPattern:
      'No devuelvas 200 con { success: false, error: "algo fallo" }. Si algo fallo, usa el codigo HTTP correcto (400, 404, 500). No envuelvas datos en { data: [...], message: "OK", status: 200 } — es redundante y obliga al cliente a parsear dos niveles.',
    relatedCodes: [201, 204, 304],
    headers: ['Content-Type', 'Cache-Control', 'ETag'],
  },
  {
    code: 201,
    title: 'Created',
    mexicanContext: 'Fundacion de Tenochtitlan',
    category: 'success',
    description:
      'La solicitud se ha completado y se ha creado un nuevo recurso como resultado. El recurso recien creado se describe en el cuerpo de la respuesta y su ubicacion se indica mediante el encabezado Location o la URI de la solicitud. Se usa tipicamente como respuesta a solicitudes POST.',
    mexican:
      '1325. Despues de siglos de peregrinacion, los mexicas encontraron la senal: un aguila posada sobre un nopal devorando una serpiente, en medio de un lago. Ahi fundaron Tenochtitlan, un imperio creado de la nada sobre agua y lodo. Construyeron chinampas, calzadas, acueductos y templos que asombraron a los propios conquistadores. Crear algo de la nada, contra toda logica, en el lugar mas improbable — eso es un 201 Created. El recurso no existia, ahora existe, y aqui esta su ubicacion exacta. Como el Header Location que te dice donde encontrar lo que acabas de crear.',
    examples: { ...emptyExamples },
    bestPractice:
      'Siempre incluye el header Location apuntando al recurso recien creado (/api/recurso/{id}). Devuelve el recurso completo en el body para que el cliente no necesite hacer un GET adicional. Usa 201 exclusivamente para POST que crean nuevos recursos — no para actualizaciones.',
    antiPattern:
      'No devuelvas 200 cuando creas un recurso — usa 201. No olvides el header Location. No devuelvas solo { message: "Creado exitosamente" } sin el recurso en el body.',
    relatedCodes: [200, 204, 409],
    headers: ['Location', 'Content-Type'],
  },
  {
    code: 202,
    title: 'Accepted',
    mexicanContext: '"Ya Quedo, Jefe"',
    category: 'success',
    description:
      'La solicitud ha sido aceptada para procesamiento pero el procesamiento no se ha completado. La solicitud podria eventualmente ser ejecutada o rechazada cuando el procesamiento ocurra. No hay forma de reenviar un codigo de estado desde una operacion asincrona. Es intencionalmente no comprometedora.',
    mexican:
      '"Ya quedo, jefe" es la frase mas peligrosa de Mexico. El albanil te la dice cuando aceptas su presupuesto para arreglar el techo. El burocrata te la dice cuando entregas tus papeles en ventanilla. El mecanico te la dice cuando dejas tu carro. La solicitud fue aceptada — pero no hay garantia de cuando se completara, ni como, ni si el resultado sera lo que esperabas. Es un compromiso sin compromiso. Lo unico que sabes con certeza es que alguien recibio tu peticion y prometio procesarla. El "cuando" y el "como" quedan en el aire, flotando en esa ambiguedad tan mexicana donde "ahorita" puede significar cinco minutos o cinco meses.',
    examples: { ...emptyExamples },
    bestPractice:
      'Usa 202 para operaciones asincronas reales: envio de emails, procesamiento de reportes, tareas en cola. Devuelve informacion sobre como consultar el estado del proceso (URL de polling, ID de tarea). Considera webhooks para notificar al cliente cuando el proceso termine.',
    antiPattern:
      'No uses 202 para ocultar que tu endpoint es lento. Si la operacion puede completarse en la misma request, hazlo y devuelve 200 o 201. No devuelvas 202 sin darle al cliente forma de saber cuando termina el proceso.',
    relatedCodes: [200, 102],
    headers: ['Location', 'Retry-After'],
  },
  {
    code: 204,
    title: 'No Content',
    mexicanContext: 'Presa Vacia en Sequia',
    category: 'success',
    description:
      'El servidor ha cumplido la solicitud exitosamente pero no necesita devolver contenido en el cuerpo de la respuesta. El servidor puede incluir metainformacion en los encabezados. Se usa comumente para operaciones DELETE exitosas o PUT/PATCH donde no se necesita devolver el recurso actualizado.',
    mexican:
      'La presa El Granero en Chihuahua, la presa La Boquilla, las presas de Nuevo Leon — operan exitosamente como infraestructura, sus compuertas funcionan, sus sistemas estan activos, pero estan vacias. La sequia del norte de Mexico no es un evento puntual sino una crisis permanente que se agrava cada ano. Las presas reportan niveles del 5%, 10%, 15% de su capacidad. La operacion fue exitosa pero no hay contenido que entregar. Asi es el 204: todo funciono, la peticion se proceso correctamente, simplemente no hay nada que devolver. Como abrir la llave y que no salga agua — la tuberia funciona, el problema es que no hay recurso.',
    examples: { ...emptyExamples },
    bestPractice:
      'Usa 204 para DELETE exitoso y para PUT/PATCH cuando el cliente no necesita el recurso actualizado. No incluyas body — por definicion, 204 significa sin contenido. Si necesitas confirmar que algo cambio, devuelve el recurso actualizado con 200 en su lugar.',
    antiPattern:
      'No devuelvas 200 con { message: "Eliminado correctamente" } cuando 204 sin body es suficiente. No uses 204 para GET — si no hay datos, considera 404 (no existe) o 200 con array vacio (coleccion vacia). Nunca incluyas body en un 204.',
    relatedCodes: [200, 404],
    headers: ['ETag', 'Cache-Control'],
  },
  {
    code: 206,
    title: 'Partial Content',
    mexicanContext: 'Reconstruccion Post-Sismo 2017',
    category: 'success',
    description:
      'El servidor ha cumplido parcialmente una solicitud GET para el recurso, entregando solo una parte del contenido segun lo especificado en el encabezado Range de la solicitud. Se usa para descargas parciales, streaming de video y reanudar transferencias interrumpidas. El servidor debe incluir Content-Range indicando que porcion del recurso se entrega.',
    mexican:
      'El 19 de septiembre de 2017, un sismo de 7.1 grados derrumbo mas de 40 edificios solo en la Ciudad de Mexico. 369 personas murieron. El gobierno y la sociedad civil prometieron reconstruccion total. Anos despues, miles de familias seguian desplazadas, edificios a medio reparar, colonias enteras con danos estructurales visibles. De los miles de millones asignados, solo una fraccion se ejecuto realmente. Se entrego contenido parcial de lo prometido — y para muchas familias, esa fraccion nunca llego. El 206 es honesto: te dice exactamente que porcion estas recibiendo del total. La reconstruccion de 2017, en cambio, prometia el recurso completo y entregaba migajas.',
    examples: { ...emptyExamples },
    bestPractice:
      'Implementa Range requests para archivos grandes, streaming de audio/video y descargas reanudables. Siempre incluye Content-Range en la respuesta. Soporta multipart ranges cuando sea necesario. Responde 416 si el rango solicitado no es satisfacible.',
    antiPattern:
      'No ignores el header Range y devuelvas el recurso completo — desperdicias ancho de banda. No uses 206 para paginacion de APIs — usa 200 con headers de paginacion o links. No olvides validar que el rango solicitado sea valido.',
    relatedCodes: [200, 416],
    headers: ['Range', 'Content-Range', 'Accept-Ranges'],
  },

  // ===========================================================================
  // 3xx — REDIRECCION
  // ===========================================================================
  {
    code: 301,
    title: 'Moved Permanently',
    mexicanContext: 'El Aeropuerto de Texcoco Cancelado',
    category: 'redirect',
    description:
      'El recurso solicitado se ha movido permanentemente a una nueva URI indicada en el encabezado Location. Los clientes deben actualizar sus referencias a la nueva URI. Los motores de busqueda transfieren el ranking SEO a la nueva URL. Futuras solicitudes deben usar la nueva URI.',
    mexican:
      'El Nuevo Aeropuerto Internacional de Mexico (NAIM) en Texcoco llevaba un 30% de avance y una inversion de mas de 100 mil millones de pesos cuando fue cancelado en 2018 tras una consulta popular cuestionada. La redireccion fue permanente: Felipe Angeles, una base militar adaptada a 54 km del centro, reemplazo al proyecto original. Miles de millones en cimientos, pilotes y obra civil quedaron abandonados en el lecho del lago. Es el 301 mas caro de la historia de Mexico: un recurso que se movio permanentemente, y la URL original quedo como un monumento a lo que pudo ser. Los "clientes" (aerolineas, pasajeros, inversionistas) tuvieron que actualizar todas sus referencias.',
    examples: { ...emptyExamples },
    bestPractice:
      'Usa 301 solo para movimientos genuinamente permanentes — cambios de dominio, reestructuracion de URLs. Incluye siempre el header Location con la nueva URI. Mantiene las redirecciones funcionando por meses o años. Para SEO, el 301 transfiere la autoridad de la URL vieja a la nueva.',
    antiPattern:
      'No uses 301 si la redireccion podria revertirse — usa 302 o 307. No encadenes multiples 301 (redirect chains) porque degradan performance y SEO. No olvides actualizar links internos a la URL final.',
    relatedCodes: [302, 307, 308],
    headers: ['Location'],
  },
  {
    code: 302,
    title: 'Found',
    mexicanContext: 'Desvio por el Socavon de Puebla',
    category: 'redirect',
    description:
      'El recurso solicitado reside temporalmente en una URI diferente indicada en el encabezado Location. Dado que la redireccion es temporal, el cliente debe seguir usando la URI original para futuras solicitudes. Historicamente, los navegadores cambiaban el metodo a GET, por lo que se creo 307 para preservar el metodo original.',
    mexican:
      'En mayo de 2021, un socavon gigante aparecio en Santa Maria Zacatepec, Puebla. Se trago una casa, alcanzo 126 metros de diametro y obligo a desviar todo el trafico de la zona. "Temporal", dijeron las autoridades. Meses despues, el desvio seguia. El socavon se lleno de agua, le pusieron una reja, lo volvieron "atraccion turistica". La redireccion supuestamente temporal se convirtio en parte del paisaje. Asi es el 302: te manda a otro lado prometiendo que la ruta original volvera a funcionar. A veces vuelve. A veces te acostumbras al desvio. A veces te vendes fotos frente al hoyo.',
    examples: { ...emptyExamples },
    bestPractice:
      'Usa 302 para redirecciones genuinamente temporales: mantenimiento, A/B testing, redireccion post-login. El cliente debe seguir usando la URI original. Si necesitas preservar el metodo HTTP (POST sigue siendo POST), usa 307 en su lugar.',
    antiPattern:
      'No uses 302 para movimientos permanentes — usa 301 o 308. No dependas de que el cliente preserve el metodo HTTP con 302 — historicamente los navegadores cambian a GET. Si la redireccion lleva meses activa, probablemente deberia ser un 301.',
    relatedCodes: [301, 303, 307],
    headers: ['Location'],
  },
  {
    code: 303,
    title: 'See Other',
    mexicanContext: '"Vaya a la Ventanilla 7"',
    category: 'redirect',
    description:
      'El servidor redirige al cliente a un recurso diferente, indicado por la URI en el encabezado Location, que debe ser obtenido con GET. Se usa despues de un POST o PUT para redirigir al cliente a una pagina de confirmacion o al recurso creado. Garantiza que el navegador use GET para la nueva URI.',
    mexican:
      'Llegas a la ventanilla 3 de cualquier dependencia de gobierno en Mexico. Traes todos tus documentos, hiciste fila dos horas, es tu turno. "Esto no es aqui, vaya a la ventanilla 7." Vas a la 7. "No, esto lo ven en la ventanilla 12, pero cierra a las 2." Llegas a la 12. "Necesita una copia que le dan en la ventanilla 3." El loop burocratico mexicano es un sistema de redirecciones donde cada ventanilla te manda a otra con un metodo diferente. Y siempre, siempre, terminas en una ventanilla que ya cerro. La burocracia mexicana no necesito inventar el 303 — lo vive desde hace decadas.',
    examples: { ...emptyExamples },
    bestPractice:
      'Usa 303 despues de un POST exitoso para redirigir al recurso creado (patron Post/Redirect/Get). Esto evita reenvios accidentales del formulario si el usuario refresca la pagina. Siempre usa GET para obtener el recurso al que rediriges.',
    antiPattern:
      'No uses 303 si necesitas que el cliente repita la misma operacion con el mismo metodo — usa 307. No redirijas en circulos (ventanilla a ventanilla). No uses 303 para esconder errores — si la peticion fallo, devuelve el error correspondiente.',
    relatedCodes: [302, 307],
    headers: ['Location'],
  },
  {
    code: 304,
    title: 'Not Modified',
    mexicanContext: 'Las Reformas que No Cambian Nada',
    category: 'redirect',
    description:
      'Indica que el recurso no ha sido modificado desde la version especificada por los encabezados If-Modified-Since o If-None-Match. El servidor no necesita transmitir el recurso nuevamente. El cliente debe usar su copia en cache. No incluye body en la respuesta.',
    mexican:
      'Mexico ha tenido mas de 700 reformas constitucionales desde 1917. Reforma educativa, reforma energetica, reforma fiscal, reforma laboral, reforma electoral. Se aprueban con bombo y platillo, se publican en el Diario Oficial, se celebran como el cambio que Mexico necesitaba. Y la realidad en las aulas, en las gasolineras, en las fabricas, en las casillas, sigue exactamente igual. El recurso no ha sido modificado. Puedes consultarlo las veces que quieras, vas a obtener la misma version de siempre. El 304 al menos es honesto: te dice "no cambio nada, usa lo que ya tienes". Las reformas mexicanas te dicen "todo cambio" y te entregan lo mismo.',
    examples: { ...emptyExamples },
    bestPractice:
      'Implementa cache con ETag y Last-Modified para reducir transferencia de datos. El cliente envia If-None-Match o If-Modified-Since, y si el recurso no cambio, devuelve 304 sin body. Es fundamental para performance en APIs con datos que cambian poco.',
    antiPattern:
      'No devuelvas 200 con el recurso completo cada vez si el contenido no cambio — desperdicias ancho de banda. No olvides incluir los headers de cache (ETag, Last-Modified) en tus respuestas 200 para que el 304 funcione.',
    relatedCodes: [200],
    headers: ['ETag', 'Last-Modified', 'If-None-Match', 'If-Modified-Since', 'Cache-Control'],
  },
  {
    code: 307,
    title: 'Temporary Redirect',
    mexicanContext: 'Bloqueo en Reforma por Manifestacion',
    category: 'redirect',
    description:
      'El recurso solicitado reside temporalmente en otra URI indicada en el encabezado Location. A diferencia del 302, el 307 garantiza que el metodo HTTP y el cuerpo de la solicitud no cambien al seguir la redireccion. El cliente debe seguir usando la URI original para futuras solicitudes.',
    mexican:
      'Paseo de la Reforma, la avenida mas emblematica de la Ciudad de Mexico, esta bloqueada. Otra vez. Maestros de la CNTE, campesinos desplazados, familiares de desaparecidos, trabajadores despedidos — todos marchan por Reforma porque es la unica forma de que el gobierno los vea. El trafico se desvía temporalmente, tu ruta cambia, pero tu destino y tu metodo de transporte siguen siendo los mismos. Manana — o la proxima semana, o el proximo mes — la marcha se levantara y la ruta original volvera a funcionar. El 307 preserva exactamente tu metodo original: si ibas en POST, sigues en POST. Si ibas en carro, sigues en carro. Solo cambia el camino, no la intencion.',
    examples: { ...emptyExamples },
    bestPractice:
      'Usa 307 cuando necesites una redireccion temporal que preserve el metodo HTTP original. Es critico para POST — un 302 podria cambiar el metodo a GET, pero un 307 garantiza que el POST se reenvia tal cual. Util para mantenimiento temporal de endpoints.',
    antiPattern:
      'No uses 307 para redirecciones permanentes — usa 308. No confundas 307 con 302: la diferencia clave es que 307 preserva el metodo HTTP. No uses 307 si quieres que el cliente cambie a GET — usa 303.',
    relatedCodes: [302, 303, 308],
    headers: ['Location'],
  },
  {
    code: 308,
    title: 'Permanent Redirect',
    mexicanContext: 'De DF a CDMX',
    category: 'redirect',
    description:
      'El recurso ha sido movido permanentemente a una nueva URI indicada en el encabezado Location. A diferencia del 301, el 308 garantiza que el metodo HTTP y el cuerpo de la solicitud no cambien. El cliente debe actualizar sus referencias y usar la nueva URI para todas las solicitudes futuras.',
    mexican:
      'El 29 de enero de 2016, el Distrito Federal dejo de existir oficialmente. Despues de 192 años, la capital de Mexico cambio de nombre a Ciudad de Mexico. No fue un desvio temporal, no fue una sugerencia — fue un cambio permanente en la Constitucion. Placas de carro, documentos oficiales, direcciones postales, sistemas informaticos: todo tuvo que actualizarse. Pero al igual que el 308, el metodo no cambio: la ciudad sigue funcionando exactamente igual, con los mismos problemas de siempre. Solo cambio la referencia. Los que seguimos diciendo "el DF" somos como clientes que ignoran la redireccion permanente y siguen usando la URL vieja.',
    examples: { ...emptyExamples },
    bestPractice:
      'Usa 308 para movimientos permanentes donde necesites preservar el metodo HTTP. Ideal para migracion de APIs donde los clientes hacen POST/PUT/DELETE. Combina con 301 para endpoints que solo reciben GET. Actualiza la documentacion para reflejar las nuevas URIs.',
    antiPattern:
      'No uses 308 si la redireccion es temporal — usa 307. No asumas que todos los clientes soportan 308 — clientes antiguos podrian no manejarlo correctamente. Verifica compatibilidad antes de migrar de 301 a 308.',
    relatedCodes: [301, 307],
    headers: ['Location'],
  },

  // ===========================================================================
  // 4xx — ERROR DEL CLIENTE
  // ===========================================================================
  {
    code: 400,
    title: 'Bad Request',
    mexicanContext: 'Pedir Ketchup en la Taqueria',
    category: 'client-error',
    description:
      'El servidor no puede procesar la solicitud debido a un error del cliente: sintaxis malformada, parametros invalidos, o un cuerpo de peticion que no se puede parsear. El cliente no debe repetir la solicitud sin modificaciones. Es el error generico para peticiones que el servidor no puede entender.',
    mexican:
      'Llegas a una taqueria de verdad — de esas con el trompo girando, la salsa verde recien molcajeteada y el cilantro picado al momento — y pides ketchup para tus tacos al pastor. El taquero te mira. Los demas clientes te miran. Acabas de enviar una peticion malformada al servidor equivocado. No es que no tengan ketchup — es que tu solicitud es fundamentalmente incorrecta en este contexto. La peticion no tiene sentido, viola el protocolo basico de la taqueria mexicana, y ningun amount de insistencia va a hacer que sea valida. Reformula tu peticion: salsa verde, salsa roja, limon, cebolla. Esos son los parametros aceptados.',
    examples: { ...emptyExamples },
    bestPractice:
      'Devuelve mensajes de error claros que indiquen que esta mal en la peticion. Diferencia entre 400 (peticion malformada) y 422 (peticion bien formada pero con datos invalidos). Valida el Content-Type y el formato del body antes de procesar. Incluye detalles sobre que campos o parametros son incorrectos.',
    antiPattern:
      'No uses 400 como catch-all para todos los errores del cliente — existen codigos mas especificos (401, 403, 404, 422). No devuelvas 400 con mensajes genericos como "Error" sin indicar que salio mal. No devuelvas 200 con { success: false } cuando la peticion es invalida.',
    relatedCodes: [422, 415],
    headers: ['Content-Type'],
  },
  {
    code: 401,
    title: 'Unauthorized',
    mexicanContext: 'Colonia Cerrada con Plumas',
    category: 'client-error',
    description:
      'La solicitud requiere autenticacion del usuario. El cliente debe incluir credenciales validas (token, cookie de sesion, etc.) para acceder al recurso. Semanticamente significa "no autenticado" — el servidor no sabe quien eres. El encabezado WWW-Authenticate indica el esquema de autenticacion requerido.',
    mexican:
      'En Mexico, miles de colonias han instalado plumas, rejas y casetas de vigilancia privada para bloquear calles publicas. Llegas a una calle que segun el mapa es publica, y un guardia te detiene: "¿A donde va? ¿A que numero? ¿Quien lo espera?". Si no demuestras que "perteneces", no pasas. Es una privatizacion ilegal del espacio publico que las autoridades toleran porque las colonias "de bien" tienen derecho a sentirse seguras. El 401 es eso: no es que tengas prohibido el acceso — es que no has demostrado quien eres. Presentas tu identificacion (token, credenciales) y el acceso se concede. Pero la pregunta queda: ¿desde cuando una calle publica requiere autenticacion?',
    examples: { ...emptyExamples },
    bestPractice:
      'Distingue claramente entre 401 (no autenticado) y 403 (autenticado pero sin permisos). Incluye el header WWW-Authenticate indicando el esquema requerido (Bearer, Basic). En el front, redirige a login cuando recibas 401. Usa refresh tokens para renovar credenciales expiradas sin interrumpir al usuario.',
    antiPattern:
      'No uses 403 cuando el problema es falta de autenticacion — usa 401. No devuelvas 401 sin el header WWW-Authenticate. No expongas detalles sobre por que fallo la autenticacion ("usuario no existe" vs "contrasena incorrecta") — es una vulnerabilidad de seguridad.',
    relatedCodes: [403, 407],
    headers: ['WWW-Authenticate', 'Authorization'],
  },
  {
    code: 402,
    title: 'Payment Required',
    mexicanContext: 'La Mordida',
    category: 'client-error',
    description:
      'Reservado para uso futuro. La intencion original era que este codigo se usara en esquemas de micropagos digitales, pero esto nunca se implemento de manera estandar. Algunos servicios lo usan para indicar que se requiere un pago o que se ha excedido el limite de una cuenta de pago.',
    mexican:
      'Te para un transito en Mexico. Tus papeles estan en orden, tu licencia vigente, tus placas al dia. "Es que la infraccion ya se genero, jefe, pero podemos arreglarlo aqui." La mordida — ese pago extraoficial que engrasa la maquinaria de la burocracia y la corrupcion mexicana — es un 402 Payment Required que opera fuera de todo protocolo oficial. No esta documentado, no aparece en ningun reglamento, pero todo el mundo sabe que existe y como funciona. Es el pago que se "requiere" para que tu tramite avance, para que tu multa desaparezca, para que tu permiso se apruebe. Un impuesto invisible que cobra el sistema para funcionar como realmente funciona.',
    examples: { ...emptyExamples },
    bestPractice:
      'Aunque no hay estandar RFC, usa 402 para APIs con modelo de pago: suscripciones vencidas, creditos agotados, funcionalidades premium. Incluye informacion clara sobre que pago se requiere y como realizarlo. Acompana con un body que explique las opciones de pago.',
    antiPattern:
      'No uses 402 como broma o placeholder. No lo confundas con 401 (autenticacion) o 403 (permisos). Si el pago no es realmente un requisito de tu API, no lo uses. No requieras "pagos informales" para que tu API funcione — eso es corrupcion de protocolo.',
    relatedCodes: [401, 403],
    headers: [],
  },
  {
    code: 403,
    title: 'Forbidden',
    mexicanContext: 'Campo Militar No. 1',
    category: 'client-error',
    description:
      'El servidor ha entendido la solicitud pero se niega a autorizarla. A diferencia del 401, la autenticacion no hara diferencia — el acceso esta prohibido independientemente de las credenciales del cliente. El servidor puede explicar la razon de la prohibicion en el cuerpo de la respuesta.',
    mexican:
      'El Campo Militar Numero 1, en la Ciudad de Mexico, es una de las instalaciones militares mas grandes de America Latina. Durante la Guerra Sucia de los años 60 y 70, fue usado como centro de detencion clandestina donde desaparecieron opositores politicos. Hoy sigue siendo zona militar restringida. No importa quien seas, que credencial traigas o que permiso tengas — el acceso esta prohibido. Punto. No es un problema de autenticacion; es una prohibicion absoluta. Periodistas, organizaciones de derechos humanos, familiares de desaparecidos: todos han pedido acceso para buscar evidencia de las atrocidades. La respuesta siempre es 403 Forbidden. Prohibido. No insistas.',
    examples: { ...emptyExamples },
    bestPractice:
      'Usa 403 solo cuando el usuario esta autenticado pero no tiene permisos para el recurso. Si no esta autenticado, usa 401. No reveles la existencia del recurso si es sensible — en ese caso, considera devolver 404. Implementa RBAC (Role-Based Access Control) claro para determinar permisos.',
    antiPattern:
      'No uses 403 cuando el problema es falta de autenticacion — eso es 401. No devuelvas 403 con mensajes vagos — indica que permiso falta. No uses 403 para recursos que simplemente no existen — eso es 404.',
    relatedCodes: [401, 404],
    headers: [],
  },
  {
    code: 404,
    title: 'Not Found',
    mexicanContext: 'Los 43 de Ayotzinapa',
    category: 'client-error',
    description:
      'El servidor no puede encontrar el recurso solicitado. La URI no se reconoce o el recurso no existe. Puede ser temporal o permanente, pero si el servidor sabe que es permanente, deberia usar 410 Gone. Es el codigo de error mas conocido y comun en la web.',
    mexican:
      'La noche del 26 de septiembre de 2014, 43 estudiantes de la Escuela Normal Rural de Ayotzinapa fueron detenidos por policias municipales en Iguala, Guerrero, y entregados a miembros del cartel Guerreros Unidos. Desaparecieron. Fueron buscados durante años en fosas clandestinas, rios, basureros, cerros. El gobierno de Pena Nieto fabrico una "verdad historica" que se desmorono. Comisiones, investigaciones internacionales, analisis forenses — todo para encontrar lo que el sistema desaparecio deliberadamente. A mas de una decada, la mayoria sigue sin ser encontrada. 43 recursos que el servidor dice no poder localizar, pero que alguien movio, destruyo o escondio a proposito. El 404 mas doloroso de Mexico. Buscados. Nunca encontrados.',
    examples: { ...emptyExamples },
    bestPractice:
      'Diferencia entre "no existe" (404) y "fue eliminado permanentemente" (410). No reveles informacion sensible en el mensaje de error. Para APIs, un body minimo como { error: "Recurso no encontrado" } es suficiente — el 404 ya lo dice todo. Personaliza tu pagina 404 para orientar al usuario.',
    antiPattern:
      'No devuelvas 200 con { data: null } cuando el recurso no existe — usa 404. No uses 404 para ocultar recursos que existen pero a los que el usuario no tiene acceso — eso es 403 (o 404 por seguridad si no quieres revelar existencia). No olvides 404 para rutas de API inexistentes.',
    relatedCodes: [410, 403],
    headers: [],
  },
  {
    code: 405,
    title: 'Method Not Allowed',
    mexicanContext: 'Protesta Reprimida en Atenco',
    category: 'client-error',
    description:
      'El metodo HTTP especificado en la solicitud no esta permitido para el recurso identificado. El servidor debe incluir el encabezado Allow indicando los metodos que si son validos para ese recurso. El recurso existe, pero el metodo usado para acceder a el no es aceptable.',
    mexican:
      'En mayo de 2006, habitantes de San Salvador Atenco se manifestaron contra la construccion de un Walmart y el proyecto del aeropuerto en sus tierras. Usaron metodos legitimos de protesta: bloqueos, marchas, resistencia civil. La respuesta del Estado fue una operacion policial con mas de 3,500 elementos que entro al pueblo con violencia extrema. Dos muertos, cientos de heridos, 207 detenidos, al menos 26 mujeres agredidas sexualmente por policias. Los metodos de protesta estaban permitidos constitucionalmente, pero el servidor — el Estado — decidio que esos metodos no eran aceptables y respondio con violencia. Un 405 donde el header Allow no incluye ninguno de los metodos que el pueblo necesita.',
    examples: { ...emptyExamples },
    bestPractice:
      'Siempre incluye el header Allow con los metodos HTTP validos para ese endpoint (GET, POST, etc.). Implementa CORS correctamente para que los navegadores conozcan los metodos permitidos. Devuelve 405 — no 404 — cuando el recurso existe pero el metodo no es correcto.',
    antiPattern:
      'No olvides el header Allow — es requerido por la especificacion. No devuelvas 400 o 404 cuando el problema es el metodo HTTP. No permitas metodos que no has implementado (si no soportas DELETE, devuelve 405).',
    relatedCodes: [400, 501],
    headers: ['Allow'],
  },
  {
    code: 406,
    title: 'Not Acceptable',
    mexicanContext: 'Leche Adulterada',
    category: 'client-error',
    description:
      'El recurso solicitado solo puede generar contenido que no es aceptable segun los encabezados Accept enviados por el cliente. El servidor no puede producir una respuesta que cumpla con los requisitos de negociacion de contenido del cliente (tipo de medio, idioma, codificacion, etc.).',
    mexican:
      'En Mexico, PROFECO y la COFEPRIS han descubierto decenas de marcas de "leche" que no son leche. Son "formulas lacteas", "productos lacteos combinados" o simplemente liquido blanco con grasa vegetal, suero de leche y aditivos que se vende como si fuera leche entera. Pides leche, te dan algo que parece leche, sabe parecido a la leche, pero no cumple con los estandares minimos para ser llamada leche. Es inaceptable. El producto existe, el envase se ve igual, pero el contenido no cumple con lo que el cliente solicito. Un 406 donde el Accept pedia "application/leche-entera" y el servidor te devuelve "application/formula-lactea-con-grasa-vegetal".',
    examples: { ...emptyExamples },
    bestPractice:
      'Implementa negociacion de contenido usando Accept, Accept-Language y Accept-Encoding. Si no puedes cumplir con lo solicitado, devuelve 406 con una lista de los formatos disponibles. En la practica, es mejor devolver el formato por defecto que un 406, a menos que la negociacion sea estricta.',
    antiPattern:
      'No ignores los headers Accept del cliente y devuelvas siempre JSON — al menos valida que el cliente pueda procesarlo. No uses 406 cuando el problema es el cuerpo de la peticion — eso es 400 o 422. No adulteres la respuesta para "parecer" que cumples.',
    relatedCodes: [400, 415],
    headers: ['Accept', 'Accept-Language', 'Accept-Encoding'],
  },
  {
    code: 408,
    title: 'Request Timeout',
    mexicanContext: 'Justicia que Prescribe',
    category: 'client-error',
    description:
      'El servidor agoto el tiempo de espera para recibir la solicitud del cliente. El cliente no produjo la solicitud completa dentro del periodo que el servidor estaba dispuesto a esperar. El cliente puede repetir la solicitud sin modificaciones. El servidor debe cerrar la conexion.',
    mexican:
      'En Mexico, miles de casos judiciales prescriben cada ano sin resolverse. Homicidios, fraudes, desapariciones, violaciones a derechos humanos — el sistema judicial tiene plazos legales y cuando se agotan, el caso se cierra sin justicia. La prescripcion es el timeout del sistema legal: el servidor se canso de esperar una respuesta (evidencia, investigacion, voluntad politica) y cerro la conexion. Las familias de victimas quedan con un expediente muerto y una carpeta que dice "prescrito". El sistema no fallo por falta de evidencia — fallo porque se acabo el tiempo. Y en Mexico, el tiempo siempre juega a favor de los que tienen poder para agotarlo.',
    examples: { ...emptyExamples },
    bestPractice:
      'Configura timeouts razonables segun el tipo de operacion. Devuelve 408 cuando el cliente tarda demasiado en enviar la solicitud — no cuando tu servidor tarda en procesar (eso es potencialmente un 504). Incluye un header Retry-After si tiene sentido reintentar. Cierra la conexion despues del timeout.',
    antiPattern:
      'No confundas 408 (timeout del cliente) con 504 (timeout del gateway). No configures timeouts demasiado cortos que penalicen conexiones lentas legitimas. No uses 408 cuando tu servidor es el lento — eso es un problema del lado del servidor, no del cliente.',
    relatedCodes: [504, 429],
    headers: ['Connection', 'Retry-After'],
  },
  {
    code: 409,
    title: 'Conflict',
    mexicanContext: 'Disputa Territorial del Narco',
    category: 'client-error',
    description:
      'La solicitud no se pudo completar debido a un conflicto con el estado actual del recurso. Se usa cuando la solicitud es valida pero contradice el estado del servidor, como intentar crear un recurso duplicado o actualizar un recurso con datos desactualizados (conflictos de concurrencia).',
    mexican:
      'Dos carteles, una plaza. Es la ecuacion mas sangrienta de Mexico. Cuando dos organizaciones criminales disputan el control de una misma ruta, un mismo territorio, un mismo mercado, el conflicto es inevitable e irreconciliable. Jalisco Nueva Generacion contra Sinaloa en Zacatecas. Los Zetas contra el Golfo en Tamaulipas. Cada uno intenta escribir en el mismo recurso al mismo tiempo con datos diferentes. No es que la solicitud sea invalida — es que contradice lo que otro actor ya escribio. Y cuando no hay mecanismo de resolucion de conflictos (ley, estado de derecho, merge strategy), el resultado es violencia. Pueblos enteros quedan atrapados entre dos transacciones que no pueden resolverse.',
    examples: { ...emptyExamples },
    bestPractice:
      'Usa 409 para conflictos de estado: emails duplicados al registrar, conflictos de version al actualizar (optimistic locking), intentos de transicion de estado invalidos. Incluye en el body informacion sobre el conflicto y como resolverlo. Implementa ETags para detectar conflictos de concurrencia.',
    antiPattern:
      'No uses 409 para errores de validacion genericos — eso es 422. No devuelvas 400 cuando el problema es un conflicto de estado. No ignores conflictos de concurrencia en operaciones criticas — last-write-wins puede causar perdida de datos.',
    relatedCodes: [412, 422],
    headers: ['ETag', 'If-Match'],
  },
  {
    code: 410,
    title: 'Gone',
    mexicanContext: 'Ruta 100: Desaparecida para Siempre',
    category: 'client-error',
    description:
      'El recurso solicitado ya no esta disponible en el servidor y no se conoce una direccion de reenvio. Esta condicion es permanente. Los motores de busqueda deben eliminar el recurso de sus indices. A diferencia del 404, el 410 confirma que el recurso existio pero fue eliminado intencionalmente.',
    mexican:
      'Ruta 100 fue el sistema de autobuses publicos mas grande de la Ciudad de Mexico: 88 rutas, 3,600 autobuses, 22,000 trabajadores. En 1995, el gobierno de Ernesto Zedillo lo declaro en quiebra, encarcelo a su lider sindical y lo desaparecio de un dia para otro. Nunca fue reemplazado con algo equivalente. Los trabajadores perdieron sus empleos, sus ahorros, su jubilacion. Las rutas quedaron abandonadas. La ciudad perdio un sistema de transporte que movia a millones. Ruta 100 no es un 404 — no es que no la encuentres. Es un 410 Gone: existio, fue eliminada deliberadamente, y no hay direccion de reenvio. Desaparecida para siempre, como tantas cosas que Mexico decide borrar de su memoria.',
    examples: { ...emptyExamples },
    bestPractice:
      'Usa 410 cuando elimines recursos permanentemente para que los clientes y motores de busqueda lo sepan. Diferencia entre 404 (podria existir en el futuro) y 410 (existio y fue eliminado). Es importante para SEO: Google elimina paginas 410 de su indice mas rapido que las 404.',
    antiPattern:
      'No uses 404 cuando sabes que el recurso fue eliminado permanentemente — usa 410. No uses 410 si el recurso podria volver — usa 404. No olvides limpiar las referencias internas a recursos eliminados.',
    relatedCodes: [404],
    headers: [],
  },
  {
    code: 413,
    title: 'Content Too Large',
    mexicanContext: 'Colapso de la Linea 12 (Sobrecarga)',
    category: 'client-error',
    description:
      'El servidor se niega a procesar la solicitud porque el cuerpo de la peticion es mas grande de lo que el servidor esta dispuesto o es capaz de procesar. El servidor puede cerrar la conexion para prevenir que el cliente continue enviando datos. Si la condicion es temporal, el servidor puede incluir Retry-After.',
    mexican:
      'El 3 de mayo de 2021, un tramo elevado de la Linea 12 del Metro de la Ciudad de Mexico colapso mientras un tren pasaba sobre el. 26 personas murieron y mas de 80 resultaron heridas. Las investigaciones revelaron lo que muchos ya sabian: fallas de construccion, sobrecarga estructural, mantenimiento inexistente, y una inauguracion apresurada por razones politicas. La infraestructura no soporto mas de lo que debia cargar. Payload Too Large, literalmente. Un sistema que se construyo con deficiencias, se opero sin mantenimiento, y se sobrecargo hasta que la estructura cedió. Los 26 muertos pagaron con su vida un error que se pudo prevenir con un simple limite de capacidad.',
    examples: { ...emptyExamples },
    bestPractice:
      'Configura limites claros de tamano de payload en tu servidor (client_max_body_size en nginx, etc.). Devuelve 413 antes de intentar procesar el cuerpo completo. Incluye el header Retry-After si el limite es temporal. Documenta los limites de tamano en tu API.',
    antiPattern:
      'No aceptes payloads de tamano ilimitado — es un vector de ataque DoS. No dejes que el servidor se caiga por falta de memoria al intentar procesar archivos gigantes. No ignores los limites de tu infraestructura.',
    relatedCodes: [400, 429],
    headers: ['Retry-After', 'Content-Length'],
  },
  {
    code: 415,
    title: 'Unsupported Media Type',
    mexicanContext: 'CURP con Formato Obsoleto',
    category: 'client-error',
    description:
      'El servidor se niega a aceptar la solicitud porque el formato del payload no es un formato soportado. El problema puede estar en el Content-Type indicado, en el Content-Encoding, o en el formato real de los datos enviados. El cliente debe enviar los datos en un formato que el servidor pueda procesar.',
    mexican:
      'Llegas a la oficina del RENAPO a tramitar tu CURP y traes tu acta de nacimiento en formato viejo — la que tenia tu abuela guardada en un folder amarillo. "No la aceptamos asi, necesita ser el formato nuevo con codigo QR." Vas al registro civil, sacas la nueva, regresas. "Ahora necesita ser copia certificada, no copia simple." El sistema tiene requisitos estrictos de formato y los cambia sin avisar. Tu documento tiene la misma informacion, los mismos datos validos, pero el media type no es el que el servidor acepta hoy. Un 415 que obliga a millones de mexicanos a reformatear su vida cada vez que el sistema decide que el formato anterior ya no sirve.',
    examples: { ...emptyExamples },
    bestPractice:
      'Valida el Content-Type antes de intentar parsear el body. Devuelve 415 con un mensaje claro indicando que formatos si aceptas. Soporta multiples formatos cuando sea posible (JSON y form-data, por ejemplo). Documenta los Content-Types aceptados en tu API.',
    antiPattern:
      'No intentes parsear un body cuyo Content-Type no reconoces — es fuente de errores y vulnerabilidades. No devuelvas 400 cuando el problema especifico es el formato — usa 415. No cambies los formatos aceptados sin versionar tu API.',
    relatedCodes: [400, 406],
    headers: ['Content-Type', 'Accept'],
  },
  {
    code: 418,
    title: "I'm a Teapot",
    mexicanContext: 'La Olla de Tamales de Dona Mary',
    category: 'client-error',
    description:
      'Definido en RFC 2324 (Hyper Text Coffee Pot Control Protocol) como una broma del April Fools de 1998. Una tetera no puede preparar cafe porque es una tetera. Este codigo no debe ser implementado por servidores HTTP reales, pero se ha vuelto un icono de la cultura de internet y del humor en la programacion.',
    mexican:
      'Dona Mary lleva 30 años vendiendo tamales en la esquina de su colonia. Su olla vaporera es sagrada: tamales de verde, de rojo, de rajas con queso, de dulce. Llega alguien y le pide sushi. Dona Mary no te va a insultar, no te va a correr — simplemente no puede cumplir tu peticion porque no es lo que ella hace. Cada cosa tiene su funcion. No le pidas a una tamalera que haga sushi, no le pidas a una tetera que haga cafe, no le pidas a un endpoint de usuarios que procese pagos. Es el unico codigo ligero de HTTP Cobalto 60 — un recordatorio de que no todo tiene que ser tragedia. A veces, la respuesta correcta es simplemente: "Aqui no es, joven, pero le doy un tamal de verde mientras busca."',
    examples: { ...emptyExamples },
    bestPractice:
      'No lo implementes en produccion. Usalo como easter egg, endpoint de health check creativo, o para pruebas de manejo de errores. Si lo implementas por diversion, asegurate de que no interfiera con la funcionalidad real de tu API.',
    antiPattern:
      'No uses 418 como respuesta real a errores — confunde a los clientes y herramientas de monitoreo. No lo uses como excusa para no implementar funcionalidad real. No pierdas el sentido del humor, pero no lo lleves a produccion critica.',
    relatedCodes: [],
    headers: [],
  },
  {
    code: 422,
    title: 'Unprocessable Entity',
    mexicanContext: 'Declaracion Rechazada por el SAT',
    category: 'client-error',
    description:
      'El servidor entiende el tipo de contenido y la sintaxis de la solicitud es correcta, pero no puede procesar las instrucciones contenidas. Se usa tipicamente para errores de validacion semantica: los datos estan bien formados pero no cumplen con las reglas de negocio. Originalmente definido en WebDAV, ahora ampliamente adoptado en APIs REST.',
    mexican:
      'Llega abril y toca declarar impuestos ante el SAT. Entras a su plataforma (cuando funciona), llenas los campos, subes tus facturas, calculas deducciones. Todo en el formato correcto, todo en los campos correctos. Le das enviar y... rechazada. Los datos no cuadran. Tus ingresos no coinciden con lo que tus clientes facturaron. Tus deducciones exceden el limite. Tu RFC tiene una inconsistencia. El SAT entiende perfectamente tu declaracion — la sintaxis es correcta, el formato es correcto — pero semanticamente, los datos son invalidos. Y ahora tienes que corregir, reenviar, y rezar que el sistema no se caiga antes de la fecha limite. Un 422 con un body de errores que te dice exactamente que campos corregir.',
    examples: { ...emptyExamples },
    bestPractice:
      'Usa la estructura { errors: { campo: [mensajes] } } para devolver errores de validacion. Permite multiples errores por campo. Diferencia entre 400 (peticion malformada, no se puede parsear) y 422 (peticion bien formada pero datos invalidos). Los frameworks serios (Laravel, FastAPI, Rails) ya manejan este patron.',
    antiPattern:
      'No devuelvas 400 para errores de validacion — usa 422. No devuelvas un solo mensaje de error global cuando hay multiples campos invalidos. No envuelvas errores en { success: false, message: "Error de validacion" } — el 422 ya lo dice, y { errors } te da los detalles.',
    relatedCodes: [400, 409],
    headers: ['Content-Type'],
  },
  {
    code: 429,
    title: 'Too Many Requests',
    mexicanContext: 'Apagones de CFE',
    category: 'client-error',
    description:
      'El usuario ha enviado demasiadas solicitudes en un periodo de tiempo determinado (rate limiting). El servidor debe incluir el encabezado Retry-After indicando cuanto tiempo debe esperar el cliente antes de hacer una nueva solicitud. Es fundamental para proteger servicios de abuso y sobrecarga.',
    mexican:
      'Los apagones de la CFE (Comision Federal de Electricidad) son un clasico del verano mexicano. Cuando el calor supera los 45 grados en el norte del pais, millones de aires acondicionados se encienden al mismo tiempo y el sistema electrico colapsa. Demasiada demanda para la infraestructura disponible. En Monterrey, Hermosillo, Mexicali, los apagones duran horas en plena ola de calor — literalmente peligroso para la vida. La CFE no tiene capacidad para manejar la carga y el sistema se cae. Un 429 a escala nacional donde el Retry-After es "cuando baje el calor". Y el calor, con el cambio climatico, solo sube.',
    examples: { ...emptyExamples },
    bestPractice:
      'Implementa rate limiting por IP, por usuario o por API key. Siempre incluye el header Retry-After con el tiempo de espera. Usa headers como X-RateLimit-Limit, X-RateLimit-Remaining y X-RateLimit-Reset para informar al cliente. Implementa limites diferentes para endpoints criticos vs. consultas generales.',
    antiPattern:
      'No dejes tu API sin rate limiting — es una invitacion a ataques DDoS. No devuelvas 500 cuando el problema es exceso de solicitudes — el 429 le dice al cliente que baje el ritmo. No configures limites tan bajos que bloqueen uso legitimo.',
    relatedCodes: [503],
    headers: ['Retry-After', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  },
  {
    code: 451,
    title: 'Unavailable For Legal Reasons',
    mexicanContext: 'Periodistas Censurados',
    category: 'client-error',
    description:
      'El servidor niega el acceso al recurso como consecuencia de una demanda legal. Se nombro asi por la novela "Fahrenheit 451" de Ray Bradbury. Definido en RFC 7725, debe incluir una explicacion en el cuerpo de la respuesta y puede incluir el encabezado Link con la entidad que requirio el bloqueo.',
    mexican:
      'Mexico es el pais mas peligroso del mundo para ejercer el periodismo fuera de zonas de guerra. Desde el ano 2000, mas de 150 periodistas han sido asesinados y decenas mas han desaparecido. Pero la censura no siempre llega con balas — tambien llega con demandas legales, ordenes judiciales, presiones de gobernadores, amenazas de carteles, y el retiro de publicidad gubernamental. Reportajes sobre corrupcion que se bajan de sitios web. Investigaciones sobre narcotrafico que nunca se publican. Portales de noticias que cierran tras recibir "sugerencias". El 451 es el codigo de la censura legalizada, pero en Mexico la censura opera con y sin leyes, con y sin ordenes judiciales. Lo que no se puede silenciar con abogados, se silencia con plomo.',
    examples: { ...emptyExamples },
    bestPractice:
      'Incluye en el body la razon legal por la que el contenido no esta disponible. Usa el header Link para identificar la entidad legal que requirio el bloqueo. Se transparente sobre las restricciones — la oscuridad genera desconfianza. Diferencia entre contenido bloqueado por ley (451) y contenido prohibido por politica interna (403).',
    antiPattern:
      'No uses 403 cuando la razon del bloqueo es legal — usa 451 para ser transparente. No bloquees contenido sin explicar por que. No uses 451 para censurar contenido que simplemente no te conviene — la ley y la conveniencia son cosas diferentes.',
    relatedCodes: [403],
    headers: ['Link'],
  },

  // ===========================================================================
  // 5xx — ERROR DEL SERVIDOR
  // ===========================================================================
  {
    code: 500,
    title: 'Internal Server Error',
    mexicanContext: 'La Explosion de San Juanico (1984)',
    category: 'server-error',
    description:
      'El servidor encontro una condicion inesperada que le impidio cumplir con la solicitud. Es el error generico del servidor cuando ninguna condicion mas especifica aplica. Indica un fallo no previsto en la logica del servidor. No es culpa del cliente — el servidor fallo internamente.',
    mexican:
      'El 19 de noviembre de 1984, una serie de explosiones en la planta de almacenamiento de gas de PEMEX en San Juan Ixhuatepec (San Juanico) destruyo todo en un radio de un kilometro. Se estima que murieron entre 500 y 600 personas, aunque las cifras oficiales nunca fueron claras. Miles resultaron heridos con quemaduras graves. La causa: fugas de gas por infraestructura deteriorada, falta de mantenimiento, valvulas defectuosas, y un sistema de seguridad inexistente. Un fallo interno catastrofico provocado por negligencia sistematica. PEMEX sabia de los riesgos y no actuo. El gobierno permitio asentamientos humanos junto a instalaciones peligrosas. Nadie fue a la carcel. El 500 es eso: un error interno que nunca debio ocurrir, causado por negligencia en el servidor.',
    examples: { ...emptyExamples },
    bestPractice:
      'Nunca expongas stack traces, rutas de archivos o detalles internos al cliente — es una vulnerabilidad de seguridad. Devuelve un body generico como { error: "Error interno del servidor" }. Registra todos los 500 con detalle completo en tus logs para debugging. Implementa alertas automaticas para errores 500.',
    antiPattern:
      'No devuelvas 500 con el stack trace completo en produccion. No uses 500 como catch-all para errores que tienen codigos mas especificos (400, 404, 422). No normalices los 500 — cada uno es un bug que debe investigarse y corregirse.',
    relatedCodes: [502, 503],
    headers: [],
  },
  {
    code: 501,
    title: 'Not Implemented',
    mexicanContext: 'Sistema de Salud Universal',
    category: 'server-error',
    description:
      'El servidor no reconoce el metodo de la solicitud o carece de la capacidad para cumplirla. Implica que el servidor podria soportar el metodo en el futuro. A diferencia de 405 Method Not Allowed (que indica que el metodo existe pero no se permite), 501 indica que el servidor simplemente no tiene la funcionalidad implementada.',
    mexican:
      'Cada sexenio, cada presidente de Mexico promete un sistema de salud universal. Fox lo intento con el Seguro Popular. Pena Nieto lo "fortalecio". Lopez Obrador lo desaparecio y creo el INSABI, que despues se convirtio en IMSS-Bienestar. La promesa es la misma: cobertura medica gratuita y de calidad para todos los mexicanos. La realidad es la misma: hospitales sin medicinas, sin doctores, sin equipo. El endpoint existe en la documentacion (la Constitucion), la ruta esta definida (el derecho a la salud), pero la funcionalidad nunca se ha implementado realmente. Not Implemented. Prometido en cada version, nunca desplegado en produccion. Y la gente sigue muriendo esperando una feature que solo existe en el roadmap.',
    examples: { ...emptyExamples },
    bestPractice:
      'Usa 501 cuando un metodo HTTP no esta soportado por tu servidor (no por tu endpoint — eso es 405). Comunmente se usa para metodos como TRACE o CONNECT que tu servidor no implementa. Devuelve informacion sobre cuando podria estar disponible la funcionalidad si aplica.',
    antiPattern:
      'No confundas 501 con 405: 501 es "el servidor no sabe hacer esto", 405 es "el servidor sabe pero no lo permite aqui". No uses 501 como excusa para endpoints incompletos en produccion — si no esta listo, no lo expongas.',
    relatedCodes: [405],
    headers: [],
  },
  {
    code: 502,
    title: 'Bad Gateway',
    mexicanContext: 'El Huachicol',
    category: 'server-error',
    description:
      'El servidor, actuando como gateway o proxy, recibio una respuesta invalida del servidor upstream al que intento acceder para cumplir la solicitud. El problema no esta en el servidor que responde al cliente, sino en el servidor intermedio que fallo al comunicarse con el origen.',
    mexican:
      'El huachicol — el robo de gasolina mediante tomas clandestinas en los ductos de PEMEX — es la corrupcion del intermediario en su forma mas literal. La gasolina sale de la refineria con una calidad determinada. Pasa por ductos, es "ordeñada" por huachicoleros, adulterada, redistribuida. Cuando llega a tu tanque, puede estar mezclada con agua, solventes, o simplemente no llegar. El intermediario (gateway) corrupto la respuesta del servidor original. Y el cliente final (tu carro) recibe un producto que no es lo que el origen envio, o no recibe nada. PEMEX pierde miles de millones de pesos al ano por esta "mala respuesta del gateway". El huachicol no es solo un crimen — es un 502 industrial que costó vidas cuando el gobierno intento combatirlo cortando ductos y provoco escasez nacional.',
    examples: { ...emptyExamples },
    bestPractice:
      'Implementa health checks para detectar servidores upstream caidos. Usa circuit breakers para dejar de enviar peticiones a servicios que estan fallando. Configura timeouts apropiados en tu proxy/gateway. Devuelve un mensaje claro al cliente indicando que el problema es temporal.',
    antiPattern:
      'No expongas detalles del error upstream al cliente — no necesita saber que tu microservicio de pagos se cayo. No reintentes infinitamente hacia un upstream muerto — implementa backoff exponencial. No confundas 502 con 500 — el 502 indica que el problema es un servicio externo.',
    relatedCodes: [500, 503, 504],
    headers: ['Retry-After'],
  },
  {
    code: 503,
    title: 'Service Unavailable',
    mexicanContext: 'Hospital Sin Medicinas',
    category: 'server-error',
    description:
      'El servidor no puede manejar la solicitud actualmente debido a sobrecarga temporal o mantenimiento. Implica que es una condicion temporal y el servicio se restaurara en algun momento. El servidor debe enviar el encabezado Retry-After indicando cuando el cliente puede intentar de nuevo.',
    mexican:
      '"No hay." Dos palabras que resumen la crisis del sistema de salud mexicano. Llegas al hospital publico con una emergencia y el servicio existe — hay paredes, hay techo, hay un letrero que dice "Hospital General". Pero no hay gasas, no hay anestesia, no hay quimioterapia, no hay insulina, no hay antibioticos. Los doctores estan ahi pero no tienen con que trabajar. Las enfermeras estan ahi pero no hay insumos. El servicio esta registrado, la infraestructura esta en pie, pero no tiene los recursos para funcionar. Un 503 permanente disfrazado de temporal: "vuelva manana", "vaya a la farmacia de enfrente", "traiga sus propios materiales". El Retry-After en el sistema de salud mexicano es indefinido.',
    examples: { ...emptyExamples },
    bestPractice:
      'Siempre incluye el header Retry-After con una estimacion realista. Devuelve una pagina de mantenimiento informativa, no un error crudo. Implementa health checks que detecten cuando el servicio se recupera. Usa 503 durante deploys y mantenimiento programado.',
    antiPattern:
      'No devuelvas 500 cuando el problema es temporal — usa 503 con Retry-After. No dejes tu servicio en 503 permanente sin comunicar al equipo. No olvides el header Retry-After — sin el, el cliente no sabe cuando reintentar.',
    relatedCodes: [500, 429],
    headers: ['Retry-After'],
  },
  {
    code: 504,
    title: 'Gateway Timeout',
    mexicanContext: 'Llamar a Locatel',
    category: 'server-error',
    description:
      'El servidor, actuando como gateway o proxy, no recibio una respuesta a tiempo del servidor upstream necesario para completar la solicitud. A diferencia del 408, donde el cliente es lento, en el 504 es el servidor upstream el que no responde dentro del tiempo configurado en el gateway.',
    mexican:
      'Locatel fue durante decadas el servicio telefonico de atencion ciudadana de la Ciudad de Mexico. Marcabas, esperabas, te transferian, esperabas mas, te transferian de nuevo, y eventualmente la llamada se cortaba o el sistema te mandaba de vuelta al menu principal. El intermediario (Locatel) intentaba conectarte con la dependencia que necesitabas, pero la dependencia simplemente no contestaba. El gateway hacia su trabajo — recibia tu solicitud y la reenviaba — pero el servidor upstream (la oficina de gobierno) nunca respondía a tiempo. Timeout. Y tu, del otro lado de la linea, con tu problema sin resolver. Locatel es el load balancer que todos necesitamos pero que nadie mantiene.',
    examples: { ...emptyExamples },
    bestPractice:
      'Configura timeouts realistas en tu gateway/proxy basados en el comportamiento normal de tus servicios upstream. Implementa circuit breakers para servicios que fallan recurrentemente. Diferencia entre 504 (timeout del upstream) y 408 (timeout del cliente). Registra y alerta sobre 504 frecuentes.',
    antiPattern:
      'No configures timeouts del gateway mas altos que lo que el usuario esta dispuesto a esperar. No confundas 504 con 408 — el 504 es problema del upstream, el 408 es problema del cliente. No reintentes indefinidamente hacia un upstream lento.',
    relatedCodes: [408, 502],
    headers: ['Retry-After'],
  },
  {
    code: 507,
    title: 'Insufficient Storage',
    mexicanContext: 'Presas Desbordadas en Tabasco',
    category: 'server-error',
    description:
      'El servidor no puede almacenar la representacion necesaria para completar la solicitud. Originalmente definido en WebDAV (RFC 4918), indica que el servidor ha agotado su capacidad de almacenamiento. El cliente no puede hacer nada al respecto — es una condicion del servidor.',
    mexican:
      'Tabasco, 2007, 2020. Cuando las lluvias exceden la capacidad de las presas — Penitas, Malpaso, Angostura — no hay opcion: hay que abrir las compuertas. El agua que el sistema no puede almacenar se desborda e inunda todo a su paso. Colonias enteras bajo el agua, familias en los techos, cosechas perdidas, ganado ahogado. En 2020, Tabasco vivio las peores inundaciones de su historia moderna: mas de 175 mil viviendas afectadas, miles de damnificados. El sistema de almacenamiento (las presas) no dio abasto. Insufficient Storage en su expresion mas devastadora. Y lo peor es que es predecible: cada temporada de lluvias, el mismo codigo de error, la misma respuesta insuficiente.',
    examples: { ...emptyExamples },
    bestPractice:
      'Monitorea constantemente el almacenamiento disponible de tus servidores. Implementa alertas antes de llegar al limite. Configura rotacion de logs y limpieza de archivos temporales. Devuelve 507 con un mensaje claro y notifica al equipo de operaciones inmediatamente.',
    antiPattern:
      'No esperes a que el disco se llene para actuar — monitorea proactivamente. No devuelvas 500 cuando el problema especifico es almacenamiento — usa 507. No ignores 507 recurrentes — es una bomba de tiempo.',
    relatedCodes: [500, 413],
    headers: [],
  },
  {
    code: 508,
    title: 'Loop Detected',
    mexicanContext: 'El Tramite Infinito CURP-INE',
    category: 'server-error',
    description:
      'El servidor detecto un ciclo infinito al procesar la solicitud. Definido en WebDAV (RFC 5842), indica que la operacion fallo porque el servidor encontro una referencia circular que resultaria en un procesamiento infinito. El servidor termina la operacion para evitar consumir recursos indefinidamente.',
    mexican:
      'Para tramitar tu INE necesitas tu CURP. Para tramitar tu CURP necesitas tu acta de nacimiento. Para corregir tu acta de nacimiento necesitas tu INE. Loop detectado. Este ciclo infernal de la burocracia mexicana atrapa a millones de personas que, por un error en un documento, quedan varadas en un circuito sin salida. "Vaya al registro civil." "No puedo, necesito mi INE." "Para la INE necesita su CURP corregida." "Para la CURP necesita su acta." "Para el acta necesita su INE." El sistema no tiene un break condition, no tiene una excepcion que resuelva el loop. Y mientras el ciudadano rebota de oficina en oficina, su identidad legal queda en limbo. Un loop infinito que el servidor burocratico detecta pero no sabe resolver.',
    examples: { ...emptyExamples },
    bestPractice:
      'Implementa deteccion de ciclos en cualquier operacion que siga referencias o redirecciones. Establece un limite maximo de profundidad/iteraciones. Registra el punto donde se detecto el loop para facilitar debugging. Devuelve informacion util sobre donde se rompio el ciclo.',
    antiPattern:
      'No dejes que tu servidor siga ciclos indefinidamente — consumira recursos hasta morir. No confundas 508 con 500 — el loop detectado es un diagnostico mas preciso. No diseñes sistemas con dependencias circulares.',
    relatedCodes: [500],
    headers: [],
  },
  {
    code: 511,
    title: 'Network Authentication Required',
    mexicanContext: 'WiFi del Aeropuerto: Paga Primero',
    category: 'server-error',
    description:
      'El cliente necesita autenticarse para obtener acceso a la red. Definido en RFC 6585, es generado por proxies intermedios (no por el servidor origen) para indicar que se necesita autenticacion a nivel de red, tipicamente en portales cautivos de WiFi. No debe confundirse con 401, que es autenticacion a nivel de aplicacion.',
    mexican:
      'Llegas al Aeropuerto Internacional de la Ciudad de Mexico, cansado, con urgencia de enviar un correo o hacer una llamada por internet. Tu dispositivo detecta la red WiFi — esta disponible, la senal es fuerte, te conectas. Pero no puedes navegar. Un portal cautivo te intercepta: "Ingrese su numero de vuelo y pague $150 por 2 horas de acceso." O en la terminal nueva: "Vea este anuncio de 30 segundos." La red esta ahi, la infraestructura funciona, pero hay un intermediario que te bloquea hasta que te autentiques o pagues. No es el servidor al que quieres llegar el que te niega acceso — es la red misma. Un peaje digital en un aeropuerto que ya te cobro estacionamiento, comida al triple de precio y un cafe a 80 pesos.',
    examples: { ...emptyExamples },
    bestPractice:
      'Usa 511 solo en proxies de red que requieren autenticacion (portales cautivos). El cuerpo debe contener una pagina HTML con un enlace a donde el usuario puede autenticarse. No lo uses a nivel de aplicacion — para eso existe 401. Asegurate de no cachear respuestas 511.',
    antiPattern:
      'No confundas 511 con 401 — el 511 es autenticacion de red, el 401 es autenticacion de aplicacion. No uses 511 en tu API REST — es exclusivo para intermediarios de red. No cachees respuestas 511 — la condicion cambia cuando el usuario se autentica.',
    relatedCodes: [401, 407],
    headers: [],
  },
];

// =============================================================================
// Poblar ejemplos de código desde los archivos de cada lenguaje
// =============================================================================
codes.forEach((code) => {
  code.examples = getExamples(code.code);
});

// =============================================================================
// FUNCIONES AUXILIARES
// =============================================================================

/**
 * Obtiene un codigo HTTP por su numero.
 * Retorna undefined si el codigo no existe en el catalogo.
 */
export function getCodeByNumber(code: number): HTTPCode | undefined {
  return codes.find((c) => c.code === code);
}

/**
 * Obtiene todos los codigos HTTP de una categoria especifica.
 * Retorna un array vacio si la categoria no tiene codigos.
 */
export function getCodesByCategory(category: HTTPCode['category']): HTTPCode[] {
  return codes.filter((c) => c.category === category);
}
