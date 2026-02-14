// Ejemplos de código HTTP en C++ (Crow)
// Todos los comentarios en español
// Filosofía HTTP: el código de estado ES el mensaje. Sin envolturas innecesarias.

export const cppExamples: Record<number, string> = {
  // ─── 1xx Informativos ───

  100: `// 100 Continue — La Espera en el IMSS
// El servidor indica al cliente que puede continuar enviando el cuerpo
#include "crow.h"

int main() {
    crow::SimpleApp app;

    CROW_ROUTE(app, "/api/archivos/subir").methods("POST"_method)
    ([](const crow::request& req) {
        auto content_length = std::stoi(req.get_header_value("Content-Length"));
        int limite = 50 * 1024 * 1024; // 50MB

        if (content_length > limite) {
            // Rechazar antes de procesar todo el archivo
            return crow::response(413);
        }

        // Crow maneja 100 Continue a nivel de servidor
        auto archivo_id = guardar_archivo(req.body);
        crow::json::wvalue respuesta;
        respuesta["id"] = archivo_id;
        respuesta["tamano"] = req.body.size();

        auto res = crow::response(201, respuesta.dump());
        res.add_header("Location", "/api/archivos/" + std::to_string(archivo_id));
        return res;
    });

    app.port(3000).run();
}`,

  101: `// 101 Switching Protocols — Cambio de Mando Presidencial
// Upgrade de HTTP a WebSocket
#include "crow.h"

int main() {
    crow::SimpleApp app;

    // El servidor acepta cambiar de protocolo
    // El handshake responde 101 automáticamente
    CROW_WEBSOCKET_ROUTE(app, "/ws/notificaciones")
        .onopen([](crow::websocket::connection& conn) {
            // Protocolo cambiado: HTTP → WebSocket
            CROW_LOG_INFO << "Nueva conexión WebSocket establecida";
        })
        .onmessage([](crow::websocket::connection& conn,
                       const std::string& mensaje, bool es_binario) {
            // Reenviar mensaje a todos los conectados
            conn.send_text(mensaje);
        })
        .onclose([](crow::websocket::connection& conn,
                     const std::string& razon) {
            CROW_LOG_INFO << "Conexión WebSocket cerrada: " << razon;
        });

    app.port(3000).run();
}`,

  102: `// 102 Processing — Trámite en la SEP
// Indica que la solicitud se recibió y está en procesamiento
#include "crow.h"
#include <thread>
#include <future>

CROW_ROUTE(app, "/api/reportes/generar").methods("POST"_method)
([](const crow::request& req) {
    auto body = crow::json::load(req.body);
    std::string tipo = body["tipo"].s();
    std::string fecha_inicio = body["fecha_inicio"].s();
    std::string fecha_fin = body["fecha_fin"].s();

    // Crear tarea para procesamiento asíncrono
    int tarea_id = crear_tarea(tipo, fecha_inicio, fecha_fin);

    // Lanzar procesamiento en hilo separado
    std::thread([tarea_id]() {
        procesar_reporte(tarea_id);
    }).detach();

    // 202 Accepted: aceptamos pero no está listo
    crow::json::wvalue respuesta;
    respuesta["tarea_id"] = tarea_id;
    respuesta["estado"] = "procesando";

    auto res = crow::response(202, respuesta.dump());
    res.add_header("Location", "/api/tareas/" + std::to_string(tarea_id));
    return res;
});`,

  103: `// 103 Early Hints — La Alerta Sísmica
// Envía hints tempranos antes de la respuesta final
#include "crow.h"

CROW_ROUTE(app, "/app")
([]() {
    // Los early hints se configuran a nivel de proxy/servidor web
    // En la aplicación, indicamos recursos a precargar via headers
    std::string html = renderizar_pagina();

    crow::response res(200, html);
    res.set_header("Content-Type", "text/html");
    res.add_header("Link",
        "</css/main.css>; rel=preload; as=style, "
        "</js/app.js>; rel=preload; as=script, "
        "</fonts/bebas-neue.woff2>; rel=preload; as=font; crossorigin"
    );

    return res;
});`,

  // ─── 2xx Éxito ───

  200: `// 200 OK — El Maíz Llegó a la Milpa
// Devolver datos directamente. Sin envolturas.
#include "crow.h"

CROW_ROUTE(app, "/api/productos")
([](const crow::request& req) {
    auto categoria = req.url_params.get("categoria");
    int pagina = std::stoi(req.url_params.get("pagina") ? req.url_params.get("pagina") : "1");
    int limite = std::stoi(req.url_params.get("limite") ? req.url_params.get("limite") : "20");
    int offset = (pagina - 1) * limite;

    auto productos = Producto::listar(categoria, limite, offset);

    // El 200 ya dice que todo salió bien
    // Solo devuelve los datos, nada más
    crow::json::wvalue respuesta;
    for (size_t i = 0; i < productos.size(); i++) {
        respuesta[i]["id"] = productos[i].id;
        respuesta[i]["nombre"] = productos[i].nombre;
        respuesta[i]["precio"] = productos[i].precio;
    }

    return crow::response(200, respuesta.dump());
});`,

  201: `// 201 Created — Fundación de Tenochtitlan
// Recurso creado: devolver el recurso + Location header
#include "crow.h"

CROW_ROUTE(app, "/api/proyectos").methods("POST"_method)
([](const crow::request& req) {
    auto body = crow::json::load(req.body);
    std::string nombre = body["nombre"].s();
    std::string descripcion = body["descripcion"].s();
    std::string responsable = body["responsable"].s();

    auto proyecto = Proyecto::crear(nombre, descripcion, responsable);

    crow::json::wvalue respuesta;
    respuesta["id"] = proyecto.id;
    respuesta["nombre"] = proyecto.nombre;
    respuesta["descripcion"] = proyecto.descripcion;
    respuesta["estado"] = "activo";

    // 201 + Location + el recurso creado
    auto res = crow::response(201, respuesta.dump());
    res.add_header("Location", "/api/proyectos/" + std::to_string(proyecto.id));
    res.set_header("Content-Type", "application/json");
    return res;
});`,

  202: `// 202 Accepted — "Ya Quedó, Jefe"
// Solicitud aceptada pero procesamiento pendiente
#include "crow.h"
#include <thread>

CROW_ROUTE(app, "/api/exportaciones").methods("POST"_method)
([](const crow::request& req) {
    auto body = crow::json::load(req.body);
    std::string formato = body["formato"].s();

    // Crear tarea en cola de procesamiento
    auto tarea = Cola::agregar("exportacion", formato);

    // Lanzar procesamiento en background
    std::thread([id = tarea.id]() {
        procesar_exportacion(id);
    }).detach();

    // Aceptamos, pero no está lista
    // Como el albañil: "ya quedó" pero quién sabe cuándo
    crow::json::wvalue respuesta;
    respuesta["tarea_id"] = tarea.id;
    respuesta["estado"] = "pendiente";

    auto res = crow::response(202, respuesta.dump());
    res.add_header("Location", "/api/tareas/" + std::to_string(tarea.id));
    return res;
});`,

  204: `// 204 No Content — Presa Vacía en Sequía
// Operación exitosa, sin cuerpo en la respuesta
#include "crow.h"

CROW_ROUTE(app, "/api/sesiones/<int>").methods("DELETE"_method)
([](const crow::request& req, int sesion_id) {
    auto usuario = obtener_usuario(req);
    auto sesion = Sesion::buscar(sesion_id);

    if (!sesion.has_value()) {
        return crow::response(404);
    }

    // Verificar que la sesión pertenece al usuario
    if (sesion->usuario_id != usuario.id) {
        return crow::response(403);
    }

    sesion->eliminar();

    // 204: operación exitosa, nada que devolver
    // El silencio es la respuesta
    return crow::response(204);
});`,

  206: `// 206 Partial Content — Reconstrucción Post-Sismo 2017
// Devolver solo una porción del recurso
#include "crow.h"
#include <fstream>

CROW_ROUTE(app, "/api/archivos/<int>/contenido")
([](const crow::request& req, int archivo_id) {
    auto archivo = Archivo::buscar(archivo_id);
    if (!archivo.has_value()) return crow::response(404);

    auto rango = req.get_header_value("Range");
    if (rango.empty()) {
        return crow::response(200, archivo->leer_todo());
    }

    // Parsear rango: bytes=inicio-fin
    size_t inicio, fin;
    sscanf(rango.c_str(), "bytes=%zu-%zu", &inicio, &fin);
    if (fin == 0) fin = archivo->tamano - 1;

    auto contenido = archivo->leer_rango(inicio, fin);

    crow::response res(206, contenido);
    res.add_header("Content-Range",
        "bytes " + std::to_string(inicio) + "-" +
        std::to_string(fin) + "/" + std::to_string(archivo->tamano));
    res.add_header("Accept-Ranges", "bytes");
    res.add_header("Content-Length", std::to_string(fin - inicio + 1));
    res.set_header("Content-Type", archivo->tipo_mime);
    return res;
});`,

  // ─── 3xx Redirección ───

  301: `// 301 Moved Permanently — El Aeropuerto de Texcoco Cancelado
// Redirección permanente: el recurso cambió de ubicación para siempre
#include "crow.h"

CROW_ROUTE(app, "/api/v1/usuarios")
([]() {
    // La API v1 fue deprecada permanentemente
    // Como Texcoco fue redirigido a Felipe Ángeles
    crow::response res(301);
    res.add_header("Location", "/api/v2/usuarios");
    return res;
});

CROW_ROUTE(app, "/perfil/<int>")
([](int id) {
    // Ruta vieja que ya no existe
    // Los motores de búsqueda actualizarán sus índices
    crow::response res(301);
    res.add_header("Location", "/usuarios/" + std::to_string(id));
    return res;
});`,

  302: `// 302 Found (Redirect Temporal) — Desvío por el Socavón de Puebla
// Redirección temporal: el recurso está en otro lugar por ahora
#include "crow.h"

CROW_ROUTE(app, "/api/configuracion")
([]() {
    bool mantenimiento = verificar_mantenimiento();

    if (mantenimiento) {
        // Desvío temporal mientras dura el mantenimiento
        // Como el socavón: "use la otra ruta mientras tanto"
        crow::response res(302);
        res.add_header("Location", "/api/configuracion/cache");
        return res;
    }

    auto config = Configuracion::obtener();
    return crow::response(200, config.to_json());
});`,

  303: `// 303 See Other — "Vaya a la Ventanilla 7"
// Después de un POST, redirigir a otro recurso con GET
#include "crow.h"

CROW_ROUTE(app, "/api/pedidos").methods("POST"_method)
([](const crow::request& req) {
    auto body = crow::json::load(req.body);

    auto pedido = Pedido::crear(
        body["productos"],
        body["direccion"].s()
    );

    // Después de crear, redirigir al recibo con GET
    // Como la burocracia: "su trámite se registró, pase a ventanilla 7"
    crow::response res(303);
    res.add_header("Location",
        "/api/pedidos/" + std::to_string(pedido.id) + "/recibo");
    return res;
});`,

  304: `// 304 Not Modified — Las Reformas que No Cambian Nada
// El recurso no ha cambiado desde la última vez
#include "crow.h"

CROW_ROUTE(app, "/api/catalogo")
([](const crow::request& req) {
    auto ultima_mod = Catalogo::ultima_actualizacion();
    std::string etag = generar_etag(ultima_mod);

    // Verificar si el cliente ya tiene la versión actual
    auto if_none_match = req.get_header_value("If-None-Match");
    if (if_none_match == etag) {
        // Nada cambió. Como siempre.
        return crow::response(304);
    }

    auto catalogo = Catalogo::obtener_todo();
    crow::response res(200, catalogo.dump());
    res.set_header("Content-Type", "application/json");
    res.add_header("ETag", etag);
    res.add_header("Cache-Control", "max-age=3600");
    return res;
});`,

  307: `// 307 Temporary Redirect — Bloqueo en Reforma por Manifestación
// Redirección temporal que PRESERVA el método HTTP original
#include "crow.h"

CROW_ROUTE(app, "/api/pagos").methods("POST"_method)
([](const crow::request& req) {
    bool pasarela_disponible = verificar_pasarela();

    if (!pasarela_disponible) {
        // A diferencia del 302, el 307 mantiene el método original
        // POST sigue siendo POST en el destino
        crow::response res(307);
        res.add_header("Location", "https://respaldo.pagos.mx/api/pagos");
        return res;
    }

    // Procesar pago normalmente
    auto body = crow::json::load(req.body);
    auto resultado = procesar_pago(body);
    return crow::response(200, resultado.dump());
});`,

  308: `// 308 Permanent Redirect — De DF a CDMX
// Redirección permanente que PRESERVA el método HTTP
#include "crow.h"

CROW_ROUTE(app, "/api/distrito-federal/<path>")
([](const crow::request& req, const std::string& ruta) {
    // El recurso cambió permanentemente de ubicación
    // Como el DF → CDMX: el nombre cambió para siempre
    // A diferencia del 301, el 308 preserva el método original
    std::string nueva_url = "/api/cdmx/" + ruta;

    crow::response res(308);
    res.add_header("Location", nueva_url);
    return res;
});`,

  // ─── 4xx Error del Cliente ───

  400: `// 400 Bad Request — Pedir Ketchup en la Taquería
// La petición está malformada o es inválida
#include "crow.h"

CROW_ROUTE(app, "/api/transferencias").methods("POST"_method)
([](const crow::request& req) {
    auto body = crow::json::load(req.body);

    // Validar que la petición tenga sentido básico
    if (!body || !body.has("cuenta_origen") ||
        !body.has("cuenta_destino") || !body.has("monto")) {
        return crow::response(400,
            crow::json::wvalue{{"error", "Faltan campos requeridos"}}.dump());
    }

    double monto = body["monto"].d();
    if (monto <= 0) {
        return crow::response(400,
            crow::json::wvalue{{"error", "El monto debe ser positivo"}}.dump());
    }

    auto transferencia = ejecutar_transferencia(body);
    auto res = crow::response(201, transferencia.to_json());
    res.add_header("Location",
        "/api/transferencias/" + std::to_string(transferencia.id));
    return res;
});`,

  401: `// 401 Unauthorized — Colonia Cerrada con Plumas
// No autenticado: no sabemos quién eres
#include "crow.h"

CROW_ROUTE(app, "/api/expediente")
([](const crow::request& req) {
    auto auth = req.get_header_value("Authorization");

    if (auth.empty()) {
        // Sin credenciales. No pasas.
        crow::response res(401,
            crow::json::wvalue{{"error", "Token de autenticación requerido"}}.dump());
        res.add_header("WWW-Authenticate", "Bearer realm=\\"api\\"");
        return res;
    }

    // Extraer token: "Bearer <token>"
    std::string token = auth.substr(7);
    auto usuario = verificar_token(token);

    if (!usuario.has_value()) {
        // Token inválido o expirado
        crow::response res(401,
            crow::json::wvalue{{"error", "Token inválido o expirado"}}.dump());
        res.add_header("WWW-Authenticate",
            "Bearer realm=\\"api\\", error=\\"invalid_token\\"");
        return res;
    }

    auto expediente = Expediente::buscar_por_usuario(usuario->id);
    return crow::response(200, expediente.to_json());
});`,

  402: `// 402 Payment Required — La Mordida
// Pago requerido para acceder al recurso
#include "crow.h"

CROW_ROUTE(app, "/api/reportes/premium/<string>")
([](const crow::request& req, const std::string& reporte_id) {
    auto usuario = obtener_usuario(req);
    auto suscripcion = Suscripcion::buscar_por_usuario(usuario.id);

    if (!suscripcion.has_value() || suscripcion->estado != "activa") {
        // Sin pago, sin acceso. Así funciona.
        return crow::response(402,
            crow::json::wvalue{{"error", "Se requiere suscripción activa"}}.dump());
    }

    if (suscripcion->tipo == "basica" &&
        reporte_id.substr(0, 8) == "avanzado") {
        return crow::response(402,
            crow::json::wvalue{{"error", "Requiere suscripción avanzada"}}.dump());
    }

    auto reporte = Reporte::generar(reporte_id);
    return crow::response(200, reporte.to_json());
});`,

  403: `// 403 Forbidden — Campo Militar No. 1
// Autenticado pero sin permisos. Prohibido. Punto.
#include "crow.h"

CROW_ROUTE(app, "/api/usuarios/<int>").methods("DELETE"_method)
([](const crow::request& req, int usuario_id) {
    auto solicitante = obtener_usuario(req);

    // Solo administradores pueden eliminar usuarios
    if (solicitante.rol != "admin") {
        // Sabemos quién eres, pero no tienes permiso
        return crow::response(403,
            crow::json::wvalue{{"error",
                "No tienes permisos para esta acción"}}.dump());
    }

    // No permitir auto-eliminación
    if (usuario_id == solicitante.id) {
        return crow::response(403,
            crow::json::wvalue{{"error",
                "No puedes eliminar tu propia cuenta"}}.dump());
    }

    Usuario::eliminar(usuario_id);
    return crow::response(204); // Sin cuerpo
});`,

  404: `// 404 Not Found — Los 43 de Ayotzinapa
// El recurso no existe. Buscado. No encontrado.
#include "crow.h"

CROW_ROUTE(app, "/api/expedientes/<string>")
([](const std::string& folio) {
    auto expediente = Expediente::buscar_por_folio(folio);

    if (!expediente.has_value()) {
        // No existe. El 404 lo dice todo.
        return crow::response(404,
            crow::json::wvalue{{"error",
                "Expediente no encontrado"}}.dump());
    }

    return crow::response(200, expediente->to_json());
});`,

  405: `// 405 Method Not Allowed — Protesta Reprimida en Atenco
// El método HTTP no está permitido en esta ruta
#include "crow.h"

// Solo GET está permitido en esta ruta
CROW_ROUTE(app, "/api/reportes/incidencias").methods("GET"_method)
([]() {
    auto reportes = Reporte::listar_por_tipo("incidencia");
    return crow::response(200, reportes.to_json());
});

// Crow devuelve 405 automáticamente para métodos no registrados
// Personalizar el manejo de errores:
app.default_route()
([](const crow::request& req) {
    if (req.url == "/api/reportes/incidencias") {
        crow::response res(405,
            crow::json::wvalue{{"error",
                "Método no permitido. Solo se acepta GET."}}.dump());
        res.add_header("Allow", "GET");
        return res;
    }
    return crow::response(404);
});`,

  406: `// 406 Not Acceptable — Leche Adulterada
// El servidor no puede producir el formato que el cliente pide
#include "crow.h"
#include <set>

CROW_ROUTE(app, "/api/datos/exportar")
([](const crow::request& req) {
    std::set<std::string> formatos_permitidos = {
        "application/json", "text/csv"
    };

    auto accept = req.get_header_value("Accept");
    if (accept.empty()) accept = "application/json";

    if (formatos_permitidos.find(accept) == formatos_permitidos.end()) {
        // No podemos entregar en el formato que pides
        crow::json::wvalue error;
        error["error"] = "Formato no soportado";
        error["formatos_disponibles"][0] = "application/json";
        error["formatos_disponibles"][1] = "text/csv";
        return crow::response(406, error.dump());
    }

    auto datos = Datos::exportar();

    if (accept == "text/csv") {
        crow::response res(200, convertir_a_csv(datos));
        res.set_header("Content-Type", "text/csv");
        return res;
    }

    return crow::response(200, datos.dump());
});`,

  408: `// 408 Request Timeout — Justicia que Prescribe
// El servidor se cansó de esperar la solicitud completa
#include "crow.h"
#include <future>
#include <chrono>

CROW_ROUTE(app, "/api/consultas/pesadas").methods("POST"_method)
([](const crow::request& req) {
    auto body = crow::json::load(req.body);

    // Ejecutar consulta con timeout de 30 segundos
    auto futuro = std::async(std::launch::async, [&body]() {
        return ejecutar_consulta(body);
    });

    auto estado = futuro.wait_for(std::chrono::seconds(30));

    if (estado == std::future_status::timeout) {
        // El tiempo expiró. Como los casos que prescriben.
        return crow::response(408,
            crow::json::wvalue{{"error",
                "Tiempo de espera agotado"}}.dump());
    }

    auto resultado = futuro.get();
    return crow::response(200, resultado.dump());
});`,

  409: `// 409 Conflict — Disputa Territorial del Narco
// Conflicto con el estado actual del recurso
#include "crow.h"

CROW_ROUTE(app, "/api/inventario/<string>").methods("PUT"_method)
([](const crow::request& req, const std::string& sku) {
    auto body = crow::json::load(req.body);
    int cantidad = body["cantidad"].i();
    int version = body["version"].i();

    auto producto = Inventario::buscar(sku);
    if (!producto.has_value()) {
        return crow::response(404,
            crow::json::wvalue{{"error", "Producto no encontrado"}}.dump());
    }

    // Verificar conflicto de versiones (optimistic locking)
    if (producto->version != version) {
        // Dos escrituras sobre el mismo territorio: conflicto
        crow::json::wvalue error;
        error["error"] = "El recurso fue modificado por otro proceso";
        error["version_actual"] = producto->version;
        return crow::response(409, error.dump());
    }

    producto->actualizar(cantidad);
    return crow::response(200, producto->to_json());
});`,

  410: `// 410 Gone — Ruta 100: Desaparecida para Siempre
// El recurso existió pero fue eliminado permanentemente
#include "crow.h"

CROW_ROUTE(app, "/api/servicios/ruta-100")
([]() {
    // Este recurso ya no existe y no volverá
    // A diferencia del 404, confirmamos que SÍ existió
    return crow::response(410,
        crow::json::wvalue{{"error",
            "Este servicio fue descontinuado permanentemente"}}.dump());
});

// Endpoints deprecados de API antigua
CROW_ROUTE(app, "/api/v1/<path>")
([](const std::string&) {
    crow::response res(410,
        crow::json::wvalue{{"error",
            "API v1 fue eliminada. Migre a /api/v3/"}}.dump());
    res.add_header("Sunset", "Sat, 01 Jan 2025 00:00:00 GMT");
    return res;
});`,

  413: `// 413 Payload Too Large — Colapso de la Línea 12
// El cuerpo de la solicitud excede el límite permitido
#include "crow.h"

constexpr size_t LIMITE_BYTES = 10 * 1024 * 1024; // 10MB

CROW_ROUTE(app, "/api/documentos").methods("POST"_method)
([](const crow::request& req) {
    auto content_length = req.get_header_value("Content-Length");
    size_t tamano = content_length.empty() ? 0 : std::stoull(content_length);

    if (tamano > LIMITE_BYTES) {
        // Sobrecarga. La infraestructura no soporta más.
        crow::response res(413,
            crow::json::wvalue{{"error",
                "El archivo excede el tamaño máximo (10MB)"}}.dump());
        res.add_header("Retry-After", "3600");
        return res;
    }

    auto documento = Documento::guardar(req.body);
    auto res = crow::response(201, documento.to_json());
    res.add_header("Location",
        "/api/documentos/" + std::to_string(documento.id));
    return res;
});`,

  415: `// 415 Unsupported Media Type — CURP con Formato Obsoleto
// El formato del contenido no es soportado
#include "crow.h"
#include <set>

CROW_ROUTE(app, "/api/documentos/importar").methods("POST"_method)
([](const crow::request& req) {
    std::set<std::string> tipos_permitidos = {
        "application/json", "application/xml", "text/csv"
    };

    auto content_type = req.get_header_value("Content-Type");

    if (tipos_permitidos.find(content_type) == tipos_permitidos.end()) {
        // Formato no soportado. Actualice su sistema.
        crow::json::wvalue error;
        error["error"] = "Tipo de contenido no soportado";
        error["tipos_aceptados"][0] = "application/json";
        error["tipos_aceptados"][1] = "application/xml";
        error["tipos_aceptados"][2] = "text/csv";
        return crow::response(415, error.dump());
    }

    auto datos = procesar_importacion(content_type, req.body);
    return crow::response(200, datos.dump());
});`,

  418: `// 418 I'm a Teapot — La Olla de Tamales de Doña Mary
// Cada cosa tiene su función. No le pidas café a la tetera.
#include "crow.h"

CROW_ROUTE(app, "/api/cafeteria/cafe")
([]() {
    // RFC 2324 — Soy una tetera. No hago café.
    // Como Doña Mary: no le pidas sushi a la tamalera
    crow::json::wvalue respuesta;
    respuesta["error"] = "Soy una tetera. No preparo café.";
    respuesta["sugerencia"] = "Pruebe con /api/cafeteria/te";

    return crow::response(418, respuesta.dump());
});

// El único código "ligero" del proyecto
CROW_ROUTE(app, "/api/tamales")
([]() {
    crow::json::wvalue tamales;
    tamales[0]["tipo"] = "verde";  tamales[0]["precio"] = 15;
    tamales[1]["tipo"] = "rojo";   tamales[1]["precio"] = 15;
    tamales[2]["tipo"] = "rajas";  tamales[2]["precio"] = 18;

    return crow::response(200, tamales.dump());
});`,

  422: `// 422 Unprocessable Entity — Declaración Rechazada por el SAT
// La sintaxis es correcta pero los datos no son procesables
#include "crow.h"

CROW_ROUTE(app, "/api/usuarios").methods("POST"_method)
([](const crow::request& req) {
    auto body = crow::json::load(req.body);
    crow::json::wvalue errores;
    bool hay_errores = false;

    // Validar cada campo
    if (!body.has("email") || std::string(body["email"].s()).empty()) {
        errores["email"][0] = "El email es obligatorio";
        hay_errores = true;
    }

    if (!body.has("nombre") || std::string(body["nombre"].s()).size() < 3) {
        errores["nombre"][0] = "El nombre es obligatorio";
        errores["nombre"][1] = "Mínimo 3 caracteres";
        hay_errores = true;
    }

    if (hay_errores) {
        // Entendemos la petición, pero los datos no cuadran
        crow::json::wvalue respuesta;
        respuesta["errors"] = std::move(errores);
        return crow::response(422, respuesta.dump());
    }

    auto usuario = Usuario::crear(body);
    auto res = crow::response(201, usuario.to_json());
    res.add_header("Location",
        "/api/usuarios/" + std::to_string(usuario.id));
    return res;
});`,

  429: `// 429 Too Many Requests — Apagones de CFE
// Demasiadas solicitudes. El sistema está sobrecargado.
#include "crow.h"
#include <unordered_map>
#include <chrono>
#include <mutex>

// Rate limiter simple
struct RateLimiter {
    std::unordered_map<std::string, int> contadores;
    std::mutex mtx;
    static constexpr int MAX_PETICIONES = 100;

    bool verificar(const std::string& ip) {
        std::lock_guard<std::mutex> lock(mtx);
        auto& contador = contadores[ip];
        if (contador >= MAX_PETICIONES) {
            return false; // Límite excedido
        }
        contador++;
        return true;
    }
};

RateLimiter limitador;

// Middleware de rate limiting
struct MiddlewareRateLimit : crow::ILocalMiddleware {
    struct context {};
    void before_handle(crow::request& req, crow::response& res, context&) {
        if (!limitador.verificar(req.remote_ip_address)) {
            // Sobrecarga. Demasiada demanda.
            res.code = 429;
            res.add_header("Retry-After", "900");
            res.body = crow::json::wvalue{{"error",
                "Demasiadas solicitudes. Intente más tarde."}}.dump();
            res.end();
        }
    }
    void after_handle(crow::request&, crow::response&, context&) {}
};`,

  451: `// 451 Unavailable For Legal Reasons — Periodistas Censurados
// Contenido no disponible por razones legales
#include "crow.h"

CROW_ROUTE(app, "/api/publicaciones/<int>")
([](int publicacion_id) {
    auto publicacion = Publicacion::buscar(publicacion_id);

    if (!publicacion.has_value()) {
        return crow::response(404,
            crow::json::wvalue{{"error",
                "Publicación no encontrada"}}.dump());
    }

    if (publicacion->bloqueada_legalmente) {
        // Censurado. Bloqueado por orden legal.
        crow::response res(451,
            crow::json::wvalue{{"error",
                "Contenido no disponible por orden judicial"}}.dump());
        res.add_header("Link",
            "<https://ejemplo.mx/orden-judicial/12345>; rel=\\"blocked-by\\"");
        return res;
    }

    return crow::response(200, publicacion->to_json());
});`,

  // ─── 5xx Error del Servidor ───

  500: `// 500 Internal Server Error — La Explosión de San Juanico
// Fallo interno catastrófico. Nunca exponer detalles al cliente.
#include "crow.h"
#include <iostream>

CROW_ROUTE(app, "/api/dashboard")
([](const crow::request& req) {
    try {
        auto ventas = Venta::resumen();
        auto usuarios = Usuario::conteo();
        auto metricas = Metrica::calcular();

        crow::json::wvalue respuesta;
        respuesta["ventas"] = ventas;
        respuesta["usuarios"] = usuarios;
        respuesta["metricas"] = metricas;

        return crow::response(200, respuesta.dump());
    } catch (const std::exception& e) {
        // Registrar internamente TODO el detalle
        CROW_LOG_ERROR << "Error catastrófico en dashboard: " << e.what();

        // Al cliente: NUNCA el stack trace. Solo el mínimo.
        return crow::response(500,
            crow::json::wvalue{{"error",
                "Error interno del servidor"}}.dump());
    }
});`,

  501: `// 501 Not Implemented — Sistema de Salud Universal
// Funcionalidad reconocida pero no implementada
#include "crow.h"

// PATCH no implementado aún
CROW_ROUTE(app, "/api/usuarios/<int>").methods("PATCH"_method)
([](int id) {
    // Como el sistema de salud universal: prometido, nunca construido
    return crow::response(501,
        crow::json::wvalue{{"error",
            "Actualización parcial no implementada"}}.dump());
});

// PUT sí funciona: actualización completa del recurso
CROW_ROUTE(app, "/api/usuarios/<int>").methods("PUT"_method)
([](const crow::request& req, int id) {
    auto body = crow::json::load(req.body);
    auto usuario = Usuario::buscar(id);

    if (!usuario.has_value()) {
        return crow::response(404);
    }

    usuario->actualizar(body);
    return crow::response(200, usuario->to_json());
});`,

  502: `// 502 Bad Gateway — El Huachicol
// El intermediario recibió respuesta inválida del upstream
#include "crow.h"
#include <cpr/cpr.h>

CROW_ROUTE(app, "/api/clima/<string>")
([](const std::string& ciudad) {
    // Actuar como gateway hacia servicio externo
    auto respuesta = cpr::Get(
        cpr::Url{"https://api.clima-externo.mx/v1/" + ciudad},
        cpr::Timeout{5000} // 5 segundos de timeout
    );

    if (respuesta.status_code >= 500) {
        // El servicio upstream falló
        return crow::response(502,
            crow::json::wvalue{{"error",
                "El servicio de clima no responde correctamente"}}.dump());
    }

    if (respuesta.status_code == 0) {
        // Error de conexión con el servicio externo
        return crow::response(502,
            crow::json::wvalue{{"error",
                "Error al comunicarse con el servicio externo"}}.dump());
    }

    crow::response res(200, respuesta.text);
    res.set_header("Content-Type", "application/json");
    return res;
});`,

  503: `// 503 Service Unavailable — Hospital Sin Medicinas
// El servicio no puede atender solicitudes en este momento
#include "crow.h"

// Middleware para verificar disponibilidad del servicio
struct VerificarDisponibilidad : crow::ILocalMiddleware {
    struct context {};

    void before_handle(crow::request& req, crow::response& res, context&) {
        auto estado = verificar_estado_servicio();

        if (estado.mantenimiento) {
            res.code = 503;
            res.add_header("Retry-After",
                std::to_string(estado.tiempo_estimado));
            res.body = crow::json::wvalue{{"error",
                "Servicio en mantenimiento programado"}}.dump();
            res.end();
            return;
        }

        if (estado.sobrecargado) {
            res.code = 503;
            res.add_header("Retry-After", "120");
            res.body = crow::json::wvalue{{"error",
                "Servicio temporalmente no disponible"}}.dump();
            res.end();
        }
    }

    void after_handle(crow::request&, crow::response&, context&) {}
};`,

  504: `// 504 Gateway Timeout — Llamar a Locatel
// El gateway no recibió respuesta a tiempo del upstream
#include "crow.h"
#include <cpr/cpr.h>

CROW_ROUTE(app, "/api/consultas/curp/<string>")
([](const std::string& curp) {
    // Consultar servicio gubernamental (que siempre tarda)
    auto respuesta = cpr::Get(
        cpr::Url{"https://api.renapo.gob.mx/v1/curp/" + curp},
        cpr::Timeout{30000} // 30 segundos de paciencia
    );

    if (respuesta.status_code == 0 && respuesta.error.code ==
        cpr::ErrorCode::OPERATION_TIMEDOUT) {
        // El servicio upstream nunca respondió
        // Como Locatel: intentas conectar pero nadie contesta
        return crow::response(504,
            crow::json::wvalue{{"error",
                "El servicio externo no respondió a tiempo"}}.dump());
    }

    if (respuesta.status_code == 0) {
        return crow::response(502,
            crow::json::wvalue{{"error",
                "Error en el servicio externo"}}.dump());
    }

    crow::response res(200, respuesta.text);
    res.set_header("Content-Type", "application/json");
    return res;
});`,

  507: `// 507 Insufficient Storage — Presas Desbordadas en Tabasco
// El servidor no tiene espacio suficiente
#include "crow.h"
#include <filesystem>

CROW_ROUTE(app, "/api/respaldos").methods("POST"_method)
([]() {
    // Verificar espacio disponible
    auto info = std::filesystem::space("/");
    size_t espacio_minimo = 500ULL * 1024 * 1024; // 500MB

    if (info.available < espacio_minimo) {
        // Sin capacidad. El sistema se desborda.
        return crow::response(507,
            crow::json::wvalue{{"error",
                "Espacio de almacenamiento insuficiente"}}.dump());
    }

    auto respaldo = Respaldo::crear();
    auto res = crow::response(201, respaldo.to_json());
    res.add_header("Location",
        "/api/respaldos/" + std::to_string(respaldo.id));
    return res;
});`,

  508: `// 508 Loop Detected — El Trámite Infinito CURP-INE
// Se detectó un bucle infinito al procesar la solicitud
#include "crow.h"
#include <set>

// Resolver recurso detectando referencias circulares
std::optional<Recurso> resolver(int id, std::set<int>& visitados) {
    // Detectar referencia circular
    if (visitados.count(id)) {
        // Loop: A apunta a B que apunta a A
        // Como el trámite CURP-INE: necesitas uno para el otro
        return std::nullopt;
    }

    visitados.insert(id);
    auto recurso = Recurso::buscar(id);

    if (!recurso.has_value()) return std::nullopt;

    if (recurso->referencia_id > 0) {
        return resolver(recurso->referencia_id, visitados);
    }

    return recurso;
}

CROW_ROUTE(app, "/api/recursos/<int>")
([](int id) {
    std::set<int> visitados;
    auto resultado = resolver(id, visitados);

    if (!resultado.has_value()) {
        return crow::response(508,
            crow::json::wvalue{{"error",
                "Referencia circular detectada"}}.dump());
    }

    return crow::response(200, resultado->to_json());
});`,

  511: `// 511 Network Authentication Required — WiFi del Aeropuerto
// Se requiere autenticación a nivel de red
#include "crow.h"

// Middleware de portal cautivo
struct PortalCautivo : crow::ILocalMiddleware {
    struct context {};

    void before_handle(crow::request& req, crow::response& res, context&) {
        auto mac_cliente = req.get_header_value("X-Client-Mac");
        bool autenticado = verificar_autenticacion_red(mac_cliente);

        if (!autenticado) {
            // Red disponible pero requiere autenticación
            // Como el WiFi del aeropuerto: ves la red, pero paga primero
            res.code = 511;
            res.set_header("Content-Type", "text/html");
            res.body = R"(
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
            )";
            res.end();
        }
    }

    void after_handle(crow::request&, crow::response&, context&) {}
};`,
}
