// Ejemplos de código HTTP en JavaScript (Express.js / Node.js)
// Todos los comentarios en español
// Filosofía HTTP: el código de estado ES el mensaje. Sin envolturas innecesarias.

export const javascriptExamples: Record<number, string> = {
  // ─── 1xx Informativos ───

  100: `// 100 Continue — La Espera en el IMSS
// El servidor indica al cliente que puede continuar enviando el cuerpo
app.post('/api/archivos/subir', (req, res) => {
  const tamano = parseInt(req.headers['content-length'] || '0');
  const limite = 50 * 1024 * 1024; // 50MB

  if (tamano > limite) {
    // Rechazar antes de que envíe todo el archivo
    return res.status(413).end();
  }

  // Indicar al cliente que puede continuar
  res.writeContinue();

  // Procesar el cuerpo cuando llegue
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    const archivo = Buffer.concat(chunks);
    guardarArchivo(archivo);
    res.status(201).json({ id: generarId(), tamano: archivo.length });
  });
});`,

  101: `// 101 Switching Protocols — Cambio de Mando Presidencial
// Upgrade de HTTP a WebSocket
const WebSocket = require('ws');
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// El servidor acepta cambiar de protocolo
wss.on('connection', (ws, req) => {
  // La conexión ya cambió de HTTP a WebSocket
  // El handshake respondió 101 automáticamente
  console.log('Protocolo cambiado: HTTP → WebSocket');

  ws.on('message', (mensaje) => {
    // Reenviar a todos los conectados
    wss.clients.forEach((cliente) => {
      if (cliente.readyState === WebSocket.OPEN) {
        cliente.send(mensaje);
      }
    });
  });

  ws.send(JSON.stringify({ evento: 'conectado' }));
});`,

  102: `// 102 Processing — Trámite en la SEP
// Indica que la solicitud se recibió y se está procesando (WebDAV)
app.post('/api/reportes/generar', async (req, res) => {
  const { tipo, fechaInicio, fechaFin } = req.body;

  // Enviar 102 para indicar que estamos procesando
  // Evita que el cliente asuma timeout
  res.writeHead(102);
  res.flushHeaders();

  try {
    // Proceso largo: generar reporte con miles de registros
    const datos = await obtenerDatos(tipo, fechaInicio, fechaFin);
    const reporte = await generarReporte(datos);
    const url = await subirReporte(reporte);

    res.writeHead(201, { 'Location': url });
    res.end(JSON.stringify({ id: reporte.id, url }));
  } catch (error) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Error al generar el reporte' }));
  }
});`,

  103: `// 103 Early Hints — La Alerta Sísmica
// Envía hints al navegador antes de la respuesta final
app.get('/app', (req, res) => {
  // Enviar hints tempranos para que el navegador precargue recursos
  // Como la alerta sísmica: información anticipada que salva tiempo
  res.writeEarlyHints({
    link: [
      '</css/main.css>; rel=preload; as=style',
      '</js/app.js>; rel=preload; as=script',
      '</fonts/bebas-neue.woff2>; rel=preload; as=font; crossorigin',
    ],
  });

  // Mientras tanto, preparar la respuesta completa
  const html = renderizarPagina();
  res.status(200)
    .set('Content-Type', 'text/html')
    .send(html);
});`,

  // ─── 2xx Éxito ───

  200: `// 200 OK — El Maíz Llegó a la Milpa
// Devolver datos directamente. Sin envolturas.
app.get('/api/productos', async (req, res) => {
  const { categoria, pagina = 1, limite = 20 } = req.query;
  const offset = (pagina - 1) * limite;

  const productos = await Producto.findAll({
    where: categoria ? { categoria } : {},
    limit: parseInt(limite),
    offset,
    order: [['created_at', 'DESC']],
  });

  // El 200 ya dice que todo salió bien
  // Solo devuelve los datos, nada más
  res.json(productos);
});`,

  201: `// 201 Created — Fundación de Tenochtitlan
// Recurso creado: devolver el recurso + Location header
app.post('/api/proyectos', async (req, res) => {
  const { nombre, descripcion, responsable } = req.body;

  const proyecto = await Proyecto.create({
    nombre,
    descripcion,
    responsable,
    estado: 'activo',
    creado_en: new Date(),
  });

  // 201 + Location + el recurso creado
  res.status(201)
    .header('Location', \`/api/proyectos/\${proyecto.id}\`)
    .json(proyecto);
});`,

  202: `// 202 Accepted — "Ya Quedó, Jefe"
// Solicitud aceptada pero procesamiento pendiente
app.post('/api/exportaciones', async (req, res) => {
  const { formato, filtros } = req.body;

  // Crear tarea en cola de procesamiento
  const tarea = await Cola.agregar({
    tipo: 'exportacion',
    formato,
    filtros,
    estado: 'pendiente',
    solicitado_en: new Date(),
  });

  // Aceptamos la solicitud, pero no está lista
  // Como el albañil: "ya quedó" pero quién sabe cuándo
  res.status(202)
    .header('Location', \`/api/tareas/\${tarea.id}\`)
    .json({ tarea_id: tarea.id, estado: 'pendiente' });
});`,

  204: `// 204 No Content — Presa Vacía en Sequía
// Operación exitosa, sin cuerpo en la respuesta
app.delete('/api/sesiones/:id', async (req, res) => {
  const sesion = await Sesion.findByPk(req.params.id);

  if (!sesion) {
    return res.status(404).end();
  }

  // Verificar que la sesión pertenece al usuario autenticado
  if (sesion.usuario_id !== req.usuario.id) {
    return res.status(403).end();
  }

  await sesion.destroy();

  // 204: operación exitosa, nada que devolver
  // El silencio es la respuesta
  res.status(204).end();
});`,

  206: `// 206 Partial Content — Reconstrucción Post-Sismo 2017
// Devolver solo una porción del recurso solicitado
app.get('/api/archivos/:id/contenido', async (req, res) => {
  const archivo = await Archivo.findByPk(req.params.id);
  if (!archivo) return res.status(404).end();

  const rango = req.headers.range;
  if (!rango) {
    return res.status(200).sendFile(archivo.ruta);
  }

  // Parsear el rango solicitado: bytes=inicio-fin
  const [inicio, fin] = rango.replace('bytes=', '').split('-').map(Number);
  const finReal = fin || archivo.tamano - 1;
  const tamanoChunk = finReal - inicio + 1;

  res.status(206)
    .set({
      'Content-Range': \`bytes \${inicio}-\${finReal}/\${archivo.tamano}\`,
      'Accept-Ranges': 'bytes',
      'Content-Length': tamanoChunk,
      'Content-Type': archivo.tipo_mime,
    })
    .send(archivo.leerRango(inicio, finReal));
});`,

  // ─── 3xx Redirección ───

  301: `// 301 Moved Permanently — El Aeropuerto de Texcoco Cancelado
// Redirección permanente: el recurso cambió de ubicación para siempre
app.get('/api/v1/usuarios', (req, res) => {
  // La API v1 fue deprecada permanentemente
  // Redirigir a v2, como Texcoco fue redirigido a Felipe Ángeles
  res.redirect(301, '/api/v2/usuarios');
});

// También para rutas legacy del sitio
app.get('/perfil/:id', (req, res) => {
  // Ruta vieja que ya no existe
  // Los motores de búsqueda actualizarán sus índices
  res.redirect(301, \`/usuarios/\${req.params.id}\`);
});`,

  302: `// 302 Found (Redirect Temporal) — Desvío por el Socavón de Puebla
// Redirección temporal: el recurso está en otro lugar por ahora
app.get('/api/configuracion', async (req, res) => {
  const mantenimiento = await verificarMantenimiento();

  if (mantenimiento.activo) {
    // Desvío temporal mientras dura el mantenimiento
    // Como el socavón: "use la otra ruta mientras tanto"
    return res.redirect(302, '/api/configuracion/cache');
  }

  const config = await Configuracion.obtener();
  res.json(config);
});`,

  303: `// 303 See Other — "Vaya a la Ventanilla 7"
// Después de un POST, redirigir a otro recurso con GET
app.post('/api/pedidos', async (req, res) => {
  const { productos, direccion } = req.body;

  const pedido = await Pedido.crear({
    productos,
    direccion,
    estado: 'procesando',
  });

  // Después de crear el pedido, redirigir al recibo
  // El cliente debe hacer GET al nuevo recurso
  // Como la burocracia: "su trámite se registró, pase a ventanilla 7"
  res.redirect(303, \`/api/pedidos/\${pedido.id}/recibo\`);
});`,

  304: `// 304 Not Modified — Las Reformas que No Cambian Nada
// El recurso no ha cambiado desde la última vez
app.get('/api/catalogo', async (req, res) => {
  const ultimaModificacion = await Catalogo.ultimaActualizacion();
  const etag = generarETag(ultimaModificacion);

  // Verificar si el cliente ya tiene la versión actual
  if (req.headers['if-none-match'] === etag) {
    // Nada cambió. Como siempre.
    return res.status(304).end();
  }

  const catalogo = await Catalogo.obtenerTodo();
  res.set({
    'ETag': etag,
    'Last-Modified': ultimaModificacion.toUTCString(),
    'Cache-Control': 'max-age=3600',
  }).json(catalogo);
});`,

  307: `// 307 Temporary Redirect — Bloqueo en Reforma por Manifestación
// Redirección temporal que PRESERVA el método HTTP original
app.all('/api/pagos', async (req, res) => {
  const pasarelaDisponible = await verificarPasarela();

  if (!pasarelaDisponible) {
    // Redirigir temporalmente a pasarela de respaldo
    // A diferencia del 302, el 307 mantiene el método (POST sigue siendo POST)
    // Como la manifestación: desvío temporal, mismo destino
    return res.redirect(307, 'https://respaldo.pagos.mx/api/pagos');
  }

  // Procesar pago normalmente
  const resultado = await procesarPago(req.body);
  res.status(200).json(resultado);
});`,

  308: `// 308 Permanent Redirect — De DF a CDMX
// Redirección permanente que PRESERVA el método HTTP
app.all('/api/distrito-federal/*', (req, res) => {
  // El recurso cambió permanentemente de ubicación
  // Como el DF → CDMX: el nombre cambió para siempre
  // A diferencia del 301, el 308 preserva el método original
  const nuevaRuta = req.originalUrl.replace(
    '/api/distrito-federal',
    '/api/cdmx'
  );

  res.redirect(308, nuevaRuta);
});`,

  // ─── 4xx Error del Cliente ───

  400: `// 400 Bad Request — Pedir Ketchup en la Taquería
// La petición está malformada o es inválida
app.post('/api/transferencias', async (req, res) => {
  const { cuenta_origen, cuenta_destino, monto } = req.body;

  // Validar que la petición tenga sentido básico
  if (!cuenta_origen || !cuenta_destino || !monto) {
    return res.status(400).json({
      error: 'Faltan campos requeridos en la solicitud',
    });
  }

  if (typeof monto !== 'number' || monto <= 0) {
    return res.status(400).json({
      error: 'El monto debe ser un número positivo',
    });
  }

  const transferencia = await ejecutarTransferencia(req.body);
  res.status(201)
    .header('Location', \`/api/transferencias/\${transferencia.id}\`)
    .json(transferencia);
});`,

  401: `// 401 Unauthorized — Colonia Cerrada con Plumas
// No autenticado: no sabemos quién eres
app.get('/api/expediente', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    // Sin credenciales. No pasas.
    return res.status(401)
      .set('WWW-Authenticate', 'Bearer realm="api"')
      .json({ error: 'Token de autenticación requerido' });
  }

  try {
    const usuario = await verificarToken(token);
    req.usuario = usuario;
  } catch (e) {
    // Token inválido o expirado
    return res.status(401)
      .set('WWW-Authenticate', 'Bearer realm="api", error="invalid_token"')
      .json({ error: 'Token inválido o expirado' });
  }

  const expediente = await Expediente.findByUsuario(req.usuario.id);
  res.json(expediente);
});`,

  402: `// 402 Payment Required — La Mordida
// Pago requerido para acceder al recurso
app.get('/api/reportes/premium/:id', async (req, res) => {
  const usuario = req.usuario;
  const suscripcion = await Suscripcion.findByUsuario(usuario.id);

  if (!suscripcion || suscripcion.estado !== 'activa') {
    // Sin pago, sin acceso. Así funciona.
    return res.status(402).json({
      error: 'Se requiere suscripción activa para acceder a reportes premium',
    });
  }

  if (suscripcion.tipo === 'basica' && req.params.id.startsWith('avanzado')) {
    return res.status(402).json({
      error: 'Este reporte requiere suscripción avanzada',
    });
  }

  const reporte = await Reporte.generar(req.params.id);
  res.json(reporte);
});`,

  403: `// 403 Forbidden — Campo Militar No. 1
// Autenticado pero sin permisos. Prohibido. Punto.
app.delete('/api/usuarios/:id', async (req, res) => {
  const usuarioSolicitante = req.usuario;

  // Solo administradores pueden eliminar usuarios
  if (usuarioSolicitante.rol !== 'admin') {
    // Sabemos quién eres, pero no tienes permiso
    return res.status(403).json({
      error: 'No tienes permisos para realizar esta acción',
    });
  }

  // No permitir auto-eliminación
  if (req.params.id === usuarioSolicitante.id) {
    return res.status(403).json({
      error: 'No puedes eliminar tu propia cuenta',
    });
  }

  await Usuario.destroy({ where: { id: req.params.id } });
  res.status(204).end();
});`,

  404: `// 404 Not Found — Los 43 de Ayotzinapa
// El recurso no existe. Buscado. No encontrado.
app.get('/api/expedientes/:folio', async (req, res) => {
  const expediente = await Expediente.findOne({
    where: { folio: req.params.folio },
  });

  if (!expediente) {
    // No existe. El 404 lo dice todo.
    return res.status(404).json({
      error: 'Expediente no encontrado',
    });
  }

  res.json(expediente);
});`,

  405: `// 405 Method Not Allowed — Protesta Reprimida en Atenco
// El método HTTP no está permitido en esta ruta
app.get('/api/reportes/incidencias', async (req, res) => {
  const reportes = await Reporte.findAll({ tipo: 'incidencia' });
  res.json(reportes);
});

// Manejar métodos no permitidos explícitamente
app.all('/api/reportes/incidencias', (req, res) => {
  // Solo GET está permitido en esta ruta
  // Cualquier otro método es rechazado
  res.status(405)
    .set('Allow', 'GET')
    .json({ error: 'Método no permitido. Solo se acepta GET.' });
});`,

  406: `// 406 Not Acceptable — Leche Adulterada
// El servidor no puede producir el formato que el cliente pide
app.get('/api/datos/exportar', async (req, res) => {
  const formatosPermitidos = ['application/json', 'text/csv'];
  const aceptado = req.accepts(formatosPermitidos);

  if (!aceptado) {
    // No podemos entregar en el formato que pides
    return res.status(406).json({
      error: 'Formato no soportado',
      formatos_disponibles: formatosPermitidos,
    });
  }

  const datos = await Datos.exportar();

  if (aceptado === 'text/csv') {
    return res.type('text/csv').send(convertirACSV(datos));
  }

  res.json(datos);
});`,

  408: `// 408 Request Timeout — Justicia que Prescribe
// El servidor se cansó de esperar la solicitud completa
const timeout = require('connect-timeout');

app.use('/api/subidas', timeout('30s'));

app.post('/api/subidas', (req, res) => {
  if (req.timedout) return;

  const chunks = [];
  req.on('data', (chunk) => {
    if (req.timedout) return;
    chunks.push(chunk);
  });

  req.on('end', () => {
    if (req.timedout) return;
    const archivo = Buffer.concat(chunks);
    guardarArchivo(archivo);
    res.status(201).json({ tamano: archivo.length });
  });

  req.on('timeout', () => {
    // El tiempo expiró. Como los casos que prescriben.
    res.status(408).json({ error: 'Tiempo de espera agotado' });
  });
});`,

  409: `// 409 Conflict — Disputa Territorial del Narco
// Conflicto con el estado actual del recurso
app.put('/api/inventario/:sku', async (req, res) => {
  const { cantidad, version } = req.body;
  const producto = await Inventario.findByPk(req.params.sku);

  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  // Verificar que no haya conflicto de versiones (optimistic locking)
  if (producto.version !== version) {
    // Otro proceso ya modificó este recurso
    // Dos escrituras sobre el mismo territorio: conflicto
    return res.status(409).json({
      error: 'El recurso fue modificado por otro proceso',
      version_actual: producto.version,
    });
  }

  producto.cantidad = cantidad;
  producto.version += 1;
  await producto.save();
  res.json(producto);
});`,

  410: `// 410 Gone — Ruta 100: Desaparecida para Siempre
// El recurso existió pero fue eliminado permanentemente
app.get('/api/servicios/ruta-100', (req, res) => {
  // Este recurso ya no existe y no volverá
  // A diferencia del 404, aquí confirmamos que SÍ existió
  res.status(410).json({
    error: 'Este servicio fue descontinuado permanentemente',
  });
});

// Útil para endpoints deprecados
app.all('/api/v1/*', (req, res) => {
  res.status(410)
    .set('Sunset', 'Sat, 01 Jan 2025 00:00:00 GMT')
    .json({
      error: 'API v1 fue eliminada. Migre a /api/v3/',
    });
});`,

  413: `// 413 Payload Too Large — Colapso de la Línea 12
// El cuerpo de la solicitud excede el límite permitido
const express = require('express');

// Configurar límite global
app.use(express.json({ limit: '1mb' }));

app.post('/api/documentos', async (req, res) => {
  const tamano = parseInt(req.headers['content-length'] || '0');
  const limiteBytes = 10 * 1024 * 1024; // 10MB

  if (tamano > limiteBytes) {
    // Sobrecarga. La infraestructura no soporta más.
    return res.status(413)
      .set('Retry-After', '3600')
      .json({
        error: 'El archivo excede el tamaño máximo permitido (10MB)',
      });
  }

  const documento = await Documento.guardar(req.body);
  res.status(201)
    .header('Location', \`/api/documentos/\${documento.id}\`)
    .json(documento);
});`,

  415: `// 415 Unsupported Media Type — CURP con Formato Obsoleto
// El formato del contenido no es soportado
app.post('/api/documentos/importar', (req, res) => {
  const tipoContenido = req.headers['content-type'];
  const tiposPermitidos = [
    'application/json',
    'application/xml',
    'text/csv',
  ];

  if (!tiposPermitidos.includes(tipoContenido)) {
    // Formato no soportado. Actualice su sistema.
    return res.status(415).json({
      error: 'Tipo de contenido no soportado',
      tipos_aceptados: tiposPermitidos,
    });
  }

  // Procesar según el tipo
  const procesador = obtenerProcesador(tipoContenido);
  const datos = procesador.parsear(req.body);
  res.status(200).json(datos);
});`,

  418: `// 418 I'm a Teapot — La Olla de Tamales de Doña Mary
// Cada cosa tiene su función. No le pidas café a la tetera.
app.get('/api/cafeteria/cafe', (req, res) => {
  // RFC 2324 - Hyper Text Coffee Pot Control Protocol
  // Soy una tetera. No hago café.
  // Como Doña Mary: no le pidas sushi a la tamalera.
  res.status(418).json({
    error: 'Soy una tetera. No preparo café.',
    sugerencia: 'Pruebe con /api/cafeteria/te',
  });
});

// El único código "ligero" del proyecto
app.get('/api/tamales', (req, res) => {
  res.json([
    { tipo: 'verde', precio: 15 },
    { tipo: 'rojo', precio: 15 },
    { tipo: 'rajas', precio: 18 },
  ]);
});`,

  422: `// 422 Unprocessable Entity — Declaración Rechazada por el SAT
// La sintaxis es correcta pero los datos no son procesables
app.post('/api/usuarios', async (req, res) => {
  const errores = {};

  // Validar cada campo
  if (!req.body.email || !req.body.email.includes('@')) {
    errores.email = ['El email es obligatorio y debe ser válido'];
  } else if (await Usuario.existeEmail(req.body.email)) {
    errores.email = ['El email ya está registrado'];
  }

  if (!req.body.nombre || req.body.nombre.length < 3) {
    errores.nombre = ['El nombre es obligatorio', 'Mínimo 3 caracteres'];
  }

  if (Object.keys(errores).length > 0) {
    // Entendemos la petición, pero los datos no cuadran
    return res.status(422).json({ errors: errores });
  }

  const usuario = await Usuario.create(req.body);
  res.status(201)
    .header('Location', \`/api/usuarios/\${usuario.id}\`)
    .json(usuario);
});`,

  429: `// 429 Too Many Requests — Apagones de CFE
// Demasiadas solicitudes. El sistema está sobrecargado.
const rateLimit = require('express-rate-limit');

const limitador = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 peticiones por ventana
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    // Sobrecarga. Demasiada demanda. Se cae todo.
    res.status(429)
      .set('Retry-After', '900')
      .json({
        error: 'Demasiadas solicitudes. Intente más tarde.',
      });
  },
});

app.use('/api/', limitador);`,

  451: `// 451 Unavailable For Legal Reasons — Periodistas Censurados
// Contenido no disponible por razones legales
app.get('/api/publicaciones/:id', async (req, res) => {
  const publicacion = await Publicacion.findByPk(req.params.id);

  if (!publicacion) {
    return res.status(404).json({ error: 'Publicación no encontrada' });
  }

  if (publicacion.bloqueada_legalmente) {
    // Censurado. Bloqueado por orden legal.
    return res.status(451)
      .set('Link', '<https://ejemplo.mx/orden-judicial/12345>; rel="blocked-by"')
      .json({
        error: 'Contenido no disponible por orden judicial',
      });
  }

  res.json(publicacion);
});`,

  // ─── 5xx Error del Servidor ───

  500: `// 500 Internal Server Error — La Explosión de San Juanico
// Fallo interno catastrófico. Nunca exponer detalles al cliente.
app.get('/api/dashboard', async (req, res) => {
  try {
    const [ventas, usuarios, metricas] = await Promise.all([
      Venta.resumen(),
      Usuario.conteo(),
      Metrica.calcular(),
    ]);

    res.json({ ventas, usuarios, metricas });
  } catch (error) {
    // Registrar internamente TODO el detalle
    console.error('Error catastrófico en dashboard:', error);
    registrarError(error, req);

    // Al cliente: NUNCA el stack trace. Solo el mínimo.
    res.status(500).json({
      error: 'Error interno del servidor',
    });
  }
});`,

  501: `// 501 Not Implemented — Sistema de Salud Universal
// Funcionalidad reconocida pero no implementada
app.patch('/api/usuarios/:id', (req, res) => {
  // PATCH no está implementado aún en esta versión
  // Como el sistema de salud universal: prometido, nunca construido
  res.status(501).json({
    error: 'Actualización parcial no implementada',
  });
});

// Método que sí funciona
app.put('/api/usuarios/:id', async (req, res) => {
  const usuario = await Usuario.findByPk(req.params.id);
  if (!usuario) return res.status(404).end();

  await usuario.update(req.body);
  res.json(usuario);
});`,

  502: `// 502 Bad Gateway — El Huachicol
// El intermediario recibió una respuesta inválida del servidor upstream
const axios = require('axios');

app.get('/api/clima/:ciudad', async (req, res) => {
  try {
    // Actuar como gateway hacia servicio externo
    const respuesta = await axios.get(
      \`https://api.clima-externo.mx/v1/\${req.params.ciudad}\`,
      { timeout: 5000 }
    );
    res.json(respuesta.data);
  } catch (error) {
    if (error.response && error.response.status >= 500) {
      // El servicio upstream falló. El intermediario reporta.
      return res.status(502).json({
        error: 'El servicio de clima no está respondiendo correctamente',
      });
    }
    // Otro tipo de error del gateway
    res.status(502).json({
      error: 'Error al comunicarse con el servicio externo',
    });
  }
});`,

  503: `// 503 Service Unavailable — Hospital Sin Medicinas
// El servicio no puede atender solicitudes en este momento
app.use('/api', async (req, res, next) => {
  const estado = await verificarEstadoServicio();

  if (estado.mantenimiento) {
    // El servicio existe pero no puede funcionar ahora
    return res.status(503)
      .set('Retry-After', estado.tiempoEstimado || '3600')
      .json({
        error: 'Servicio en mantenimiento programado',
      });
  }

  if (estado.sobrecargado) {
    return res.status(503)
      .set('Retry-After', '120')
      .json({
        error: 'Servicio temporalmente no disponible por alta demanda',
      });
  }

  next();
});`,

  504: `// 504 Gateway Timeout — Llamar a Locatel
// El gateway no recibió respuesta a tiempo del servidor upstream
const axios = require('axios');

app.get('/api/consultas/curp/:curp', async (req, res) => {
  try {
    // Consultar servicio gubernamental (que siempre tarda)
    const respuesta = await axios.get(
      \`https://api.renapo.gob.mx/v1/curp/\${req.params.curp}\`,
      { timeout: 30000 } // 30 segundos de paciencia
    );
    res.json(respuesta.data);
  } catch (error) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      // El servicio upstream nunca respondió
      // Como Locatel: intentas conectar pero nadie contesta
      return res.status(504).json({
        error: 'El servicio externo no respondió a tiempo',
      });
    }
    res.status(502).json({ error: 'Error en el servicio externo' });
  }
});`,

  507: `// 507 Insufficient Storage — Presas Desbordadas en Tabasco
// El servidor no tiene espacio suficiente para completar la solicitud
const disk = require('diskusage');

app.post('/api/respaldos', async (req, res) => {
  // Verificar espacio disponible antes de intentar
  const { available } = await disk.check('/');
  const espacioMinimo = 500 * 1024 * 1024; // 500MB mínimo

  if (available < espacioMinimo) {
    // Sin capacidad. El sistema se desborda.
    return res.status(507).json({
      error: 'Espacio de almacenamiento insuficiente',
    });
  }

  try {
    const respaldo = await Respaldo.crear(req.body);
    res.status(201)
      .header('Location', \`/api/respaldos/\${respaldo.id}\`)
      .json(respaldo);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el respaldo' });
  }
});`,

  508: `// 508 Loop Detected — El Trámite Infinito CURP-INE
// Se detectó un bucle infinito al procesar la solicitud
app.get('/api/recursos/:id', async (req, res) => {
  const visitados = new Set();

  async function resolver(id) {
    // Detectar referencia circular
    if (visitados.has(id)) {
      // Loop detectado: el recurso A apunta a B que apunta a A
      // Como el trámite CURP-INE: necesitas uno para el otro
      throw new Error('LOOP_DETECTADO');
    }

    visitados.add(id);
    const recurso = await Recurso.findByPk(id);

    if (recurso.referencia_id) {
      return resolver(recurso.referencia_id);
    }
    return recurso;
  }

  try {
    const resultado = await resolver(req.params.id);
    res.json(resultado);
  } catch (error) {
    if (error.message === 'LOOP_DETECTADO') {
      return res.status(508).json({ error: 'Referencia circular detectada' });
    }
    res.status(500).json({ error: 'Error interno' });
  }
});`,

  511: `// 511 Network Authentication Required — WiFi del Aeropuerto
// Se requiere autenticación a nivel de red
const express = require('express');
const portalCautivo = express.Router();

portalCautivo.use((req, res, next) => {
  const macCliente = req.headers['x-client-mac'];
  const autenticado = verificarAutenticacionRed(macCliente);

  if (!autenticado) {
    // Red disponible pero requiere autenticación primero
    // Como el WiFi del aeropuerto: ves la red, pero paga primero
    return res.status(511)
      .set('Content-Type', 'text/html')
      .send(\`
        <html>
          <head><title>Autenticación de Red Requerida</title></head>
          <body>
            <h1>Inicie sesión para acceder a la red</h1>
            <form action="/portal/login" method="POST">
              <input name="usuario" placeholder="Usuario" />
              <input name="clave" type="password" placeholder="Contraseña" />
              <button type="submit">Conectar</button>
            </form>
          </body>
        </html>
      \`);
  }

  next();
});`,
}
