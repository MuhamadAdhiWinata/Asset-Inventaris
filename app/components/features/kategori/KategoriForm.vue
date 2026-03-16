<!-- components/features/kategori/KategoriForm.vue -->
<template>
  <div>

    <!-- Header + Actions desktop -->
    <div class="mb-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold tracking-tight">
            {{ isEdit ? 'Edit Kategori' : 'Tambah Kategori' }}
          </h1>
          <p class="text-muted-foreground text-sm mt-1">
            {{ isEdit ? `Mengubah data kategori ${initialData?.nama}` : 'Isi form berikut untuk menambah kategori baru.' }}
          </p>
        </div>
        <!-- Actions desktop -->
        <div class="hidden lg:flex items-center gap-3 flex-shrink-0">
          <button type="button" @click="navigateTo('/kategori')"
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
            {{ isEdit ? 'Simpan Perubahan' : 'Tambah Kategori' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loadingData" class="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      <div class="space-y-4">
        <div v-for="i in 2" :key="i" class="h-40 rounded-xl bg-muted animate-pulse" />
      </div>
      <div class="h-48 rounded-xl bg-muted animate-pulse" />
    </div>

    <!-- Error -->
    <div v-else-if="fetchError" class="flex flex-col items-center justify-center py-20 gap-3 border rounded-xl">
      <p class="text-sm text-destructive">{{ fetchError }}</p>
      <button @click="emit('retry')"
        class="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-input bg-background text-sm hover:bg-accent transition-colors">
        <RefreshCwIcon class="h-4 w-4" /> Coba Lagi
      </button>
    </div>

    <!-- 2-Column Layout -->
    <form v-else @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">

        <!-- Kolom Kiri -->
        <div class="space-y-5">

          <!-- Card: Identitas -->
          <div class="border rounded-xl p-6 space-y-5">
            <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Identitas Kategori
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Kode <span class="text-destructive">*</span></label>
                <input
                  v-model="form.kode"
                  type="text"
                  required
                  placeholder="KIT"
                  maxlength="10"
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-mono uppercase ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  @input="form.kode = form.kode.toUpperCase()"
                />
                <p class="text-xs text-muted-foreground">Maks. 10 karakter, huruf kapital</p>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Status <span class="text-destructive">*</span></label>
                <select v-model="form.status" required
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
              </div>

              <div class="sm:col-span-2 space-y-1.5">
                <label class="text-sm font-medium">Nama Kategori <span class="text-destructive">*</span></label>
                <input
                  v-model="form.nama"
                  type="text"
                  required
                  placeholder="Contoh: Komputer & IT"
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

            </div>
          </div>

          <!-- Card: Parameter Depresiasi Default -->
          <div class="border rounded-xl p-6 space-y-5">
            <div>
              <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Parameter Depresiasi Default
              </h2>
              <p class="text-xs text-muted-foreground mt-1">
                Nilai ini akan otomatis diisi saat membuat barang di kategori ini. Bisa di-override per barang.
              </p>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Masa Manfaat Default (tahun) <span class="text-destructive">*</span></label>
                <input
                  v-model.number="form.masaManfaatDefault"
                  type="number"
                  required
                  min="1"
                  max="50"
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <p class="text-xs text-muted-foreground">Depresiasi per bulan: {{ depresiasiPerBulanLabel }}</p>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Metode Depresiasi Default <span class="text-destructive">*</span></label>
                <select v-model="form.metodeDefault" required
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="garis_lurus">Garis Lurus</option>
                  <option value="saldo_menurun">Saldo Menurun</option>
                </select>
                <p class="text-xs text-muted-foreground">
                  {{ form.metodeDefault === 'garis_lurus'
                    ? 'Nilai depresiasi sama setiap bulan'
                    : 'Nilai depresiasi menurun setiap bulan' }}
                </p>
              </div>

            </div>
          </div>

          <!-- Actions mobile -->
          <div class="flex items-center justify-between pt-1 lg:hidden">
            <button type="button" @click="navigateTo('/kategori')"
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
                {{ isEdit ? 'Simpan' : 'Tambah' }}
              </button>
            </div>
          </div>

        </div>

        <!-- Kolom Kanan: Sidebar -->
        <div class="hidden lg:block">
          <div class="sticky top-6 space-y-4">

            <!-- Preview -->
            <div class="border rounded-xl p-5 space-y-3">
              <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Pratinjau</h3>
              <div class="space-y-2.5">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs text-muted-foreground">Kode</span>
                  <span class="text-xs font-mono font-medium">{{ form.kode || '—' }}</span>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs text-muted-foreground">Nama</span>
                  <span class="text-xs font-medium text-right max-w-[140px] truncate">{{ form.nama || '—' }}</span>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs text-muted-foreground">Masa manfaat</span>
                  <span class="text-xs font-medium">{{ form.masaManfaatDefault }} tahun</span>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs text-muted-foreground">Metode</span>
                  <span class="text-xs font-medium">{{ METODE_LABEL[form.metodeDefault] }}</span>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs text-muted-foreground">Status</span>
                  <span
                    class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="STATUS_KATEGORI_CONFIG[form.status]?.class"
                  >
                    {{ form.status }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Info -->
            <div class="border border-dashed rounded-xl p-4 space-y-1.5">
              <p class="text-xs font-medium text-muted-foreground">Info</p>
              <ul class="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Kode kategori harus unik</li>
                <li>Masa manfaat & metode bisa di-override per barang</li>
                <li>Kategori tidak aktif tidak muncul di dropdown barang</li>
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
  type Kategori,
  type KategoriFormData,
  STATUS_KATEGORI_CONFIG,
  METODE_LABEL,
  emptyKategoriForm,
} from '@/services/kategoriService'

interface Props {
  initialData: Kategori | null
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
  submit: [data: KategoriFormData]
  retry:  []
}>()

const isEdit = computed(() => !!props.initialData)
const form   = ref<KategoriFormData>(emptyKategoriForm())

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      const { id, ...rest } = data
      form.value = { ...rest }
    } else {
      form.value = emptyKategoriForm()
    }
  },
  { immediate: true }
)

// Preview depresiasi per bulan (asumsi harga Rp 1.000.000 untuk ilustrasi)
const depresiasiPerBulanLabel = computed(() => {
  if (!form.value.masaManfaatDefault) return '—'
  const persen = (1 / (form.value.masaManfaatDefault * 12) * 100).toFixed(2)
  return `${persen}% dari harga perolehan`
})

function resetForm() {
  form.value = emptyKategoriForm()
}

function handleSubmit() {
  emit('submit', { ...form.value })
}
</script>