<!-- components/features/master-asset/MasterAssetForm.vue -->
<template>
  <div>

    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold tracking-tight">
            {{ isEdit ? 'Edit Aset' : 'Tambah Aset Baru' }}
          </h1>
          <p class="text-muted-foreground text-sm mt-1">
            {{ isEdit
              ? `Mengubah data aset ${initialData?.namaAset}`
              : 'Isi form berikut untuk menambah aset baru ke inventaris.' }}
          </p>
        </div>
        <!-- Actions (desktop top-right) -->
        <div class="hidden lg:flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            @click="navigateTo('/master-asset')"
            class="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors"
          >
            <ArrowLeftIcon class="h-4 w-4" />
            Kembali
          </button>
          <button
            v-if="!isEdit"
            type="button"
            @click="resetForm"
            class="inline-flex items-center h-10 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            :disabled="submitting"
            @click="handleSubmit"
            class="inline-flex items-center gap-2 h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            <Loader2Icon v-if="submitting" class="h-4 w-4 animate-spin" />
            <CheckIcon v-else class="h-4 w-4" />
            {{ isEdit ? 'Simpan Perubahan' : 'Tambah Aset' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loadingData" class="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
      <div class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-48 rounded-xl bg-muted animate-pulse" />
      </div>
      <div class="space-y-4">
        <div class="h-64 rounded-xl bg-muted animate-pulse" />
      </div>
    </div>

    <!-- Error fetch -->
    <div v-else-if="fetchError" class="flex flex-col items-center justify-center py-20 gap-3 border rounded-xl">
      <p class="text-sm text-destructive">{{ fetchError }}</p>
      <button
        @click="emit('retry')"
        class="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-input bg-background text-sm hover:bg-accent transition-colors"
      >
        <RefreshCwIcon class="h-4 w-4" />
        Coba Lagi
      </button>
    </div>

    <!-- 2-Column Layout -->
    <form v-else @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

        <!-- ── Kolom Kiri: Form Fields ─────────────────────── -->
        <div class="space-y-5">

          <!-- Card: Identitas Aset -->
          <div class="border rounded-xl p-6 space-y-3">
            <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Identitas Aset
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Kode Aset <span class="text-destructive">*</span></label>
                <input
                  v-model="form.kodeAset"
                  type="text"
                  required
                  placeholder="KOM-001"
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Status <span class="text-destructive">*</span></label>
                <select
                  v-model="form.status"
                  required
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option v-for="s in STATUS_LIST" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Nama Aset <span class="text-destructive">*</span></label>
                <input
                  v-model="form.namaAset"
                  type="text"
                  required
                  placeholder="Contoh: Laptop Dell Latitude 5520"
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Lokasi <span class="text-destructive">*</span></label>
                <input
                  v-model="form.lokasi"
                  type="text"
                  required
                  placeholder="Contoh: Ruang IT Lt. 2"
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

            </div>
          </div>

          <!-- Card: Klasifikasi -->
          <div class="border rounded-xl p-6 space-y-3">
            <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Klasifikasi
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Kategori <span class="text-destructive">*</span></label>
                <select
                  v-model="form.kategori"
                  required
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  @change="form.subKategori = ''"
                >
                  <option value="" disabled>Pilih kategori</option>
                  <option v-for="k in kategoriList" :key="k.id" :value="k.name">{{ k.name }}</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Sub Kategori</label>
                <select
                  v-model="form.subKategori"
                  :disabled="!form.kategori"
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Pilih sub kategori</option>
                  <option v-for="s in filteredSubKategori" :key="s.id" :value="s.name">{{ s.name }}</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Satuan</label>
                <select
                  v-model="form.satuan"
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option v-for="s in satuanList" :key="s.id" :value="s.name">{{ s.name }}</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Tanggal Perolehan <span class="text-destructive">*</span></label>
                <input
                  v-model="form.tanggalPerolehan"
                  type="date"
                  required
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

            </div>
          </div>

          <!-- Card: Nilai Keuangan -->
          <div class="border rounded-xl p-6 space-y-3">
            <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Nilai Keuangan
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Harga Perolehan (Rp) <span class="text-destructive">*</span></label>
                <input
                  v-model.number="form.hargaPerolehan"
                  type="number"
                  required
                  min="0"
                  placeholder="0"
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm tabular-nums ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <p class="text-xs text-muted-foreground">{{ formatRupiah(form.hargaPerolehan) }}</p>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Akm. Depresiasi (Rp)</label>
                <input
                  v-model.number="form.akumulasiDepresiasi"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm tabular-nums ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <p class="text-xs text-muted-foreground">{{ formatRupiah(form.akumulasiDepresiasi) }}</p>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">
                  Nilai Buku (Rp)
                  <span class="ml-1 text-xs font-normal text-muted-foreground">(otomatis)</span>
                </label>
                <input
                  :value="computedNilaiBuku"
                  type="number"
                  readonly
                  class="w-full h-10 rounded-md border border-input bg-muted px-3 text-sm tabular-nums cursor-not-allowed opacity-70"
                />
                <p class="text-xs text-muted-foreground">{{ formatRupiah(computedNilaiBuku) }}</p>
              </div>

            </div>
            <p class="text-xs text-muted-foreground">
              * Nilai Buku = Harga Perolehan − Akumulasi Depresiasi (dihitung otomatis)
            </p>
          </div>

          <!-- Actions (mobile bottom) -->
          <div class="flex items-center justify-between pt-1 lg:hidden">
            <button
              type="button"
              @click="navigateTo('/master-asset')"
              class="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors"
            >
              <ArrowLeftIcon class="h-4 w-4" />
              Kembali
            </button>
            <div class="flex items-center gap-3">
              <button
                v-if="!isEdit"
                type="button"
                @click="resetForm"
                class="inline-flex items-center h-10 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors"
              >
                Reset
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                <Loader2Icon v-if="submitting" class="h-4 w-4 animate-spin" />
                <CheckIcon v-else class="h-4 w-4" />
                {{ isEdit ? 'Simpan' : 'Tambah Aset' }}
              </button>
            </div>
          </div>

        </div>

        <!-- ── Kolom Kanan: Sticky Sidebar ────────────────── -->
        <div class="hidden lg:block">
          <div class="sticky top-6 space-y-4">

            <!-- Ringkasan Nilai -->
            <div class="border rounded-xl p-5 space-y-4">
              <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Ringkasan Nilai
              </h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm text-muted-foreground">Harga Perolehan</span>
                  <span class="text-sm font-medium tabular-nums">{{ formatRupiah(form.hargaPerolehan) }}</span>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm text-muted-foreground">Akm. Depresiasi</span>
                  <span class="text-sm tabular-nums text-muted-foreground">− {{ formatRupiah(form.akumulasiDepresiasi) }}</span>
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
              <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Info Aset
              </h3>
              <div class="space-y-2.5">
                <div class="flex items-start justify-between gap-2">
                  <span class="text-xs text-muted-foreground mt-0.5">Kode</span>
                  <span class="text-xs font-mono font-medium text-right">{{ form.kodeAset || '—' }}</span>
                </div>
                <div class="flex items-start justify-between gap-2">
                  <span class="text-xs text-muted-foreground mt-0.5">Kategori</span>
                  <span class="text-xs font-medium text-right">{{ form.kategori || '—' }}</span>
                </div>
                <div class="flex items-start justify-between gap-2">
                  <span class="text-xs text-muted-foreground mt-0.5">Lokasi</span>
                  <span class="text-xs font-medium text-right max-w-[140px] truncate">{{ form.lokasi || '—' }}</span>
                </div>
                <div class="flex items-start justify-between gap-2">
                  <span class="text-xs text-muted-foreground mt-0.5">Status</span>
                  <span
                    class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="STATUS_CONFIG[form.status]?.class ?? 'bg-muted text-muted-foreground'"
                  >
                    {{ form.status || '—' }}
                  </span>
                </div>
                <div v-if="form.tanggalPerolehan" class="flex items-start justify-between gap-2">
                  <span class="text-xs text-muted-foreground mt-0.5">Tgl. Perolehan</span>
                  <span class="text-xs font-medium text-right">{{ formatTanggal(form.tanggalPerolehan) }}</span>
                </div>
              </div>
            </div>

            <!-- Tips -->
            <div class="border border-dashed rounded-xl p-4 space-y-1.5">
              <p class="text-xs font-medium text-muted-foreground">Tips</p>
              <ul class="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Kode aset harus unik</li>
                <li>Nilai buku dihitung otomatis</li>
                <li>Pastikan lokasi sesuai posisi fisik</li>
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
  type MasterItem,
  type MasterItemFormData,
  type KategoriItem,
  type SubKategoriItem,
  type SatuanItem,
  type StatusAset,
  STATUS_CONFIG,
  emptyForm,
  formatRupiah,
  formatTanggal,
} from '@/services/masterAssetService'

interface Props {
  initialData: MasterItem | null
  kategoriList: KategoriItem[]
  subKategoriList: SubKategoriItem[]
  satuanList: SatuanItem[]
  loadingData?: boolean
  fetchError?: string | null
  submitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loadingData: false,
  fetchError: null,
  submitting: false,
})

const emit = defineEmits<{
  submit: [data: MasterItemFormData]
  retry:  []
}>()

const STATUS_LIST: StatusAset[] = ['Aktif', 'Tidak Aktif', 'Dijual', 'Dalam Perbaikan']

const isEdit = computed(() => !!props.initialData)
const form   = ref<MasterItemFormData>(emptyForm())

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      const { id, ...rest } = data
      form.value = { ...rest }
    } else {
      form.value = emptyForm()
    }
  },
  { immediate: true }
)

const filteredSubKategori = computed(() => {
  if (!form.value.kategori) return props.subKategoriList
  const selected = props.kategoriList.find(k => k.name === form.value.kategori)
  if (!selected) return []
  return props.subKategoriList.filter(s => s.kategoriId === selected.id)
})

const computedNilaiBuku = computed(() =>
  Math.max(0, (form.value.hargaPerolehan ?? 0) - (form.value.akumulasiDepresiasi ?? 0))
)

const depresiasiPercent = computed(() => {
  if (!form.value.hargaPerolehan) return 0
  return Math.min(100, Math.round((form.value.akumulasiDepresiasi / form.value.hargaPerolehan) * 100))
})

function resetForm() {
  form.value = emptyForm()
}

function handleSubmit() {
  emit('submit', { ...form.value, nilaiBuku: computedNilaiBuku.value })
}
</script>