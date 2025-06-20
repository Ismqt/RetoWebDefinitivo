// Business Rules Implementation
export interface User {
  id: any
  email: string
  role: string // For display purposes
  id_Rol: number // For logic
  hashedPassword?: string
  createdAt?: Date
  lastLogin?: Date
}

export interface Child {
  id: string
  cedula: string
  nombreCompleto: string
  fechaNacimiento: Date
  genero: "M" | "F"
  tutorId: string // Business Rule: Child must be associated with a Tutor
  createdAt: Date
}

export interface VaccineLot {
  id: string
  vaccine: string
  manufacturer: string
  lotNumber: string
  expirationDate: Date
  totalQuantity: number
  availableQuantity: number // Updated automatically via triggers
}

export interface VaccinationRecord {
  id: string
  childId: string
  vaccineLotId: string
  applicationDate: Date
  administeredBy: string
  centerId: string
  doseNumber: number
  notes?: string
}

export interface Appointment {
  id: string
  childId: string
  tutorId: string
  vaccineType: string
  scheduledDate: Date
  centerId: string
  status: "scheduled" | "completed" | "canceled"
  createdAt: Date
}

// Business Rule Functions
export class BusinessRules {
  // User Management & Security Rules
  // Role IDs: 1 = Administrador, 6 = Tutor
  static validateUserRole(user: User, requiredRole: number): boolean {
    // Admin can do anything
    if (user.id_Rol === 1) return true;
    return user.id_Rol === requiredRole;
  }

  static canManageChild(user: User, child: Child): boolean {
    // Administrador (1) can manage any child
    if (user.id_Rol === 1) return true

    // Tutor (6) can only manage their own children
    return user.id_Rol === 6 && child.tutorId === user.id
  }

  static canViewAppointment(user: User, appointment: Appointment): boolean {
    // Administrador (1) can view any appointment
    if (user.id_Rol === 1) return true

    // Tutor (6) can only view appointments for their children
    return user.id_Rol === 6 && appointment.tutorId === user.id
  }

  // Age Calculation Rule
  static calculateAge(birthDate: Date): number {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  // Vaccination Rules
  static validateVaccinationAge(child: Child, vaccineType: string): { valid: boolean; message?: string } {
    const age = this.calculateAge(child.fechaNacimiento)

    // Define age requirements for vaccines
    const ageRequirements: Record<string, { min: number; max?: number }> = {
      "COVID-19": { min: 5 },
      Influenza: { min: 6 / 12 }, // 6 months
      "Hepatitis B": { min: 0 },
      Sarampión: { min: 12 / 12 }, // 12 months
      Tétanos: { min: 2 / 12 }, // 2 months
    }

    const requirement = ageRequirements[vaccineType]
    if (!requirement) {
      return { valid: false, message: "Tipo de vacuna no reconocido" }
    }

    if (age < requirement.min) {
      return {
        valid: false,
        message: `El niño debe tener al menos ${requirement.min} años para esta vacuna`,
      }
    }

    if (requirement.max && age > requirement.max) {
      return {
        valid: false,
        message: `El niño no puede tener más de ${requirement.max} años para esta vacuna`,
      }
    }

    return { valid: true }
  }

  // Inventory Control Rules
  static canAdministerVaccine(lot: VaccineLot): { valid: boolean; message?: string } {
    if (lot.availableQuantity <= 0) {
      return { valid: false, message: "No hay dosis disponibles en este lote" }
    }

    if (new Date() > lot.expirationDate) {
      return { valid: false, message: "Este lote de vacuna ha expirado" }
    }

    return { valid: true }
  }

  // Appointment Rules
  static validateAppointmentScheduling(
    appointment: Appointment,
    existingAppointments: Appointment[],
  ): { valid: boolean; message?: string } {
    // Check if child already has an appointment for the same day
    const sameDay = existingAppointments.filter(
      (apt) =>
        apt.childId === appointment.childId &&
        apt.scheduledDate.toDateString() === appointment.scheduledDate.toDateString() &&
        apt.status === "scheduled",
    )

    if (sameDay.length > 0) {
      return {
        valid: false,
        message: "El niño ya tiene una cita programada para este día",
      }
    }

    // Check if appointment is in the past
    if (appointment.scheduledDate < new Date()) {
      return {
        valid: false,
        message: "No se pueden programar citas en el pasado",
      }
    }

    return { valid: true }
  }

  // JWT Token Validation (1 hour expiry)
  static isTokenValid(tokenTimestamp: Date): boolean {
    const now = new Date()
    const oneHour = 60 * 60 * 1000 // 1 hour in milliseconds
    return now.getTime() - tokenTimestamp.getTime() < oneHour
  }

  // Password Security Rules
  static validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: "La contraseña debe tener al menos 8 caracteres" }
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return {
        valid: false,
        message: "La contraseña debe contener al menos una mayúscula, una minúscula y un número",
      }
    }

    return { valid: true }
  }

  // Search and Filter Rules
  static applyAdvancedFilters<T>(data: T[], filters: any, user: User): T[] {
    let filteredData = [...data]

    // Apply role-based filtering first
    if (user.id_Rol === 6) { // Tutor
      // Tutors can only see their own children's data
      filteredData = filteredData.filter((item: any) => item.tutorId === user.id || item.userId === user.id)
    }

    // Apply other filters...
    return filteredData
  }
}

// Validation Schemas
export const ValidationSchemas = {
  child: {
    cedula: (value: string) => /^\d{9}$/.test(value) || "Cédula debe tener 9 dígitos",
    nombreCompleto: (value: string) => value.length >= 2 || "Nombre debe tener al menos 2 caracteres",
    fechaNacimiento: (value: Date) => value <= new Date() || "Fecha de nacimiento no puede ser futura",
  },

  appointment: {
    scheduledDate: (value: Date) => value > new Date() || "La cita debe ser programada para el futuro",
  },

  vaccination: {
    applicationDate: (value: Date) => value <= new Date() || "Fecha de aplicación no puede ser futura",
  },
}
