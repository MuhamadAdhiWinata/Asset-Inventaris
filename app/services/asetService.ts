// services/asetService.ts
// Aset = registri fisik unik, lahir dari transaksi pembelian atau initial balance

// ============================================================
// TYPES
// ============================================================

export type StatusAset        = 'Aktif' | 'Dalam Perbaikan' | 'Terjual' | 'Disposal'
export type MetodeDepresiasi  = 'garis_lurus' | 'saldo_menurun'

export interface Aset {
  id: number
  kodeAset: string
  barangId: number
  barangNama: string       // denormalized
  barangKode: string       // denormalized
  kategoriNama: string     // denormalized
  unitId: number
  unitNama: string         // denormalized
  transaksiId: number | null  // null = initial balance / migrasi
  hargaPerolehan: number
  masaManfaat: number      // tahun
  metodeDepresiasi: MetodeDepresiasi
  tanggalPerolehan: string // ISO date
  akmDepresiasi: number
  nilaiBuku: number
  status: StatusAset
}

export interface AsetFormData {
  // Dipakai untuk initial balance (input manual)
  kodeAset: string
  barangId: number
  unitId: number
  hargaPerolehan: number
  masaManfaat: number
  metodeDepresiasi: MetodeDepresiasi
  tanggalPerolehan: string
  akmDepresiasi: number    // bisa diisi manual untuk migrasi
  status: StatusAset
}

export interface AsetResponse {
  success: boolean
  data: Aset[]
  total: number
}

// ============================================================
// HELPERS KODE ASET
// Prefix sementara dari kode barang
// Format: {kodeBarang}-{nomor urut per jenis barang}
// Contoh: KIT-LPT-001, KIT-LPT-002, FUR-MJK-001
// ============================================================

const _kodeCounter: Record<string, number> = {}

export function generateKodeAset(kodeBarang: string): string {
  const key = kodeBarang.toUpperCase()
  _kodeCounter[key] = (_kodeCounter[key] ?? 0) + 1
  return `${key}-${String(_kodeCounter[key]).padStart(3, '0')}`
}

// ============================================================
// MOCK DATA — initial balance / aset existing
// ============================================================

const mockData: Aset[] = [
  // Unit Kantor A (unitId: 1)
  {
    id: 1, kodeAset: 'KIT-LPT-001',
    barangId: 1, barangNama: 'Laptop', barangKode: 'KIT-LPT', kategoriNama: 'Komputer & IT',
    unitId: 1, unitNama: 'Unit Kantor A',
    transaksiId: null,   // initial balance
    hargaPerolehan: 15000000, masaManfaat: 4, metodeDepresiasi: 'garis_lurus',
    tanggalPerolehan: '2023-01-15', akmDepresiasi: 281250, nilaiBuku: 14718750,
    status: 'Aktif',
  },
  {
    id: 2, kodeAset: 'KIT-DSK-001',
    barangId: 2, barangNama: 'PC Desktop', barangKode: 'KIT-DSK', kategoriNama: 'Komputer & IT',
    unitId: 1, unitNama: 'Unit Kantor A',
    transaksiId: null,
    hargaPerolehan: 12000000, masaManfaat: 4, metodeDepresiasi: 'garis_lurus',
    tanggalPerolehan: '2022-06-20', akmDepresiasi: 0, nilaiBuku: 12000000,
    status: 'Aktif',
  },
  {
    id: 3, kodeAset: 'FUR-MJK-001',
    barangId: 5, barangNama: 'Meja Kerja', barangKode: 'FUR-MJK', kategoriNama: 'Furniture',
    unitId: 1, unitNama: 'Unit Kantor A',
    transaksiId: null,
    hargaPerolehan: 8500000, masaManfaat: 8, metodeDepresiasi: 'garis_lurus',
    tanggalPerolehan: '2021-03-10', akmDepresiasi: 0, nilaiBuku: 0,
    status: 'Terjual',
  },
  {
    id: 4, kodeAset: 'GDB-GDG-001',
    barangId: 8, barangNama: 'Gedung Kantor', barangKode: 'GDB-GDG', kategoriNama: 'Gedung & Bangunan',
    unitId: 1, unitNama: 'Unit Kantor A',
    transaksiId: null,
    hargaPerolehan: 5000000000, masaManfaat: 20, metodeDepresiasi: 'garis_lurus',
    tanggalPerolehan: '2015-01-01', akmDepresiasi: 0, nilaiBuku: 5000000000,
    status: 'Aktif',
  },
  {
    id: 5, kodeAset: 'KIT-SRV-001',
    barangId: 3, barangNama: 'Server', barangKode: 'KIT-SRV', kategoriNama: 'Komputer & IT',
    unitId: 1, unitNama: 'Unit Kantor A',
    transaksiId: null,
    hargaPerolehan: 85000000, masaManfaat: 5, metodeDepresiasi: 'garis_lurus',
    tanggalPerolehan: '2021-06-01', akmDepresiasi: 0, nilaiBuku: 85000000,
    status: 'Dalam Perbaikan',
  },
  // Unit Kantor B (unitId: 2)
  {
    id: 6, kodeAset: 'KIT-LPT-002',
    barangId: 1, barangNama: 'Laptop', barangKode: 'KIT-LPT', kategoriNama: 'Komputer & IT',
    unitId: 2, unitNama: 'Unit Kantor B',
    transaksiId: null,
    hargaPerolehan: 13000000, masaManfaat: 4, metodeDepresiasi: 'garis_lurus',
    tanggalPerolehan: '2023-03-10', akmDepresiasi: 0, nilaiBuku: 13000000,
    status: 'Aktif',
  },
  {
    id: 7, kodeAset: 'FUR-KRS-001',
    barangId: 6, barangNama: 'Kursi Kerja', barangKode: 'FUR-KRS', kategoriNama: 'Furniture',
    unitId: 2, unitNama: 'Unit Kantor B',
    transaksiId: null,
    hargaPerolehan: 12000000, masaManfaat: 8, metodeDepresiasi: 'garis_lurus',
    tanggalPerolehan: '2022-08-15', akmDepresiasi: 0, nilaiBuku: 12000000,
    status: 'Aktif',
  },
  {
    id: 8, kodeAset: 'KDR-MBL-001',
    barangId: 11, barangNama: 'Mobil', barangKode: 'KDR-MBL', kategoriNama: 'Kendaraan',
    unitId: 2, unitNama: 'Unit Kantor B',
    transaksiId: null,
    hargaPerolehan: 220000000, masaManfaat: 8, metodeDepresiasi: 'saldo_menurun',
    tanggalPerolehan: '2022-01-10', akmDepresiasi: 0, nilaiBuku: 220000000,
    status: 'Aktif',
  },
]

// Init counter dari mock data
mockData.forEach(a => {
  const key = a.barangKode.toUpperCase()
  const num = parseInt(a.kodeAset.split('-').pop() ?? '0')
  _kodeCounter[key] = Math.max(_kodeCounter[key] ?? 0, num)
})

// ============================================================
// IN-MEMORY STORE
// ============================================================

let _store: Aset[] = [...mockData]
let _nextId = _store.length + 1

// ============================================================
// SERVICE CLASS
// ============================================================

export class AsetService {
  private delay(ms = 150): Promise<void> {
    return new Promise(r => setTimeout(r, ms))
  }

  // unitId null = admin pusat (semua unit)
  async getItems(unitId: number | null): Promise<AsetResponse> {
    await this.delay()
    const data = unitId !== null
      ? _store.filter(a => a.unitId === unitId)
      : [..._store]
    return { success: true, data, total: data.length }
  }

  async getItemById(id: number): Promise<Aset | null> {
    await this.delay()
    return _store.find(a => a.id === id) ?? null
  }

  // Dipakai saat initial balance (input manual tanpa transaksi)
  async createItem(data: AsetFormData, meta: {
    barangNama: string
    barangKode: string
    kategoriNama: string
    unitNama: string
  }): Promise<Aset> {
    await this.delay()
    const nilaiBuku = Math.max(0, data.hargaPerolehan - data.akmDepresiasi)
    const item: Aset = {
      id: _nextId++,
      kodeAset: data.kodeAset || generateKodeAset(meta.barangKode),
      barangId: data.barangId,
      barangNama: meta.barangNama,
      barangKode: meta.barangKode,
      kategoriNama: meta.kategoriNama,
      unitId: data.unitId,
      unitNama: meta.unitNama,
      transaksiId: null,
      hargaPerolehan: data.hargaPerolehan,
      masaManfaat: data.masaManfaat,
      metodeDepresiasi: data.metodeDepresiasi,
      tanggalPerolehan: data.tanggalPerolehan,
      akmDepresiasi: data.akmDepresiasi,
      nilaiBuku,
      status: data.status,
    }
    _store.unshift(item)
    return item
  }

  // Dipakai saat transaksi pembelian — generate qty aset sekaligus
  async createFromPembelian(payload: {
    transaksiId: number
    barangId: number
    barangNama: string
    barangKode: string
    kategoriNama: string
    unitId: number
    unitNama: string
    hargaPerUnit: number
    masaManfaat: number
    metodeDepresiasi: MetodeDepresiasi
    tanggalPerolehan: string
    qty: number
  }): Promise<Aset[]> {
    await this.delay()
    const generated: Aset[] = []

    for (let i = 0; i < payload.qty; i++) {
      const item: Aset = {
        id: _nextId++,
        kodeAset: generateKodeAset(payload.barangKode),
        barangId: payload.barangId,
        barangNama: payload.barangNama,
        barangKode: payload.barangKode,
        kategoriNama: payload.kategoriNama,
        unitId: payload.unitId,
        unitNama: payload.unitNama,
        transaksiId: payload.transaksiId,
        hargaPerolehan: payload.hargaPerUnit,
        masaManfaat: payload.masaManfaat,
        metodeDepresiasi: payload.metodeDepresiasi,
        tanggalPerolehan: payload.tanggalPerolehan,
        akmDepresiasi: 0,
        nilaiBuku: payload.hargaPerUnit,
        status: 'Aktif',
      }
      _store.unshift(item)
      generated.push(item)
    }

    return generated
  }

  // Edit terbatas — hanya field yang boleh diubah setelah aset aktif
  async updateItem(id: number, patch: Partial<Pick<Aset,
    'unitId' | 'unitNama' | 'status' | 'akmDepresiasi' | 'nilaiBuku'
  >>): Promise<Aset> {
    await this.delay()
    const idx = _store.findIndex(a => a.id === id)
    if (idx === -1) throw new Error('Aset tidak ditemukan')
    const current = _store[idx]!
    const updated: Aset = { ...current, ...patch }
    _store[idx] = updated
    return updated
  }

  async deleteItem(id: number): Promise<void> {
    await this.delay()
    const idx = _store.findIndex(a => a.id === id)
    if (idx === -1) throw new Error('Aset tidak ditemukan')
    _store.splice(idx, 1)
  }
}

export const asetService = new AsetService()

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
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export function hitungDepresiasiPeriode(
  hargaPerolehan: number,
  masaManfaat: number,
  metode: MetodeDepresiasi,
  nilaiBuku: number,
): number {
  if (metode === 'garis_lurus') {
    return hargaPerolehan / (masaManfaat * 12)  // per bulan
  } else {
    // Saldo menurun: tarif = 2 / masa manfaat per tahun, dibagi 12 per bulan
    const tarifTahunan = 2 / masaManfaat
    return (nilaiBuku * tarifTahunan) / 12
  }
}

export const STATUS_ASET_CONFIG: Record<StatusAset, { label: string; class: string }> = {
  'Aktif':           { label: 'Aktif',           class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  'Dalam Perbaikan': { label: 'Dalam Perbaikan', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  'Terjual':         { label: 'Terjual',         class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  'Disposal':        { label: 'Disposal',        class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
}

export const METODE_LABEL: Record<MetodeDepresiasi, string> = {
  garis_lurus:   'Garis Lurus',
  saldo_menurun: 'Saldo Menurun',
}