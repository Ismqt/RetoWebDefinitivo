/**
 * Formatea una cadena de tiempo de la base de datos a formato HH:MM
 * @param timeString - Cadena de tiempo que puede venir en varios formatos
 * @returns Tiempo formateado como HH:MM
 */
export function formatTimeString(timeString: string): string {
  if (!timeString) return ""

  try {
    // Si viene como datetime completo (ej: "1970-01-01T18:31:00.000Z")
    if (timeString.includes("T")) {
      const timePart = timeString.split("T")[1]
      const timeOnly = timePart.split(".")[0] // Remover milisegundos si existen
      return timeOnly.substring(0, 5) // Tomar solo HH:MM
    }

    // Si viene como tiempo simple (ej: "18:31:00")
    if (timeString.includes(":")) {
      const parts = timeString.split(":")
      if (parts.length >= 2) {
        const hours = parts[0].padStart(2, "0")
        const minutes = parts[1].padStart(2, "0")
        return `${hours}:${minutes}`
      }
    }

    // Si viene en otro formato, intentar parsearlo como Date
    const date = new Date(`1970-01-01T${timeString}`)
    if (!isNaN(date.getTime())) {
      return date.toTimeString().substring(0, 5)
    }

    return timeString // Devolver tal como viene si no se puede formatear
  } catch (error) {
    console.error("Error formatting time string:", timeString, error)
    return timeString
  }
}

/**
 * Formatea una fecha de la base de datos
 * @param dateString - Cadena de fecha
 * @returns Fecha formateada
 */
export function formatDateString(dateString: string): string {
  if (!dateString) return ""

  try {
    // Extraer parte de fecha (YYYY-MM-DD) para evitar desfase por timezone
    const datePart = dateString.split("T")[0]
    const [year, month, day] = datePart.split("-").map(Number)
    if ([year, month, day].some((v) => isNaN(v))) return dateString
    // Crear fecha en zona local sin considerar UTC
    const date = new Date(year, month - 1, day)
    if (isNaN(date.getTime())) return dateString

    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch (error) {
    console.error("Error formatting date string:", dateString, error)
    return dateString
  }
}

/**
 * Combina fecha y hora de la base de datos en un objeto Date válido
 * @param dateStr - Cadena de fecha de SQL Server
 * @param timeStr - Cadena de tiempo de SQL Server
 * @returns Objeto Date válido
 */
export function combineDateTime(dateStr: string, timeStr: string | null): Date {
  if (!dateStr) return new Date()

  try {
    // Limpiar la fecha - SQL Server puede devolver fechas como "2025-01-15T00:00:00.000Z"
    let cleanDate = dateStr
    if (dateStr.includes("T")) {
      cleanDate = dateStr.split("T")[0]
    }

    // Limpiar la hora
    let cleanTime = "00:00:00"
    if (timeStr) {
      if (timeStr.includes("T")) {
        // Si la hora viene como datetime completo, extraer solo la parte de tiempo
        const timePart = timeStr.split("T")[1]
        cleanTime = timePart.split(".")[0] // Remover milisegundos
      } else {
        cleanTime = timeStr
      }
    }

    // Asegurar que la hora tenga formato HH:MM:SS
    if (cleanTime && !cleanTime.includes(":")) {
      cleanTime = "00:00:00"
    } else if (cleanTime && cleanTime.split(":").length === 2) {
      cleanTime += ":00" // Agregar segundos si no están presentes
    }

    // Crear la fecha combinada
    const combinedDateTime = `${cleanDate}T${cleanTime}`
    const date = new Date(combinedDateTime)

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.warn("Invalid date created:", { dateStr, timeStr, cleanDate, cleanTime, combinedDateTime })
      return new Date() // Devolver fecha actual como fallback
    }

    return date
  } catch (error) {
    console.error("Error combining date and time:", { dateStr, timeStr, error })
    return new Date() // Devolver fecha actual como fallback
  }
}

/**
 * Formatea una fecha completa para mostrar en la UI
 * @param date - Objeto Date
 * @returns Fecha formateada en español
 */
export function formatDisplayDate(date: Date): string {
  if (!date || isNaN(date.getTime())) {
    return "Fecha no disponible"
  }

  try {
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date)
  } catch (error) {
    console.error("Error formatting display date:", error)
    return "Error en fecha"
  }
}
