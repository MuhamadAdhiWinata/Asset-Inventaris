<!-- components/features/pembelian/PembelianForm.vue -->
<template>
  <div>

    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold tracking-tight">Transaksi Pembelian</h1>
          <p class="text-muted-foreground text-sm mt-1">
            Catat pembelian aset. Sistem akan otomatis membuat data aset sesuai quantity.
          </p>
        </div>
        <div class="hidden lg:flex items-center gap-3 flex-shrink-0">
          <button type="button" @click="navigateTo('/pembelian')"
            class="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors">
            <ArrowLeftIcon class="h-4 w-4" /> Kembali
          </button>
          <button type="button" :disabled="submitting || items.length === 0" @click="handleSubmit"
            class="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none">
            <Loader2Icon v-if="submitting" class="h-4 w-4 animate-spin" />
            <CheckIcon v-else class="h-4 w-4" />
            Proses Pembelian
          </button>
        </div>
      </div>
    </div>

    <!-- Loading lookup -->
    <div v-if="loadingData" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-16 rounded-xl bg-muted animate-pulse" />
    </div>

    <form v-else @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

        <!-- Kolom Kiri -->
        <div class="space-y-5">

          <!-- Card: Header Pembelian -->
          <div class="border rounded-xl p-6 space-y-5">
            <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Informasi Pembelian</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <!-- Unit kantor — hanya admin pusat yang pilih -->
              <div v-if="showUnitSelect" class="sm:col-span-2 space-y-1.5">
                <label class="text-sm font-medium">Unit Kantor <span class="text-destructive">*</span></label>
                <select v-model="header.unitId" required
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option :value="0" disabled>Pilih unit kantor</option>
                  <option v-for="u in unitList" :key="u.id" :value="u.id">{{ u.nama }}</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Tanggal Pembelian <span class="text-destructive">*</span></label>
                <input v-model="header.tanggal" type="date" required
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Keterangan</label>
                <input v-model="header.keterangan" type="text" placeholder="Opsional..."
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>

            </div>
          </div>

          <!-- Card: Item Pembelian -->
          <div class="border rounded-xl p-6 space-y-5">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Item Pembelian</h2>
                <p class="text-xs text-muted-foreground mt-0.5">Setiap item akan menghasilkan aset sebanyak qty</p>
              </div>
              <button
                type="button"
                @click="addItem"
                class="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-input bg-background text-xs font-medium hover:bg-accent transition-colors"
              >
                <PlusIcon class="h-3.5 w-3.5" />
                Tambah Item
              </button>
            </div>

            <!-- Item list -->
            <div class="space-y-4">
              <div
                v-for="(item, idx) in items"
                :key="idx"
                class="border rounded-lg p-4 space-y-4 relative"
              >
                <!-- Nomor item + hapus -->
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-semibold text-muted-foreground">Item #{{ idx + 1 }}</span>
                  <button
                    v-if="items.length > 1"
                    type="button"
                    @click="removeItem(idx)"
                    class="inline-flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <XIcon class="h-3.5 w-3.5" />
                  </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  <!-- Supplier -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-medium">Supplier <span class="text-destructive">*</span></label>
                    <select v-model="item.supplierId" required
                      class="w-full h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <option :value="0" disabled>Pilih supplier</option>
                      <option v-for="s in supplierList" :key="s.id" :value="s.id">{{ s.nama }}</option>
                    </select>
                  </div>

                  <!-- Barang -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-medium">Barang <span class="text-destructive">*</span></label>
                    <select v-model="item.barangId" required
                      class="w-full h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      @change="onBarangChange(idx)"
                    >
                      <option :value="0" disabled>Pilih barang</option>
                      <option v-for="b in barangList" :key="b.id" :value="b.id">
                        {{ b.kode }} — {{ b.nama }}
                      </option>
                    </select>
                  </div>

                  <!-- Qty -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-medium">Qty <span class="text-destructive">*</span></label>
                    <input v-model.number="item.qty" type="number" required min="1" max="999"
                      class="w-full h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  </div>

                  <!-- Harga per unit -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-medium">Harga per Unit (Rp) <span class="text-destructive">*</span></label>
                    <input v-model.number="item.hargaPerUnit" type="number" required min="0"
                      class="w-full h-9 rounded-md border border-input bg-background px-3 text-sm tabular-nums ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  </div>

                  <!-- Masa manfaat -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-medium">Masa Manfaat (tahun) <span class="text-destructive">*</span></label>
                    <input v-model.number="item.masaManfaat" type="number" required min="1" max="50"
                      class="w-full h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  </div>

                  <!-- Metode depresiasi -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-medium">Metode Depresiasi <span class="text-destructive">*</span></label>
                    <select v-model="item.metodeDepresiasi" required
                      class="w-full h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <option value="garis_lurus">Garis Lurus</option>
                      <option value="saldo_menurun">Saldo Menurun</option>
                    </select>
                  </div>

                </div>

                <!-- Subtotal per item -->
                <div class="flex items-center justify-between pt-2 border-t text-xs">
                  <span class="text-muted-foreground">
                    {{ item.qty }} aset akan dibuat →
                    <span class="font-mono font-medium text-foreground">
                      {{ getBarangKode(item.barangId) }}-001 s/d {{ getBarangKode(item.barangId) }}-{{ String(item.qty).padStart(3,'0') }}
                    </span>
                  </span>
                  <span class="font-medium tabular-nums">
                    {{ formatRupiah(item.qty * item.hargaPerUnit) }}
                  </span>
                </div>

              </div>
            </div>

          </div>

          <!-- Actions mobile -->
          <div class="flex items-center justify-between pt-1 lg:hidden">
            <button type="button" @click="navigateTo('/pembelian')"
              class="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors">
              <ArrowLeftIcon class="h-4 w-4" /> Kembali
            </button>
            <button type="submit" :disabled="submitting || items.length === 0"
              class="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none">
              <Loader2Icon v-if="submitting" class="h-4 w-4 animate-spin" />
              <CheckIcon v-else class="h-4 w-4" />
              Proses Pembelian
            </button>
          </div>

        </div>

        <!-- Kolom Kanan: Sidebar ringkasan -->
        <div class="hidden lg:block">
          <div class="sticky top-6 space-y-4">

            <!-- Ringkasan -->
            <div class="border rounded-xl p-5 space-y-4">
              <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Ringkasan</h3>

              <div class="space-y-3">
                <div v-for="(item, idx) in items" :key="idx" class="space-y-1">
                  <div class="flex items-start justify-between gap-2 text-xs">
                    <span class="text-muted-foreground">Item #{{ idx + 1 }}</span>
                    <span class="font-medium tabular-nums">{{ formatRupiah(item.qty * item.hargaPerUnit) }}</span>
                  </div>
                  <p class="text-xs text-muted-foreground pl-2">
                    {{ getBarangNama(item.barangId) || '—' }} × {{ item.qty }}
                  </p>
                </div>
              </div>

              <div class="border-t pt-3 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-muted-foreground">Total Item</span>
                  <span class="text-sm font-medium">{{ items.length }} jenis</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-muted-foreground">Total Aset</span>
                  <span class="text-sm font-medium text-green-700 dark:text-green-400">{{ totalAset }} aset</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">Total Nilai</span>
                  <span class="text-base font-bold tabular-nums text-primary">{{ formatRupiah(totalNilai) }}</span>
                </div>
              </div>
            </div>

            <!-- Proses info -->
            <div class="border rounded-xl p-5 space-y-3">
              <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <ZapIcon class="h-3.5 w-3.5" />
                Proses Otomatis
              </h3>
              <div class="space-y-2 text-xs text-muted-foreground">
                <div class="flex items-start gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>Transaksi pembelian dicatat ke sistem</span>
                </div>
                <div class="flex items-start gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>Aset dibuat otomatis sebanyak qty</span>
                </div>
                <div class="flex items-start gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>Kode aset di-generate dari kode barang</span>
                </div>
                <div class="flex items-start gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>Status aset langsung Aktif</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeftIcon, CheckIcon, Loader2Icon, PlusIcon, XIcon, ZapIcon } from 'lucide-vue-next'
import type { PembelianFormData } from '@/services/transaksiService'
import type { MetodeDepresiasi } from '@/services/asetService'
import { formatRupiah } from '@/services/asetService'
import { type Barang } from '@/services/barangService'
import { type Supplier } from '@/services/supplierService'
import { type UnitKantor } from '@/services/unitKantorService'

interface ItemForm {
  supplierId: number
  barangId: number
  qty: number
  hargaPerUnit: number
  masaManfaat: number
  metodeDepresiasi: MetodeDepresiasi
}

interface Props {
  barangList: Barang[]
  supplierList: Supplier[]
  unitList: UnitKantor[]
  showUnitSelect?: boolean
  defaultUnitId?: number
  loadingData?: boolean
  submitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showUnitSelect: false,
  defaultUnitId: 0,
  loadingData: false,
  submitting: false,
})

const emit = defineEmits<{
  submit: [data: PembelianFormData & { itemsMeta: { supplierId: number; supplierNama: string; barangNama: string; barangKode: string; kategoriNama: string; unitNama: string }[] }]
}>()

interface HeaderForm {
  unitId:     number
  tanggal:    string
  keterangan: string
}

// Header
const header = ref<HeaderForm>({
  unitId:      props.defaultUnitId,
  tanggal:     new Date().toISOString().slice(0, 10),
  keterangan:  '',
})

// Items
const emptyItem = (): ItemForm => ({
  supplierId:       0,
  barangId:         0,
  qty:              1,
  hargaPerUnit:     0,
  masaManfaat:      4,
  metodeDepresiasi: 'garis_lurus',
})

const items = ref<ItemForm[]>([emptyItem()])

function addItem() {
  items.value.push(emptyItem())
}

function removeItem(idx: number) {
  items.value.splice(idx, 1)
}

// Auto-fill masa manfaat dari barang
function onBarangChange(idx: number) {
  const item = items.value[idx]
  if (!item) return
  const barang = props.barangList.find(b => b.id === item.barangId)
  if (barang) {
    item.masaManfaat      = barang.masaManfaatDefault
    item.metodeDepresiasi = barang.metodeDefault
  }
}

// Helpers untuk preview
function getBarangNama(id: number): string {
  return props.barangList.find(b => b.id === id)?.nama ?? ''
}

function getBarangKode(id: number): string {
  return props.barangList.find(b => b.id === id)?.kode ?? '???'
}

const formatTanggal = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })

const totalAset  = computed(() => items.value.reduce((sum, i) => sum + (i.qty || 0), 0))
const totalNilai = computed(() => items.value.reduce((sum, i) => sum + (i.qty || 0) * (i.hargaPerUnit || 0), 0))

function handleSubmit() {
  const unitNama = props.unitList.find(u => u.id === header.value.unitId)?.nama ?? `Unit #${header.value.unitId}`

  const itemsMeta = items.value.map(item => {
    const barang   = props.barangList.find(b => b.id === item.barangId)
    const supplier = props.supplierList.find(s => s.id === item.supplierId)
    return {
      supplierId:   item.supplierId,
      supplierNama: supplier?.nama ?? '',
      barangNama:   barang?.nama ?? '',
      barangKode:   barang?.kode ?? '',
      kategoriNama: barang?.kategoriNama ?? '',
      unitNama,
    }
  })

  emit('submit', {
    unitId:      header.value.unitId,
    tanggal:     header.value.tanggal,
    keterangan:  header.value.keterangan,
    items: items.value.map(i => ({
      supplierId:       i.supplierId,
      barangId:         i.barangId,
      qty:              i.qty,
      hargaPerUnit:     i.hargaPerUnit,
      masaManfaat:      i.masaManfaat,
      metodeDepresiasi: i.metodeDepresiasi,
    })),
    itemsMeta,
  })
}
</script>