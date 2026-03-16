// services/supplierService.ts

// ============================================================
// TYPES
// ============================================================

export type StatusSupplier = 'Aktif' | 'Tidak Aktif'

export interface Supplier {
  id: number
  kode: string
  nama: string
  kontak: string
  email: string
  alamat: string
  status: StatusSupplier
}

export interface SupplierFormData {
  kode: string
  nama: string
  kontak: string
  email: string
  alamat: string
  status: StatusSupplier
}

export interface SupplierResponse {
  success: boolean
  data: Supplier[]
  total: number
}

// ============================================================
// MOCK DATA
// ============================================================

const mockData: Supplier[] = [
  { id: 1, kode: 'SUP-001', nama: 'PT. Dell Indonesia',       kontak: '021-1234567', email: 'sales@dell.co.id',    alamat: 'Jl. Sudirman No. 1, Jakarta',   status: 'Aktif' },
  { id: 2, kode: 'SUP-002', nama: 'PT. HP Indonesia',         kontak: '021-2345678', email: 'sales@hp.co.id',      alamat: 'Jl. Thamrin No. 5, Jakarta',    status: 'Aktif' },
  { id: 3, kode: 'SUP-003', nama: 'PT. Daikin Aircon',        kontak: '021-3456789', email: 'sales@daikin.co.id',  alamat: 'Jl. Gatot Subroto No. 10, Jakarta', status: 'Aktif' },
  { id: 4, kode: 'SUP-004', nama: 'CV. Maju Furniture',       kontak: '022-4567890', email: 'info@majufurniture.com', alamat: 'Jl. Braga No. 20, Bandung',  status: 'Aktif' },
  { id: 5, kode: 'SUP-005', nama: 'PT. Toyota Astra Motor',   kontak: '021-5678901', email: 'fleet@toyota.co.id',  alamat: 'Jl. Yos Sudarso No. 11, Jakarta', status: 'Aktif' },
  { id: 6, kode: 'SUP-006', nama: 'PT. Lenovo Indonesia',     kontak: '021-6789012', email: 'sales@lenovo.co.id',  alamat: 'Jl. MH Thamrin No. 8, Jakarta', status: 'Tidak Aktif' },
]

// ============================================================
// IN-MEMORY STORE
// ============================================================

let _store: Supplier[] = [...mockData]
let _nextId = _store.length + 1

// ============================================================
// SERVICE CLASS
// ============================================================

export class SupplierService {
  private delay(ms = 150): Promise<void> {
    return new Promise(r => setTimeout(r, ms))
  }

  async getItems(): Promise<SupplierResponse> {
    await this.delay()
    return { success: true, data: [..._store], total: _store.length }
  }

  async getActiveItems(): Promise<Supplier[]> {
    await this.delay()
    return _store.filter(s => s.status === 'Aktif')
  }

  async getItemById(id: number): Promise<Supplier | null> {
    await this.delay()
    return _store.find(s => s.id === id) ?? null
  }

  async createItem(data: SupplierFormData): Promise<Supplier> {
    await this.delay()
    const item: Supplier = { id: _nextId++, ...data }
    _store.unshift(item)
    return item
  }

  async updateItem(id: number, data: SupplierFormData): Promise<Supplier> {
    await this.delay()
    const idx = _store.findIndex(s => s.id === id)
    if (idx === -1) throw new Error('Supplier tidak ditemukan')
    _store[idx] = { id, ...data }
    return _store[idx]
  }

  async deleteItem(id: number): Promise<void> {
    await this.delay()
    const idx = _store.findIndex(s => s.id === id)
    if (idx === -1) throw new Error('Supplier tidak ditemukan')
    _store.splice(idx, 1)
  }
}

export const supplierService = new SupplierService()

// ============================================================
// HELPERS
// ============================================================

export function emptySupplierForm(): SupplierFormData {
  return {
    kode: '',
    nama: '',
    kontak: '',
    email: '',
    alamat: '',
    status: 'Aktif',
  }
}

export const STATUS_SUPPLIER_CONFIG: Record<StatusSupplier, { label: string; class: string }> = {
  'Aktif':       { label: 'Aktif',       class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  'Tidak Aktif': { label: 'Tidak Aktif', class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
}