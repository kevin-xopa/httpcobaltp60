// Ejemplos de código HTTP en Rust (Actix Web)
// Todos los comentarios en español
// Filosofía HTTP: el código de estado ES el mensaje. Sin envolturas innecesarias.

export const rustExamples: Record<number, string> = {
  // ─── 1xx Informativos ───

  100: `// 100 Continue — La Espera en el IMSS
// El servidor indica al cliente que puede continuar enviando el cuerpo
use actix_web::{web, HttpRequest, HttpResponse};

async fn subir_archivo(req: HttpRequest, body: web::Bytes) -> HttpResponse {
    // Verificar tamaño antes de procesar
    let content_length: usize = req
        .headers()
        .get("content-length")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.parse().ok())
        .unwrap_or(0);

    let limite = 50 * 1024 * 1024; // 50MB

    if content_length > limite {
        // Rechazar antes de procesar todo el archivo
        return HttpResponse::PayloadTooLarge().finish();
    }

    // Actix maneja 100 Continue automáticamente
    let archivo_id = guardar_archivo(&body).await;
    HttpResponse::Created()
        .insert_header(("Location", format!("/api/archivos/{}", archivo_id)))
        .json(serde_json::json!({ "id": archivo_id, "tamano": body.len() }))
}`,

  101: `// 101 Switching Protocols — Cambio de Mando Presidencial
// Upgrade de HTTP a WebSocket
use actix_web::{web, HttpRequest, HttpResponse};
use actix_ws::Message;

async fn websocket(req: HttpRequest, stream: web::Payload) -> HttpResponse {
    // El handshake responde 101 automáticamente
    let (response, mut session, mut msg_stream) = actix_ws::handle(&req, stream)
        .expect("Error al iniciar WebSocket");

    // Procesar mensajes en un task separado
    actix_web::rt::spawn(async move {
        while let Some(Ok(msg)) = msg_stream.recv().await {
            match msg {
                Message::Text(texto) => {
                    // Reenviar el mensaje recibido
                    let _ = session.text(texto).await;
                }
                Message::Close(_) => break,
                _ => {}
            }
        }
    });

    response
}`,

  102: `// 102 Processing — Trámite en la SEP
// Indica que la solicitud se recibió y está en procesamiento
use actix_web::{web, HttpResponse};
use serde::Deserialize;

#[derive(Deserialize)]
struct ParametrosReporte {
    tipo: String,
    fecha_inicio: String,
    fecha_fin: String,
}

async fn generar_reporte(params: web::Json<ParametrosReporte>) -> HttpResponse {
    // Crear tarea para procesamiento asíncrono
    // El 102 (WebDAV) indica procesamiento en curso
    // En REST moderno usamos 202 Accepted
    let tarea_id = crear_tarea(&params.tipo, &params.fecha_inicio, &params.fecha_fin).await;

    // Enviar a cola de procesamiento
    tokio::spawn(procesar_reporte(tarea_id));

    HttpResponse::Accepted()
        .insert_header(("Location", format!("/api/tareas/{}", tarea_id)))
        .json(serde_json::json!({
            "tarea_id": tarea_id,
            "estado": "procesando"
        }))
}`,

  103: `// 103 Early Hints — La Alerta Sísmica
// Envía hints tempranos antes de la respuesta final
use actix_web::{HttpRequest, HttpResponse};

async fn pagina_principal(_req: HttpRequest) -> HttpResponse {
    // Los early hints se configuran a nivel de proxy/servidor web
    // En la aplicación, indicamos los recursos a precargar via headers
    let html = renderizar_pagina().await;

    HttpResponse::Ok()
        .content_type("text/html")
        .insert_header((
            "Link",
            "</css/main.css>; rel=preload; as=style, \
             </js/app.js>; rel=preload; as=script",
        ))
        .body(html)
}`,

  // ─── 2xx Éxito ───

  200: `// 200 OK — El Maíz Llegó a la Milpa
// Devolver datos directamente. Sin envolturas.
use actix_web::{web, HttpResponse};
use serde::Deserialize;

#[derive(Deserialize)]
struct FiltroProductos {
    categoria: Option<String>,
    pagina: Option<u32>,
    limite: Option<u32>,
}

async fn listar_productos(query: web::Query<FiltroProductos>) -> HttpResponse {
    let pagina = query.pagina.unwrap_or(1);
    let limite = query.limite.unwrap_or(20);
    let offset = (pagina - 1) * limite;

    let productos = Producto::listar(
        query.categoria.as_deref(),
        limite,
        offset,
    ).await;

    // El 200 ya dice que todo salió bien
    // Solo devuelve los datos, nada más
    HttpResponse::Ok().json(productos)
}`,

  201: `// 201 Created — Fundación de Tenochtitlan
// Recurso creado: devolver el recurso + Location header
use actix_web::{web, HttpResponse};
use serde::Deserialize;

#[derive(Deserialize)]
struct CrearProyecto {
    nombre: String,
    descripcion: String,
    responsable: String,
}

async fn crear_proyecto(datos: web::Json<CrearProyecto>) -> HttpResponse {
    let proyecto = Proyecto::create(
        &datos.nombre,
        &datos.descripcion,
        &datos.responsable,
    ).await;

    // 201 + Location + el recurso creado
    HttpResponse::Created()
        .insert_header(("Location", format!("/api/proyectos/{}", proyecto.id)))
        .json(proyecto)
}`,

  202: `// 202 Accepted — "Ya Quedó, Jefe"
// Solicitud aceptada pero procesamiento pendiente
use actix_web::{web, HttpResponse};
use serde::Deserialize;

#[derive(Deserialize)]
struct SolicitudExportacion {
    formato: String,
    filtros: serde_json::Value,
}

async fn crear_exportacion(datos: web::Json<SolicitudExportacion>) -> HttpResponse {
    // Crear tarea en cola de procesamiento
    let tarea = Cola::agregar("exportacion", &datos.formato, &datos.filtros).await;

    // Lanzar procesamiento en background
    let tarea_id = tarea.id;
    tokio::spawn(async move {
        procesar_exportacion(tarea_id).await;
    });

    // Aceptamos, pero no está lista
    HttpResponse::Accepted()
        .insert_header(("Location", format!("/api/tareas/{}", tarea.id)))
        .json(serde_json::json!({ "tarea_id": tarea.id, "estado": "pendiente" }))
}`,

  204: `// 204 No Content — Presa Vacía en Sequía
// Operación exitosa, sin cuerpo en la respuesta
use actix_web::{web, HttpRequest, HttpResponse};

async fn cerrar_sesion(
    req: HttpRequest,
    path: web::Path<i64>,
) -> HttpResponse {
    let sesion_id = path.into_inner();
    let usuario = obtener_usuario(&req).await;

    let sesion = match Sesion::buscar(sesion_id).await {
        Some(s) => s,
        None => return HttpResponse::NotFound().finish(),
    };

    // Verificar que la sesión pertenece al usuario
    if sesion.usuario_id != usuario.id {
        return HttpResponse::Forbidden().finish();
    }

    sesion.eliminar().await;

    // 204: operación exitosa, nada que devolver
    HttpResponse::NoContent().finish()
}`,

  206: `// 206 Partial Content — Reconstrucción Post-Sismo 2017
// Devolver solo una porción del recurso
use actix_web::{web, HttpRequest, HttpResponse};
use actix_files::NamedFile;

async fn contenido_parcial(
    req: HttpRequest,
    path: web::Path<i64>,
) -> HttpResponse {
    let archivo = Archivo::buscar(path.into_inner()).await.unwrap();

    // Verificar si hay header Range
    let rango = match req.headers().get("range") {
        Some(r) => r.to_str().unwrap_or(""),
        None => return HttpResponse::Ok().body(archivo.leer_todo().await),
    };

    // Parsear rango: bytes=inicio-fin
    let (inicio, fin) = parsear_rango(rango, archivo.tamano);
    let contenido = archivo.leer_rango(inicio, fin).await;

    HttpResponse::PartialContent()
        .insert_header(("Content-Range", format!("bytes {}-{}/{}", inicio, fin, archivo.tamano)))
        .insert_header(("Accept-Ranges", "bytes"))
        .insert_header(("Content-Length", (fin - inicio + 1).to_string()))
        .content_type(archivo.tipo_mime.clone())
        .body(contenido)
}`,

  // ─── 3xx Redirección ───

  301: `// 301 Moved Permanently — El Aeropuerto de Texcoco Cancelado
// Redirección permanente: el recurso cambió de ubicación para siempre
use actix_web::{web, HttpResponse};

async fn usuarios_v1() -> HttpResponse {
    // La API v1 fue deprecada permanentemente
    // Como Texcoco fue redirigido a Felipe Ángeles
    HttpResponse::MovedPermanently()
        .insert_header(("Location", "/api/v2/usuarios"))
        .finish()
}

async fn perfil_legacy(path: web::Path<i64>) -> HttpResponse {
    let id = path.into_inner();
    // Ruta vieja que ya no existe
    // Los motores de búsqueda actualizarán sus índices
    HttpResponse::MovedPermanently()
        .insert_header(("Location", format!("/usuarios/{}", id)))
        .finish()
}`,

  302: `// 302 Found (Redirect Temporal) — Desvío por el Socavón de Puebla
// Redirección temporal: el recurso está en otro lugar por ahora
use actix_web::HttpResponse;

async fn obtener_configuracion() -> HttpResponse {
    let mantenimiento = verificar_mantenimiento().await;

    if mantenimiento.activo {
        // Desvío temporal mientras dura el mantenimiento
        // Como el socavón: "use la otra ruta mientras tanto"
        return HttpResponse::Found()
            .insert_header(("Location", "/api/configuracion/cache"))
            .finish();
    }

    let config = Configuracion::obtener().await;
    HttpResponse::Ok().json(config)
}`,

  303: `// 303 See Other — "Vaya a la Ventanilla 7"
// Después de un POST, redirigir a otro recurso con GET
use actix_web::{web, HttpResponse};
use serde::Deserialize;

#[derive(Deserialize)]
struct CrearPedido {
    productos: Vec<i64>,
    direccion: String,
}

async fn crear_pedido(datos: web::Json<CrearPedido>) -> HttpResponse {
    let pedido = Pedido::crear(&datos.productos, &datos.direccion).await;

    // Después de crear, redirigir al recibo con GET
    // Como la burocracia: "su trámite se registró, pase a ventanilla 7"
    HttpResponse::SeeOther()
        .insert_header(("Location", format!("/api/pedidos/{}/recibo", pedido.id)))
        .finish()
}`,

  304: `// 304 Not Modified — Las Reformas que No Cambian Nada
// El recurso no ha cambiado desde la última vez
use actix_web::{HttpRequest, HttpResponse};

async fn obtener_catalogo(req: HttpRequest) -> HttpResponse {
    let ultima_modificacion = Catalogo::ultima_actualizacion().await;
    let etag = generar_etag(&ultima_modificacion);

    // Verificar si el cliente ya tiene la versión actual
    if let Some(if_none_match) = req.headers().get("if-none-match") {
        if if_none_match.to_str().unwrap_or("") == etag {
            // Nada cambió. Como siempre.
            return HttpResponse::NotModified().finish();
        }
    }

    let catalogo = Catalogo::obtener_todo().await;
    HttpResponse::Ok()
        .insert_header(("ETag", etag))
        .insert_header(("Cache-Control", "max-age=3600"))
        .json(catalogo)
}`,

  307: `// 307 Temporary Redirect — Bloqueo en Reforma por Manifestación
// Redirección temporal que PRESERVA el método HTTP original
use actix_web::HttpResponse;

async fn procesar_pago() -> HttpResponse {
    let pasarela_disponible = verificar_pasarela().await;

    if !pasarela_disponible {
        // A diferencia del 302, el 307 mantiene el método original
        // POST sigue siendo POST en el destino
        return HttpResponse::TemporaryRedirect()
            .insert_header(("Location", "https://respaldo.pagos.mx/api/pagos"))
            .finish();
    }

    let resultado = procesar_pago_principal().await;
    HttpResponse::Ok().json(resultado)
}`,

  308: `// 308 Permanent Redirect — De DF a CDMX
// Redirección permanente que PRESERVA el método HTTP
use actix_web::{web, HttpResponse};

async fn redirigir_df(path: web::Path<String>) -> HttpResponse {
    let ruta = path.into_inner();
    // El recurso cambió permanentemente de ubicación
    // Como el DF → CDMX: el nombre cambió para siempre
    // A diferencia del 301, el 308 preserva el método original
    let nueva_url = format!("/api/cdmx/{}", ruta);

    HttpResponse::PermanentRedirect()
        .insert_header(("Location", nueva_url))
        .finish()
}`,

  // ─── 4xx Error del Cliente ───

  400: `// 400 Bad Request — Pedir Ketchup en la Taquería
// La petición está malformada o es inválida
use actix_web::{web, HttpResponse};
use serde::Deserialize;

#[derive(Deserialize)]
struct Transferencia {
    cuenta_origen: Option<String>,
    cuenta_destino: Option<String>,
    monto: Option<f64>,
}

async fn crear_transferencia(datos: web::Json<Transferencia>) -> HttpResponse {
    // Validar que la petición tenga sentido básico
    if datos.cuenta_origen.is_none() || datos.cuenta_destino.is_none() || datos.monto.is_none() {
        return HttpResponse::BadRequest()
            .json(serde_json::json!({ "error": "Faltan campos requeridos" }));
    }

    if datos.monto.unwrap() <= 0.0 {
        return HttpResponse::BadRequest()
            .json(serde_json::json!({ "error": "El monto debe ser positivo" }));
    }

    let transferencia = ejecutar_transferencia(&datos).await;
    HttpResponse::Created()
        .insert_header(("Location", format!("/api/transferencias/{}", transferencia.id)))
        .json(transferencia)
}`,

  401: `// 401 Unauthorized — Colonia Cerrada con Plumas
// No autenticado: no sabemos quién eres
use actix_web::{HttpRequest, HttpResponse};

async fn obtener_expediente(req: HttpRequest) -> HttpResponse {
    // Extraer token del header Authorization
    let token = match req.headers().get("authorization") {
        Some(valor) => {
            let s = valor.to_str().unwrap_or("");
            s.strip_prefix("Bearer ").unwrap_or("")
        }
        None => {
            // Sin credenciales. No pasas.
            return HttpResponse::Unauthorized()
                .insert_header(("WWW-Authenticate", "Bearer realm=\\"api\\""))
                .json(serde_json::json!({ "error": "Token de autenticación requerido" }));
        }
    };

    let usuario = match verificar_token(token).await {
        Ok(u) => u,
        Err(_) => {
            return HttpResponse::Unauthorized()
                .insert_header(("WWW-Authenticate", "Bearer realm=\\"api\\", error=\\"invalid_token\\""))
                .json(serde_json::json!({ "error": "Token inválido o expirado" }));
        }
    };

    let expediente = Expediente::buscar_por_usuario(usuario.id).await;
    HttpResponse::Ok().json(expediente)
}`,

  402: `// 402 Payment Required — La Mordida
// Pago requerido para acceder al recurso
use actix_web::{web, HttpRequest, HttpResponse};

async fn reporte_premium(
    req: HttpRequest,
    path: web::Path<String>,
) -> HttpResponse {
    let reporte_id = path.into_inner();
    let usuario = obtener_usuario(&req).await;
    let suscripcion = Suscripcion::buscar_por_usuario(usuario.id).await;

    match suscripcion {
        None => {
            // Sin pago, sin acceso. Así funciona.
            HttpResponse::PaymentRequired()
                .json(serde_json::json!({ "error": "Se requiere suscripción activa" }))
        }
        Some(s) if s.estado != "activa" => {
            HttpResponse::PaymentRequired()
                .json(serde_json::json!({ "error": "Se requiere suscripción activa" }))
        }
        Some(s) if s.tipo == "basica" && reporte_id.starts_with("avanzado") => {
            HttpResponse::PaymentRequired()
                .json(serde_json::json!({ "error": "Requiere suscripción avanzada" }))
        }
        _ => {
            let reporte = Reporte::generar(&reporte_id).await;
            HttpResponse::Ok().json(reporte)
        }
    }
}`,

  403: `// 403 Forbidden — Campo Militar No. 1
// Autenticado pero sin permisos. Prohibido. Punto.
use actix_web::{web, HttpRequest, HttpResponse};

async fn eliminar_usuario(
    req: HttpRequest,
    path: web::Path<i64>,
) -> HttpResponse {
    let usuario_id = path.into_inner();
    let solicitante = obtener_usuario(&req).await;

    // Solo administradores pueden eliminar usuarios
    if solicitante.rol != "admin" {
        return HttpResponse::Forbidden()
            .json(serde_json::json!({ "error": "No tienes permisos para esta acción" }));
    }

    // No permitir auto-eliminación
    if usuario_id == solicitante.id {
        return HttpResponse::Forbidden()
            .json(serde_json::json!({ "error": "No puedes eliminar tu propia cuenta" }));
    }

    Usuario::eliminar(usuario_id).await;
    HttpResponse::NoContent().finish()
}`,

  404: `// 404 Not Found — Los 43 de Ayotzinapa
// El recurso no existe. Buscado. No encontrado.
use actix_web::{web, HttpResponse};

async fn buscar_expediente(path: web::Path<String>) -> HttpResponse {
    let folio = path.into_inner();

    match Expediente::buscar_por_folio(&folio).await {
        Some(expediente) => HttpResponse::Ok().json(expediente),
        None => {
            // No existe. El 404 lo dice todo.
            HttpResponse::NotFound()
                .json(serde_json::json!({ "error": "Expediente no encontrado" }))
        }
    }
}`,

  405: `// 405 Method Not Allowed — Protesta Reprimida en Atenco
// El método HTTP no está permitido en esta ruta
use actix_web::{web, HttpResponse};

// Solo GET está permitido en esta ruta
async fn listar_incidencias() -> HttpResponse {
    let reportes = Reporte::listar_por_tipo("incidencia").await;
    HttpResponse::Ok().json(reportes)
}

// Configurar en la app:
// web::resource("/api/reportes/incidencias").route(web::get().to(listar_incidencias))
// Actix devuelve 405 automáticamente para métodos no registrados

// Personalizar respuesta de método no permitido
async fn metodo_no_permitido() -> HttpResponse {
    HttpResponse::MethodNotAllowed()
        .insert_header(("Allow", "GET"))
        .json(serde_json::json!({ "error": "Método no permitido. Solo se acepta GET." }))
}`,

  406: `// 406 Not Acceptable — Leche Adulterada
// El servidor no puede producir el formato que el cliente pide
use actix_web::{HttpRequest, HttpResponse};

async fn exportar_datos(req: HttpRequest) -> HttpResponse {
    let formatos_permitidos = vec!["application/json", "text/csv"];

    let accept = req
        .headers()
        .get("accept")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("application/json");

    if !formatos_permitidos.contains(&accept) {
        // No podemos entregar en el formato que pides
        return HttpResponse::NotAcceptable()
            .json(serde_json::json!({
                "error": "Formato no soportado",
                "formatos_disponibles": formatos_permitidos,
            }));
    }

    let datos = Datos::exportar().await;

    if accept == "text/csv" {
        let csv = convertir_a_csv(&datos);
        return HttpResponse::Ok().content_type("text/csv").body(csv);
    }

    HttpResponse::Ok().json(datos)
}`,

  408: `// 408 Request Timeout — Justicia que Prescribe
// El servidor se cansó de esperar la solicitud completa
use actix_web::{web, HttpResponse};
use tokio::time::{timeout, Duration};

async fn consulta_pesada(datos: web::Json<serde_json::Value>) -> HttpResponse {
    // Dar máximo 30 segundos para completar la consulta
    let resultado = timeout(
        Duration::from_secs(30),
        ejecutar_consulta(&datos),
    ).await;

    match resultado {
        Ok(Ok(datos)) => HttpResponse::Ok().json(datos),
        Ok(Err(e)) => {
            HttpResponse::InternalServerError()
                .json(serde_json::json!({ "error": "Error en la consulta" }))
        }
        Err(_) => {
            // El tiempo expiró. Como los casos que prescriben.
            HttpResponse::RequestTimeout()
                .json(serde_json::json!({ "error": "Tiempo de espera agotado" }))
        }
    }
}`,

  409: `// 409 Conflict — Disputa Territorial del Narco
// Conflicto con el estado actual del recurso
use actix_web::{web, HttpResponse};
use serde::Deserialize;

#[derive(Deserialize)]
struct ActualizarInventario {
    cantidad: i32,
    version: i32,
}

async fn actualizar_inventario(
    path: web::Path<String>,
    datos: web::Json<ActualizarInventario>,
) -> HttpResponse {
    let sku = path.into_inner();
    let producto = match Inventario::buscar(&sku).await {
        Some(p) => p,
        None => return HttpResponse::NotFound().json(serde_json::json!({ "error": "No encontrado" })),
    };

    // Verificar conflicto de versiones (optimistic locking)
    if producto.version != datos.version {
        // Dos escrituras sobre el mismo territorio: conflicto
        return HttpResponse::Conflict()
            .json(serde_json::json!({
                "error": "El recurso fue modificado por otro proceso",
                "version_actual": producto.version,
            }));
    }

    let actualizado = producto.actualizar(datos.cantidad).await;
    HttpResponse::Ok().json(actualizado)
}`,

  410: `// 410 Gone — Ruta 100: Desaparecida para Siempre
// El recurso existió pero fue eliminado permanentemente
use actix_web::HttpResponse;

async fn ruta_100() -> HttpResponse {
    // Este recurso ya no existe y no volverá
    // A diferencia del 404, confirmamos que SÍ existió
    HttpResponse::Gone()
        .json(serde_json::json!({
            "error": "Este servicio fue descontinuado permanentemente"
        }))
}

// Endpoints deprecados de API antigua
async fn api_v1_deprecada() -> HttpResponse {
    HttpResponse::Gone()
        .insert_header(("Sunset", "Sat, 01 Jan 2025 00:00:00 GMT"))
        .json(serde_json::json!({
            "error": "API v1 fue eliminada. Migre a /api/v3/"
        }))
}`,

  413: `// 413 Payload Too Large — Colapso de la Línea 12
// El cuerpo de la solicitud excede el límite permitido
use actix_web::{web, HttpRequest, HttpResponse};

const LIMITE_BYTES: usize = 10 * 1024 * 1024; // 10MB

async fn subir_documento(req: HttpRequest, body: web::Bytes) -> HttpResponse {
    let content_length: usize = req
        .headers()
        .get("content-length")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.parse().ok())
        .unwrap_or(0);

    if content_length > LIMITE_BYTES {
        // Sobrecarga. La infraestructura no soporta más.
        return HttpResponse::PayloadTooLarge()
            .insert_header(("Retry-After", "3600"))
            .json(serde_json::json!({
                "error": "El archivo excede el tamaño máximo (10MB)"
            }));
    }

    let documento = Documento::guardar(&body).await;
    HttpResponse::Created()
        .insert_header(("Location", format!("/api/documentos/{}", documento.id)))
        .json(documento)
}`,

  415: `// 415 Unsupported Media Type — CURP con Formato Obsoleto
// El formato del contenido no es soportado
use actix_web::{HttpRequest, HttpResponse};

async fn importar_documentos(req: HttpRequest, body: web::Bytes) -> HttpResponse {
    let tipos_permitidos = ["application/json", "application/xml", "text/csv"];

    let content_type = req
        .headers()
        .get("content-type")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");

    if !tipos_permitidos.contains(&content_type) {
        // Formato no soportado. Actualice su sistema.
        return HttpResponse::UnsupportedMediaType()
            .json(serde_json::json!({
                "error": "Tipo de contenido no soportado",
                "tipos_aceptados": tipos_permitidos,
            }));
    }

    let datos = procesar_importacion(content_type, &body).await;
    HttpResponse::Ok().json(datos)
}`,

  418: `// 418 I'm a Teapot — La Olla de Tamales de Doña Mary
// Cada cosa tiene su función. No le pidas café a la tetera.
use actix_web::HttpResponse;

async fn pedir_cafe() -> HttpResponse {
    // RFC 2324 — Soy una tetera. No hago café.
    // Como Doña Mary: no le pidas sushi a la tamalera
    HttpResponse::build(actix_web::http::StatusCode::from_u16(418).unwrap())
        .json(serde_json::json!({
            "error": "Soy una tetera. No preparo café.",
            "sugerencia": "Pruebe con /api/cafeteria/te",
        }))
}

// El único código "ligero" del proyecto
async fn listar_tamales() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!([
        { "tipo": "verde", "precio": 15 },
        { "tipo": "rojo", "precio": 15 },
        { "tipo": "rajas", "precio": 18 },
    ]))
}`,

  422: `// 422 Unprocessable Entity — Declaración Rechazada por el SAT
// La sintaxis es correcta pero los datos no son procesables
use actix_web::{web, HttpResponse};
use serde::Deserialize;
use validator::Validate;
use std::collections::HashMap;

#[derive(Deserialize, Validate)]
struct CrearUsuario {
    #[validate(email(message = "Email inválido"))]
    email: String,
    #[validate(length(min = 3, message = "Mínimo 3 caracteres"))]
    nombre: String,
}

async fn crear_usuario(datos: web::Json<CrearUsuario>) -> HttpResponse {
    // Validar campos
    if let Err(errores) = datos.validate() {
        // Entendemos la petición, pero los datos no cuadran
        return HttpResponse::UnprocessableEntity()
            .json(serde_json::json!({ "errors": errores }));
    }

    // Verificar duplicados
    if Usuario::existe_email(&datos.email).await {
        let mut errors: HashMap<&str, Vec<&str>> = HashMap::new();
        errors.insert("email", vec!["El email ya está registrado"]);
        return HttpResponse::UnprocessableEntity()
            .json(serde_json::json!({ "errors": errors }));
    }

    let usuario = Usuario::create(&datos.email, &datos.nombre).await;
    HttpResponse::Created()
        .insert_header(("Location", format!("/api/usuarios/{}", usuario.id)))
        .json(usuario)
}`,

  429: `// 429 Too Many Requests — Apagones de CFE
// Demasiadas solicitudes. El sistema está sobrecargado.
use actix_web::{web, HttpResponse, HttpRequest};
use actix_governor::{Governor, GovernorConfigBuilder};

// Configurar rate limiting
fn configurar_rate_limit() -> Governor {
    let config = GovernorConfigBuilder::default()
        .per_second(2)       // 2 peticiones por segundo
        .burst_size(100)     // Ráfaga máxima de 100
        .finish()
        .unwrap();

    Governor::new(&config)
}

// Cuando se excede el límite, responder con 429
async fn rate_limit_excedido() -> HttpResponse {
    // Sobrecarga. Demasiada demanda. Se cae todo.
    HttpResponse::TooManyRequests()
        .insert_header(("Retry-After", "900"))
        .json(serde_json::json!({
            "error": "Demasiadas solicitudes. Intente más tarde."
        }))
}`,

  451: `// 451 Unavailable For Legal Reasons — Periodistas Censurados
// Contenido no disponible por razones legales
use actix_web::{web, HttpResponse};

async fn obtener_publicacion(path: web::Path<i64>) -> HttpResponse {
    let id = path.into_inner();
    let publicacion = match Publicacion::buscar(id).await {
        Some(p) => p,
        None => {
            return HttpResponse::NotFound()
                .json(serde_json::json!({ "error": "Publicación no encontrada" }));
        }
    };

    if publicacion.bloqueada_legalmente {
        // Censurado. Bloqueado por orden legal.
        return HttpResponse::build(
            actix_web::http::StatusCode::from_u16(451).unwrap()
        )
        .insert_header((
            "Link",
            "<https://ejemplo.mx/orden-judicial/12345>; rel=\\"blocked-by\\""
        ))
        .json(serde_json::json!({
            "error": "Contenido no disponible por orden judicial"
        }));
    }

    HttpResponse::Ok().json(publicacion)
}`,

  // ─── 5xx Error del Servidor ───

  500: `// 500 Internal Server Error — La Explosión de San Juanico
// Fallo interno catastrófico. Nunca exponer detalles al cliente.
use actix_web::{HttpResponse, middleware};
use log::error;

// Configurar manejador global de errores
async fn dashboard() -> Result<HttpResponse, actix_web::Error> {
    let resultado = tokio::try_join!(
        Venta::resumen(),
        Usuario::conteo(),
        Metrica::calcular(),
    );

    match resultado {
        Ok((ventas, usuarios, metricas)) => {
            Ok(HttpResponse::Ok().json(serde_json::json!({
                "ventas": ventas,
                "usuarios": usuarios,
                "metricas": metricas,
            })))
        }
        Err(e) => {
            // Registrar internamente TODO el detalle
            error!("Error catastrófico en dashboard: {:?}", e);
            // Al cliente: NUNCA el stack trace
            Ok(HttpResponse::InternalServerError()
                .json(serde_json::json!({ "error": "Error interno del servidor" })))
        }
    }
}`,

  501: `// 501 Not Implemented — Sistema de Salud Universal
// Funcionalidad reconocida pero no implementada
use actix_web::{web, HttpResponse};
use serde::Deserialize;

#[derive(Deserialize)]
struct ActualizarUsuario {
    nombre: String,
    email: String,
}

// PATCH no implementado aún
async fn actualizar_parcial(_path: web::Path<i64>) -> HttpResponse {
    // Como el sistema de salud universal: prometido, nunca construido
    HttpResponse::NotImplemented()
        .json(serde_json::json!({ "error": "Actualización parcial no implementada" }))
}

// PUT sí funciona
async fn actualizar_completo(
    path: web::Path<i64>,
    datos: web::Json<ActualizarUsuario>,
) -> HttpResponse {
    let id = path.into_inner();
    let usuario = Usuario::actualizar(id, &datos.nombre, &datos.email).await;
    HttpResponse::Ok().json(usuario)
}`,

  502: `// 502 Bad Gateway — El Huachicol
// El intermediario recibió una respuesta inválida del upstream
use actix_web::{web, HttpResponse};

async fn consultar_clima(path: web::Path<String>) -> HttpResponse {
    let ciudad = path.into_inner();
    let cliente = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .build()
        .unwrap();

    match cliente
        .get(format!("https://api.clima-externo.mx/v1/{}", ciudad))
        .send()
        .await
    {
        Ok(resp) if resp.status().is_server_error() => {
            // El servicio upstream falló
            HttpResponse::BadGateway()
                .json(serde_json::json!({
                    "error": "El servicio de clima no responde correctamente"
                }))
        }
        Ok(resp) => {
            let datos = resp.json::<serde_json::Value>().await.unwrap();
            HttpResponse::Ok().json(datos)
        }
        Err(_) => {
            HttpResponse::BadGateway()
                .json(serde_json::json!({
                    "error": "Error al comunicarse con el servicio externo"
                }))
        }
    }
}`,

  503: `// 503 Service Unavailable — Hospital Sin Medicinas
// El servicio no puede atender solicitudes en este momento
use actix_web::{HttpRequest, HttpResponse};
use actix_web::dev::{Service, Transform, ServiceRequest, ServiceResponse};

// Middleware para verificar disponibilidad del servicio
async fn verificar_disponibilidad(req: HttpRequest) -> Option<HttpResponse> {
    let estado = verificar_estado_servicio().await;

    if estado.mantenimiento {
        return Some(HttpResponse::ServiceUnavailable()
            .insert_header(("Retry-After", estado.tiempo_estimado.to_string()))
            .json(serde_json::json!({
                "error": "Servicio en mantenimiento programado"
            })));
    }

    if estado.sobrecargado {
        return Some(HttpResponse::ServiceUnavailable()
            .insert_header(("Retry-After", "120"))
            .json(serde_json::json!({
                "error": "Servicio temporalmente no disponible"
            })));
    }

    None // Continuar con la solicitud normal
}`,

  504: `// 504 Gateway Timeout — Llamar a Locatel
// El gateway no recibió respuesta a tiempo del upstream
use actix_web::{web, HttpResponse};
use reqwest::Client;
use std::time::Duration;

async fn consultar_curp(path: web::Path<String>) -> HttpResponse {
    let curp = path.into_inner();
    let cliente = Client::builder()
        .timeout(Duration::from_secs(30))
        .build()
        .unwrap();

    match cliente
        .get(format!("https://api.renapo.gob.mx/v1/curp/{}", curp))
        .send()
        .await
    {
        Ok(resp) => {
            let datos = resp.json::<serde_json::Value>().await.unwrap();
            HttpResponse::Ok().json(datos)
        }
        Err(e) if e.is_timeout() => {
            // El servicio upstream nunca respondió
            // Como Locatel: intentas conectar pero nadie contesta
            HttpResponse::GatewayTimeout()
                .json(serde_json::json!({
                    "error": "El servicio externo no respondió a tiempo"
                }))
        }
        Err(_) => {
            HttpResponse::BadGateway()
                .json(serde_json::json!({ "error": "Error en el servicio externo" }))
        }
    }
}`,

  507: `// 507 Insufficient Storage — Presas Desbordadas en Tabasco
// El servidor no tiene espacio suficiente
use actix_web::HttpResponse;
use sysinfo::Disks;

async fn crear_respaldo() -> HttpResponse {
    // Verificar espacio disponible
    let disks = Disks::new_with_refreshed_list();
    let disco_principal = disks.list().first().unwrap();
    let espacio_libre = disco_principal.available_space();
    let espacio_minimo: u64 = 500 * 1024 * 1024; // 500MB

    if espacio_libre < espacio_minimo {
        // Sin capacidad. El sistema se desborda.
        return HttpResponse::InsufficientStorage()
            .json(serde_json::json!({
                "error": "Espacio de almacenamiento insuficiente"
            }));
    }

    let respaldo = Respaldo::crear().await;
    HttpResponse::Created()
        .insert_header(("Location", format!("/api/respaldos/{}", respaldo.id)))
        .json(respaldo)
}`,

  508: `// 508 Loop Detected — El Trámite Infinito CURP-INE
// Se detectó un bucle infinito al procesar la solicitud
use actix_web::{web, HttpResponse};
use std::collections::HashSet;

async fn resolver_recurso(path: web::Path<i64>) -> HttpResponse {
    let id = path.into_inner();
    let mut visitados = HashSet::new();

    match resolver(id, &mut visitados).await {
        Ok(recurso) => HttpResponse::Ok().json(recurso),
        Err(codigo) => match codigo {
            404 => HttpResponse::NotFound().finish(),
            508 => {
                // Loop: A apunta a B que apunta a A
                // Como el trámite CURP-INE: necesitas uno para el otro
                HttpResponse::build(actix_web::http::StatusCode::from_u16(508).unwrap())
                    .json(serde_json::json!({ "error": "Referencia circular detectada" }))
            }
            _ => HttpResponse::InternalServerError().finish(),
        },
    }
}

async fn resolver(id: i64, visitados: &mut HashSet<i64>) -> Result<Recurso, u16> {
    if !visitados.insert(id) {
        return Err(508); // Loop detectado
    }
    let recurso = Recurso::buscar(id).await.ok_or(404u16)?;
    match recurso.referencia_id {
        Some(ref_id) => resolver(ref_id, visitados).await,
        None => Ok(recurso),
    }
}`,

  511: `// 511 Network Authentication Required — WiFi del Aeropuerto
// Se requiere autenticación a nivel de red
use actix_web::{HttpRequest, HttpResponse};

async fn portal_cautivo(req: HttpRequest) -> HttpResponse {
    let mac_cliente = req
        .headers()
        .get("x-client-mac")
        .and_then(|v| v.to_str().ok());

    let autenticado = match mac_cliente {
        Some(mac) => verificar_autenticacion_red(mac).await,
        None => false,
    };

    if !autenticado {
        // Red disponible pero requiere autenticación
        // Como el WiFi del aeropuerto: ves la red, pero paga primero
        return HttpResponse::build(
            actix_web::http::StatusCode::from_u16(511).unwrap()
        )
        .content_type("text/html")
        .body(r#"
            <html>
            <head><title>Autenticación de Red</title></head>
            <body>
                <h1>Inicie sesión para acceder a la red</h1>
                <form action="/portal/login" method="POST">
                    <input name="usuario" placeholder="Usuario" />
                    <input name="clave" type="password" />
                    <button type="submit">Conectar</button>
                </form>
            </body>
            </html>
        "#);
    }

    // Continuar con la solicitud normal
    HttpResponse::Ok().finish()
}`,
}
