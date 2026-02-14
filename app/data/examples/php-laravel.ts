// Ejemplos de código HTTP en PHP (Laravel)
// Todos los comentarios en español
// Filosofía HTTP: el código de estado ES el mensaje. Sin envolturas innecesarias.

export const phpLaravelExamples: Record<number, string> = {
  // ─── 1xx Informativos ───

  100: `// 100 Continue — La Espera en el IMSS
// El servidor indica al cliente que puede continuar enviando el cuerpo
<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;

class ArchivoController extends Controller
{
    public function subir(Request $request)
    {
        $tamano = $request->header('Content-Length', 0);
        $limite = 50 * 1024 * 1024; // 50MB

        if ($tamano > $limite) {
            // Rechazar antes de recibir todo el archivo
            abort(413, 'Archivo demasiado grande');
        }

        // Laravel maneja el 100 Continue automáticamente
        // cuando el cliente envía Expect: 100-continue
        $archivo = $request->file('documento');
        $ruta = $archivo->store('documentos');

        return response()->json(['ruta' => $ruta], 201)
            ->header('Location', "/api/archivos/{$ruta}");
    }
}`,

  101: `// 101 Switching Protocols — Cambio de Mando Presidencial
// Upgrade de HTTP a WebSocket usando Laravel Reverb
<?php

// En Laravel, WebSockets se manejan con Reverb o Laravel Echo
// El handshake 101 lo maneja el servidor WebSocket

namespace App\\Events;

use Illuminate\\Broadcasting\\Channel;
use Illuminate\\Contracts\\Broadcasting\\ShouldBroadcast;

class NotificacionEnviada implements ShouldBroadcast
{
    public function __construct(
        public string $mensaje,
        public string $canal,
    ) {}

    // El servidor acepta el upgrade de protocolo automáticamente
    // y transmite eventos a los clientes conectados
    public function broadcastOn(): Channel
    {
        return new Channel($this->canal);
    }

    public function broadcastAs(): string
    {
        return 'notificacion.nueva';
    }
}`,

  102: `// 102 Processing — Trámite en la SEP
// Indica que la solicitud se recibió y está en procesamiento
<?php

namespace App\\Http\\Controllers;

use App\\Jobs\\GenerarReporte;
use Illuminate\\Http\\Request;

class ReporteController extends Controller
{
    public function generar(Request $request)
    {
        $request->validate([
            'tipo' => 'required|string',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio',
        ]);

        // Enviar a cola para procesamiento largo
        $tarea = Tarea::create([
            'tipo' => 'reporte',
            'estado' => 'procesando',
        ]);

        GenerarReporte::dispatch($tarea, $request->all());

        // 202 Accepted: aceptamos pero no está listo
        return response()->json(
            ['tarea_id' => $tarea->id, 'estado' => 'procesando'],
            202
        )->header('Location', "/api/tareas/{$tarea->id}");
    }
}`,

  103: `// 103 Early Hints — La Alerta Sísmica
// Envía hints tempranos antes de la respuesta final
<?php

namespace App\\Http\\Controllers;

class PaginaController extends Controller
{
    public function principal()
    {
        // Los early hints se configuran a nivel de servidor web
        // En Laravel, indicamos los recursos a precargar via headers
        $html = view('app')->render();

        return response($html, 200)
            ->header('Content-Type', 'text/html')
            ->header('Link', implode(', ', [
                '</css/main.css>; rel=preload; as=style',
                '</js/app.js>; rel=preload; as=script',
                '</fonts/bebas-neue.woff2>; rel=preload; as=font; crossorigin',
            ]));
    }
}`,

  // ─── 2xx Éxito ───

  200: `// 200 OK — El Maíz Llegó a la Milpa
// Devolver datos directamente. Sin envolturas.
<?php

namespace App\\Http\\Controllers;

use App\\Models\\Producto;
use Illuminate\\Http\\Request;

class ProductoController extends Controller
{
    public function index(Request $request)
    {
        $query = Producto::query();

        if ($request->has('categoria')) {
            $query->where('categoria', $request->categoria);
        }

        // El 200 ya dice que todo salió bien
        // Solo devuelve los datos, nada más
        $productos = $query->orderByDesc('created_at')
            ->paginate($request->input('limite', 20));

        return response()->json($productos);
    }
}`,

  201: `// 201 Created — Fundación de Tenochtitlan
// Recurso creado: devolver el recurso + Location header
<?php

namespace App\\Http\\Controllers;

use App\\Models\\Proyecto;
use Illuminate\\Http\\Request;

class ProyectoController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'responsable' => 'required|string',
        ]);

        $proyecto = Proyecto::create([
            ...$request->validated(),
            'estado' => 'activo',
        ]);

        // 201 + Location + el recurso creado
        return response()->json($proyecto, 201)
            ->header('Location', "/api/proyectos/{$proyecto->id}");
    }
}`,

  202: `// 202 Accepted — "Ya Quedó, Jefe"
// Solicitud aceptada pero procesamiento pendiente
<?php

namespace App\\Http\\Controllers;

use App\\Jobs\\ProcesarExportacion;
use App\\Models\\Tarea;
use Illuminate\\Http\\Request;

class ExportacionController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'formato' => 'required|in:csv,xlsx,pdf',
            'filtros' => 'array',
        ]);

        // Crear tarea en cola de procesamiento
        $tarea = Tarea::create([
            'tipo' => 'exportacion',
            'estado' => 'pendiente',
            'parametros' => $request->all(),
        ]);

        // Aceptamos, pero no está lista
        ProcesarExportacion::dispatch($tarea);

        return response()->json(
            ['tarea_id' => $tarea->id, 'estado' => 'pendiente'],
            202
        )->header('Location', "/api/tareas/{$tarea->id}");
    }
}`,

  204: `// 204 No Content — Presa Vacía en Sequía
// Operación exitosa, sin cuerpo en la respuesta
<?php

namespace App\\Http\\Controllers;

use App\\Models\\Sesion;
use Illuminate\\Http\\Request;

class SesionController extends Controller
{
    public function destroy(Request $request, int $id)
    {
        $sesion = Sesion::findOrFail($id);

        // Verificar que la sesión pertenece al usuario autenticado
        if ($sesion->usuario_id !== $request->user()->id) {
            abort(403);
        }

        $sesion->delete();

        // 204: operación exitosa, nada que devolver
        // El silencio es la respuesta
        return response()->noContent();
    }
}`,

  206: `// 206 Partial Content — Reconstrucción Post-Sismo 2017
// Devolver solo una porción del recurso
<?php

namespace App\\Http\\Controllers;

use App\\Models\\Archivo;
use Illuminate\\Http\\Request;

class ArchivoController extends Controller
{
    public function contenido(Request $request, int $id)
    {
        $archivo = Archivo::findOrFail($id);
        $ruta = storage_path("app/{$archivo->ruta}");
        $tamano = filesize($ruta);

        if (!$request->hasHeader('Range')) {
            return response()->file($ruta);
        }

        // Parsear rango: bytes=inicio-fin
        preg_match('/bytes=(\\d+)-(\\d*)/', $request->header('Range'), $matches);
        $inicio = (int) $matches[1];
        $fin = $matches[2] !== '' ? (int) $matches[2] : $tamano - 1;

        $handle = fopen($ruta, 'rb');
        fseek($handle, $inicio);
        $contenido = fread($handle, $fin - $inicio + 1);
        fclose($handle);

        return response($contenido, 206)->withHeaders([
            'Content-Range' => "bytes {$inicio}-{$fin}/{$tamano}",
            'Accept-Ranges' => 'bytes',
            'Content-Length' => $fin - $inicio + 1,
            'Content-Type' => $archivo->tipo_mime,
        ]);
    }
}`,

  // ─── 3xx Redirección ───

  301: `// 301 Moved Permanently — El Aeropuerto de Texcoco Cancelado
// Redirección permanente: el recurso cambió de ubicación para siempre
<?php

// En routes/api.php
use Illuminate\\Support\\Facades\\Route;

// La API v1 fue deprecada permanentemente
Route::get('/api/v1/usuarios', function () {
    // Como Texcoco fue redirigido a Felipe Ángeles
    // Los motores de búsqueda actualizarán sus índices
    return redirect('/api/v2/usuarios', 301);
});

// Ruta legacy del sitio
Route::get('/perfil/{id}', function (int $id) {
    return redirect("/usuarios/{$id}", 301);
});`,

  302: `// 302 Found (Redirect Temporal) — Desvío por el Socavón de Puebla
// Redirección temporal: el recurso está en otro lugar por ahora
<?php

namespace App\\Http\\Controllers;

use App\\Services\\MantenimientoService;

class ConfiguracionController extends Controller
{
    public function index(MantenimientoService $mantenimiento)
    {
        if ($mantenimiento->activo()) {
            // Desvío temporal mientras dura el mantenimiento
            // Como el socavón: "use la otra ruta mientras tanto"
            return redirect('/api/configuracion/cache', 302);
        }

        $config = config('app');

        return response()->json($config);
    }
}`,

  303: `// 303 See Other — "Vaya a la Ventanilla 7"
// Después de un POST, redirigir a otro recurso con GET
<?php

namespace App\\Http\\Controllers;

use App\\Models\\Pedido;
use Illuminate\\Http\\Request;

class PedidoController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'productos' => 'required|array|min:1',
            'direccion' => 'required|string',
        ]);

        $pedido = Pedido::create([
            'productos' => $request->productos,
            'direccion' => $request->direccion,
            'estado' => 'procesando',
            'usuario_id' => $request->user()->id,
        ]);

        // Después de crear, redirigir al recibo con GET
        // "Su trámite se registró, pase a ventanilla 7"
        return redirect("/api/pedidos/{$pedido->id}/recibo", 303);
    }
}`,

  304: `// 304 Not Modified — Las Reformas que No Cambian Nada
// El recurso no ha cambiado desde la última vez
<?php

namespace App\\Http\\Controllers;

use App\\Models\\Catalogo;
use Illuminate\\Http\\Request;

class CatalogoController extends Controller
{
    public function index(Request $request)
    {
        $ultimaModificacion = Catalogo::max('updated_at');
        $etag = md5($ultimaModificacion);

        // Verificar si el cliente ya tiene la versión actual
        if ($request->header('If-None-Match') === $etag) {
            // Nada cambió. Como siempre.
            return response('', 304);
        }

        $catalogo = Catalogo::all();

        return response()->json($catalogo)
            ->header('ETag', $etag)
            ->header('Last-Modified', $ultimaModificacion)
            ->header('Cache-Control', 'max-age=3600');
    }
}`,

  307: `// 307 Temporary Redirect — Bloqueo en Reforma por Manifestación
// Redirección temporal que PRESERVA el método HTTP original
<?php

namespace App\\Http\\Controllers;

use App\\Services\\PasarelaService;
use Illuminate\\Http\\Request;

class PagoController extends Controller
{
    public function procesar(Request $request, PasarelaService $pasarela)
    {
        if (!$pasarela->disponible()) {
            // A diferencia del 302, el 307 mantiene el método original
            // POST sigue siendo POST en el destino
            return redirect(
                'https://respaldo.pagos.mx/api/pagos',
                307
            );
        }

        // Procesar pago normalmente
        $resultado = $pasarela->cobrar($request->all());

        return response()->json($resultado);
    }
}`,

  308: `// 308 Permanent Redirect — De DF a CDMX
// Redirección permanente que PRESERVA el método HTTP
<?php

// En routes/api.php
use Illuminate\\Support\\Facades\\Route;
use Illuminate\\Http\\Request;

// El recurso cambió permanentemente de ubicación
// Como el DF → CDMX: el nombre cambió para siempre
Route::any('/api/distrito-federal/{ruta}', function (Request $request, string $ruta) {
    // A diferencia del 301, el 308 preserva el método original
    $nuevaUrl = "/api/cdmx/{$ruta}";

    return redirect($nuevaUrl, 308);
})->where('ruta', '.*');`,

  // ─── 4xx Error del Cliente ───

  400: `// 400 Bad Request — Pedir Ketchup en la Taquería
// La petición está malformada o es inválida
<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;

class TransferenciaController extends Controller
{
    public function store(Request $request)
    {
        // Validación básica de estructura de la petición
        if (!$request->has(['cuenta_origen', 'cuenta_destino', 'monto'])) {
            return response()->json(
                ['error' => 'Faltan campos requeridos en la solicitud'],
                400
            );
        }

        if (!is_numeric($request->monto) || $request->monto <= 0) {
            return response()->json(
                ['error' => 'El monto debe ser un número positivo'],
                400
            );
        }

        $transferencia = $this->ejecutar($request->all());

        return response()->json($transferencia, 201)
            ->header('Location', "/api/transferencias/{$transferencia->id}");
    }
}`,

  401: `// 401 Unauthorized — Colonia Cerrada con Plumas
// No autenticado: no sabemos quién eres
<?php

namespace App\\Http\\Middleware;

use Closure;
use Illuminate\\Http\\Request;

class VerificarToken
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            // Sin credenciales. No pasas.
            return response()->json(
                ['error' => 'Token de autenticación requerido'],
                401
            )->header('WWW-Authenticate', 'Bearer realm="api"');
        }

        try {
            $usuario = $this->verificarToken($token);
            $request->merge(['usuario_autenticado' => $usuario]);
        } catch (\\Exception $e) {
            // Token inválido o expirado
            return response()->json(
                ['error' => 'Token inválido o expirado'],
                401
            )->header('WWW-Authenticate', 'Bearer realm="api", error="invalid_token"');
        }

        return $next($request);
    }
}`,

  402: `// 402 Payment Required — La Mordida
// Pago requerido para acceder al recurso
<?php

namespace App\\Http\\Controllers;

use App\\Models\\Suscripcion;
use Illuminate\\Http\\Request;

class ReportePremiumController extends Controller
{
    public function show(Request $request, string $reporteId)
    {
        $usuario = $request->user();
        $suscripcion = Suscripcion::where('usuario_id', $usuario->id)->first();

        if (!$suscripcion || $suscripcion->estado !== 'activa') {
            // Sin pago, sin acceso. Así funciona.
            return response()->json(
                ['error' => 'Se requiere suscripción activa'],
                402
            );
        }

        if ($suscripcion->tipo === 'basica' && str_starts_with($reporteId, 'avanzado')) {
            return response()->json(
                ['error' => 'Este reporte requiere suscripción avanzada'],
                402
            );
        }

        $reporte = $this->generarReporte($reporteId);
        return response()->json($reporte);
    }
}`,

  403: `// 403 Forbidden — Campo Militar No. 1
// Autenticado pero sin permisos. Prohibido. Punto.
<?php

namespace App\\Http\\Controllers;

use App\\Models\\Usuario;
use Illuminate\\Http\\Request;

class UsuarioController extends Controller
{
    public function destroy(Request $request, int $id)
    {
        $solicitante = $request->user();

        // Solo administradores pueden eliminar usuarios
        if ($solicitante->rol !== 'admin') {
            // Sabemos quién eres, pero no tienes permiso
            return response()->json(
                ['error' => 'No tienes permisos para realizar esta acción'],
                403
            );
        }

        // No permitir auto-eliminación
        if ($id === $solicitante->id) {
            return response()->json(
                ['error' => 'No puedes eliminar tu propia cuenta'],
                403
            );
        }

        Usuario::findOrFail($id)->delete();

        return response()->noContent(); // 204
    }
}`,

  404: `// 404 Not Found — Los 43 de Ayotzinapa
// El recurso no existe. Buscado. No encontrado.
<?php

namespace App\\Http\\Controllers;

use App\\Models\\Expediente;

class ExpedienteController extends Controller
{
    public function show(string $folio)
    {
        $expediente = Expediente::where('folio', $folio)->first();

        if (!$expediente) {
            // No existe. El 404 lo dice todo.
            return response()->json(
                ['error' => 'Expediente no encontrado'],
                404
            );
        }

        return response()->json($expediente);
    }
}`,

  405: `// 405 Method Not Allowed — Protesta Reprimida en Atenco
// El método HTTP no está permitido en esta ruta
<?php

// En routes/api.php — Solo GET permitido
use Illuminate\\Support\\Facades\\Route;

Route::get('/api/reportes/incidencias', [ReporteController::class, 'incidencias']);

// Laravel devuelve 405 automáticamente si el método no coincide
// Personalizar la respuesta en app/Exceptions/Handler.php:

namespace App\\Exceptions;

use Symfony\\Component\\HttpKernel\\Exception\\MethodNotAllowedHttpException;

class Handler extends ExceptionHandler
{
    public function register(): void
    {
        $this->renderable(function (MethodNotAllowedHttpException $e) {
            return response()->json(
                ['error' => 'Método no permitido'],
                405
            )->header('Allow', implode(', ', $e->getHeaders()['Allow'] ?? ['GET']));
        });
    }
}`,

  406: `// 406 Not Acceptable — Leche Adulterada
// El servidor no puede producir el formato que el cliente pide
<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;

class DatoController extends Controller
{
    public function exportar(Request $request)
    {
        $formatosPermitidos = ['application/json', 'text/csv'];
        $accept = $request->header('Accept', 'application/json');

        if (!in_array($accept, $formatosPermitidos)) {
            // No podemos entregar en el formato que pides
            return response()->json([
                'error' => 'Formato no soportado',
                'formatos_disponibles' => $formatosPermitidos,
            ], 406);
        }

        $datos = $this->obtenerDatos();

        if ($accept === 'text/csv') {
            $csv = $this->convertirACsv($datos);
            return response($csv, 200)
                ->header('Content-Type', 'text/csv');
        }

        return response()->json($datos);
    }
}`,

  408: `// 408 Request Timeout — Justicia que Prescribe
// El servidor se cansó de esperar la solicitud completa
<?php

namespace App\\Http\\Middleware;

use Closure;
use Illuminate\\Http\\Request;

class TimeoutRequest
{
    public function handle(Request $request, Closure $next, int $segundos = 30)
    {
        // Establecer tiempo máximo de ejecución
        set_time_limit($segundos);

        $inicio = microtime(true);

        try {
            $respuesta = $next($request);
        } catch (\\Exception $e) {
            $transcurrido = microtime(true) - $inicio;

            if ($transcurrido >= $segundos) {
                // El tiempo expiró. Como los casos que prescriben.
                return response()->json(
                    ['error' => 'Tiempo de espera agotado'],
                    408
                );
            }

            throw $e;
        }

        return $respuesta;
    }
}`,

  409: `// 409 Conflict — Disputa Territorial del Narco
// Conflicto con el estado actual del recurso
<?php

namespace App\\Http\\Controllers;

use App\\Models\\Inventario;
use Illuminate\\Http\\Request;

class InventarioController extends Controller
{
    public function update(Request $request, string $sku)
    {
        $request->validate([
            'cantidad' => 'required|integer',
            'version' => 'required|integer',
        ]);

        $producto = Inventario::where('sku', $sku)->firstOrFail();

        // Verificar conflicto de versiones (optimistic locking)
        if ($producto->version !== $request->version) {
            // Dos escrituras sobre el mismo territorio: conflicto
            return response()->json([
                'error' => 'El recurso fue modificado por otro proceso',
                'version_actual' => $producto->version,
            ], 409);
        }

        $producto->update([
            'cantidad' => $request->cantidad,
            'version' => $producto->version + 1,
        ]);

        return response()->json($producto);
    }
}`,

  410: `// 410 Gone — Ruta 100: Desaparecida para Siempre
// El recurso existió pero fue eliminado permanentemente
<?php

// En routes/api.php
use Illuminate\\Support\\Facades\\Route;

Route::get('/api/servicios/ruta-100', function () {
    // Este recurso ya no existe y no volverá
    // A diferencia del 404, confirmamos que SÍ existió
    return response()->json(
        ['error' => 'Este servicio fue descontinuado permanentemente'],
        410
    );
});

// Endpoints deprecados de API antigua
Route::any('/api/v1/{ruta}', function () {
    return response()->json(
        ['error' => 'API v1 fue eliminada. Migre a /api/v3/'],
        410
    )->header('Sunset', 'Sat, 01 Jan 2025 00:00:00 GMT');
})->where('ruta', '.*');`,

  413: `// 413 Payload Too Large — Colapso de la Línea 12
// El cuerpo de la solicitud excede el límite permitido
<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;

class DocumentoController extends Controller
{
    private const LIMITE_MB = 10;

    public function store(Request $request)
    {
        $tamano = $request->header('Content-Length', 0);
        $limiteBytes = self::LIMITE_MB * 1024 * 1024;

        if ($tamano > $limiteBytes) {
            // Sobrecarga. La infraestructura no soporta más.
            return response()->json(
                ['error' => 'El archivo excede el tamaño máximo (' . self::LIMITE_MB . 'MB)'],
                413
            )->header('Retry-After', '3600');
        }

        $archivo = $request->file('documento');
        $ruta = $archivo->store('documentos');
        $documento = Documento::create(['ruta' => $ruta, 'tamano' => $tamano]);

        return response()->json($documento, 201)
            ->header('Location', "/api/documentos/{$documento->id}");
    }
}`,

  415: `// 415 Unsupported Media Type — CURP con Formato Obsoleto
// El formato del contenido no es soportado
<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;

class ImportacionController extends Controller
{
    private const TIPOS_PERMITIDOS = [
        'application/json',
        'application/xml',
        'text/csv',
    ];

    public function importar(Request $request)
    {
        $tipoContenido = $request->header('Content-Type');

        if (!in_array($tipoContenido, self::TIPOS_PERMITIDOS)) {
            // Formato no soportado. Actualice su sistema.
            return response()->json([
                'error' => 'Tipo de contenido no soportado',
                'tipos_aceptados' => self::TIPOS_PERMITIDOS,
            ], 415);
        }

        $procesador = $this->obtenerProcesador($tipoContenido);
        $datos = $procesador->parsear($request->getContent());

        return response()->json($datos);
    }
}`,

  418: `// 418 I'm a Teapot — La Olla de Tamales de Doña Mary
// Cada cosa tiene su función. No le pidas café a la tetera.
<?php

// En routes/api.php
use Illuminate\\Support\\Facades\\Route;

// RFC 2324 — Soy una tetera. No hago café.
Route::get('/api/cafeteria/cafe', function () {
    // Como Doña Mary: no le pidas sushi a la tamalera
    return response()->json([
        'error' => 'Soy una tetera. No preparo café.',
        'sugerencia' => 'Pruebe con /api/cafeteria/te',
    ], 418);
});

// El único código "ligero" del proyecto
Route::get('/api/tamales', function () {
    return response()->json([
        ['tipo' => 'verde', 'precio' => 15],
        ['tipo' => 'rojo', 'precio' => 15],
        ['tipo' => 'rajas', 'precio' => 18],
    ]);
});`,

  422: `// 422 Unprocessable Entity — Declaración Rechazada por el SAT
// La sintaxis es correcta pero los datos no son procesables
<?php

// Laravel devuelve 422 automáticamente con FormRequest
namespace App\\Http\\Requests;

use Illuminate\\Foundation\\Http\\FormRequest;

class CrearUsuarioRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'unique:usuarios'],
            'nombre' => ['required', 'min:3'],
        ];
    }

    // Laravel devuelve automáticamente:
    // { "errors": { "email": ["..."], "nombre": ["..."] } }
}

// En el controlador:
namespace App\\Http\\Controllers;

class UsuarioController extends Controller
{
    public function store(CrearUsuarioRequest $request)
    {
        $usuario = Usuario::create($request->validated());

        return response()->json($usuario, 201)
            ->header('Location', "/api/usuarios/{$usuario->id}");
    }
}`,

  429: `// 429 Too Many Requests — Apagones de CFE
// Demasiadas solicitudes. El sistema está sobrecargado.
<?php

// En routes/api.php — Rate limiting con Laravel
use Illuminate\\Support\\Facades\\Route;
use Illuminate\\Cache\\RateLimiting\\Limit;
use Illuminate\\Support\\Facades\\RateLimiter;

// Definir el limitador en AppServiceProvider
RateLimiter::for('api', function ($request) {
    return Limit::perMinute(60)
        ->by($request->user()?->id ?: $request->ip())
        ->response(function () {
            // Sobrecarga. Demasiada demanda. Se cae todo.
            return response()->json(
                ['error' => 'Demasiadas solicitudes. Intente más tarde.'],
                429
            )->header('Retry-After', '900');
        });
});

Route::middleware('throttle:api')->group(function () {
    Route::get('/api/consultas', [ConsultaController::class, 'index']);
});`,

  451: `// 451 Unavailable For Legal Reasons — Periodistas Censurados
// Contenido no disponible por razones legales
<?php

namespace App\\Http\\Controllers;

use App\\Models\\Publicacion;

class PublicacionController extends Controller
{
    public function show(int $id)
    {
        $publicacion = Publicacion::findOrFail($id);

        if ($publicacion->bloqueada_legalmente) {
            // Censurado. Bloqueado por orden legal.
            return response()->json(
                ['error' => 'Contenido no disponible por orden judicial'],
                451
            )->header(
                'Link',
                '<https://ejemplo.mx/orden-judicial/12345>; rel="blocked-by"'
            );
        }

        return response()->json($publicacion);
    }
}`,

  // ─── 5xx Error del Servidor ───

  500: `// 500 Internal Server Error — La Explosión de San Juanico
// Fallo interno catastrófico. Nunca exponer detalles al cliente.
<?php

// En app/Exceptions/Handler.php
namespace App\\Exceptions;

use Illuminate\\Foundation\\Exceptions\\Handler as ExceptionHandler;
use Illuminate\\Support\\Facades\\Log;
use Throwable;

class Handler extends ExceptionHandler
{
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            // Registrar internamente TODO el detalle
            Log::error('Error catastrófico', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        });

        $this->renderable(function (Throwable $e) {
            // Al cliente: NUNCA el stack trace. Solo el mínimo.
            return response()->json(
                ['error' => 'Error interno del servidor'],
                500
            );
        });
    }
}`,

  501: `// 501 Not Implemented — Sistema de Salud Universal
// Funcionalidad reconocida pero no implementada
<?php

namespace App\\Http\\Controllers;

use App\\Models\\Usuario;
use Illuminate\\Http\\Request;

class UsuarioController extends Controller
{
    // PATCH no implementado aún
    public function updatePartial(Request $request, int $id)
    {
        // Como el sistema de salud universal: prometido, nunca construido
        return response()->json(
            ['error' => 'Actualización parcial no implementada'],
            501
        );
    }

    // PUT sí funciona
    public function update(Request $request, int $id)
    {
        $usuario = Usuario::findOrFail($id);
        $usuario->update($request->validated());

        return response()->json($usuario);
    }
}`,

  502: `// 502 Bad Gateway — El Huachicol
// El intermediario recibió una respuesta inválida del upstream
<?php

namespace App\\Http\\Controllers;

use Illuminate\\Support\\Facades\\Http;

class ClimaController extends Controller
{
    public function show(string $ciudad)
    {
        try {
            // Actuar como gateway hacia servicio externo
            $respuesta = Http::timeout(5)
                ->get("https://api.clima-externo.mx/v1/{$ciudad}");

            if ($respuesta->serverError()) {
                // El servicio upstream falló
                return response()->json(
                    ['error' => 'El servicio de clima no responde correctamente'],
                    502
                );
            }

            return response()->json($respuesta->json());
        } catch (\\Exception $e) {
            // Error de comunicación con el servicio externo
            return response()->json(
                ['error' => 'Error al comunicarse con el servicio externo'],
                502
            );
        }
    }
}`,

  503: `// 503 Service Unavailable — Hospital Sin Medicinas
// El servicio no puede atender solicitudes en este momento
<?php

namespace App\\Http\\Middleware;

use App\\Services\\EstadoServicio;
use Closure;
use Illuminate\\Http\\Request;

class VerificarDisponibilidad
{
    public function handle(Request $request, Closure $next)
    {
        $estado = app(EstadoServicio::class);

        if ($estado->enMantenimiento()) {
            return response()->json(
                ['error' => 'Servicio en mantenimiento programado'],
                503
            )->header('Retry-After', $estado->tiempoEstimado() ?? 3600);
        }

        if ($estado->sobrecargado()) {
            return response()->json(
                ['error' => 'Servicio temporalmente no disponible'],
                503
            )->header('Retry-After', '120');
        }

        return $next($request);
    }
}`,

  504: `// 504 Gateway Timeout — Llamar a Locatel
// El gateway no recibió respuesta a tiempo del upstream
<?php

namespace App\\Http\\Controllers;

use Illuminate\\Support\\Facades\\Http;

class CurpController extends Controller
{
    public function consultar(string $curp)
    {
        try {
            // Consultar servicio gubernamental (que siempre tarda)
            $respuesta = Http::timeout(30)
                ->get("https://api.renapo.gob.mx/v1/curp/{$curp}");

            return response()->json($respuesta->json());
        } catch (\\Illuminate\\Http\\Client\\ConnectionException $e) {
            // El servicio upstream nunca respondió
            // Como Locatel: intentas conectar pero nadie contesta
            return response()->json(
                ['error' => 'El servicio externo no respondió a tiempo'],
                504
            );
        } catch (\\Exception $e) {
            return response()->json(
                ['error' => 'Error en el servicio externo'],
                502
            );
        }
    }
}`,

  507: `// 507 Insufficient Storage — Presas Desbordadas en Tabasco
// El servidor no tiene espacio suficiente
<?php

namespace App\\Http\\Controllers;

use App\\Models\\Respaldo;

class RespaldoController extends Controller
{
    public function store()
    {
        // Verificar espacio disponible
        $espacioLibre = disk_free_space('/');
        $espacioMinimo = 500 * 1024 * 1024; // 500MB

        if ($espacioLibre < $espacioMinimo) {
            // Sin capacidad. El sistema se desborda.
            return response()->json(
                ['error' => 'Espacio de almacenamiento insuficiente'],
                507
            );
        }

        $respaldo = Respaldo::create([
            'estado' => 'completado',
            'tamano' => 0,
        ]);

        return response()->json($respaldo, 201)
            ->header('Location', "/api/respaldos/{$respaldo->id}");
    }
}`,

  508: `// 508 Loop Detected — El Trámite Infinito CURP-INE
// Se detectó un bucle infinito al procesar la solicitud
<?php

namespace App\\Http\\Controllers;

use App\\Models\\Recurso;

class RecursoController extends Controller
{
    public function show(int $id)
    {
        $visitados = [];
        $resultado = $this->resolver($id, $visitados);

        return response()->json($resultado);
    }

    private function resolver(int $id, array &$visitados)
    {
        // Detectar referencia circular
        if (in_array($id, $visitados)) {
            // Loop: A apunta a B que apunta a A
            // Como el trámite CURP-INE: necesitas uno para el otro
            abort(508, 'Referencia circular detectada');
        }

        $visitados[] = $id;
        $recurso = Recurso::findOrFail($id);

        if ($recurso->referencia_id) {
            return $this->resolver($recurso->referencia_id, $visitados);
        }

        return $recurso;
    }
}`,

  511: `// 511 Network Authentication Required — WiFi del Aeropuerto
// Se requiere autenticación a nivel de red
<?php

namespace App\\Http\\Middleware;

use Closure;
use Illuminate\\Http\\Request;

class PortalCautivo
{
    public function handle(Request $request, Closure $next)
    {
        $macCliente = $request->header('X-Client-Mac');
        $autenticado = $this->verificarAutenticacionRed($macCliente);

        if (!$autenticado) {
            // Red disponible pero requiere autenticación
            // Como el WiFi del aeropuerto: ves la red, pero paga primero
            return response(view('portal-cautivo'), 511)
                ->header('Content-Type', 'text/html');
        }

        return $next($request);
    }

    private function verificarAutenticacionRed(?string $mac): bool
    {
        if (!$mac) return false;
        return cache()->has("red_auth:{$mac}");
    }
}`,
}
