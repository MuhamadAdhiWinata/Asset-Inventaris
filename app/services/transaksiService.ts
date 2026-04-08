// services/transaksiService.ts
// Opsi C: satu header transaksi + detail per jenis

import { asetService, hitungDepresiasiPeriode } from './asetService'
import type { MetodeDepresiasi } from './asetService'

// ============================================================
// TYPES
// ============================================================

export type JenisTransaksi =
  | 'pembelian'
  | 'transfer'
  | 'penjualan'
  | 'disposal'
  | 'maintenance'
  | 'depresiasi'

export type StatusMaintenance = 'Dalam Perbaikan' | 'Selesai'
export type JenisMaintenance  = 'preventif' | 'korektif'

// ── Header ────────────────────────────────────────────────────
export interface Transaksi {
  id: number
  jenis: JenisTransaksi
  asetId: number | null   // null saat pembelian (multi aset)
  unitId: number
  tanggal: string         // ISO date
  keterangan: string
  createdBy: number       // user id
}

// ── Detail per jenis ──────────────────────────────────────────
export interface TrxPembelian {
  id: number
  transaksiId: number
  supplierId: number
  supplierNama: string    // denormalized
  barangId: number
  barangNama: string      // denormalized
  barangKode: string      // denormalized
  kategoriNama: string    // denormalized
  qty: number
  hargaPerUnit: number
  masaManfaat: number
  metodeDepresiasi: MetodeDepresiasi
}

export interface TrxTransfer {
  id: number
  transaksiId: number
  unitAsalId: number
  unitAsalNama: string    // denormalized
  unitTujuanId: number
  unitTujuanNama: string  // denormalized
  alasan: string
}

export interface TrxPenjualan {
  id: number
  transaksiId: number
  hargaJual: number
  pembeli: string
  noDokumen: string
}

export interface TrxDisposal {
  id: number
  transaksiId: number
  alasan: string
  nilaiSisa: number
  noBeritaAcara: string
}

export interface TrxMaintenance {
  id: number
  transaksiId: number
  jenis: JenisMaintenance
  deskripsi: string
  biaya: number
  vendor: string
  tanggalSelesai: string | null
  status: StatusMaintenance
}

export interface TrxDepresiasi {
  id: number
  transaksiId: number
  periode: string         // format YYYY-MM
  nilaiPeriode: number
  akmSebelum: number
  akmSesudah: number
  nilaiBukuSesudah: number
}

// ── Form Data ─────────────────────────────────────────────────
export interface PembelianFormData {
  unitId: number
  tanggal: string
  keterangan: string
  items: {
    supplierId: number
    barangId: number
    qty: number
    hargaPerUnit: number
    masaManfaat: number
    metodeDepresiasi: MetodeDepresiasi
  }[]
}

export interface TransferFormData {
  asetId: number
  unitAsalId: number
  unitTujuanId: number
  tanggal: string
  alasan: string
  keterangan: string
}

export interface PenjualanFormData {
  asetId: number
  unitId: number
  tanggal: string
  hargaJual: number
  pembeli: string
  noDokumen: string
  keterangan: string
}

export interface DisposalFormData {
  asetId: number
  unitId: number
  tanggal: string
  alasan: string
  nilaiSisa: number
  noBeritaAcara: string
  keterangan: string
}

export interface MaintenanceFormData {
  asetId: number
  unitId: number
  tanggal: string
  jenis: JenisMaintenance
  deskripsi: string
  biaya: number
  vendor: string
  keterangan: string
}

export interface DepresiasiFormData {
  unitId: number      // null = semua unit (admin pusat)
  periode: string     // YYYY-MM
  keterangan: string
}

// ============================================================
// IN-MEMORY STORES
// ============================================================

let _transaksi:    Transaksi[]     = []
let _pembelian:    TrxPembelian[]  = []
let _transfer:     TrxTransfer[]   = []
let _penjualan:    TrxPenjualan[]  = []
let _disposal:     TrxDisposal[]   = []
let _maintenance:  TrxMaintenance[]= []
let _depresiasi:   TrxDepresiasi[] = []

let _nextTrxId  = 1
let _nextDetId  = 1

// ============================================================
// SERVICE CLASS
// ============================================================

export class TransaksiService {
  private delay(ms = 200): Promise<void> {
    return new Promise(r => setTimeout(r, ms))
  }

  // ── Query ──────────────────────────────────────────────────

  // Histori lengkap satu aset — cukup query header
  async getHistoriAset(asetId: number): Promise<Transaksi[]> {
    await this.delay()
    return _transaksi
      .filter(t => t.asetId === asetId)
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
  }

  async getTransaksiByUnit(unitId: number | null): Promise<Transaksi[]> {
    await this.delay()
    return unitId !== null
      ? _transaksi.filter(t => t.unitId === unitId)
      : [..._transaksi]
  }

  async getPembelianDetail(transaksiId: number): Promise<TrxPembelian | null> {
    await this.delay()
    return _pembelian.find(p => p.transaksiId === transaksiId) ?? null
  }

  async getTransferDetail(transaksiId: number): Promise<TrxTransfer | null> {
    await this.delay()
    return _transfer.find(t => t.transaksiId === transaksiId) ?? null
  }

  async getPenjualanDetail(transaksiId: number): Promise<TrxPenjualan | null> {
    await this.delay()
    return _penjualan.find(p => p.transaksiId === transaksiId) ?? null
  }

  async getDisposalDetail(transaksiId: number): Promise<TrxDisposal | null> {
    await this.delay()
    return _disposal.find(d => d.transaksiId === transaksiId) ?? null
  }

  async getMaintenanceDetail(transaksiId: number): Promise<TrxMaintenance | null> {
    await this.delay()
    return _maintenance.find(m => m.transaksiId === transaksiId) ?? null
  }

  async getDepresiasiDetail(transaksiId: number): Promise<TrxDepresiasi | null> {
    await this.delay()
    return _depresiasi.find(d => d.transaksiId === transaksiId) ?? null
  }

  async getMaintenanceAktif(unitId: number | null): Promise<TrxMaintenance[]> {
    await this.delay()
    const aktif = _maintenance.filter(m => m.status === 'Dalam Perbaikan')
    if (unitId === null) return aktif
    return aktif.filter(m => {
      const trx = _transaksi.find(t => t.id === m.transaksiId)
      return trx?.unitId === unitId
    })
  }

  // ── PEMBELIAN ─────────────────────────────────────────────
  // Atomic: buat header + detail + generate aset per item × qty
  async createPembelian(data: PembelianFormData, meta: {
    createdBy: number
    itemsMeta: {
      supplierId: number
      supplierNama: string
      barangNama: string
      barangKode: string
      kategoriNama: string
      unitNama: string
    }[]
  }): Promise<{ transaksi: Transaksi[]; asetGenerated: string[] }> {
    await this.delay()

    const transaksiList: Transaksi[] = []
    const allKodeAset: string[] = []

    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i]
      const m    = meta.itemsMeta[i]

      // Guard — seharusnya tidak terjadi jika pemanggil benar
      if (!item || !m) throw new Error(`Item meta index ${i} tidak ditemukan`)

      // 1. Buat header transaksi (satu per item pembelian)
      const trx: Transaksi = {
        id: _nextTrxId++,
        jenis: 'pembelian',
        asetId: null,       // null karena generate banyak aset
        unitId: data.unitId,
        tanggal: data.tanggal,
        keterangan: data.keterangan,
        createdBy: meta.createdBy,
      }
      _transaksi.push(trx)
      transaksiList.push(trx)

      // 2. Buat detail pembelian
      const det: TrxPembelian = {
        id: _nextDetId++,
        transaksiId: trx.id,
        supplierId: item.supplierId,
        supplierNama: m.supplierNama,
        barangId: item.barangId,
        barangNama: m.barangNama,
        barangKode: m.barangKode,
        kategoriNama: m.kategoriNama,
        qty: item.qty,
        hargaPerUnit: item.hargaPerUnit,
        masaManfaat: item.masaManfaat,
        metodeDepresiasi: item.metodeDepresiasi,
      }
      _pembelian.push(det)

      // 3. Generate aset × qty
      const asets = await asetService.createFromPembelian({
        transaksiId: trx.id,
        barangId: item.barangId,
        barangNama: m.barangNama,
        barangKode: m.barangKode,
        kategoriNama: m.kategoriNama,
        unitId: data.unitId,
        unitNama: m.unitNama,
        hargaPerUnit: item.hargaPerUnit,
        masaManfaat: item.masaManfaat,
        metodeDepresiasi: item.metodeDepresiasi,
        tanggalPerolehan: data.tanggal,
        qty: item.qty,
      })
      allKodeAset.push(...asets.map(a => a.kodeAset))
    }

    return { transaksi: transaksiList, asetGenerated: allKodeAset }
  }

  // ── TRANSFER ──────────────────────────────────────────────
  async createTransfer(data: TransferFormData, meta: {
    createdBy: number
    unitAsalNama: string
    unitTujuanNama: string
  }): Promise<Transaksi> {
    await this.delay()

    const trx: Transaksi = {
      id: _nextTrxId++,
      jenis: 'transfer',
      asetId: data.asetId,
      unitId: data.unitAsalId,
      tanggal: data.tanggal,
      keterangan: data.keterangan,
      createdBy: meta.createdBy,
    }
    _transaksi.push(trx)

    _transfer.push({
      id: _nextDetId++,
      transaksiId: trx.id,
      unitAsalId: data.unitAsalId,
      unitAsalNama: meta.unitAsalNama,
      unitTujuanId: data.unitTujuanId,
      unitTujuanNama: meta.unitTujuanNama,
      alasan: data.alasan,
    })

    // Update unit pada aset
    await asetService.updateItem(data.asetId, {
      unitId: data.unitTujuanId,
      unitNama: meta.unitTujuanNama,
    })

    return trx
  }

  // ── PENJUALAN ─────────────────────────────────────────────
  async createPenjualan(data: PenjualanFormData, meta: {
    createdBy: number
  }): Promise<Transaksi> {
    await this.delay()

    const trx: Transaksi = {
      id: _nextTrxId++,
      jenis: 'penjualan',
      asetId: data.asetId,
      unitId: data.unitId,
      tanggal: data.tanggal,
      keterangan: data.keterangan,
      createdBy: meta.createdBy,
    }
    _transaksi.push(trx)

    _penjualan.push({
      id: _nextDetId++,
      transaksiId: trx.id,
      hargaJual: data.hargaJual,
      pembeli: data.pembeli,
      noDokumen: data.noDokumen,
    })

    await asetService.updateItem(data.asetId, { status: 'Terjual' })

    return trx
  }

  // ── DISPOSAL ──────────────────────────────────────────────
  async createDisposal(data: DisposalFormData, meta: {
    createdBy: number
  }): Promise<Transaksi> {
    await this.delay()

    const trx: Transaksi = {
      id: _nextTrxId++,
      jenis: 'disposal',
      asetId: data.asetId,
      unitId: data.unitId,
      tanggal: data.tanggal,
      keterangan: data.keterangan,
      createdBy: meta.createdBy,
    }
    _transaksi.push(trx)

    _disposal.push({
      id: _nextDetId++,
      transaksiId: trx.id,
      alasan: data.alasan,
      nilaiSisa: data.nilaiSisa,
      noBeritaAcara: data.noBeritaAcara,
    })

    await asetService.updateItem(data.asetId, { status: 'Disposal' })

    return trx
  }

  // ── MAINTENANCE ───────────────────────────────────────────
  async createMaintenance(data: MaintenanceFormData, meta: {
    createdBy: number
  }): Promise<Transaksi> {
    await this.delay()

    const trx: Transaksi = {
      id: _nextTrxId++,
      jenis: 'maintenance',
      asetId: data.asetId,
      unitId: data.unitId,
      tanggal: data.tanggal,
      keterangan: data.keterangan,
      createdBy: meta.createdBy,
    }
    _transaksi.push(trx)

    _maintenance.push({
      id: _nextDetId++,
      transaksiId: trx.id,
      jenis: data.jenis,
      deskripsi: data.deskripsi,
      biaya: data.biaya,
      vendor: data.vendor,
      tanggalSelesai: null,
      status: 'Dalam Perbaikan',
    })

    await asetService.updateItem(data.asetId, { status: 'Dalam Perbaikan' })

    return trx
  }

  async selesaikanMaintenance(transaksiId: number, tanggalSelesai: string): Promise<void> {
    await this.delay()
    const det = _maintenance.find(m => m.transaksiId === transaksiId)
    if (!det) throw new Error('Detail maintenance tidak ditemukan')

    det.status = 'Selesai'
    det.tanggalSelesai = tanggalSelesai

    const trx = _transaksi.find(t => t.id === transaksiId)
    if (trx?.asetId) {
      await asetService.updateItem(trx.asetId, { status: 'Aktif' })
    }
  }

  // ── DEPRESIASI BULANAN ────────────────────────────────────
  // Proses semua aset aktif di unit (atau semua unit jika unitId null)
  async prosesBulanan(data: DepresiasiFormData, meta: {
    createdBy: number
  }): Promise<{ processed: number; totalDepresiasi: number }> {
    await this.delay()

    // Cek apakah periode sudah pernah diproses
    const sudahDiproses = _depresiasi.some(d => {
      const trx = _transaksi.find(t => t.id === d.transaksiId)
      return d.periode === data.periode &&
        (data.unitId === null || trx?.unitId === data.unitId)
    })
    if (sudahDiproses) {
      throw new Error(`Depresiasi periode ${data.periode} sudah pernah diproses`)
    }

    const response = await asetService.getItems(data.unitId)
    const asetAktif = response.data.filter(a => a.status === 'Aktif')

    let processed = 0
    let totalDepresiasi = 0

    for (const aset of asetAktif) {
      const nilaiPeriode = hitungDepresiasiPeriode(
        aset.hargaPerolehan,
        aset.masaManfaat,
        aset.metodeDepresiasi,
        aset.nilaiBuku,
      )

      // Tidak boleh melebihi nilai buku
      const depresiasi = Math.min(nilaiPeriode, aset.nilaiBuku)
      if (depresiasi <= 0) continue

      const akmBaru    = aset.akmDepresiasi + depresiasi
      const nilaiBuku  = Math.max(0, aset.hargaPerolehan - akmBaru)

      // Buat header transaksi
      const trx: Transaksi = {
        id: _nextTrxId++,
        jenis: 'depresiasi',
        asetId: aset.id,
        unitId: aset.unitId,
        tanggal: `${data.periode}-01`,
        keterangan: data.keterangan || `Depresiasi ${data.periode}`,
        createdBy: meta.createdBy,
      }
      _transaksi.push(trx)

      // Buat detail depresiasi
      _depresiasi.push({
        id: _nextDetId++,
        transaksiId: trx.id,
        periode: data.periode,
        nilaiPeriode: depresiasi,
        akmSebelum: aset.akmDepresiasi,
        akmSesudah: akmBaru,
        nilaiBukuSesudah: nilaiBuku,
      })

      // Update aset
      await asetService.updateItem(aset.id, {
        akmDepresiasi: akmBaru,
        nilaiBuku,
      })

      processed++
      totalDepresiasi += depresiasi
    }

    return { processed, totalDepresiasi }
  }
}

export const transaksiService = new TransaksiService()

// ============================================================
// HELPERS
// ============================================================

export const JENIS_LABEL: Record<JenisTransaksi, string> = {
  pembelian:   'Pembelian',
  transfer:    'Transfer',
  penjualan:   'Penjualan',
  disposal:    'Disposal',
  maintenance: 'Maintenance',
  depresiasi:  'Depresiasi',
}

export const JENIS_CONFIG: Record<JenisTransaksi, { label: string; class: string }> = {
  pembelian:   { label: 'Pembelian',   class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  transfer:    { label: 'Transfer',    class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  penjualan:   { label: 'Penjualan',   class: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400' },
  disposal:    { label: 'Disposal',    class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  maintenance: { label: 'Maintenance', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  depresiasi:  { label: 'Depresiasi',  class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
}