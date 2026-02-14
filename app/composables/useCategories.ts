export interface Category {
  id: 'info' | 'success' | 'redirect' | 'client-error' | 'server-error'
  label: string
  range: string
  color: string
  description: string
}

const categories: Category[] = [
  {
    id: 'info',
    label: 'Informativos',
    range: '1xx',
    color: '#5C6378',
    description: 'Respuestas provisionales. El servidor recibió la petición y el cliente debe continuar.',
  },
  {
    id: 'success',
    label: 'Éxito',
    range: '2xx',
    color: '#4A6B5A',
    description: 'La petición fue recibida, entendida y aceptada correctamente.',
  },
  {
    id: 'redirect',
    label: 'Redirección',
    range: '3xx',
    color: '#7B6B3A',
    description: 'El cliente debe tomar acción adicional para completar la petición.',
  },
  {
    id: 'client-error',
    label: 'Error del Cliente',
    range: '4xx',
    color: '#7B4A4A',
    description: 'La petición tiene un error por parte del cliente.',
  },
  {
    id: 'server-error',
    label: 'Error del Servidor',
    range: '5xx',
    color: '#6B2A2A',
    description: 'El servidor falló al procesar una petición aparentemente válida.',
  },
]

export function useCategories() {
  function getCategoryById(id: Category['id']): Category | undefined {
    return categories.find(c => c.id === id)
  }

  function getCategoryColor(id: Category['id']): string {
    return getCategoryById(id)?.color ?? '#6B6B6B'
  }

  function getCategoryLabel(id: Category['id']): string {
    return getCategoryById(id)?.label ?? ''
  }

  function getCategoryRange(id: Category['id']): string {
    return getCategoryById(id)?.range ?? ''
  }

  function getCategoryFromCode(code: number): Category['id'] {
    if (code < 200) return 'info'
    if (code < 300) return 'success'
    if (code < 400) return 'redirect'
    if (code < 500) return 'client-error'
    return 'server-error'
  }

  return {
    categories,
    getCategoryById,
    getCategoryColor,
    getCategoryLabel,
    getCategoryRange,
    getCategoryFromCode,
  }
}
