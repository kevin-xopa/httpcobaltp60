<template>
  <section id="filosofia" class="py-16 philosophy-section">
    <v-container style="max-width: 900px">
      <h2 class="text-display section-heading mb-2">FILOSOFÍA HTTP</h2>
      <p class="section-sub mb-10">
        Un endpoint, un código HTTP. Sin envolturas innecesarias.
      </p>

      <!-- Principio central -->
      <v-card color="surface-container-low" flat class="pa-6 mb-8 border-subtle">
        <blockquote class="principle-quote">
          "Un endpoint siempre debe responder con un código HTTP adecuado y datos si es el caso.
          El código HTTP ES el mensaje. No necesitas envolverlo."
        </blockquote>
      </v-card>

      <!-- Anti-pattern -->
      <h3 class="text-display anti-heading mb-4">
        <v-icon color="error" class="mr-2">mdi-close-circle</v-icon>
        EL ANTI-PATTERN
      </h3>

      <v-card color="surface-container" flat class="pa-0 mb-8 border-subtle overflow-hidden">
        <div class="code-label bad">NO hagas esto</div>
        <CodeExample
          :code="antiPatternCode"
          lang="json"
        />
      </v-card>

      <div class="bad-reasons mb-10">
        <div v-for="reason in badReasons" :key="reason" class="reason-item">
          <v-icon size="14" color="error" class="mr-2">mdi-close</v-icon>
          <span>{{ reason }}</span>
        </div>
      </div>

      <!-- Patrón correcto -->
      <h3 class="text-display good-heading mb-4">
        <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
        EL PATRÓN CORRECTO
      </h3>

      <v-row class="mb-8">
        <v-col
          v-for="example in goodExamples"
          :key="example.label"
          cols="12"
          md="6"
        >
          <v-card color="surface-container" flat class="pa-0 border-subtle overflow-hidden" style="height: 100%">
            <div class="code-label good">{{ example.label }}</div>
            <CodeExample :code="example.code" lang="json" />
          </v-card>
        </v-col>
      </v-row>

      <!-- Tabla resumen -->
      <h3 class="text-display table-heading mb-4">RESUMEN</h3>
      <v-card color="surface-container" flat class="border-subtle overflow-hidden">
        <v-table density="comfortable" class="philosophy-table">
          <thead>
            <tr>
              <th>Situación</th>
              <th>Código</th>
              <th>Body</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in summaryTable" :key="row.code">
              <td class="table-situation">{{ row.situation }}</td>
              <td>
                <code class="code-inline">{{ row.code }}</code>
              </td>
              <td class="table-body">{{ row.body }}</td>
            </tr>
          </tbody>
        </v-table>
      </v-card>

      <!-- Debate: la ambigüedad del 404 -->
      <h3 class="text-display debate-heading mt-12 mb-4">
        <v-icon color="warning" class="mr-2">mdi-alert-circle</v-icon>
        LA AMBIGÜEDAD DEL 404
      </h3>

      <v-card color="surface-container-low" flat class="pa-6 mb-6 border-subtle">
        <div class="debate-text">
          <p>
            El 404 tiene un problema real: es ambiguo. Cuando haces
            <code>GET /api/usuarios/999</code> y recibes un 404, no sabes si el usuario 999
            no existe o si escribiste mal la ruta. ¿Es <code>/api/usarios/999</code>?
            ¿O es que el registro no está en la base de datos?
          </p>
          <p>
            En desarrollo eso quema tiempo. Estás debuggeando pensando que la ruta
            está mal configurada, y resulta que el registro simplemente no existía.
            O peor: asumes que el dato no existe cuando en realidad tu endpoint tiene un typo.
          </p>
        </div>
      </v-card>

      <v-row class="mb-6">
        <v-col cols="12" md="6">
          <v-card color="surface-container" flat class="pa-0 border-subtle overflow-hidden" style="height: 100%">
            <div class="code-label bad">Ambiguo</div>
            <CodeExample :code="ambiguous404" lang="javascript" />
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card color="surface-container" flat class="pa-0 border-subtle overflow-hidden" style="height: 100%">
            <div class="code-label good">Claro</div>
            <CodeExample :code="clear200" lang="javascript" />
          </v-card>
        </v-col>
      </v-row>

      <v-card color="surface-container-low" flat class="pa-6 border-subtle">
        <div class="debate-text">
          <p>
            No hay consenso universal aquí — es uno de los debates eternos de API design.
            Pero si un código HTTP te confunde al debuggear, no está cumpliendo su propósito.
            Una lista vacía es <strong>dato válido</strong>: <code>200 []</code>.
            Un recurso individual que no existe puede ser <code>200 null</code> o un 404 con body
            descriptivo. Lo importante es que tu equipo tenga una convención clara y la respete.
          </p>
        </div>
      </v-card>
    </v-container>
  </section>
</template>

<script setup lang="ts">
const ambiguous404 = `// GET /api/usuarios/999
// Respuesta: 404
// ¿La ruta está mal? ¿O el usuario
// 999 no existe? No lo sabes.`

const clear200 = `// GET /api/usuarios/999
// Respuesta: 200 null
// La ruta existe y funciona.
// El usuario 999 no está registrado.`

const antiPatternCode = `{
  "data": [],
  "message": "Usuarios obtenidos correctamente",
  "status": 200,
  "success": true
}`

const badReasons = [
  'El status ya viene en el HTTP response. ¿Para qué repetirlo en el body?',
  'El message es redundante — el código 200 YA dice que fue exitoso.',
  'success: true es absurdo cuando ya tienes un 200.',
  'El front tiene que verificar response.status Y response.data.success — ¿cuál es la fuente de verdad?',
  'Cuando hay error, ¿el HTTP dice 200 pero el body dice success: false? Eso es un desastre.',
]

const goodExamples = [
  {
    label: 'HTTP 200 — Solo los datos',
    code: `[
  { "id": 1, "nombre": "Juan" },
  { "id": 2, "nombre": "María" }
]`,
  },
  {
    label: 'HTTP 422 — Errores de validación',
    code: `{
  "errors": {
    "email": ["El email ya está registrado"],
    "nombre": ["El nombre es obligatorio"]
  }
}`,
  },
  {
    label: 'HTTP 201 — Recurso creado',
    code: `// Header Location: /api/usuarios/3
{
  "id": 3,
  "nombre": "Pedro",
  "created_at": "2025-02-13"
}`,
  },
  {
    label: 'HTTP 204 — Sin body',
    code: `// Eliminación exitosa
// Sin body. El 204 lo dice todo.`,
  },
]

const summaryTable = [
  { situation: 'GET exitoso', code: '200', body: 'Los datos directamente' },
  { situation: 'Recurso creado', code: '201', body: 'El recurso + Header Location' },
  { situation: 'Acción exitosa sin respuesta', code: '204', body: 'Sin body' },
  { situation: 'Error de validación', code: '422', body: '{ errors: { campo: [mensajes] } }' },
  { situation: 'No autenticado', code: '401', body: '{ error: "..." } (opcional)' },
  { situation: 'Sin permisos', code: '403', body: '{ error: "..." } (opcional)' },
  { situation: 'No encontrado', code: '404', body: '{ error: "..." } (opcional)' },
  { situation: 'Error del servidor', code: '500', body: '{ error: "Error interno" }' },
]
</script>

<style scoped lang="scss">
.philosophy-section {
  background-color: rgb(var(--v-theme-background));
}

.section-heading {
  font-size: 1.5rem;
  color: rgb(var(--v-theme-on-surface));
  letter-spacing: 0.1em;
}

.section-sub {
  color: rgb(var(--v-theme-primary));
  font-size: 1rem;
  font-style: italic;
}

.principle-quote {
  color: rgb(var(--v-theme-on-surface));
  font-size: 1.05rem;
  line-height: 1.7;
  font-style: italic;
  border-left: 3px solid rgb(var(--v-theme-primary));
  padding-left: 1.5rem;
  margin: 0;
}

.anti-heading,
.good-heading,
.table-heading,
.debate-heading {
  font-size: 1rem;
  letter-spacing: 0.08em;
}

.anti-heading { color: rgb(var(--v-theme-error)); }
.good-heading { color: rgb(var(--v-theme-success)); }
.table-heading { color: rgb(var(--v-theme-on-surface)); }
.debate-heading { color: rgb(var(--v-theme-warning)); }

.code-label {
  padding: 0.4rem 1rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-bottom: 1px solid var(--co60-border);

  &.bad {
    background-color: rgba(123, 74, 74, 0.15);
    color: rgb(var(--v-theme-error));
  }

  &.good {
    background-color: rgba(74, 107, 90, 0.15);
    color: rgb(var(--v-theme-success));
  }
}

.bad-reasons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reason-item {
  display: flex;
  align-items: flex-start;
  color: rgb(var(--v-theme-secondary));
  font-size: 0.875rem;
  line-height: 1.5;
}

.philosophy-table {
  background-color: transparent !important;

  th {
    color: rgb(var(--v-theme-secondary)) !important;
    font-size: 0.75rem !important;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border-bottom-color: var(--co60-border) !important;
  }

  td {
    border-bottom-color: var(--co60-border) !important;
  }
}

.table-situation {
  color: rgb(var(--v-theme-secondary));
}

.table-body {
  color: rgb(var(--v-theme-secondary));
  font-size: 0.8rem;
}

.debate-text p {
  color: rgb(var(--v-theme-on-surface));
  font-size: 0.9rem;
  line-height: 1.8;
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }

  strong {
    color: rgb(var(--v-theme-primary));
    font-weight: 600;
  }
}

.code-inline {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  color: rgb(var(--v-theme-primary));
  background: none;
  border: none;
  padding: 0;
}
</style>
