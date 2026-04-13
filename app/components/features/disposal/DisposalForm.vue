<!-- components/features/disposal/DisposalForm.vue -->
<template>
  <div>

    <div class="mb-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold tracking-tight">Disposal Aset</h1>
          <p class="text-muted-foreground text-sm mt-1">Hapuskan aset yang sudah tidak dapat digunakan.</p>
        </div>
        <div class="hidden lg:flex items-center gap-3 flex-shrink-0">
          <button type="button" @click="navigateTo('/disposal')"
            class="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors">
            <ArrowLeftIcon class="h-4 w-4" /> Kembali
          </button>
          <button type="button" :disabled="submitting || !selectedAset" @click="handleSubmit"
            class="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none">
            <Loader2Icon v-if="submitting" class="h-4 w-4 animate-spin" />
            <Trash2Icon v-else class="h-4 w-4" />
            Proses Disposal
          </button>
        </div>
      </div>
    </div>

    <div v-if="loadingData" class="space-y-4">
      <div v-for="i in 2" :key="i" class="h-40 rounded-xl bg-muted animate-pulse" />
    </div>

    <form v-else @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

        <div class="space-y-5">

          <!-- Pilih Aset -->
          <div class="border rounded-xl p-6 space-y-4">
            <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Aset yang Didisposal</h2>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Cari & Pilih Aset <span class="text-destructive">*</span></label>
              <div class="relative">
                <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input v-model="asetSearch" type="text" placeholder="Ketik kode atau nama aset..."
                  class="w-full pl-9 pr-4 h-10 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>
              <div v-if="asetSearch && filteredAset.length > 0 && !selectedAset"
                class="border rounded-lg overflow-hidden shadow-sm max-h-48 overflow-y-auto">
                <button v-for="a in filteredAset" :key="a.id" type="button" @click="selectAset(a)"
                  class="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-accent transition-colors border-b last:border-0">
                  <div class="text-left">
                    <p class="font-mono font-medium text-xs">{{ a.kodeAset }}</p>
                    <p class="text-muted-foreground text-xs">{{ a.barangNama }}</p>
                  </div>
                  <span class="text-xs text-muted-foreground">{{ a.unitNama }}</span>
                </button>
              </div>
            </div>

            <div v-if="selectedAset" class="border border-destructive/30 rounded-lg p-4 bg-destructive/5 space-y-3">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="font-mono font-medium text-sm">{{ selectedAset.kodeAset }}</p>
                  <p class="font-medium text-sm mt-0.5">{{ selectedAset.barangNama }}</p>
                  <p class="text-xs text-muted-foreground">{{ selectedAset.unitNama }}</p>
                </div>
                <button type="button" @click="clearAset"
                  class="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-shrink-0">
                  <XIcon class="h-4 w-4" />
                </button>
              </div>
              <div class="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-destructive/20">
                <div><p class="text-muted-foreground">Harga Perolehan</p><p class="font-medium tabular-nums">{{ formatRupiah(selectedAset.hargaPerolehan) }}</p></div>
                <div><p class="text-muted-foreground">Nilai Buku</p><p class="font-medium tabular-nums text-destructive">{{ formatRupiah(selectedAset.nilaiBuku) }}</p></div>
              </div>
            </div>
          </div>

          <!-- Detail Disposal -->
          <div class="border rounded-xl p-6 space-y-5">
            <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Detail Disposal</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Tanggal Disposal <span class="text-destructive">*</span></label>
                <input v-model="form.tanggal" type="date" required
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Nilai Sisa (Rp)</label>
                <input v-model.number="form.nilaiSisa" type="number" min="0" placeholder="0"
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm tabular-nums ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                <p class="text-xs text-muted-foreground">Nilai scrap / sisa jika ada</p>
              </div>

              <div class="sm:col-span-2 space-y-1.5">
                <label class="text-sm font-medium">Alasan Disposal <span class="text-destructive">*</span></label>
                <select v-model="form.alasan" required
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="" disabled>Pilih alasan...</option>
                  <option value="Rusak tidak dapat diperbaiki">Rusak tidak dapat diperbaiki</option>
                  <option value="Usang / sudah tidak relevan">Usang / sudah tidak relevan</option>
                  <option value="Hilang">Hilang</option>
                  <option value="Bencana alam">Bencana alam</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">No. Berita Acara</label>
                <input v-model="form.noBeritaAcara" type="text" placeholder="No. BA Penghapusan..."
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Keterangan</label>
                <input v-model="form.keterangan" type="text" placeholder="Opsional..."
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>

            </div>
          </div>

          <!-- Actions mobile -->
          <div class="flex items-center justify-between pt-1 lg:hidden">
            <button type="button" @click="navigateTo('/disposal')"
              class="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors">
              <ArrowLeftIcon class="h-4 w-4" /> Kembali
            </button>
            <button type="submit" :disabled="submitting || !selectedAset"
              class="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:pointer-events-none">
              <Loader2Icon v-if="submitting" class="h-4 w-4 animate-spin" />
              <Trash2Icon v-else class="h-4 w-4" />
              Proses
            </button>
          </div>

        </div>

        <!-- Sidebar -->
        <div class="hidden lg:block">
          <div class="sticky top-6 space-y-4">

            <div class="border rounded-xl p-5 space-y-4">
              <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Ringkasan</h3>
              <div v-if="!selectedAset" class="text-center py-4 text-xs text-muted-foreground">Pilih aset terlebih dahulu</div>
              <template v-else>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between gap-2">
                    <span class="text-muted-foreground">Nilai Buku</span>
                    <span class="tabular-nums font-medium">{{ formatRupiah(selectedAset.nilaiBuku) }}</span>
                  </div>
                  <div class="flex justify-between gap-2">
                    <span class="text-muted-foreground">Nilai Sisa</span>
                    <span class="tabular-nums">{{ formatRupiah(form.nilaiSisa) }}</span>
                  </div>
                  <div class="border-t pt-2 flex justify-between gap-2">
                    <span class="font-medium">Kerugian</span>
                    <span class="font-bold tabular-nums text-destructive">{{ formatRupiah(Math.max(0, selectedAset.nilaiBuku - form.nilaiSisa)) }}</span>
                  </div>
                </div>
              </template>
            </div>

            <!-- Warning -->
            <div class="flex items-start gap-3 p-4 border border-destructive/30 bg-destructive/5 rounded-xl">
              <AlertTriangleIcon class="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <div class="text-xs text-destructive space-y-1">
                <p class="font-medium">Perhatian</p>
                <p>Disposal bersifat permanen. Aset tidak bisa dikembalikan setelah diproses.</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </form>

  </div>
</template>

<script setup lang="ts">
import { AlertTriangleIcon, ArrowLeftIcon, Loader2Icon, SearchIcon, Trash2Icon, XIcon } from 'lucide-vue-next'
import { type DisposalFormData } from '@/services/transaksiService'
import { type Aset, formatRupiah } from '@/services/asetService'

interface DisposalForm {
  tanggal:       string
  alasan:        string
  nilaiSisa:     number
  noBeritaAcara: string
  keterangan:    string
}

interface Props {
  asetList:    Aset[]
  loadingData?: boolean
  submitting?:  boolean
}

const props = withDefaults(defineProps<Props>(), { loadingData: false, submitting: false })
const emit  = defineEmits<{ submit: [data: DisposalFormData] }>()

const asetSearch   = ref('')
const selectedAset = ref<Aset | null>(null)

const filteredAset = computed(() => {
  if (!asetSearch.value) return []
  const q = asetSearch.value.toLowerCase()
  return props.asetList.filter(a => a.status === 'Aktif')
    .filter(a => a.kodeAset.toLowerCase().includes(q) || a.barangNama.toLowerCase().includes(q))
    .slice(0, 8)
})

function selectAset(a: Aset) { selectedAset.value = a; asetSearch.value = a.kodeAset }
function clearAset() { selectedAset.value = null; asetSearch.value = '' }

const form = ref<DisposalForm>({
  tanggal:       new Date().toISOString().slice(0, 10),
  alasan:        '',
  nilaiSisa:     0,
  noBeritaAcara: '',
  keterangan:    '',
})

function handleSubmit() {
  if (!selectedAset.value) return
  emit('submit', {
    asetId:        selectedAset.value.id,
    unitId:        selectedAset.value.unitId,
    tanggal:       form.value.tanggal,
    alasan:        form.value.alasan,
    nilaiSisa:     form.value.nilaiSisa,
    noBeritaAcara: form.value.noBeritaAcara,
    keterangan:    form.value.keterangan,
  })
}
</script>