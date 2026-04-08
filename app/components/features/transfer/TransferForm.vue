<!-- components/features/transfer/TransferForm.vue -->
<template>
  <div>

    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold tracking-tight">Transfer Aset</h1>
          <p class="text-muted-foreground text-sm mt-1">
            Pindahkan aset dari satu unit kantor ke unit lain.
          </p>
        </div>
        <div class="hidden lg:flex items-center gap-3 flex-shrink-0">
          <button type="button" @click="navigateTo('/transfer')"
            class="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors">
            <ArrowLeftIcon class="h-4 w-4" /> Kembali
          </button>
          <button type="button" :disabled="submitting" @click="handleSubmit"
            class="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none">
            <Loader2Icon v-if="submitting" class="h-4 w-4 animate-spin" />
            <CheckIcon v-else class="h-4 w-4" />
            Proses Transfer
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loadingData" class="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
      <div class="space-y-4">
        <div v-for="i in 2" :key="i" class="h-40 rounded-xl bg-muted animate-pulse" />
      </div>
      <div class="h-48 rounded-xl bg-muted animate-pulse" />
    </div>

    <form v-else @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

        <!-- Kolom Kiri -->
        <div class="space-y-5">

          <!-- Card: Pilih Aset -->
          <div class="border rounded-xl p-6 space-y-5">
            <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Aset yang Ditransfer</h2>

            <!-- Search aset -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Cari & Pilih Aset <span class="text-destructive">*</span></label>
              <div class="relative">
                <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  v-model="asetSearch"
                  type="text"
                  placeholder="Ketik kode atau nama aset..."
                  class="w-full pl-9 pr-4 h-10 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <!-- Dropdown hasil search -->
              <div v-if="asetSearch && filteredAset.length > 0 && !selectedAset"
                class="border rounded-lg overflow-hidden shadow-sm max-h-48 overflow-y-auto">
                <button
                  v-for="a in filteredAset"
                  :key="a.id"
                  type="button"
                  @click="selectAset(a)"
                  class="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-accent transition-colors border-b last:border-0"
                >
                  <div class="text-left">
                    <p class="font-mono font-medium text-xs">{{ a.kodeAset }}</p>
                    <p class="text-muted-foreground text-xs">{{ a.barangNama }}</p>
                  </div>
                  <span class="text-xs text-muted-foreground">{{ a.unitNama }}</span>
                </button>
              </div>
              <p v-else-if="asetSearch && filteredAset.length === 0 && !selectedAset" class="text-xs text-muted-foreground">
                Tidak ada aset aktif ditemukan
              </p>
            </div>

            <!-- Aset terpilih -->
            <div v-if="selectedAset" class="border rounded-lg p-4 bg-muted/30 space-y-3">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="font-mono font-medium text-sm">{{ selectedAset.kodeAset }}</p>
                  <p class="font-medium text-sm mt-0.5">{{ selectedAset.barangNama }}</p>
                  <p class="text-xs text-muted-foreground mt-0.5">{{ selectedAset.kategoriNama }}</p>
                </div>
                <button type="button" @click="clearAset"
                  class="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-shrink-0">
                  <XIcon class="h-4 w-4" />
                </button>
              </div>
              <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <span class="text-muted-foreground">Unit Asal</span>
                <span class="font-medium text-muted-foreground">{{ selectedAset.unitNama }}</span>
                <span class="text-muted-foreground">Nilai Buku</span>
                <span class="font-medium tabular-nums">{{ formatRupiah(selectedAset.nilaiBuku) }}</span>
                <span class="text-muted-foreground">Status</span>
                <span class="inline-flex items-center rounded-full px-2 py-0.5 font-medium w-fit"
                  :class="STATUS_ASET_CONFIG[selectedAset.status].class">
                  {{ selectedAset.status }}
                </span>
              </div>
            </div>

          </div>

          <!-- Card: Detail Transfer -->
          <div class="border rounded-xl p-6 space-y-5">
            <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Detail Transfer</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <!-- Unit Tujuan -->
              <div class="sm:col-span-2 space-y-1.5">
                <label class="text-sm font-medium">Unit Tujuan <span class="text-destructive">*</span></label>
                <select v-model="form.unitTujuanId" required
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  :disabled="!selectedAset"
                >
                  <option :value="0" disabled>Pilih unit tujuan</option>
                  <option
                    v-for="u in availableUnits"
                    :key="u.id"
                    :value="u.id"
                  >
                    {{ u.nama }}
                  </option>
                </select>
                <p v-if="selectedAset && availableUnits.length === 0" class="text-xs text-destructive">
                  Tidak ada unit tujuan lain yang tersedia
                </p>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Tanggal Transfer <span class="text-destructive">*</span></label>
                <input v-model="form.tanggal" type="date" required
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Keterangan</label>
                <input v-model="form.keterangan" type="text" placeholder="Opsional..."
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>

              <div class="sm:col-span-2 space-y-1.5">
                <label class="text-sm font-medium">Alasan Transfer <span class="text-destructive">*</span></label>
                <textarea v-model="form.alasan" required rows="3"
                  placeholder="Jelaskan alasan transfer aset ini..."
                  class="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
              </div>

            </div>
          </div>

          <!-- Actions mobile -->
          <div class="flex items-center justify-between pt-1 lg:hidden">
            <button type="button" @click="navigateTo('/transfer')"
              class="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors">
              <ArrowLeftIcon class="h-4 w-4" /> Kembali
            </button>
            <button type="submit" :disabled="submitting"
              class="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none">
              <Loader2Icon v-if="submitting" class="h-4 w-4 animate-spin" />
              <CheckIcon v-else class="h-4 w-4" />
              Proses Transfer
            </button>
          </div>

        </div>

        <!-- Kolom Kanan: Sidebar -->
        <div class="hidden lg:block">
          <div class="sticky top-6 space-y-4">

            <!-- Ringkasan Transfer -->
            <div class="border rounded-xl p-5 space-y-4">
              <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Ringkasan Transfer</h3>

              <div v-if="!selectedAset" class="text-center py-4 text-xs text-muted-foreground">
                Pilih aset terlebih dahulu
              </div>

              <template v-else>
                <div class="space-y-1">
                  <p class="text-xs text-muted-foreground">Aset</p>
                  <p class="text-sm font-medium">{{ selectedAset.barangNama }}</p>
                  <p class="font-mono text-xs text-muted-foreground">{{ selectedAset.kodeAset }}</p>
                </div>

                <!-- Arrow diagram -->
                <div class="flex flex-col items-center gap-2 py-2">
                  <div class="w-full border rounded-lg px-3 py-2 text-center">
                    <p class="text-xs text-muted-foreground">Dari</p>
                    <p class="text-sm font-medium">{{ selectedAset.unitNama }}</p>
                  </div>
                  <div class="flex flex-col items-center gap-1">
                    <div class="w-0.5 h-3 bg-border" />
                    <ArrowDownIcon class="h-4 w-4 text-primary" />
                    <div class="w-0.5 h-3 bg-border" />
                  </div>
                  <div class="w-full border border-primary/30 rounded-lg px-3 py-2 text-center bg-primary/5">
                    <p class="text-xs text-muted-foreground">Ke</p>
                    <p class="text-sm font-medium text-primary">
                      {{ unitTujuanNama || '—' }}
                    </p>
                  </div>
                </div>

                <div class="border-t pt-3 space-y-2 text-xs">
                  <div class="flex justify-between gap-2">
                    <span class="text-muted-foreground">Nilai Buku</span>
                    <span class="font-medium tabular-nums">{{ formatRupiah(selectedAset.nilaiBuku) }}</span>
                  </div>
                  <div class="flex justify-between gap-2">
                    <span class="text-muted-foreground">Tanggal</span>
                    <span>{{ form.tanggal ? formatTanggal(form.tanggal) : '—' }}</span>
                  </div>
                </div>
              </template>
            </div>

            <!-- Info -->
            <div class="border border-dashed rounded-xl p-4 space-y-1.5">
              <p class="text-xs font-medium text-muted-foreground">Info Transfer</p>
              <ul class="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Hanya aset berstatus Aktif yang bisa ditransfer</li>
                <li>Kepemilikan unit berubah setelah transfer</li>
                <li>Histori transfer tetap tercatat</li>
                <li>Nilai buku tidak berubah saat transfer</li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </form>

  </div>
</template>

<script setup lang="ts">
import { ArrowDownIcon, ArrowLeftIcon, CheckIcon, Loader2Icon, SearchIcon, XIcon } from 'lucide-vue-next'
import { type TransferFormData } from '@/services/transaksiService'
import { type Aset, STATUS_ASET_CONFIG, formatRupiah, formatTanggal } from '@/services/asetService'
import { type UnitKantor } from '@/services/unitKantorService'

interface Props {
  asetList: Aset[]           // hanya aset Aktif milik unit user
  unitList: UnitKantor[]     // semua unit aktif
  loadingData?: boolean
  submitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loadingData: false,
  submitting: false,
})

const emit = defineEmits<{
  submit: [data: TransferFormData & { unitAsalNama: string; unitTujuanNama: string }]
}>()

// Aset search & select
const asetSearch   = ref('')
const selectedAset = ref<Aset | null>(null)

const filteredAset = computed(() => {
  if (!asetSearch.value) return []
  const q = asetSearch.value.toLowerCase()
  return props.asetList
    .filter(a => a.status === 'Aktif')
    .filter(a =>
      a.kodeAset.toLowerCase().includes(q) ||
      a.barangNama.toLowerCase().includes(q)
    )
    .slice(0, 8)
})

function selectAset(a: Aset) {
  selectedAset.value    = a
  asetSearch.value      = a.kodeAset
  form.value.unitAsalId = a.unitId
  form.value.unitTujuanId = 0
}

function clearAset() {
  selectedAset.value      = null
  asetSearch.value        = ''
  form.value.unitAsalId   = 0
  form.value.unitTujuanId = 0
}

// Form
interface TransferForm {
  unitAsalId:   number
  unitTujuanId: number
  tanggal:      string
  alasan:       string
  keterangan:   string
}

const form = ref<TransferForm>({
  unitAsalId:   0,
  unitTujuanId: 0,
  tanggal:      new Date().toISOString().slice(0, 10),
  alasan:       '',
  keterangan:   '',
})

// Unit tujuan — exclude unit asal
const availableUnits = computed(() =>
  props.unitList.filter(u => u.id !== form.value.unitAsalId)
)

const unitTujuanNama = computed(() =>
  props.unitList.find(u => u.id === form.value.unitTujuanId)?.nama ?? ''
)

function handleSubmit() {
  if (!selectedAset.value) return

  const unitAsalNama   = selectedAset.value.unitNama
  const unitTujuanNama = props.unitList.find(u => u.id === form.value.unitTujuanId)?.nama ?? ''

  emit('submit', {
    asetId:       selectedAset.value.id,
    unitAsalId:   form.value.unitAsalId,
    unitTujuanId: form.value.unitTujuanId,
    tanggal:      form.value.tanggal,
    alasan:       form.value.alasan,
    keterangan:   form.value.keterangan,
    unitAsalNama,
    unitTujuanNama,
  })
}
</script>