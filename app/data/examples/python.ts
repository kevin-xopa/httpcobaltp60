// Ejemplos de código HTTP en Python (FastAPI)
// Todos los comentarios en español
// Filosofía HTTP: el código de estado ES el mensaje. Sin envolturas innecesarias.

export const pythonExamples: Record<number, string> = {
  // ─── 1xx Informativos ───

  100: `# 100 Continue — La Espera en el IMSS
# El servidor indica que el cliente puede continuar enviando el cuerpo
from fastapi import FastAPI, Request, HTTPException
from starlette.responses import Response

app = FastAPI()

@app.post("/api/archivos/subir")
async def subir_archivo(request: Request):
    """Verificar tamaño antes de aceptar el cuerpo completo."""
    content_length = int(request.headers.get("content-length", 0))
    limite = 50 * 1024 * 1024  # 50MB

    if content_length > limite:
        # Rechazar antes de recibir todo el archivo
        raise HTTPException(status_code=413, detail="Archivo demasiado grande")

    # FastAPI/Starlette maneja el 100 Continue automáticamente
    # cuando el cliente envía Expect: 100-continue
    cuerpo = await request.body()
    archivo_id = await guardar_archivo(cuerpo)
    return Response(status_code=201, headers={"Location": f"/api/archivos/{archivo_id}"})`,

  101: `# 101 Switching Protocols — Cambio de Mando Presidencial
# Upgrade de HTTP a WebSocket
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List

app = FastAPI()
conexiones_activas: List[WebSocket] = []

@app.websocket("/ws/notificaciones")
async def websocket_notificaciones(ws: WebSocket):
    """El servidor acepta cambiar de protocolo HTTP a WebSocket."""
    # El handshake responde 101 automáticamente
    await ws.accept()
    conexiones_activas.append(ws)

    try:
        while True:
            mensaje = await ws.receive_text()
            # Reenviar a todos los conectados
            for conexion in conexiones_activas:
                await conexion.send_text(mensaje)
    except WebSocketDisconnect:
        conexiones_activas.remove(ws)`,

  102: `# 102 Processing — Trámite en la SEP
# Indica que la solicitud se recibió y se está procesando
from fastapi import FastAPI, BackgroundTasks
from fastapi.responses import JSONResponse

app = FastAPI()

@app.post("/api/reportes/generar", status_code=202)
async def generar_reporte(
    tipo: str,
    fecha_inicio: str,
    fecha_fin: str,
    tareas: BackgroundTasks,
):
    """Proceso largo: generar reporte en segundo plano."""
    # El 102 (WebDAV) indica procesamiento en curso
    # En REST moderno, usamos 202 Accepted con tarea en background
    tarea_id = crear_tarea(tipo, fecha_inicio, fecha_fin)
    tareas.add_task(procesar_reporte, tarea_id)

    return JSONResponse(
        status_code=202,
        content={"tarea_id": tarea_id, "estado": "procesando"},
        headers={"Location": f"/api/tareas/{tarea_id}"},
    )`,

  103: `# 103 Early Hints — La Alerta Sísmica
# Envía hints tempranos antes de la respuesta final
from fastapi import FastAPI, Request
from starlette.responses import Response

app = FastAPI()

@app.get("/app")
async def pagina_principal(request: Request):
    """Enviar early hints para que el navegador precargue recursos."""
    # Los early hints se configuran a nivel de servidor (nginx/caddy)
    # En la aplicación, indicamos los recursos a precargar via headers
    html = renderizar_pagina()

    return Response(
        content=html,
        media_type="text/html",
        headers={
            "Link": "</css/main.css>; rel=preload; as=style, "
                    "</js/app.js>; rel=preload; as=script",
            "X-Early-Hints": "true",
        },
    )`,

  // ─── 2xx Éxito ───

  200: `# 200 OK — El Maíz Llegó a la Milpa
# Devolver datos directamente. Sin envolturas.
from fastapi import FastAPI, Query
from typing import Optional

app = FastAPI()

@app.get("/api/productos")
async def listar_productos(
    categoria: Optional[str] = None,
    pagina: int = Query(1, ge=1),
    limite: int = Query(20, ge=1, le=100),
):
    """Obtener productos. El 200 ya dice que todo salió bien."""
    filtros = {}
    if categoria:
        filtros["categoria"] = categoria

    offset = (pagina - 1) * limite
    productos = await Producto.filter(**filtros).offset(offset).limit(limite).all()

    # Solo devuelve los datos, nada más
    return productos`,

  201: `# 201 Created — Fundación de Tenochtitlan
# Recurso creado: devolver el recurso + Location header
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime

app = FastAPI()

class ProyectoCrear(BaseModel):
    nombre: str
    descripcion: str
    responsable: str

@app.post("/api/proyectos", status_code=201)
async def crear_proyecto(datos: ProyectoCrear):
    """Crear proyecto y devolver el recurso con Location."""
    proyecto = await Proyecto.create(
        **datos.dict(),
        estado="activo",
        creado_en=datetime.utcnow(),
    )

    # 201 + Location + el recurso creado
    return JSONResponse(
        status_code=201,
        content=proyecto.dict(),
        headers={"Location": f"/api/proyectos/{proyecto.id}"},
    )`,

  202: `# 202 Accepted — "Ya Quedó, Jefe"
# Solicitud aceptada pero procesamiento pendiente
from fastapi import FastAPI, BackgroundTasks
from fastapi.responses import JSONResponse

app = FastAPI()

@app.post("/api/exportaciones")
async def crear_exportacion(
    formato: str,
    filtros: dict,
    tareas: BackgroundTasks,
):
    """Aceptar solicitud de exportación para procesamiento asíncrono."""
    tarea = await Cola.agregar(
        tipo="exportacion",
        formato=formato,
        filtros=filtros,
        estado="pendiente",
    )

    # Aceptamos, pero no está lista. Como el albañil: "ya quedó".
    tareas.add_task(procesar_exportacion, tarea.id)

    return JSONResponse(
        status_code=202,
        content={"tarea_id": tarea.id, "estado": "pendiente"},
        headers={"Location": f"/api/tareas/{tarea.id}"},
    )`,

  204: `# 204 No Content — Presa Vacía en Sequía
# Operación exitosa, sin cuerpo en la respuesta
from fastapi import FastAPI, Depends, HTTPException
from starlette.responses import Response

app = FastAPI()

@app.delete("/api/sesiones/{sesion_id}")
async def cerrar_sesion(sesion_id: int, usuario=Depends(obtener_usuario)):
    """Eliminar sesión. Éxito silencioso."""
    sesion = await Sesion.get_or_none(id=sesion_id)

    if not sesion:
        raise HTTPException(status_code=404)

    if sesion.usuario_id != usuario.id:
        raise HTTPException(status_code=403)

    await sesion.delete()

    # 204: operación exitosa, nada que devolver
    # El silencio es la respuesta
    return Response(status_code=204)`,

  206: `# 206 Partial Content — Reconstrucción Post-Sismo 2017
# Devolver solo una porción del recurso
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import StreamingResponse

app = FastAPI()

@app.get("/api/archivos/{archivo_id}/contenido")
async def contenido_parcial(archivo_id: int, request: Request):
    """Servir contenido parcial según el header Range."""
    archivo = await Archivo.get_or_none(id=archivo_id)
    if not archivo:
        raise HTTPException(status_code=404)

    rango = request.headers.get("range")
    if not rango:
        return StreamingResponse(abrir_archivo(archivo.ruta))

    # Parsear rango: bytes=inicio-fin
    inicio, fin = parsear_rango(rango, archivo.tamano)
    tamano_chunk = fin - inicio + 1

    return StreamingResponse(
        leer_rango(archivo.ruta, inicio, fin),
        status_code=206,
        headers={
            "Content-Range": f"bytes {inicio}-{fin}/{archivo.tamano}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(tamano_chunk),
        },
        media_type=archivo.tipo_mime,
    )`,

  // ─── 3xx Redirección ───

  301: `# 301 Moved Permanently — El Aeropuerto de Texcoco Cancelado
# Redirección permanente: el recurso cambió de ubicación para siempre
from fastapi import FastAPI
from fastapi.responses import RedirectResponse

app = FastAPI()

@app.get("/api/v1/usuarios")
async def usuarios_v1():
    """API v1 deprecada permanentemente. Redirigir a v2."""
    # Como Texcoco fue redirigido a Felipe Ángeles
    # Los motores de búsqueda actualizarán sus índices
    return RedirectResponse(
        url="/api/v2/usuarios",
        status_code=301,
    )

@app.get("/perfil/{usuario_id}")
async def perfil_legacy(usuario_id: int):
    """Ruta vieja que ya no existe."""
    return RedirectResponse(
        url=f"/usuarios/{usuario_id}",
        status_code=301,
    )`,

  302: `# 302 Found (Redirect Temporal) — Desvío por el Socavón de Puebla
# Redirección temporal: el recurso está en otro lugar por ahora
from fastapi import FastAPI
from fastapi.responses import RedirectResponse

app = FastAPI()

@app.get("/api/configuracion")
async def obtener_configuracion():
    """Desvío temporal si hay mantenimiento."""
    mantenimiento = await verificar_mantenimiento()

    if mantenimiento.activo:
        # Desvío temporal mientras dura el mantenimiento
        # Como el socavón: "use la otra ruta mientras tanto"
        return RedirectResponse(
            url="/api/configuracion/cache",
            status_code=302,
        )

    config = await Configuracion.obtener()
    return config`,

  303: `# 303 See Other — "Vaya a la Ventanilla 7"
# Después de un POST, redirigir a otro recurso con GET
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

app = FastAPI()

class PedidoCrear(BaseModel):
    productos: list
    direccion: str

@app.post("/api/pedidos")
async def crear_pedido(datos: PedidoCrear):
    """Crear pedido y redirigir al recibo."""
    pedido = await Pedido.crear(
        productos=datos.productos,
        direccion=datos.direccion,
        estado="procesando",
    )

    # Después de crear, redirigir al recibo con GET
    # Como la burocracia: "su trámite se registró, pase a ventanilla 7"
    return RedirectResponse(
        url=f"/api/pedidos/{pedido.id}/recibo",
        status_code=303,
    )`,

  304: `# 304 Not Modified — Las Reformas que No Cambian Nada
# El recurso no ha cambiado desde la última vez
from fastapi import FastAPI, Request
from fastapi.responses import Response, JSONResponse

app = FastAPI()

@app.get("/api/catalogo")
async def obtener_catalogo(request: Request):
    """Devolver catálogo solo si cambió desde la última solicitud."""
    ultima_modificacion = await Catalogo.ultima_actualizacion()
    etag = generar_etag(ultima_modificacion)

    # Verificar si el cliente ya tiene la versión actual
    if request.headers.get("if-none-match") == etag:
        # Nada cambió. Como siempre.
        return Response(status_code=304)

    catalogo = await Catalogo.obtener_todo()
    return JSONResponse(
        content=catalogo,
        headers={
            "ETag": etag,
            "Last-Modified": ultima_modificacion.isoformat(),
            "Cache-Control": "max-age=3600",
        },
    )`,

  307: `# 307 Temporary Redirect — Bloqueo en Reforma por Manifestación
# Redirección temporal que PRESERVA el método HTTP original
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse

app = FastAPI()

@app.api_route("/api/pagos", methods=["GET", "POST", "PUT"])
async def procesar_pago(request: Request):
    """Redirigir temporalmente si la pasarela principal no está disponible."""
    pasarela_disponible = await verificar_pasarela()

    if not pasarela_disponible:
        # A diferencia del 302, el 307 mantiene el método original
        # POST sigue siendo POST en el destino
        return RedirectResponse(
            url="https://respaldo.pagos.mx/api/pagos",
            status_code=307,
        )

    # Procesar pago normalmente
    cuerpo = await request.json()
    resultado = await procesar_pago_principal(cuerpo)
    return resultado`,

  308: `# 308 Permanent Redirect — De DF a CDMX
# Redirección permanente que PRESERVA el método HTTP
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse

app = FastAPI()

@app.api_route("/api/distrito-federal/{ruta:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def redirigir_df_a_cdmx(ruta: str, request: Request):
    """El recurso cambió permanentemente de ubicación."""
    # Como el DF → CDMX: el nombre cambió para siempre
    # A diferencia del 301, el 308 preserva el método original
    nueva_url = f"/api/cdmx/{ruta}"

    return RedirectResponse(
        url=nueva_url,
        status_code=308,
    )`,

  // ─── 4xx Error del Cliente ───

  400: `# 400 Bad Request — Pedir Ketchup en la Taquería
# La petición está malformada o es inválida
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, validator

app = FastAPI()

class Transferencia(BaseModel):
    cuenta_origen: str
    cuenta_destino: str
    monto: float

    @validator("monto")
    def monto_positivo(cls, v):
        if v <= 0:
            raise ValueError("El monto debe ser positivo")
        return v

    @validator("cuenta_destino")
    def cuentas_diferentes(cls, v, values):
        if v == values.get("cuenta_origen"):
            raise ValueError("Las cuentas deben ser diferentes")
        return v

@app.post("/api/transferencias", status_code=201)
async def crear_transferencia(datos: Transferencia):
    """FastAPI devuelve 422 automáticamente si la validación falla."""
    transferencia = await ejecutar_transferencia(datos)
    return transferencia`,

  401: `# 401 Unauthorized — Colonia Cerrada con Plumas
# No autenticado: no sabemos quién eres
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

app = FastAPI()
seguridad = HTTPBearer()

async def verificar_autenticacion(
    credenciales: HTTPAuthorizationCredentials = Depends(seguridad),
):
    """Verificar token de autenticación."""
    try:
        usuario = await verificar_token(credenciales.credentials)
        return usuario
    except TokenInvalido:
        # Token inválido o expirado. No pasas.
        raise HTTPException(
            status_code=401,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.get("/api/expediente")
async def obtener_expediente(usuario=Depends(verificar_autenticacion)):
    """Solo usuarios autenticados pueden acceder."""
    expediente = await Expediente.filter(usuario_id=usuario.id).all()
    return expediente`,

  402: `# 402 Payment Required — La Mordida
# Pago requerido para acceder al recurso
from fastapi import FastAPI, Depends, HTTPException

app = FastAPI()

@app.get("/api/reportes/premium/{reporte_id}")
async def reporte_premium(reporte_id: str, usuario=Depends(obtener_usuario)):
    """Verificar suscripción antes de dar acceso."""
    suscripcion = await Suscripcion.get_or_none(usuario_id=usuario.id)

    if not suscripcion or suscripcion.estado != "activa":
        # Sin pago, sin acceso. Así funciona.
        raise HTTPException(
            status_code=402,
            detail="Se requiere suscripción activa",
        )

    if suscripcion.tipo == "basica" and reporte_id.startswith("avanzado"):
        raise HTTPException(
            status_code=402,
            detail="Este reporte requiere suscripción avanzada",
        )

    reporte = await Reporte.generar(reporte_id)
    return reporte`,

  403: `# 403 Forbidden — Campo Militar No. 1
# Autenticado pero sin permisos. Prohibido. Punto.
from fastapi import FastAPI, Depends, HTTPException

app = FastAPI()

@app.delete("/api/usuarios/{usuario_id}")
async def eliminar_usuario(
    usuario_id: int,
    solicitante=Depends(obtener_usuario),
):
    """Solo administradores pueden eliminar usuarios."""
    if solicitante.rol != "admin":
        # Sabemos quién eres, pero no tienes permiso
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para realizar esta acción",
        )

    if usuario_id == solicitante.id:
        raise HTTPException(
            status_code=403,
            detail="No puedes eliminar tu propia cuenta",
        )

    usuario = await Usuario.get_or_none(id=usuario_id)
    if not usuario:
        raise HTTPException(status_code=404)

    await usuario.delete()
    return Response(status_code=204)`,

  404: `# 404 Not Found — Los 43 de Ayotzinapa
# El recurso no existe. Buscado. No encontrado.
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/api/expedientes/{folio}")
async def buscar_expediente(folio: str):
    """Buscar expediente por folio."""
    expediente = await Expediente.get_or_none(folio=folio)

    if not expediente:
        # No existe. El 404 lo dice todo.
        raise HTTPException(
            status_code=404,
            detail="Expediente no encontrado",
        )

    return expediente`,

  405: `# 405 Method Not Allowed — Protesta Reprimida en Atenco
# El método HTTP no está permitido en esta ruta
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

# Solo GET está permitido en esta ruta
@app.get("/api/reportes/incidencias")
async def listar_incidencias():
    """Listar reportes de incidencias (solo lectura)."""
    reportes = await Reporte.filter(tipo="incidencia").all()
    return reportes

# FastAPI automáticamente devuelve 405 para métodos no definidos
# Pero podemos personalizar la respuesta
@app.exception_handler(405)
async def metodo_no_permitido(request: Request, exc):
    return JSONResponse(
        status_code=405,
        content={"error": "Método no permitido"},
        headers={"Allow": "GET"},
    )`,

  406: `# 406 Not Acceptable — Leche Adulterada
# El servidor no puede producir el formato que el cliente pide
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import Response
import csv
import io

app = FastAPI()

@app.get("/api/datos/exportar")
async def exportar_datos(request: Request):
    """Exportar datos en el formato solicitado por el cliente."""
    formatos_permitidos = {"application/json", "text/csv"}
    accept = request.headers.get("accept", "application/json")

    if accept not in formatos_permitidos:
        # No podemos entregar en el formato que pides
        raise HTTPException(
            status_code=406,
            detail=f"Formatos disponibles: {', '.join(formatos_permitidos)}",
        )

    datos = await Datos.exportar()

    if accept == "text/csv":
        buffer = io.StringIO()
        escritor = csv.DictWriter(buffer, fieldnames=datos[0].keys())
        escritor.writeheader()
        escritor.writerows(datos)
        return Response(content=buffer.getvalue(), media_type="text/csv")

    return datos`,

  408: `# 408 Request Timeout — Justicia que Prescribe
# El servidor se cansó de esperar la solicitud completa
from fastapi import FastAPI, Request, HTTPException
import asyncio

app = FastAPI()

@app.post("/api/consultas/pesadas")
async def consulta_pesada(request: Request):
    """Ejecutar consulta con timeout estricto."""
    try:
        # Dar máximo 30 segundos para completar
        cuerpo = await asyncio.wait_for(
            request.body(),
            timeout=30.0,
        )
    except asyncio.TimeoutError:
        # El tiempo expiró. Como los casos que prescriben.
        raise HTTPException(
            status_code=408,
            detail="Tiempo de espera agotado",
        )

    datos = parsear_consulta(cuerpo)
    try:
        resultado = await asyncio.wait_for(
            ejecutar_consulta(datos),
            timeout=60.0,
        )
        return resultado
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Consulta excedió el tiempo límite")`,

  409: `# 409 Conflict — Disputa Territorial del Narco
# Conflicto con el estado actual del recurso
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class InventarioActualizar(BaseModel):
    cantidad: int
    version: int

@app.put("/api/inventario/{sku}")
async def actualizar_inventario(sku: str, datos: InventarioActualizar):
    """Actualizar inventario con control de concurrencia optimista."""
    producto = await Inventario.get_or_none(sku=sku)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    # Verificar conflicto de versiones (optimistic locking)
    if producto.version != datos.version:
        # Dos escrituras sobre el mismo territorio: conflicto
        raise HTTPException(
            status_code=409,
            detail="El recurso fue modificado por otro proceso",
        )

    producto.cantidad = datos.cantidad
    producto.version += 1
    await producto.save()
    return producto`,

  410: `# 410 Gone — Ruta 100: Desaparecida para Siempre
# El recurso existió pero fue eliminado permanentemente
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/api/servicios/ruta-100")
async def ruta_100():
    """Este servicio fue descontinuado permanentemente."""
    # A diferencia del 404, aquí confirmamos que SÍ existió
    raise HTTPException(
        status_code=410,
        detail="Este servicio fue descontinuado permanentemente",
    )

# Endpoints deprecados de API antigua
@app.api_route("/api/v1/{ruta:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def api_v1_deprecada(ruta: str):
    """API v1 eliminada permanentemente."""
    return JSONResponse(
        status_code=410,
        content={"error": "API v1 fue eliminada. Migre a /api/v3/"},
        headers={"Sunset": "Sat, 01 Jan 2025 00:00:00 GMT"},
    )`,

  413: `# 413 Payload Too Large — Colapso de la Línea 12
# El cuerpo de la solicitud excede el límite permitido
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse

app = FastAPI()

LIMITE_BYTES = 10 * 1024 * 1024  # 10MB

@app.post("/api/documentos")
async def subir_documento(request: Request):
    """Verificar tamaño del payload antes de procesar."""
    content_length = int(request.headers.get("content-length", 0))

    if content_length > LIMITE_BYTES:
        # Sobrecarga. La infraestructura no soporta más.
        return JSONResponse(
            status_code=413,
            content={"error": "El archivo excede el tamaño máximo (10MB)"},
            headers={"Retry-After": "3600"},
        )

    cuerpo = await request.body()
    documento = await Documento.guardar(cuerpo)

    return JSONResponse(
        status_code=201,
        content=documento.dict(),
        headers={"Location": f"/api/documentos/{documento.id}"},
    )`,

  415: `# 415 Unsupported Media Type — CURP con Formato Obsoleto
# El formato del contenido no es soportado
from fastapi import FastAPI, Request, HTTPException

app = FastAPI()

TIPOS_PERMITIDOS = {"application/json", "application/xml", "text/csv"}

@app.post("/api/documentos/importar")
async def importar_documentos(request: Request):
    """Importar documentos verificando el tipo de contenido."""
    tipo_contenido = request.headers.get("content-type", "")

    if tipo_contenido not in TIPOS_PERMITIDOS:
        # Formato no soportado. Actualice su sistema.
        raise HTTPException(
            status_code=415,
            detail=f"Tipo de contenido no soportado. Aceptados: {', '.join(TIPOS_PERMITIDOS)}",
        )

    cuerpo = await request.body()
    procesador = obtener_procesador(tipo_contenido)
    datos = procesador.parsear(cuerpo)
    return datos`,

  418: `# 418 I'm a Teapot — La Olla de Tamales de Doña Mary
# Cada cosa tiene su función. No le pidas café a la tetera.
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/api/cafeteria/cafe")
async def pedir_cafe():
    """RFC 2324 — Soy una tetera. No hago café."""
    # Como Doña Mary: no le pidas sushi a la tamalera
    return JSONResponse(
        status_code=418,
        content={
            "error": "Soy una tetera. No preparo café.",
            "sugerencia": "Pruebe con /api/cafeteria/te",
        },
    )

# El único código "ligero" del proyecto
@app.get("/api/tamales")
async def listar_tamales():
    return [
        {"tipo": "verde", "precio": 15},
        {"tipo": "rojo", "precio": 15},
        {"tipo": "rajas", "precio": 18},
    ]`,

  422: `# 422 Unprocessable Entity — Declaración Rechazada por el SAT
# La sintaxis es correcta pero los datos no son procesables
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel, validator

app = FastAPI()

class CrearUsuario(BaseModel):
    email: str
    nombre: str

    @validator("nombre")
    def nombre_minimo(cls, v):
        if len(v) < 3:
            raise ValueError("Mínimo 3 caracteres")
        return v

@app.post("/api/usuarios", status_code=201)
async def crear_usuario(datos: CrearUsuario):
    """FastAPI devuelve 422 automáticamente con errores de validación."""
    # Validación adicional contra la base de datos
    if await Usuario.existe_email(datos.email):
        return JSONResponse(
            status_code=422,
            content={
                "errors": {
                    "email": ["El email ya está registrado"],
                },
            },
        )

    usuario = await Usuario.create(**datos.dict())
    return JSONResponse(
        status_code=201,
        content=usuario.dict(),
        headers={"Location": f"/api/usuarios/{usuario.id}"},
    )`,

  429: `# 429 Too Many Requests — Apagones de CFE
# Demasiadas solicitudes. El sistema está sobrecargado.
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()

@app.exception_handler(429)
async def rate_limit_handler(request: Request, exc):
    """Sobrecarga. Demasiada demanda. Se cae todo."""
    return JSONResponse(
        status_code=429,
        content={"error": "Demasiadas solicitudes. Intente más tarde."},
        headers={"Retry-After": "900"},
    )

@app.get("/api/consultas")
@limiter.limit("100/15minutes")
async def consultar(request: Request):
    """Endpoint con límite de 100 peticiones cada 15 minutos."""
    resultados = await Consulta.ejecutar()
    return resultados`,

  451: `# 451 Unavailable For Legal Reasons — Periodistas Censurados
# Contenido no disponible por razones legales
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/api/publicaciones/{publicacion_id}")
async def obtener_publicacion(publicacion_id: int):
    """Verificar si el contenido está bloqueado legalmente."""
    publicacion = await Publicacion.get_or_none(id=publicacion_id)

    if not publicacion:
        raise HTTPException(status_code=404, detail="Publicación no encontrada")

    if publicacion.bloqueada_legalmente:
        # Censurado. Bloqueado por orden legal.
        return JSONResponse(
            status_code=451,
            content={"error": "Contenido no disponible por orden judicial"},
            headers={
                "Link": '<https://ejemplo.mx/orden-judicial/12345>; rel="blocked-by"',
            },
        )

    return publicacion`,

  // ─── 5xx Error del Servidor ───

  500: `# 500 Internal Server Error — La Explosión de San Juanico
# Fallo interno catastrófico. Nunca exponer detalles al cliente.
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import logging

app = FastAPI()
logger = logging.getLogger("cobalto60")

@app.exception_handler(Exception)
async def error_interno_handler(request: Request, exc: Exception):
    """Capturar errores no manejados. NUNCA exponer stack traces."""
    # Registrar internamente TODO el detalle
    logger.error(f"Error en {request.url}: {exc}", exc_info=True)
    await registrar_error(exc, request)

    # Al cliente: NUNCA el stack trace. Solo el mínimo.
    return JSONResponse(
        status_code=500,
        content={"error": "Error interno del servidor"},
    )

@app.get("/api/dashboard")
async def dashboard(usuario=Depends(obtener_usuario)):
    """Dashboard con múltiples fuentes de datos."""
    ventas = await Venta.resumen()
    usuarios = await Usuario.conteo()
    metricas = await Metrica.calcular()
    return {"ventas": ventas, "usuarios": usuarios, "metricas": metricas}`,

  501: `# 501 Not Implemented — Sistema de Salud Universal
# Funcionalidad reconocida pero no implementada
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class UsuarioActualizar(BaseModel):
    nombre: str
    email: str

@app.patch("/api/usuarios/{usuario_id}")
async def actualizar_parcial(usuario_id: int):
    """PATCH no implementado. Como el sistema de salud universal."""
    raise HTTPException(
        status_code=501,
        detail="Actualización parcial no implementada",
    )

@app.put("/api/usuarios/{usuario_id}")
async def actualizar_completo(usuario_id: int, datos: UsuarioActualizar):
    """PUT sí funciona: actualización completa del recurso."""
    usuario = await Usuario.get_or_none(id=usuario_id)
    if not usuario:
        raise HTTPException(status_code=404)

    await usuario.update_from_dict(datos.dict()).save()
    return usuario`,

  502: `# 502 Bad Gateway — El Huachicol
# El intermediario recibió una respuesta inválida del servidor upstream
from fastapi import FastAPI, HTTPException
import httpx

app = FastAPI()

@app.get("/api/clima/{ciudad}")
async def consultar_clima(ciudad: str):
    """Actuar como gateway hacia servicio externo."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as cliente:
            respuesta = await cliente.get(
                f"https://api.clima-externo.mx/v1/{ciudad}"
            )
            respuesta.raise_for_status()
            return respuesta.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code >= 500:
            # El servicio upstream falló
            raise HTTPException(
                status_code=502,
                detail="El servicio de clima no está respondiendo correctamente",
            )
        raise
    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail="Error al comunicarse con el servicio externo",
        )`,

  503: `# 503 Service Unavailable — Hospital Sin Medicinas
# El servicio no puede atender solicitudes en este momento
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

@app.middleware("http")
async def verificar_disponibilidad(request: Request, call_next):
    """Verificar si el servicio puede atender solicitudes."""
    estado = await verificar_estado_servicio()

    if estado.mantenimiento:
        return JSONResponse(
            status_code=503,
            content={"error": "Servicio en mantenimiento programado"},
            headers={"Retry-After": str(estado.tiempo_estimado or 3600)},
        )

    if estado.sobrecargado:
        return JSONResponse(
            status_code=503,
            content={"error": "Servicio temporalmente no disponible"},
            headers={"Retry-After": "120"},
        )

    return await call_next(request)`,

  504: `# 504 Gateway Timeout — Llamar a Locatel
# El gateway no recibió respuesta a tiempo del servidor upstream
from fastapi import FastAPI, HTTPException
import httpx

app = FastAPI()

@app.get("/api/consultas/curp/{curp}")
async def consultar_curp(curp: str):
    """Consultar servicio gubernamental con timeout."""
    try:
        # 30 segundos de paciencia con el servicio externo
        async with httpx.AsyncClient(timeout=30.0) as cliente:
            respuesta = await cliente.get(
                f"https://api.renapo.gob.mx/v1/curp/{curp}"
            )
            respuesta.raise_for_status()
            return respuesta.json()
    except httpx.TimeoutException:
        # El servicio upstream nunca respondió
        # Como Locatel: intentas conectar pero nadie contesta
        raise HTTPException(
            status_code=504,
            detail="El servicio externo no respondió a tiempo",
        )
    except httpx.RequestError:
        raise HTTPException(
            status_code=502,
            detail="Error en el servicio externo",
        )`,

  507: `# 507 Insufficient Storage — Presas Desbordadas en Tabasco
# El servidor no tiene espacio suficiente
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
import shutil

app = FastAPI()

@app.post("/api/respaldos", status_code=201)
async def crear_respaldo():
    """Crear respaldo verificando espacio disponible."""
    # Verificar espacio disponible
    uso = shutil.disk_usage("/")
    espacio_minimo = 500 * 1024 * 1024  # 500MB

    if uso.free < espacio_minimo:
        # Sin capacidad. El sistema se desborda.
        return JSONResponse(
            status_code=507,
            content={"error": "Espacio de almacenamiento insuficiente"},
        )

    respaldo = await Respaldo.crear()
    return JSONResponse(
        status_code=201,
        content=respaldo.dict(),
        headers={"Location": f"/api/respaldos/{respaldo.id}"},
    )`,

  508: `# 508 Loop Detected — El Trámite Infinito CURP-INE
# Se detectó un bucle infinito al procesar la solicitud
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/api/recursos/{recurso_id}")
async def resolver_recurso(recurso_id: int):
    """Resolver recurso detectando referencias circulares."""
    visitados = set()

    async def resolver(id_actual: int):
        # Detectar referencia circular
        if id_actual in visitados:
            # Loop: el recurso A apunta a B que apunta a A
            # Como el trámite CURP-INE: necesitas uno para el otro
            raise HTTPException(
                status_code=508,
                detail="Referencia circular detectada",
            )

        visitados.add(id_actual)
        recurso = await Recurso.get_or_none(id=id_actual)

        if not recurso:
            raise HTTPException(status_code=404)

        if recurso.referencia_id:
            return await resolver(recurso.referencia_id)
        return recurso

    return await resolver(recurso_id)`,

  511: `# 511 Network Authentication Required — WiFi del Aeropuerto
# Se requiere autenticación a nivel de red
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse

app = FastAPI()

@app.middleware("http")
async def portal_cautivo(request: Request, call_next):
    """Verificar autenticación de red antes de permitir acceso."""
    mac_cliente = request.headers.get("x-client-mac")
    autenticado = await verificar_autenticacion_red(mac_cliente)

    if not autenticado:
        # Red disponible pero requiere autenticación
        # Como el WiFi del aeropuerto: ves la red, pero paga primero
        return HTMLResponse(
            status_code=511,
            content=\"\"\"
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
            \"\"\",
        )

    return await call_next(request)`,
}
