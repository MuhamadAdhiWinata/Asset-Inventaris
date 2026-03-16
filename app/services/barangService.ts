// services/barangService.ts

import type { Kategori, MetodeDepresiasi } from './kategoriService'

// ============================================================
// TYPES
// ============================================================

export type StatusBarang = 'Aktif' | 'Tidak Aktif'

export interface Barang {
  id: number
  kode: string
  nama: string
  kategoriId: number
  // denormalized untuk kemudahan tampil di UI
  kategoriNama: string
  kategoriKode: string
  masaManfaatDefault: number        // inherit dari kategori, bisa override
  metodeDefault: MetodeDepresiasi   // inherit dari kategori, bisa override
  status: StatusBarang
}

export interface BarangFormData {
  kode: string
  nama: string
  kategoriId: number
  masaManfaatDefault: number
  metodeDefault: MetodeDepresiasi
  status: StatusBarang
}

export interface BarangResponse {
  success: boolean
  data: Barang[]
  total: number
}

// ============================================================
// MOCK DATA
// ============================================================

const mockData: Barang[] = [
  // Komputer & IT (kategoriId: 1, kode: KIT)
  { id: 1,  kode: 'KIT-LPT', nama: 'Laptop',           kategoriId: 1, kategoriNama: 'Komputer & IT',    kategoriKode: 'KIT', masaManfaatDefault: 4,  metodeDefault: 'garis_lurus',   status: 'Aktif' },
  { id: 2,  kode: 'KIT-DSK', nama: 'PC Desktop',        kategoriId: 1, kategoriNama: 'Komputer & IT',    kategoriKode: 'KIT', masaManfaatDefault: 4,  metodeDefault: 'garis_lurus',   status: 'Aktif' },
  { id: 3,  kode: 'KIT-SRV', nama: 'Server',            kategoriId: 1, kategoriNama: 'Komputer & IT',    kategoriKode: 'KIT', masaManfaatDefault: 5,  metodeDefault: 'garis_lurus',   status: 'Aktif' },
  { id: 4,  kode: 'KIT-PRN', nama: 'Printer',           kategoriId: 1, kategoriNama: 'Komputer & IT',    kategoriKode: 'KIT', masaManfaatDefault: 4,  metodeDefault: 'garis_lurus',   status: 'Aktif' },
  // Furniture (kategoriId: 2, kode: FUR)
  { id: 5,  kode: 'FUR-MJK', nama: 'Meja Kerja',        kategoriId: 2, kategoriNama: 'Furniture',         kategoriKode: 'FUR', masaManfaatDefault: 8,  metodeDefault: 'garis_lurus',   status: 'Aktif' },
  { id: 6,  kode: 'FUR-KRS', nama: 'Kursi Kerja',       kategoriId: 2, kategoriNama: 'Furniture',         kategoriKode: 'FUR', masaManfaatDefault: 8,  metodeDefault: 'garis_lurus',   status: 'Aktif' },
  { id: 7,  kode: 'FUR-LMR', nama: 'Lemari Arsip',      kategoriId: 2, kategoriNama: 'Furniture',         kategoriKode: 'FUR', masaManfaatDefault: 8,  metodeDefault: 'garis_lurus',   status: 'Aktif' },
  // Gedung & Bangunan (kategoriId: 3, kode: GDB)
  { id: 8,  kode: 'GDB-GDG', nama: 'Gedung Kantor',     kategoriId: 3, kategoriNama: 'Gedung & Bangunan', kategoriKode: 'GDB', masaManfaatDefault: 20, metodeDefault: 'garis_lurus',   status: 'Aktif' },
  // Elektronik (kategoriId: 4, kode: ELK)
  { id: 9,  kode: 'ELK-ACD', nama: 'AC',                kategoriId: 4, kategoriNama: 'Elektronik',        kategoriKode: 'ELK', masaManfaatDefault: 5,  metodeDefault: 'garis_lurus',   status: 'Aktif' },
  { id: 10, kode: 'ELK-PRY', nama: 'Proyektor',         kategoriId: 4, kategoriNama: 'Elektronik',        kategoriKode: 'ELK', masaManfaatDefault: 5,  metodeDefault: 'garis_lurus',   status: 'Aktif' },
  // Kendaraan (kategoriId: 5, kode: KDR)
  { id: 11, kode: 'KDR-MBL', nama: 'Mobil',             kategoriId: 5, kategoriNama: 'Kendaraan',         kategoriKode: 'KDR', masaManfaatDefault: 8,  metodeDefault: 'saldo_menurun', status: 'Aktif' },
  { id: 12, kode: 'KDR-MTR', nama: 'Motor',             kategoriId: 5, kategoriNama: 'Kendaraan',         kategoriKode: 'KDR', masaManfaatDefault: 8,  metodeDefault: 'saldo_menurun', status: 'Aktif' },
  // Mesin & Peralatan (kategoriId: 6, kode: MSN)
  { id: 13, kode: 'MSN-GNS', nama: 'Genset',            kategoriId: 6, kategoriNama: 'Mesin & Peralatan', kategoriKode: 'MSN', masaManfaatDefault: 10, metodeDefault: 'garis_lurus',   status: 'Aktif' },
  { id: 14, kode: 'MSN-PMP', nama: 'Pompa Air',         kategoriId: 6, kategoriNama: 'Mesin & Peralatan', kategoriKode: 'MSN', masaManfaatDefault: 10, metodeDefault: 'garis_lurus',   status: 'Aktif' },
]

// ============================================================
// IN-MEMORY STORE
// ============================================================

let _store: Barang[] = [...mockData]
let _nextId = _store.length + 1

// ============================================================
// SERVICE CLASS
// ============================================================

export class BarangService {
  private delay(ms = 150): Promise<void> {
    return new Promise(r => setTimeout(r, ms))
  }

  async getItems(): Promise<BarangResponse> {
    await this.delay()
    return { success: true, data: [..._store], total: _store.length }
  }

  async getActiveItems(): Promise<Barang[]> {
    await this.delay()
    return _store.filter(b => b.status === 'Aktif')
  }

  async getByKategori(kategoriId: number): Promise<Barang[]> {
    await this.delay()
    return _store.filter(b => b.kategoriId === kategoriId && b.status === 'Aktif')
  }

  async getItemById(id: number): Promise<Barang | null> {
    await this.delay()
    return _store.find(b => b.id === id) ?? null
  }

  // Buat item dengan denormalize data kategori
  async createItem(data: BarangFormData, kategori: Kategori): Promise<Barang> {
    await this.delay()
    const item: Barang = {
      id: _nextId++,
      ...data,
      kategoriNama: kategori.nama,
      kategoriKode: kategori.kode,
    }
    _store.unshift(item)
    return item
  }

  async updateItem(id: number, data: BarangFormData, kategori: Kategori): Promise<Barang> {
    await this.delay()
    const idx = _store.findIndex(b => b.id === id)
    if (idx === -1) throw new Error('Barang tidak ditemukan')
    _store[idx] = {
      id,
      ...data,
      kategoriNama: kategori.nama,
      kategoriKode: kategori.kode,
    }
    return _store[idx]
  }

  async deleteItem(id: number): Promise<void> {
    await this.delay()
    const idx = _store.findIndex(b => b.id === id)
    if (idx === -1) throw new Error('Barang tidak ditemukan')
    _store.splice(idx, 1)
  }
}

export const barangService = new BarangService()

// ============================================================
// HELPERS
// ============================================================

export function emptyBarangForm(): BarangFormData {
  return {
    kode: '',
    nama: '',
    kategoriId: 0,
    masaManfaatDefault: 4,
    metodeDefault: 'garis_lurus',
    status: 'Aktif',
  }
}

export const STATUS_BARANG_CONFIG: Record<StatusBarang, { label: string; class: string }> = {
  'Aktif':       { label: 'Aktif',       class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  'Tidak Aktif': { label: 'Tidak Aktif', class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
}