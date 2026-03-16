<!-- components/features/unit-kantor/UnitKantorForm.vue -->
<template>
  <div>

    <!-- Header + Actions desktop -->
    <div class="mb-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold tracking-tight">
            {{ isEdit ? 'Edit Unit Kantor' : 'Tambah Unit Kantor' }}
          </h1>
          <p class="text-muted-foreground text-sm mt-1">
            {{ isEdit
              ? `Mengubah data unit kantor ${initialData?.nama}`
              : 'Unit kantor baru akan memiliki data aset dan transaksi yang terisolasi.' }}
          </p>
        </div>
        <div class="hidden lg:flex items-center gap-3 flex-shrink-0">
          <button type="button" @click="navigateTo('/unit-kantor')"
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
            {{ isEdit ? 'Simpan Perubahan' : 'Tambah Unit' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loadingData" class="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      <div class="h-64 rounded-xl bg-muted animate-pulse" />
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

    <form v-else @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">

        <!-- Kolom Kiri -->
        <div class="space-y-5">
          <div class="border rounded-xl p-6 space-y-5">
            <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Data Unit Kantor</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Kode Unit <span class="text-destructive">*</span></label>
                <input
                  v-model="form.kode"
                  type="text"
                  required
                  placeholder="UKA"
                  maxlength="10"
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-mono uppercase ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  @input="form.kode = (form.kode as string).toUpperCase()"
                />
                <p class="text-xs text-muted-foreground">Kode unik untuk identifikasi unit</p>
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
                <label class="text-sm font-medium">Nama Unit Kantor <span class="text-destructive">*</span></label>
                <input
                  v-model="form.nama"
                  type="text"
                  required
                  placeholder="Contoh: Unit Kantor Jakarta Pusat"
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">No. Telepon</label>
                <input
                  v-model="form.telepon"
                  type="text"
                  placeholder="021-1234567"
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Email</label>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="unit@example.com"
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div class="sm:col-span-2 space-y-1.5">
                <label class="text-sm font-medium">Alamat</label>
                <textarea
                  v-model="form.alamat"
                  rows="3"
                  placeholder="Alamat lengkap unit kantor..."
                  class="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>

            </div>
          </div>

          <!-- Warning jika nonaktifkan unit yang sudah punya aset -->
          <div v-if="isEdit && form.status === 'Tidak Aktif'" class="flex items-start gap-3 p-4 border border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/10 rounded-xl">
            <AlertTriangleIcon class="h-4 w-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-yellow-800 dark:text-yellow-400">Perhatian</p>
              <p class="text-xs text-yellow-700 dark:text-yellow-500 mt-0.5">
                Menonaktifkan unit kantor tidak menghapus data aset dan transaksi yang sudah ada.
                User yang terikat unit ini tidak akan bisa login.
              </p>
            </div>
          </div>

          <!-- Actions mobile -->
          <div class="flex items-center justify-between pt-1 lg:hidden">
            <button type="button" @click="navigateTo('/unit-kantor')"
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

            <!-- Pratinjau -->
            <div class="border rounded-xl p-5 space-y-3">
              <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Pratinjau</h3>
              <div class="space-y-2.5">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs text-muted-foreground">Kode</span>
                  <span class="text-xs font-mono font-medium">{{ form.kode || '—' }}</span>
                </div>
                <div class="flex items-start justify-between gap-2">
                  <span class="text-xs text-muted-foreground">Nama</span>
                  <span class="text-xs font-medium text-right max-w-[150px]">{{ form.nama || '—' }}</span>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs text-muted-foreground">Telepon</span>
                  <span class="text-xs">{{ form.telepon || '—' }}</span>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs text-muted-foreground">Status</span>
                  <span
                    class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="STATUS_UNIT_CONFIG[form.status]?.class"
                  >
                    {{ form.status }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Info Isolasi -->
            <div class="border rounded-xl p-5 space-y-3">
              <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <ShieldIcon class="h-3.5 w-3.5" />
                Isolasi Data
              </h3>
              <div class="space-y-2 text-xs text-muted-foreground">
                <div class="flex items-start gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>Aset yang dibeli untuk unit ini hanya terlihat oleh admin unit tersebut</span>
                </div>
                <div class="flex items-start gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>Transaksi (pembelian, transfer, dll) terikat pada unit</span>
                </div>
                <div class="flex items-start gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>Admin pusat dapat melihat data semua unit sekaligus</span>
                </div>
                <div class="flex items-start gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
                  <span>Nama lokasi yang sama di dua unit berbeda tidak akan konflik</span>
                </div>
              </div>
            </div>

            <!-- Tips -->
            <div class="border border-dashed rounded-xl p-4 space-y-1.5">
              <p class="text-xs font-medium text-muted-foreground">Info</p>
              <ul class="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Kode unit harus unik</li>
                <li>Hanya super admin & admin pusat yang bisa kelola unit</li>
                <li>Menghapus unit tidak disarankan jika sudah punya data</li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </form>

  </div>
</template>

<script setup lang="ts">
import { AlertTriangleIcon, ArrowLeftIcon, CheckIcon, Loader2Icon, RefreshCwIcon, ShieldIcon } from 'lucide-vue-next'
import {
  type UnitKantor,
  type UnitKantorFormData,
  STATUS_UNIT_CONFIG,
  emptyUnitKantorForm,
} from '@/services/unitKantorService'

interface Props {
  initialData: UnitKantor | null
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
  submit: [data: UnitKantorFormData]
  retry:  []
}>()

const isEdit = computed(() => !!props.initialData)
const form   = ref<UnitKantorFormData>(emptyUnitKantorForm())

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      const { id, ...rest } = data
      form.value = { ...rest }
    } else {
      form.value = emptyUnitKantorForm()
    }
  },
  { immediate: true }
)

function resetForm() { form.value = emptyUnitKantorForm() }
function handleSubmit() { emit('submit', { ...form.value }) }
</script>