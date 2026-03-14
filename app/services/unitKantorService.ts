// services/unitKantorService.ts

// ============================================================
// TYPES
// ============================================================

export type StatusUnit = 'Aktif' | 'Tidak Aktif'

export interface UnitKantor {
  id: number
  kodeUnit: string
  namaUnit: string
  alamat: string
  telepon: string
  status: StatusUnit
}

export interface UnitKantorFormData {
  kodeUnit: string
  namaUnit: string
  alamat: string
  telepon: string
  status: StatusUnit
}

export interface UnitKantorResponse {
  success: boolean
  data: UnitKantor[]
  total: number
}

// ============================================================
// MOCK DATA
// ============================================================

const mockUnits: UnitKantor[] = [
  {
    id: 1,
    kodeUnit: 'UKA',
    namaUnit: 'Unit Kantor A',
    alamat: 'Jl. Sudirman No. 1, Jakarta',
    telepon: '021-1234567',
    status: 'Aktif',
  },
  {
    id: 2,
    kodeUnit: 'UKB',
    namaUnit: 'Unit Kantor B',
    alamat: 'Jl. Thamrin No. 5, Jakarta',
    telepon: '021-7654321',
    status: 'Aktif',
  },
  {
    id: 3,
    kodeUnit: 'UKC',
    namaUnit: 'Unit Kantor C',
    alamat: 'Jl. Gatot Subroto No. 10, Bandung',
    telepon: '022-9876543',
    status: 'Tidak Aktif',
  },
]

// ============================================================
// IN-MEMORY STORE
// ============================================================

let _store: UnitKantor[] = [...mockUnits]
let _nextId = _store.length + 1

// ============================================================
// SERVICE CLASS
// ============================================================

export class UnitKantorService {
  private delay(ms = 200): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Unit kantor adalah data global — tidak difilter per unit
  // Hanya super admin & admin pusat yang bisa manage
  async getItems(): Promise<UnitKantorResponse> {
    await this.delay()
    return {
      success: true,
      data: [..._store],
      total: _store.length,
    }
  }

  async getItemById(id: number): Promise<UnitKantor | null> {
    await this.delay()
    return _store.find(i => i.id === id) ?? null
  }

  // Dipakai sebagai dropdown lookup di form user / laporan
  async getActiveUnits(): Promise<UnitKantor[]> {
    await this.delay()
    return _store.filter(u => u.status === 'Aktif')
  }

  async createItem(data: UnitKantorFormData): Promise<UnitKantor> {
    await this.delay()
    const newItem: UnitKantor = { id: _nextId++, ...data }
    _store.unshift(newItem)
    return newItem
  }

  async updateItem(id: number, data: UnitKantorFormData): Promise<UnitKantor> {
    await this.delay()
    const idx = _store.findIndex(i => i.id === id)
    if (idx === -1) throw new Error('Unit kantor tidak ditemukan')
    const updated: UnitKantor = { id, ...data }
    _store[idx] = updated
    return updated
  }

  async deleteItem(id: number): Promise<void> {
    await this.delay()
    const idx = _store.findIndex(i => i.id === id)
    if (idx === -1) throw new Error('Unit kantor tidak ditemukan')
    _store.splice(idx, 1)
  }
}

export const unitKantorService = new UnitKantorService()

// ============================================================
// HELPERS
// ============================================================

export function emptyForm(): UnitKantorFormData {
  return {
    kodeUnit: '',
    namaUnit: '',
    alamat: '',
    telepon: '',
    status: 'Aktif',
  }
}

export const STATUS_CONFIG: Record<StatusUnit, { label: string; class: string }> = {
  'Aktif':       { label: 'Aktif',       class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  'Tidak Aktif': { label: 'Tidak Aktif', class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
}