// services/unitKantorService.ts
// Unit kantor bersifat GLOBAL — hanya super admin & admin pusat yang manage
// Admin unit hanya bisa READ (untuk dropdown dll)

// ============================================================
// TYPES
// ============================================================

export type StatusUnit = 'Aktif' | 'Tidak Aktif'

export interface UnitKantor {
  id: number
  kode: string
  nama: string
  alamat: string
  telepon: string
  email: string
  status: StatusUnit
}

export interface UnitKantorFormData {
  kode: string
  nama: string
  alamat: string
  telepon: string
  email: string
  status: StatusUnit
}

export interface UnitKantorResponse {
  success: boolean
  data: UnitKantor[]
  total: number
}

// ============================================================
// MOCK DATA
// ID harus sesuai dengan unitId di useAuthStore mock users:
//   unitId: 1 → Unit Kantor A
//   unitId: 2 → Unit Kantor B
// ============================================================

const mockData: UnitKantor[] = [
  {
    id: 1, kode: 'UKA',
    nama: 'Unit Kantor A',
    alamat: 'Jl. Sudirman No. 1, Jakarta Pusat',
    telepon: '021-1234567',
    email: 'unita@example.com',
    status: 'Aktif',
  },
  {
    id: 2, kode: 'UKB',
    nama: 'Unit Kantor B',
    alamat: 'Jl. Thamrin No. 5, Jakarta Pusat',
    telepon: '021-7654321',
    email: 'unitb@example.com',
    status: 'Aktif',
  },
  {
    id: 3, kode: 'UKC',
    nama: 'Unit Kantor C',
    alamat: 'Jl. Gatot Subroto No. 10, Bandung',
    telepon: '022-9876543',
    email: 'unitc@example.com',
    status: 'Tidak Aktif',
  },
]

// ============================================================
// IN-MEMORY STORE
// ============================================================

let _store: UnitKantor[] = [...mockData]
let _nextId = _store.length + 1

// ============================================================
// SERVICE CLASS
// ============================================================

export class UnitKantorService {
  private delay(ms = 150): Promise<void> {
    return new Promise(r => setTimeout(r, ms))
  }

  // Semua unit — halaman manajemen (admin pusat / super admin)
  async getItems(): Promise<UnitKantorResponse> {
    await this.delay()
    return { success: true, data: [..._store], total: _store.length }
  }

  // Hanya unit aktif — untuk dropdown di form transaksi dll
  async getActiveItems(): Promise<UnitKantor[]> {
    await this.delay()
    return _store.filter(u => u.status === 'Aktif')
  }

  async getItemById(id: number): Promise<UnitKantor | null> {
    await this.delay()
    return _store.find(u => u.id === id) ?? null
  }

  // Helper denormalize — ambil nama unit dari id
  // Dipakai di transaksiService saat buat transfer, pembelian, dll
  async getNamaById(id: number): Promise<string> {
    const unit = await this.getItemById(id)
    return unit?.nama ?? `Unit #${id}`
  }

  async createItem(data: UnitKantorFormData): Promise<UnitKantor> {
    await this.delay()
    const item: UnitKantor = { id: _nextId++, ...data }
    _store.unshift(item)
    return item
  }

  async updateItem(id: number, data: UnitKantorFormData): Promise<UnitKantor> {
    await this.delay()
    const idx = _store.findIndex(u => u.id === id)
    if (idx === -1) throw new Error('Unit kantor tidak ditemukan')
    const updated: UnitKantor = { id, ...data }
    _store[idx] = updated
    return updated
  }

  async deleteItem(id: number): Promise<void> {
    await this.delay()
    const idx = _store.findIndex(u => u.id === id)
    if (idx === -1) throw new Error('Unit kantor tidak ditemukan')
    _store.splice(idx, 1)
  }
}

export const unitKantorService = new UnitKantorService()

// ============================================================
// HELPERS
// ============================================================

export function emptyUnitKantorForm(): UnitKantorFormData {
  return {
    kode: '',
    nama: '',
    alamat: '',
    telepon: '',
    email: '',
    status: 'Aktif',
  }
}

export const STATUS_UNIT_CONFIG: Record<StatusUnit, { label: string; class: string }> = {
  'Aktif':       { label: 'Aktif',       class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  'Tidak Aktif': { label: 'Tidak Aktif', class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
}