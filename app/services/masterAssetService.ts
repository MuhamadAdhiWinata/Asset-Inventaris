// services/masterAssetService.ts

// ============================================================
// TYPES
// ============================================================

export type StatusAset = 'Aktif' | 'Tidak Aktif' | 'Dijual' | 'Dalam Perbaikan'

export interface MasterItem {
  id: number
  kodeAset: string
  namaAset: string
  lokasi: string
  kategori: string
  subKategori: string
  satuan: string
  hargaPerolehan: number
  akumulasiDepresiasi: number
  nilaiBuku: number
  tanggalPerolehan: string
  status: StatusAset
}

export interface MasterItemFormData {
  kodeAset: string
  namaAset: string
  lokasi: string
  kategori: string
  subKategori: string
  satuan: string
  hargaPerolehan: number
  akumulasiDepresiasi: number
  nilaiBuku: number
  tanggalPerolehan: string
  status: StatusAset
}

export interface KategoriItem {
  id: number
  name: string
}

export interface SubKategoriItem {
  id: number
  name: string
  kategoriId: number
}

export interface SatuanItem {
  id: number
  name: string
}

export interface MasterAssetResponse {
  success: boolean
  data: MasterItem[]
  total: number
  page: number
  limit: number
}

// ============================================================
// MOCK DATA
// ============================================================

const mockItems: MasterItem[] = [
  {
    id: 1,
    kodeAset: 'KOM-001',
    namaAset: 'Laptop Dell Latitude 5520',
    lokasi: 'Ruang IT',
    kategori: 'Komputer & IT',
    subKategori: 'Laptop',
    satuan: 'Unit',
    hargaPerolehan: 15000000,
    akumulasiDepresiasi: 281250,
    nilaiBuku: 14718750,
    tanggalPerolehan: '2023-01-15',
    status: 'Aktif',
  },
  {
    id: 2,
    kodeAset: 'KOM-002',
    namaAset: 'PC Desktop HP ProDesk',
    lokasi: 'Ruang Keuangan',
    kategori: 'Komputer & IT',
    subKategori: 'Desktop',
    satuan: 'Unit',
    hargaPerolehan: 12000000,
    akumulasiDepresiasi: 0,
    nilaiBuku: 12000000,
    tanggalPerolehan: '2022-06-20',
    status: 'Aktif',
  },
  {
    id: 3,
    kodeAset: 'FUR-001',
    namaAset: 'Meja Kerja Direktur',
    lokasi: 'Ruang Direktur',
    kategori: 'Furniture',
    subKategori: 'Meja',
    satuan: 'Unit',
    hargaPerolehan: 8500000,
    akumulasiDepresiasi: 0,
    nilaiBuku: 0,
    tanggalPerolehan: '2021-03-10',
    status: 'Dijual',
  },
  {
    id: 4,
    kodeAset: 'FUR-002',
    namaAset: 'Kursi Ergonomis Herman Miller',
    lokasi: 'Ruang Staff',
    kategori: 'Furniture',
    subKategori: 'Kursi',
    satuan: 'Unit',
    hargaPerolehan: 12000000,
    akumulasiDepresiasi: 0,
    nilaiBuku: 12000000,
    tanggalPerolehan: '2022-08-15',
    status: 'Aktif',
  },
  {
    id: 5,
    kodeAset: 'GDG-001',
    namaAset: 'Gedung Kantor Utama',
    lokasi: 'Jl. Sudirman No. 123',
    kategori: 'Gedung & Bangunan',
    subKategori: 'Gedung',
    satuan: 'Unit',
    hargaPerolehan: 5000000000,
    akumulasiDepresiasi: 0,
    nilaiBuku: 5000000000,
    tanggalPerolehan: '2015-01-01',
    status: 'Aktif',
  },
  {
    id: 6,
    kodeAset: 'ELK-001',
    namaAset: 'AC Daikin 2 PK',
    lokasi: 'Ruang Meeting',
    kategori: 'Elektronik',
    subKategori: 'AC',
    satuan: 'Unit',
    hargaPerolehan: 8000000,
    akumulasiDepresiasi: 0,
    nilaiBuku: 8000000,
    tanggalPerolehan: '2023-05-20',
    status: 'Aktif',
  },
  {
    id: 7,
    kodeAset: 'KDR-001',
    namaAset: 'Toyota Avanza',
    lokasi: 'Parkir Kantor',
    kategori: 'Kendaraan',
    subKategori: 'Mobil',
    satuan: 'Unit',
    hargaPerolehan: 220000000,
    akumulasiDepresiasi: 0,
    nilaiBuku: 220000000,
    tanggalPerolehan: '2022-01-10',
    status: 'Aktif',
  },
  {
    id: 8,
    kodeAset: 'KOM-003',
    namaAset: 'Server Dell PowerEdge',
    lokasi: 'Ruang Server',
    kategori: 'Komputer & IT',
    subKategori: 'Server',
    satuan: 'Unit',
    hargaPerolehan: 85000000,
    akumulasiDepresiasi: 0,
    nilaiBuku: 85000000,
    tanggalPerolehan: '2021-06-01',
    status: 'Dalam Perbaikan',
  },
]

const mockKategori: KategoriItem[] = [
  { id: 1, name: 'Komputer & IT' },
  { id: 2, name: 'Furniture' },
  { id: 3, name: 'Gedung & Bangunan' },
  { id: 4, name: 'Elektronik' },
  { id: 5, name: 'Kendaraan' },
]

const mockSubKategori: SubKategoriItem[] = [
  { id: 1,  name: 'Laptop',     kategoriId: 1 },
  { id: 2,  name: 'Desktop',    kategoriId: 1 },
  { id: 3,  name: 'Server',     kategoriId: 1 },
  { id: 4,  name: 'Printer',    kategoriId: 1 },
  { id: 5,  name: 'Meja',       kategoriId: 2 },
  { id: 6,  name: 'Kursi',      kategoriId: 2 },
  { id: 7,  name: 'Lemari',     kategoriId: 2 },
  { id: 8,  name: 'Gedung',     kategoriId: 3 },
  { id: 9,  name: 'AC',         kategoriId: 4 },
  { id: 10, name: 'Proyektor',  kategoriId: 4 },
  { id: 11, name: 'Mobil',      kategoriId: 5 },
  { id: 12, name: 'Motor',      kategoriId: 5 },
]

const mockSatuan: SatuanItem[] = [
  { id: 1, name: 'Unit' },
  { id: 2, name: 'Buah' },
  { id: 3, name: 'Set' },
  { id: 4, name: 'Meter' },
]

// ============================================================
// IN-MEMORY STORE
// ============================================================

let _store: MasterItem[] = [...mockItems]
let _nextId = _store.length + 1

// ============================================================
// SERVICE CLASS
// ============================================================

export class MasterAssetService {
  private delay(ms = 200): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Ketika pakai API nanti, ganti isi method ini saja dengan $fetch
  async getItems(): Promise<MasterAssetResponse> {
    await this.delay()
    return {
      success: true,
      data: [..._store],
      total: _store.length,
      page: 1,
      limit: _store.length,
    }
  }

  async getCategories(): Promise<KategoriItem[]> {
    await this.delay()
    return [...mockKategori]
  }

  async getSubCategories(): Promise<SubKategoriItem[]> {
    await this.delay()
    return [...mockSubKategori]
  }

  async getUnits(): Promise<SatuanItem[]> {
    await this.delay()
    return [...mockSatuan]
  }

  async getItemById(id: number): Promise<MasterItem | null> {
    await this.delay()
    return _store.find(i => i.id === id) ?? null
  }

  async createItem(data: MasterItemFormData): Promise<MasterItem> {
    await this.delay()
    const newItem: MasterItem = {
      id: _nextId++,
      kodeAset: data.kodeAset,
      namaAset: data.namaAset,
      lokasi: data.lokasi,
      kategori: data.kategori,
      subKategori: data.subKategori,
      satuan: data.satuan,
      hargaPerolehan: data.hargaPerolehan,
      akumulasiDepresiasi: data.akumulasiDepresiasi,
      nilaiBuku: data.nilaiBuku,
      tanggalPerolehan: data.tanggalPerolehan,
      status: data.status,
    }
    _store.unshift(newItem)
    return newItem
  }

  async updateItem(id: number, data: MasterItemFormData): Promise<MasterItem> {
    await this.delay()
    const idx = _store.findIndex(i => i.id === id)
    if (idx === -1) throw new Error('Aset tidak ditemukan')
    const updated: MasterItem = { id, ...data }
    _store[idx] = updated
    return updated
  }

  async deleteItem(id: number): Promise<void> {
    await this.delay()
    const idx = _store.findIndex(i => i.id === id)
    if (idx === -1) throw new Error('Aset tidak ditemukan')
    _store.splice(idx, 1)
  }
}

export const masterAssetService = new MasterAssetService()

// ============================================================
// HELPERS
// ============================================================

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

export function formatTanggal(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function emptyForm(): MasterItemFormData {
  return {
    kodeAset: '',
    namaAset: '',
    lokasi: '',
    kategori: '',
    subKategori: '',
    satuan: 'Unit',
    hargaPerolehan: 0,
    akumulasiDepresiasi: 0,
    nilaiBuku: 0,
    tanggalPerolehan: '',
    status: 'Aktif',
  }
}

export const STATUS_CONFIG: Record<StatusAset, { label: string; class: string }> = {
  'Aktif':           { label: 'Aktif',           class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  'Tidak Aktif':     { label: 'Tidak Aktif',     class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
  'Dijual':          { label: 'Dijual',           class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  'Dalam Perbaikan': { label: 'Dalam Perbaikan', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
}

export const KATEGORI_BADGE: Record<string, string> = {
  'Komputer & IT':     'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
  'Furniture':         'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  'Gedung & Bangunan': 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-400',
  'Elektronik':        'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  'Kendaraan':         'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
}