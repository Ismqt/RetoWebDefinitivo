import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: string
  name?: string
  email: string
  role: "medico" | "digitador" | "supervisor" | "administrador"
  id_Rol: number
  centroId?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        if (user.role) {
          user.role = user.role.toLowerCase() as User["role"];
        }
        set({ user, token, isAuthenticated: true });
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
    },
  ),
)

interface Patient {
  id: string
  cedula: string
  nombreCompleto: string
  fechaNacimiento: string
  genero: "M" | "F"
  pais: string
  direccion: string
  centroAsignado: string
  tutor1?: {
    nombre: string
    cedula: string
    telefono: string
    email: string
    direccion: string
  }
  tutor2?: {
    nombre: string
    cedula: string
    telefono: string
    email: string
    direccion: string
  }
}

interface PatientsState {
  patients: Patient[]
  selectedPatient: Patient | null
  setPatients: (patients: Patient[]) => void
  addPatient: (patient: Patient) => void
  updatePatient: (id: string, patient: Partial<Patient>) => void
  setSelectedPatient: (patient: Patient | null) => void
}

export const usePatientsStore = create<PatientsState>((set) => ({
  patients: [],
  selectedPatient: null,
  setPatients: (patients) => set({ patients }),
  addPatient: (patient) =>
    set((state) => ({
      patients: [...state.patients, patient],
    })),
  updatePatient: (id, updatedPatient) =>
    set((state) => ({
      patients: state.patients.map((p) => (p.id === id ? { ...p, ...updatedPatient } : p)),
    })),
  setSelectedPatient: (patient) => set({ selectedPatient: patient }),
}))
