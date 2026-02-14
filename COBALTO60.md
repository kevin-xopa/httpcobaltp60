# ☢️ HTTP Cobalto 60

> Los códigos HTTP explicados desde lo más oscuro, crudo y real de México.

---

## 1. Visión del Proyecto

**HTTP Cobalto 60** es una guía interactiva y educativa de códigos de estado HTTP donde cada código se explica a través de sucesos reales, oscuros y crudos de México: desastres, tragedias, corrupción, desapariciones, crimen, negligencia gubernamental, leyendas de terror, la realidad que no sale en las postales turísticas.

El nombre es un homenaje al incidente radioactivo del Cobalto-60 en Ciudad Juárez (1983), donde una fuente de radioterapia fue desmantelada por chatareros sin saber qué era, contaminando a cientos de personas y generando un desastre nuclear que el gobierno intentó minimizar. Así como ese cobalto irradiaba en silencio matando sin que nadie entendiera qué pasaba, los códigos HTTP están en cada request y la mayoría de los desarrolladores no los comprenden.

**No es un proyecto "chistoso".** Es una guía técnica seria envuelta en la realidad mexicana sin filtros.

**Público objetivo:** Desarrolladores hispanohablantes, estudiantes de programación, devs mexicanos.

**Tono:** Sombrío, directo, sin maquillaje. Técnicamente riguroso. Culturalmente honesto. Puede tener humor negro, pero nunca trivializa tragedias.

---

## 2. Stack Tecnológico

| Tecnología | Uso |
|---|---|
| **Nuxt 3** | Framework principal (Vue 3 + Composition API) |
| **Vuetify 3** | Sistema de componentes UI y layout |
| **Shiki** | Syntax highlighting multi-lenguaje |
| **@vite-pwa/nuxt** | Progressive Web App (instalable) |
| **@nuxtjs/seo** | SEO, meta tags, Open Graph |
| **@vueuse/motion** | Animaciones sutiles y transiciones |
| **Nuxt Icon** | Iconos via Iconify |
| **SSG** | Static Site Generation para deploy |

> **NOTA:** No usar Tailwind CSS. Vuetify maneja los estilos con su propio sistema. Estilos custom con SCSS/CSS puro donde sea necesario.

---

## 3. Estructura del Proyecto

```
httpcobalto60/
├── nuxt.config.ts
├── app.vue
├── pages/
│   ├── index.vue                    # Landing page principal
│   ├── codigos/
│   │   ├── index.vue                # Explorador de todos los códigos
│   │   └── [code].vue               # Página individual de cada código HTTP
│   └── about.vue                    # Sobre el proyecto y el incidente del Cobalto-60
├── components/
│   ├── landing/
│   │   ├── HeroSection.vue          # Hero sombrío con imagen de fondo
│   │   ├── CategoryGrid.vue         # Grid de categorías (1xx - 5xx)
│   │   ├── FeaturedCodes.vue        # Códigos destacados
│   │   └── SearchBar.vue            # Búsqueda de códigos
│   ├── code/
│   │   ├── CodeCard.vue             # Tarjeta preview
│   │   ├── CodeDetail.vue           # Vista completa de un código
│   │   ├── CodeExample.vue          # Bloque de código con tabs multi-lenguaje
│   │   ├── BestPractices.vue        # Sección de buenas prácticas
│   │   ├── MexicanContext.vue       # El contexto mexicano del código
│   │   └── LanguageTabs.vue         # Tabs para cambiar entre lenguajes
│   ├── navigation/
│   │   ├── NavBar.vue               # Navegación principal
│   │   ├── Footer.vue               # Footer
│   │   └── CodeNavigator.vue        # Navegación prev/next entre códigos
│   └── ui/
│       ├── CopyButton.vue           # Botón copiar código
│       ├── CategoryBadge.vue        # Badge de categoría
│       ├── ImageHeader.vue          # Imagen representativa del código
│       └── SearchModal.vue          # Modal búsqueda rápida (Cmd+K)
├── composables/
│   ├── useCodes.ts                  # Lógica para filtrar/buscar códigos
│   └── useCategories.ts             # Categorías y colores
├── data/
│   ├── codes.ts                     # Catálogo completo de códigos HTTP
│   └── examples/                    # Ejemplos de código por lenguaje
│       ├── javascript.ts
│       ├── python.ts
│       ├── php-laravel.ts
│       ├── rust.ts
│       └── cpp.ts
├── assets/
│   ├── css/
│   │   └── main.scss               # Estilos globales
│   └── images/
│       └── codes/                   # Imágenes representativas por código
├── public/
│   ├── favicon.ico
│   ├── og-image.png
│   └── icons/                       # Iconos PWA
└── layouts/
    └── default.vue                  # Layout principal
```

---

## 4. Diseño y Estética

### Filosofía Visual

El diseño debe transmitir **abandono, deterioro, realidad cruda**. Como un edificio abandonado en México: paredes agrietadas, cielo gris, cables colgando. No es bonito, pero es real.

**NO queremos:**
- Verde radioactivo brillante ni colores neón
- Estética "cool", "trendy" o alegre
- Emojis como elemento principal de diseño
- Gradientes coloridos o fondos vibrantes

**SÍ queremos:**
- Grises, negros, tonos tierra desgastados
- Texturas de concreto, óxido, deterioro
- Tipografía industrial/brutalist
- Imágenes reales que transmitan cada código
- Un sentimiento de pesadez y realidad

### Paleta de Colores

```
Background principal:    #0C0C0C (negro carbón)
Background secundario:   #141414 (gris muy oscuro)
Background terciario:    #1A1A1A (gris oscuro)
Superficie/cards:        #1E1E1E
Bordes:                  #2A2A2A
Texto principal:         #B0B0B0 (gris claro, NO blanco puro)
Texto secundario:        #6B6B6B (gris medio)
Texto apagado:           #4A4A4A (gris oscuro)
Acento mínimo:           #8B7355 (ocre/tierra, como adobe viejo)
```

### Colores por Categoría HTTP (desaturados, apagados)

```
1xx Informativos:        #5C6378 (gris azulado)
2xx Éxito:               #4A6B5A (verde musgoso apagado)
3xx Redirección:         #7B6B3A (ámbar opaco)
4xx Error del Cliente:   #7B4A4A (rojo desaturado/óxido)
5xx Error del Servidor:  #6B2A2A (rojo oscuro/sangre seca)
```

### Tipografía
- **Display/Headers:** `Bebas Neue`, `Oswald`, o `Barlow Condensed` — industrial, condensada, pesada
- **Body:** `IBM Plex Sans` o `Source Sans 3` — legible pero sobria
- **Código:** `JetBrains Mono` o `Fira Code`

### Imágenes

Cada código HTTP debe tener una imagen representativa que transmita el contexto mexicano. Estas imágenes deben ser:
- Fotografías reales o con tratamiento fotográfico oscuro
- Filtro desaturado, tonos fríos o sepia oscuro
- Transmitir la emoción del código y su referencia mexicana
- Formato: WebP optimizado, aspecto 16:9

**Ejemplos:**
- 404: Pueblo fantasma abandonado
- 500: Edificio de gobierno deteriorado
- 401: Puerta cerrada con cadenas oxidadas
- 503: Hospital vacío con pasillos oscuros

> **Primera versión:** Usar placeholders con el filtro correcto. Reemplazar con fotografías originales después.

### Efectos y Animaciones
- **Sutiles y lentas.** Nada flashy.
- Fade-ins lentos al hacer scroll
- Transiciones de página con fade oscuro
- Hover en cards: borde sutil que aparece, sin glow
- Efecto de ruido/grain sutil sobre el fondo (CSS noise texture)
- NO parallax excesivo, NO partículas

---

## 5. Páginas y Funcionalidad

### 5.1 Landing Page (`/`)

1. **Hero Section**
   - Imagen de fondo: edificio abandonado/deteriorado mexicano con overlay oscuro
   - Título: "HTTP Cobalto 60" en tipografía industrial grande
   - Subtítulo: "Los códigos HTTP explicados desde la realidad de México"
   - CTA discreto: "Explorar códigos →"
   - Sin emojis flotantes, sin animaciones alegres

2. **Categorías**
   - Grid sobrio con las 5 categorías HTTP (1xx - 5xx)
   - Cada categoría con su color apagado, conteo de códigos
   - Estética de archivero/expediente

3. **Códigos Destacados**
   - Grid de los más relevantes con cards oscuras
   - Imagen, código, nombre, contexto mexicano breve

4. **Filosofía HTTP** (sección especial — ver sección 8)
   - Introducción a la filosofía de respuestas HTTP del proyecto
   - "Un endpoint, un código HTTP. Sin envolturas innecesarias."

5. **Footer**
   - "Hecho en México • 2025"
   - Links a repo y about
   - Sin emojis excesivos

### 5.2 Explorador de Códigos (`/codigos`)

- Búsqueda por número, nombre HTTP, o contexto mexicano
- Filtro por categoría (1xx, 2xx, 3xx, 4xx, 5xx)
- Grid responsivo con Vuetify grid system
- Cada card: imagen, código, título, contexto breve
- Atajo Cmd+K / Ctrl+K para búsqueda rápida

### 5.3 Página Individual de Código (`/codigos/[code]`)

La página estrella. Cada código tiene su propia URL.

**Secciones:**

1. **Header Visual**
   - Imagen grande representativa con overlay oscuro
   - Número de código en tipografía massive
   - Título HTTP oficial
   - Nombre del contexto mexicano
   - Badge de categoría

2. **Definición Técnica**
   - Explicación formal RFC del código
   - Headers HTTP relevantes
   - Cuándo el servidor devuelve este código

3. **Contexto Mexicano**
   - La referencia real mexicana
   - Contexto histórico/social si aplica
   - Sin humor forzado — si es tragedia, tratarla con respeto pero sin censura

4. **Ejemplos de Código (MULTI-LENGUAJE con tabs)**
   - **Tabs para cambiar entre lenguajes/frameworks:**
     - JavaScript (Node.js / Express)
     - Python (FastAPI / Flask)
     - PHP (Laravel)
     - Rust (Actix Web / Axum)
     - C++ (Crow o conceptual)
   - Syntax highlighting con Shiki
   - Botón copiar por bloque
   - Comentarios en español
   - Código funcional y correcto

5. **Buenas Prácticas y Filosofía HTTP**
   - Tips profesionales
   - Cómo aplicar respuestas limpias (sección 8)
   - Anti-patterns a evitar
   - Diferencias con códigos similares

6. **Navegación**
   - Prev/Next entre códigos
   - Breadcrumbs discretos

### 5.4 Página About (`/about`)

- Historia real del incidente del Cobalto-60 en Ciudad Juárez (1983)
- La conexión conceptual con HTTP
- Filosofía del proyecto
- Stack tecnológico
- Créditos

### 5.5 Página 404 Personalizada

- Usa el tema del código 404 del catálogo
- Imagen de pueblo fantasma / lugar abandonado
- Mensaje sombrío pero funcional
- Link de regreso

---

## 6. Filosofía de Respuestas HTTP (Sección Especial del Sitio)

Este es un pilar fundamental del proyecto. **HTTP Cobalto 60** no solo explica códigos HTTP, promueve una filosofía sobre cómo usarlos correctamente.

### El Principio Central

> **"Un endpoint siempre debe responder con un código HTTP adecuado y datos si es el caso. El código HTTP ES el mensaje. No necesitas envolverlo."**

### El Anti-Pattern (Lo que NO hacer)

```json
// ❌ EL ENVOLTORIO INNECESARIO — No hagas esto
{
  "data": [],
  "message": "Usuarios obtenidos correctamente",
  "status": 200,
  "success": true
}
```

**¿Por qué es malo?**
- El `status` ya viene en el HTTP response. ¿Para qué repetirlo en el body?
- El `message` es redundante — el código 200 YA dice que fue exitoso.
- El `success: true` es absurdo cuando ya tienes un 200.
- Creas una estructura que tus clientes tienen que parsear doblemente.
- El front tiene que verificar `response.status` Y `response.data.success` — ¿cuál es la fuente de verdad?
- Cuando hay un error, ¿el HTTP dice 200 pero el body dice `success: false`? Eso es un desastre.

### El Patrón Correcto (Lo que SÍ hacer)

```json
// ✅ HTTP 200 — Solo devuelve los datos
[
  { "id": 1, "nombre": "Juan" },
  { "id": 2, "nombre": "María" }
]
```

```json
// ✅ HTTP 201 Created — Recurso creado
// Header Location: /api/usuarios/3
{ "id": 3, "nombre": "Pedro", "created_at": "2025-02-13" }
```

```
// ✅ HTTP 204 No Content — Eliminación exitosa
// Sin body. El 204 lo dice todo.
```

```json
// ✅ HTTP 422 Unprocessable Entity — Error de validación
{
  "errors": {
    "email": ["El email ya está registrado"],
    "nombre": ["El nombre es obligatorio", "Mínimo 3 caracteres"],
    "telefono": ["Formato inválido"]
  }
}
```

```json
// ✅ HTTP 404 — No encontrado
// El 404 ya dice que no existe. Si necesitas contexto mínimo:
{
  "error": "El recurso solicitado no existe"
}
```

### Filosofía para Errores de Validación

La estructura para errores de validación (422) debe ser sólida y consistente:

```typescript
// Estructura de error de validación (422)
interface ValidationErrorResponse {
  errors: {
    [field: string]: string[];  // Campo → Array de mensajes de error
  }
}
```

**¿Por qué esta estructura?**
- El front mapea cada error directamente al campo del formulario
- Múltiples errores por campo son posibles
- No necesitas `message` global — los errores SON el mensaje
- Es el estándar que usan Laravel, Rails, FastAPI y otros frameworks serios
- Tu componente de formulario puede consumir esto directamente

**En el front (Vue 3 + Vuetify):**
```vue
<template>
  <v-text-field
    v-model="form.email"
    :error-messages="errors.email"
    label="Email"
  />
  <v-text-field
    v-model="form.nombre"
    :error-messages="errors.nombre"
    label="Nombre"
  />
</template>

<script setup>
const errors = ref({});

async function submit() {
  errors.value = {}; // Limpiar errores previos
  
  try {
    const { data } = await api.post('/usuarios', form);
    // 201 → éxito, data tiene el usuario creado
  } catch (e) {
    if (e.response?.status === 422) {
      // Los errores se mapean DIRECTO a los campos
      errors.value = e.response.data.errors;
    }
    if (e.response?.status === 401) {
      // No autenticado → redirigir a login
      router.push('/login');
    }
    // El código HTTP ya te dice qué pasó
    // No necesitas leer ningún "message" del body
  }
}
</script>
```

### Resumen de la Filosofía

| Situación | Código HTTP | Body |
|---|---|---|
| GET exitoso | 200 | Los datos directamente (array, objeto, lo que sea) |
| Recurso creado | 201 | El recurso creado + Header `Location` |
| Acción exitosa sin respuesta | 204 | Sin body |
| Error de validación | 422 | `{ errors: { campo: [mensajes] } }` |
| No autenticado | 401 | `{ error: "..." }` (opcional, el 401 ya lo dice) |
| Sin permisos | 403 | `{ error: "..." }` (opcional) |
| No encontrado | 404 | `{ error: "..." }` (opcional) |
| Error del servidor | 500 | `{ error: "Error interno" }` (NUNCA stack traces) |

> **Esta sección debe tener presencia visible en el sitio**, como parte de la landing o como sección dedicada accesible desde el nav. Es parte de la identidad de HTTP Cobalto 60.

---

## 7. Catálogo Completo de Códigos HTTP

### Estructura de datos:

```typescript
interface HTTPCode {
  code: number;
  title: string;                  // Nombre HTTP oficial (RFC)
  mexicanContext: string;         // Nombre del contexto mexicano
  category: 'info' | 'success' | 'redirect' | 'client-error' | 'server-error';
  description: string;            // Definición técnica RFC
  mexican: string;                // Explicación del contexto mexicano (cruda, real)
  image?: string;                 // Ruta a imagen representativa
  examples: {
    javascript: string;           // Node.js / Express
    python: string;               // FastAPI / Flask
    phpLaravel: string;           // PHP / Laravel
    rust: string;                 // Actix Web / Axum
    cpp: string;                  // Crow o conceptual
  };
  bestPractice: string;           // Buenas prácticas
  antiPattern?: string;           // Qué NO hacer (el envoltorio, etc.)
  relatedCodes?: number[];        // Códigos relacionados
  headers?: string[];             // Headers relevantes
}
```

### Catálogo

#### 1xx — Informativos

| Código | Título HTTP | Contexto Mexicano | Referencia Real |
|--------|------------|-------------------|-----------------|
| 100 | Continue | La Espera en el IMSS | Las filas interminables del sistema de salud público donde te dicen "espere" sin garantizar nada |
| 101 | Switching Protocols | Cambio de Mando Presidencial | La transición entre sexenios, un protocolo que cambia todo y no cambia nada |
| 102 | Processing | Trámite en la SEP | Apostillar documentos: semanas de procesamiento sin respuesta |
| 103 | Early Hints | La Alerta Sísmica | Los segundos de advertencia antes del sismo. Información temprana que puede salvar vidas |

#### 2xx — Éxito

| Código | Título HTTP | Contexto Mexicano | Referencia Real |
|--------|------------|-------------------|-----------------|
| 200 | OK | El Maíz Llegó a la Milpa | La cosecha exitosa, base de supervivencia y alimentación de todo un pueblo |
| 201 | Created | Fundación de Tenochtitlan | 1325. El águila, la serpiente, el nopal. Un imperio creado de la nada |
| 202 | Accepted | "Ya Quedó, Jefe" | La respuesta del albañil/burócrata que no garantiza cuándo ni cómo |
| 204 | No Content | Presa Vacía en Sequía | Operación exitosa pero vacía, como las presas del norte en crisis hídrica |
| 206 | Partial Content | Reconstrucción Post-Sismo 2017 | Solo una fracción de lo prometido se entregó. Contenido parcial. |

#### 3xx — Redirección

| Código | Título HTTP | Contexto Mexicano | Referencia Real |
|--------|------------|-------------------|-----------------|
| 301 | Moved Permanently | El Aeropuerto de Texcoco Cancelado | Cancelación del NAIM, redirección permanente a Felipe Ángeles. Miles de millones perdidos. |
| 302 | Found (Temp Redirect) | Desvío por el Socavón de Puebla | El socavón gigante de 2021 en Santa María Zacatepec. Desvío "temporal" que duró meses. |
| 303 | See Other | "Vaya a la Ventanilla 7" | La burocracia mexicana: te mandan de ventanilla en ventanilla hasta que cierran |
| 304 | Not Modified | Las Reformas que No Cambian Nada | Reformas constitucionales que se aprueban sin modificar la realidad de nadie |
| 307 | Temporary Redirect | Bloqueo en Reforma por Manifestación | Las marchas en Paseo de la Reforma que desvían todo temporalmente |
| 308 | Permanent Redirect | De DF a CDMX | El cambio permanente de nombre de la capital en 2016 |

#### 4xx — Error del Cliente

| Código | Título HTTP | Contexto Mexicano | Referencia Real |
|--------|------------|-------------------|-----------------|
| 400 | Bad Request | Pedir Ketchup en la Taquería | Una petición malformada, inaceptable, que no debería existir |
| 401 | Unauthorized | Colonia Cerrada con Plumas | Privatización ilegal del espacio público. No demuestras que "perteneces", no pasas. |
| 402 | Payment Required | La Mordida | El pago extraoficial que se "requiere" para que tu trámite avance |
| 403 | Forbidden | Campo Militar No. 1 | Prohibido. Ni con credencial, ni con permiso. Zona restringida. Punto. |
| 404 | Not Found | Los 43 de Ayotzinapa | 43 estudiantes normalistas desaparecidos en Iguala, 2014. Buscados. Nunca encontrados. |
| 405 | Method Not Allowed | Protesta Reprimida en Atenco | Métodos legítimos de expresión prohibidos con violencia del Estado (2006) |
| 406 | Not Acceptable | Leche Adulterada | Producto que parece lo que pediste pero es inaceptable: adulterado, falso |
| 408 | Request Timeout | Justicia que Prescribe | Casos judiciales que prescriben sin resolverse. El sistema se cansó de esperar. |
| 409 | Conflict | Disputa Territorial del Narco | Dos cárteles, una plaza. Conflicto irreconciliable por el mismo recurso. |
| 410 | Gone | Ruta 100: Desaparecida para Siempre | Sistema de transporte eliminado en los 90, nunca reemplazado, los trabajadores encarcelados |
| 413 | Payload Too Large | Colapso de la Línea 12 (Sobrecarga) | Infraestructura que no soportó más de lo que debía cargar. 26 muertos. |
| 415 | Unsupported Media Type | CURP con Formato Obsoleto | Documentos que el sistema ya no acepta en formato viejo |
| 418 | I'm a Teapot | La Olla de Tamales de Doña Mary | El único código ligero: cada cosa tiene su función, no le pidas sushi a la tamalera |
| 422 | Unprocessable Entity | Declaración Rechazada por el SAT | El SAT entiende tu declaración pero los datos no cuadran. Rechazada. |
| 429 | Too Many Requests | Apagones de CFE | Sobrecarga del sistema eléctrico. Demasiada demanda, se cae todo. |
| 451 | Unavailable For Legal Reasons | Periodistas Censurados | Contenido bloqueado por presiones legales, políticas o del crimen organizado |

#### 5xx — Error del Servidor

| Código | Título HTTP | Contexto Mexicano | Referencia Real |
|--------|------------|-------------------|-----------------|
| 500 | Internal Server Error | La Explosión de San Juanico (1984) | PEMEX, negligencia, 500+ muertos. Fallo interno catastrófico que nunca debió pasar. |
| 501 | Not Implemented | Sistema de Salud Universal | Prometido cada sexenio, nunca implementado. La funcionalidad no existe. |
| 502 | Bad Gateway | El Huachicol | El intermediario corrompe lo que transporta. La gasolina llega adulterada o no llega. |
| 503 | Service Unavailable | Hospital Sin Medicinas | El servicio existe en papel pero no tiene recursos para funcionar. "No hay." |
| 504 | Gateway Timeout | Llamar a Locatel | El intermediario intenta conectarte pero nunca obtiene respuesta del otro lado |
| 507 | Insufficient Storage | Presas Desbordadas en Tabasco | Sin capacidad de almacenamiento. El sistema se desborda. Inundaciones. |
| 508 | Loop Detected | El Trámite Infinito CURP-INE | Te mandan de una oficina a otra y regresas a la primera. Loop sin salida. |
| 511 | Network Auth Required | WiFi del Aeropuerto: Paga Primero | Red disponible pero no puedes usarla sin autenticación/pago previo |

---

## 8. Contenido Detallado por Código

Para CADA código del catálogo, generar:

### Contexto Mexicano
- Mínimo 3-4 oraciones
- Referencia a un suceso, realidad o situación real de México
- Contexto histórico si aplica (fechas, datos, consecuencias)
- Tono sombrío, directo, sin maquillaje
- Si es tragedia: respeto pero sin censura
- Debe ayudar genuinamente a recordar el código HTTP

### Ejemplos de Código (5 lenguajes)
Cada código debe tener ejemplo funcional en:

1. **JavaScript (Express)**
2. **Python (FastAPI)**
3. **PHP (Laravel)**
4. **Rust (Actix Web)**
5. **C++ (Crow)**

Reglas para los ejemplos:
- Código funcional, no pseudo-código
- Comentarios en español
- **Seguir la filosofía HTTP del proyecto**: sin envolturas tipo `{ data, message, status }`
- El código HTTP habla por sí mismo
- Errores de validación con estructura `{ errors: { campo: [mensajes] } }`
- 10-25 líneas por ejemplo
- Mostrar el manejo idiomático de cada lenguaje/framework

### Buenas Prácticas
- 2-4 tips concretos y profesionales
- Headers que incluir
- Anti-patterns: el envoltorio innecesario, mensajes redundantes
- Diferencias con códigos similares (401 vs 403, 301 vs 308, etc.)
- Cómo el front debe manejar este código

---

## 9. Ejemplo Completo Multi-Lenguaje: HTTP 422

Para ilustrar cómo deben verse los tabs de código en cada página:

### Tab 1: JavaScript (Express)
```javascript
app.post('/api/usuarios', async (req, res) => {
  const errores = validar(req.body);

  if (Object.keys(errores).length > 0) {
    return res.status(422).json({ errors: errores });
  }

  const usuario = await Usuario.create(req.body);
  res.status(201)
    .header('Location', `/api/usuarios/${usuario.id}`)
    .json(usuario);
});
```

### Tab 2: Python (FastAPI)
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, validator

class CrearUsuario(BaseModel):
    email: str
    nombre: str

    @validator('nombre')
    def nombre_minimo(cls, v):
        if len(v) < 3:
            raise ValueError('Mínimo 3 caracteres')
        return v

@app.post("/api/usuarios", status_code=201)
async def crear_usuario(data: CrearUsuario):
    # FastAPI devuelve 422 automáticamente si falla validación
    usuario = await Usuario.create(**data.dict())
    return usuario
```

### Tab 3: PHP (Laravel)
```php
class CrearUsuarioRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'unique:usuarios'],
            'nombre' => ['required', 'min:3'],
        ];
    }
    // Laravel devuelve 422 automáticamente con:
    // { "errors": { "email": ["..."], "nombre": ["..."] } }
}

class UsuarioController extends Controller
{
    public function store(CrearUsuarioRequest $request)
    {
        $usuario = Usuario::create($request->validated());
        return response()->json($usuario, 201)
            ->header('Location', "/api/usuarios/{$usuario->id}");
    }
}
```

### Tab 4: Rust (Actix Web)
```rust
use actix_web::{web, HttpResponse};
use validator::Validate;

#[derive(Deserialize, Validate)]
struct CrearUsuario {
    #[validate(email(message = "Email inválido"))]
    email: String,
    #[validate(length(min = 3, message = "Mínimo 3 caracteres"))]
    nombre: String,
}

async fn crear_usuario(data: web::Json<CrearUsuario>) -> HttpResponse {
    if let Err(errores) = data.validate() {
        return HttpResponse::UnprocessableEntity()
            .json(json!({ "errors": errores }));
    }

    let usuario = Usuario::create(&data).await;
    HttpResponse::Created()
        .insert_header(("Location", format!("/api/usuarios/{}", usuario.id)))
        .json(usuario)
}
```

### Tab 5: C++ (Crow)
```cpp
CROW_ROUTE(app, "/api/usuarios").methods("POST"_method)
([](const crow::request& req) {
    auto body = json::parse(req.body);
    json errores;

    if (!body.contains("email") || body["email"].empty())
        errores["email"] = {"El email es obligatorio"};
    if (!body.contains("nombre") || body["nombre"].size() < 3)
        errores["nombre"] = {"Mínimo 3 caracteres"};

    if (!errores.empty()) {
        return crow::response(422, json{{"errors", errores}}.dump());
    }

    auto usuario = crear_usuario(body);
    auto res = crow::response(201, usuario.dump());
    res.add_header("Location", "/api/usuarios/" + to_string(usuario["id"]));
    return res;
});
```

> **TODOS los códigos del catálogo deben seguir esta estructura multi-lenguaje.**

---

## 10. PWA (Progressive Web App)

- Instalable en móvil y desktop
- Manifest: nombre "HTTP Cobalto 60", tema oscuro (#0C0C0C)
- Icono: ☢️ minimalista en grises (no verde)
- Splash screen oscuro
- Service worker para contenido offline
- Todo el catálogo disponible sin conexión

---

## 11. SEO

### Global
```
title: "HTTP Cobalto 60 — Códigos HTTP desde la realidad de México"
description: "Guía técnica de códigos HTTP con contexto real mexicano. Ejemplos en JavaScript, Python, Laravel, Rust y C++. Buenas prácticas y filosofía de respuestas HTTP."
```

### Por Código
```
title: "{code} {title} — {mexicanContext} | HTTP Cobalto 60"
description: "HTTP {code}: {description}. Ejemplos en 5 lenguajes y buenas prácticas."
```

---

## 12. Funcionalidades Extra

- **Cmd+K / Ctrl+K:** Búsqueda rápida en modal oscuro
- **← →:** Navegación entre códigos en página individual
- **Escape:** Cerrar modales
- **404 custom:** Usa el contexto del código 404 del catálogo
- **418 easter egg:** Detalle sutil, es el único código "ligero" del sitio

---

## 13. Instrucciones para Claude Code

### Paso 1: Inicializar
```bash
npx nuxi@latest init httpcobalto60
cd httpcobalto60
```

### Paso 2: Dependencias
```bash
npm install vuetify @mdi/font
npm install -D vite-plugin-vuetify sass
npm install -D @vite-pwa/nuxt
npm install -D @nuxtjs/seo
npm install @vueuse/motion
npm install shiki
npm install @iconify-json/mdi
```

### Paso 3: Orden de desarrollo
1. `nuxt.config.ts` con Vuetify, PWA, SEO
2. Tema oscuro de Vuetify con la paleta del proyecto
3. `data/codes.ts` con TODO el catálogo (sección 7)
4. `data/examples/` con los 5 lenguajes por código (sección 9)
5. Composables (`useCodes.ts`, `useCategories.ts`)
6. Componentes UI (`CategoryBadge`, `CopyButton`, `LanguageTabs`)
7. Componentes de código (`CodeCard`, `CodeDetail`, `CodeExample`)
8. Layout (`default.vue`) con NavBar y Footer
9. Landing (`pages/index.vue`)
10. Explorador (`pages/codigos/index.vue`)
11. Página individual (`pages/codigos/[code].vue`)
12. About (`pages/about.vue`)
13. Sección Filosofía HTTP
14. Página 404 personalizada
15. PWA (manifest, icons, service worker)
16. SEO y meta tags
17. Búsqueda Cmd+K
18. Navegación por teclado
19. Optimización y build SSG

### Reglas Críticas
- **NO Tailwind.** Solo Vuetify + SCSS.
- **Español mexicano** en todo el contenido.
- **Comentarios de código en español.**
- **Tono sombrío, directo, real.** No chistoso.
- **Técnicamente correcto** según RFCs.
- **Filosofía HTTP** en todos los ejemplos: sin envolturas, el código HTTP es el mensaje.
- **Código funcional**, no pseudo-código.
- **Una URL por código** para SEO.
- **Dark theme obligatorio.** Grises y negros. Sin colores brillantes.
- **Imágenes representativas** por código con tratamiento oscuro/desaturado.

---

## 14. Referencias

- [RFC 9110 — HTTP Semantics](https://httpwg.org/specs/rfc9110.html)
- [MDN — HTTP Status Codes](https://developer.mozilla.org/es/docs/Web/HTTP/Status)
- [HTTP Cats](https://http.cat) — Inspiración conceptual

---

*☢️ HTTP Cobalto 60 — Porque la realidad de México explica mejor los errores que cualquier RFC.*
