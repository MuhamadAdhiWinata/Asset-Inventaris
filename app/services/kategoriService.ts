// services/kategoriService.ts

// ============================================================
// TYPES
// ============================================================

export type MetodeDepresiasi = 'garis_lurus' | 'saldo_menurun'
export type StatusKategori   = 'Aktif' | 'Tidak Aktif'

export interface Kategori {
  id: number
  kode: string
  nama: string
  masaManfaatDefault: number   // dalam tahun
  metodeDefault: MetodeDepresiasi
  status: StatusKategori
}

export interface KategoriFormData {
  kode: string
  nama: string
  masaManfaatDefault: number
  metodeDefault: MetodeDepresiasi
  status: StatusKategori
}

export interface KategoriResponse {
  success: boolean
  data: Kategori[]
  total: number
}

// ============================================================
// MOCK DATA
// ============================================================

const mockData: Kategori[] = [
  { id: 1, kode: 'KIT', nama: 'Komputer & IT',    masaManfaatDefault: 4,  metodeDefault: 'garis_lurus',   status: 'Aktif' },
  { id: 2, kode: 'FUR', nama: 'Furniture',         masaManfaatDefault: 8,  metodeDefault: 'garis_lurus',   status: 'Aktif' },
  { id: 3, kode: 'GDB', nama: 'Gedung & Bangunan', masaManfaatDefault: 20, metodeDefault: 'garis_lurus',   status: 'Aktif' },
  { id: 4, kode: 'ELK', nama: 'Elektronik',        masaManfaatDefault: 5,  metodeDefault: 'garis_lurus',   status: 'Aktif' },
  { id: 5, kode: 'KDR', nama: 'Kendaraan',         masaManfaatDefault: 8,  metodeDefault: 'saldo_menurun', status: 'Aktif' },
  { id: 6, kode: 'MSN', nama: 'Mesin & Peralatan', masaManfaatDefault: 10, metodeDefault: 'garis_lurus',   status: 'Aktif' },
]

// ============================================================
// IN-MEMORY STORE
// ============================================================

let _store: Kategori[] = [...mockData]
let _nextId = _store.length + 1

// ============================================================
// SERVICE CLASS
// ============================================================

export class KategoriService {
  private delay(ms = 150): Promise<void> {
    return new Promise(r => setTimeout(r, ms))
  }

  async getItems(): Promise<KategoriResponse> {
    await this.delay()
    return { success: true, data: [..._store], total: _store.length }
  }

  async getActiveItems(): Promise<Kategori[]> {
    await this.delay()
    return _store.filter(k => k.status === 'Aktif')
  }

  async getItemById(id: number): Promise<Kategori | null> {
    await this.delay()
    return _store.find(k => k.id === id) ?? null
  }

  async createItem(data: KategoriFormData): Promise<Kategori> {
    await this.delay()
    const item: Kategori = { id: _nextId++, ...data }
    _store.unshift(item)
    return item
  }

  async updateItem(id: number, data: KategoriFormData): Promise<Kategori> {
    await this.delay()
    const idx = _store.findIndex(k => k.id === id)
    if (idx === -1) throw new Error('Kategori tidak ditemukan')
    _store[idx] = { id, ...data }
    return _store[idx]
  }

  async deleteItem(id: number): Promise<void> {
    await this.delay()
    const idx = _store.findIndex(k => k.id === id)
    if (idx === -1) throw new Error('Kategori tidak ditemukan')
    _store.splice(idx, 1)
  }
}

export const kategoriService = new KategoriService()

// ============================================================
// HELPERS
// ============================================================

export function emptyKategoriForm(): KategoriFormData {
  return {
    kode: '',
    nama: '',
    masaManfaatDefault: 4,
    metodeDefault: 'garis_lurus',
    status: 'Aktif',
  }
}

export const METODE_LABEL: Record<MetodeDepresiasi, string> = {
  garis_lurus:   'Garis Lurus',
  saldo_menurun: 'Saldo Menurun',
}

export const STATUS_KATEGORI_CONFIG: Record<StatusKategori, { label: string; class: string }> = {
  'Aktif':       { label: 'Aktif',       class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  'Tidak Aktif': { label: 'Tidak Aktif', class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
}