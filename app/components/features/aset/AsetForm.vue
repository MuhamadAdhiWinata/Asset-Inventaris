<!-- components/features/aset/AsetForm.vue -->
<!-- Form ini hanya untuk input INITIAL BALANCE (aset existing sebelum sistem) -->
<!-- Aset dari transaksi pembelian dibuat otomatis oleh sistem -->
<template>
  <div>

    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold tracking-tight">
            {{ isEdit ? 'Edit Aset' : 'Input Aset (Initial Balance)' }}
          </h1>
          <p class="text-muted-foreground text-sm mt-1">
            {{ isEdit
              ? `Mengubah data aset ${initialData?.kodeAset}`
              : 'Input aset yang sudah ada sebelum sistem digunakan. Aset dari pembelian dibuat otomatis.' }}
          </p>
        </div>
        <div class="hidden lg:flex items-center gap-3 flex-shrink-0">
          <button type="button" @click="navigateTo('/aset')"
            class="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors">
            <ArrowLeftIcon class="h-4 w-4" /> Kembali
          </button>
          <button v-if="!isEdit" type="button" @click="resetForm"
            class="inline-flex items-center h-10 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors">
            Reset
          </button>
          <button type="button" :disabled="submitting" @click="handleSubmit"
            class="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none">
            <Loader2Icon v-if="submitting" class="h-4 w-4 animate-spin" />
            <CheckIcon v-else class="h-4 w-4" />
            {{ isEdit ? 'Simpan Perubahan' : 'Simpan Aset' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loadingData" class="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
      <div class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-48 rounded-xl bg-muted animate-pulse" />
      </div>
      <div class="h-64 rounded-xl bg-muted animate-pulse" />
    </div>

    <!-- Error -->
    <div v-else-if="fetchError" class="flex flex-col items-center justify-center py-20 gap-3 border rounded-xl">
      <p class="text-sm text-destructive">{{ fetchError }}</p>
      <button @click="emit('retry')"
        class="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-input bg-background text-sm hover:bg-accent transition-colors">
        <RefreshCwIcon class="h-4 w-4" /> Coba Lagi
      </button>
    </div>

    <form v-else @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

        <!-- Kolom Kiri -->
        <div class="space-y-5">

          <!-- Card: Identitas Aset -->
          <div class="border rounded-xl p-6 space-y-5">
            <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Identitas Aset</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Kode Aset</label>
                <input
                  v-model="form.kodeAset"
                  type="text"
                  placeholder="Kosongkan untuk auto-generate"
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <p class="text-xs text-muted-foreground">
                  {{ form.kodeAset ? 'Kode manual' : 'Akan di-generate dari kode barang' }}
                </p>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Status <span class="text-destructive">*</span></label>
                <select v-model="form.status" required
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="Aktif">Aktif</option>
                  <option value="Dalam Perbaikan">Dalam Perbaikan</option>
                  <option value="Terjual">Terjual</option>
                  <option value="Disposal">Disposal</option>
                </select>
              </div>

              <!-- Barang -->
              <div class="space-y-1.5">
                <label class="text-sm font-medium">Barang <span class="text-destructive">*</span></label>
                <select
                  v-model="form.barangId"
                  required
                  :disabled="isEdit"
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                  @change="onBarangChange"
                >
                  <option :value="0" disabled>Pilih barang</option>
                  <option v-for="b in barangList" :key="b.id" :value="b.id">
                    {{ b.kode }} — {{ b.nama }}
                  </option>
                </select>
              </div>

              <!-- Unit Kantor — hanya tampil untuk admin pusat -->
              <div v-if="showUnitSelect" class="space-y-1.5">
                <label class="text-sm font-medium">Unit Kantor <span class="text-destructive">*</span></label>
                <select v-model="form.unitId" required
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option :value="0" disabled>Pilih unit</option>
                  <option v-for="u in unitList" :key="u.id" :value="u.id">{{ u.nama }}</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Tanggal Perolehan <span class="text-destructive">*</span></label>
                <input v-model="form.tanggalPerolehan" type="date" required
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>

            </div>
          </div>

          <!-- Card: Parameter Depresiasi -->
          <div class="border rounded-xl p-6 space-y-5">
            <div>
              <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Parameter Depresiasi</h2>
              <p class="text-xs text-muted-foreground mt-1">Otomatis diisi dari barang yang dipilih. Bisa di-override.</p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Masa Manfaat (tahun) <span class="text-destructive">*</span></label>
                <input v-model.number="form.masaManfaat" type="number" required min="1" max="50"
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Metode Depresiasi <span class="text-destructive">*</span></label>
                <select v-model="form.metodeDepresiasi" required
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="garis_lurus">Garis Lurus</option>
                  <option value="saldo_menurun">Saldo Menurun</option>
                </select>
              </div>

            </div>
          </div>

          <!-- Card: Nilai Keuangan -->
          <div class="border rounded-xl p-6 space-y-5">
            <div>
              <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Nilai Keuangan</h2>
              <p class="text-xs text-muted-foreground mt-1">
                Untuk initial balance, isi akumulasi depresiasi sesuai laporan keuangan terakhir.
              </p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Harga Perolehan (Rp) <span class="text-destructive">*</span></label>
                <input v-model.number="form.hargaPerolehan" type="number" required min="0" placeholder="0"
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm tabular-nums ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                <p class="text-xs text-muted-foreground">{{ formatRupiah(form.hargaPerolehan) }}</p>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Akm. Depresiasi (Rp)</label>
                <input v-model.number="form.akmDepresiasi" type="number" min="0" placeholder="0"
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm tabular-nums ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                <p class="text-xs text-muted-foreground">{{ formatRupiah(form.akmDepresiasi) }}</p>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">
                  Nilai Buku (Rp)
                  <span class="ml-1 text-xs font-normal text-muted-foreground">(otomatis)</span>
                </label>
                <input :value="computedNilaiBuku" type="number" readonly
                  class="w-full h-10 rounded-md border border-input bg-muted px-3 text-sm tabular-nums cursor-not-allowed opacity-70" />
                <p class="text-xs text-muted-foreground">{{ formatRupiah(computedNilaiBuku) }}</p>
              </div>

            </div>
            <p class="text-xs text-muted-foreground">* Nilai Buku = Harga Perolehan − Akumulasi Depresiasi</p>
          </div>

          <!-- Actions mobile -->
          <div class="flex items-center justify-between pt-1 lg:hidden">
            <button type="button" @click="navigateTo('/aset')"
              class="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors">
              <ArrowLeftIcon class="h-4 w-4" /> Kembali
            </button>
            <div class="flex items-center gap-3">
              <button v-if="!isEdit" type="button" @click="resetForm"
                class="inline-flex items-center h-10 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors">
                Reset
              </button>
              <button type="submit" :disabled="submitting"
                class="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none">
                <Loader2Icon v-if="submitting" class="h-4 w-4 animate-spin" />
                <CheckIcon v-else class="h-4 w-4" />
                {{ isEdit ? 'Simpan' : 'Simpan Aset' }}
              </button>
            </div>
          </div>

        </div>

        <!-- Kolom Kanan: Sidebar -->
        <div class="hidden lg:block">
          <div class="sticky top-6 space-y-4">

            <!-- Ringkasan Nilai -->
            <div class="border rounded-xl p-5 space-y-4">
              <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Ringkasan Nilai</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm text-muted-foreground">Harga Perolehan</span>
                  <span class="text-sm font-medium tabular-nums">{{ formatRupiah(form.hargaPerolehan) }}</span>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm text-muted-foreground">Akm. Depresiasi</span>
                  <span class="text-sm tabular-nums text-muted-foreground">− {{ formatRupiah(form.akmDepresiasi) }}</span>
                </div>
                <div class="border-t pt-3 flex items-center justify-between gap-2">
                  <span class="text-sm font-medium">Nilai Buku</span>
                  <span class="text-base font-bold tabular-nums text-primary">{{ formatRupiah(computedNilaiBuku) }}</span>
                </div>
              </div>
              <!-- Progress depresiasi -->
              <div v-if="form.hargaPerolehan > 0" class="space-y-1.5">
                <div class="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Tingkat Depresiasi</span>
                  <span>{{ depresiasiPercent }}%</span>
                </div>
                <div class="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    :class="depresiasiPercent > 75 ? 'bg-destructive' : depresiasiPercent > 40 ? 'bg-yellow-500' : 'bg-primary'"
                    :style="{ width: `${depresiasiPercent}%` }"
                  />
                </div>
              </div>
            </div>

            <!-- Info Aset -->
            <div class="border rounded-xl p-5 space-y-3">
              <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Info</h3>
              <div class="space-y-2.5 text-xs">
                <div class="flex items-start justify-between gap-2">
                  <span class="text-muted-foreground">Kode</span>
                  <span class="font-mono font-medium">{{ form.kodeAset || '(auto)' }}</span>
                </div>
                <div class="flex items-start justify-between gap-2">
                  <span class="text-muted-foreground">Barang</span>
                  <span class="font-medium text-right max-w-[130px] truncate">{{ selectedBarangNama || '—' }}</span>
                </div>
                <div class="flex items-start justify-between gap-2">
                  <span class="text-muted-foreground">Masa manfaat</span>
                  <span class="font-medium">{{ form.masaManfaat }} tahun</span>
                </div>
                <div class="flex items-start justify-between gap-2">
                  <span class="text-muted-foreground">Status</span>
                  <span class="inline-flex items-center rounded-full px-2 py-0.5 font-medium"
                    :class="STATUS_ASET_CONFIG[form.status]?.class ?? 'bg-muted text-muted-foreground'">
                    {{ form.status }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Tips -->
            <div class="border border-dashed rounded-xl p-4 space-y-1.5">
              <p class="text-xs font-medium text-muted-foreground">Initial Balance</p>
              <ul class="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Untuk aset sebelum sistem digunakan</li>
                <li>Isi akumulasi depresiasi dari laporan keuangan terakhir</li>
                <li>Aset dari pembelian dibuat otomatis saat transaksi</li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </form>

  </div>
</template>

<script setup lang="ts">
import { ArrowLeftIcon, CheckIcon, Loader2Icon, RefreshCwIcon } from 'lucide-vue-next'
import {
  type Aset,
  type AsetFormData,
  type StatusAset,
  STATUS_ASET_CONFIG,
  formatRupiah,
} from '@/services/asetService'
import { type Barang } from '@/services/barangService'
import { type UnitKantor } from '@/services/unitKantorService'

interface Props {
  initialData: Aset | null
  barangList: Barang[]
  unitList: UnitKantor[]
  showUnitSelect?: boolean    // true = admin pusat, bisa pilih unit
  defaultUnitId?: number      // pre-fill untuk admin unit
  loadingData?: boolean
  fetchError?: string | null
  submitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showUnitSelect: false,
  defaultUnitId: 0,
  loadingData: false,
  fetchError: null,
  submitting: false,
})

const emit = defineEmits<{
  submit: [data: AsetFormData & { barangMeta: Barang; unitNama: string }]
  retry:  []
}>()

const isEdit = computed(() => !!props.initialData)

const emptyForm = (): AsetFormData => ({
  kodeAset: '',
  barangId: 0,
  unitId: props.defaultUnitId,
  hargaPerolehan: 0,
  masaManfaat: 4,
  metodeDepresiasi: 'garis_lurus',
  tanggalPerolehan: '',
  akmDepresiasi: 0,
  status: 'Aktif',
})

const form = ref<AsetFormData>(emptyForm())

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      form.value = {
        kodeAset:          data.kodeAset,
        barangId:          data.barangId,
        unitId:            data.unitId,
        hargaPerolehan:    data.hargaPerolehan,
        masaManfaat:       data.masaManfaat,
        metodeDepresiasi:  data.metodeDepresiasi,
        tanggalPerolehan:  data.tanggalPerolehan,
        akmDepresiasi:     data.akmDepresiasi,
        status:            data.status,
      }
    } else {
      form.value = emptyForm()
    }
  },
  { immediate: true }
)

const selectedBarang = computed(() =>
  props.barangList.find(b => b.id === form.value.barangId) ?? null
)

const selectedBarangNama = computed(() => selectedBarang.value?.nama ?? '')

// Auto-fill masa manfaat & metode dari barang yang dipilih
function onBarangChange() {
  const b = selectedBarang.value
  if (b) {
    form.value.masaManfaat      = b.masaManfaatDefault
    form.value.metodeDepresiasi = b.metodeDefault
  }
}

const computedNilaiBuku = computed(() =>
  Math.max(0, (form.value.hargaPerolehan ?? 0) - (form.value.akmDepresiasi ?? 0))
)

const depresiasiPercent = computed(() => {
  if (!form.value.hargaPerolehan) return 0
  return Math.min(100, Math.round((form.value.akmDepresiasi / form.value.hargaPerolehan) * 100))
})

function resetForm() { form.value = emptyForm() }

function handleSubmit() {
  const barang = selectedBarang.value
  if (!barang) return

  const unitNama = props.unitList.find(u => u.id === form.value.unitId)?.nama
    ?? `Unit #${form.value.unitId}`

  emit('submit', {
    ...form.value,
    barangMeta: barang,
    unitNama,
  })
}
</script>