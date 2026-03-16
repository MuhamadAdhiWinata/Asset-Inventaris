<!-- components/features/supplier/SupplierForm.vue -->
<template>
  <div>

    <!-- Header + Actions desktop -->
    <div class="mb-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold tracking-tight">{{ isEdit ? 'Edit Supplier' : 'Tambah Supplier' }}</h1>
          <p class="text-muted-foreground text-sm mt-1">
            {{ isEdit ? `Mengubah data supplier ${initialData?.nama}` : 'Isi form berikut untuk menambah supplier baru.' }}
          </p>
        </div>
        <div class="hidden lg:flex items-center gap-3 flex-shrink-0">
          <button type="button" @click="navigateTo('/supplier')"
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
            {{ isEdit ? 'Simpan Perubahan' : 'Tambah Supplier' }}
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
      <button @click="emit('retry')" class="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-input bg-background text-sm hover:bg-accent transition-colors">
        <RefreshCwIcon class="h-4 w-4" /> Coba Lagi
      </button>
    </div>

    <form v-else @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">

        <!-- Kolom Kiri -->
        <div class="space-y-5">
          <div class="border rounded-xl p-6 space-y-5">
            <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Data Supplier</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Kode Supplier <span class="text-destructive">*</span></label>
                <input v-model="form.kode" type="text" required placeholder="SUP-001"
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-mono uppercase ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  @input="form.kode = (form.kode as string).toUpperCase()" />
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
                <label class="text-sm font-medium">Nama Supplier <span class="text-destructive">*</span></label>
                <input v-model="form.nama" type="text" required placeholder="Contoh: PT. Dell Indonesia"
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">No. Telepon</label>
                <input v-model="form.kontak" type="text" placeholder="021-1234567"
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">Email</label>
                <input v-model="form.email" type="email" placeholder="sales@supplier.com"
                  class="w-full h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </div>

              <div class="sm:col-span-2 space-y-1.5">
                <label class="text-sm font-medium">Alamat</label>
                <textarea v-model="form.alamat" rows="3" placeholder="Alamat lengkap supplier..."
                  class="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
              </div>

            </div>
          </div>

          <!-- Actions mobile -->
          <div class="flex items-center justify-between pt-1 lg:hidden">
            <button type="button" @click="navigateTo('/supplier')"
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

        <!-- Kolom Kanan -->
        <div class="hidden lg:block">
          <div class="sticky top-6 space-y-4">
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
                  <span class="text-xs">{{ form.kontak || '—' }}</span>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs text-muted-foreground">Status</span>
                  <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="STATUS_SUPPLIER_CONFIG[form.status]?.class">
                    {{ form.status }}
                  </span>
                </div>
              </div>
            </div>

            <div class="border border-dashed rounded-xl p-4 space-y-1.5">
              <p class="text-xs font-medium text-muted-foreground">Info</p>
              <ul class="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Kode supplier harus unik</li>
                <li>Supplier tidak aktif tidak muncul di form pembelian</li>
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
import { type Supplier, type SupplierFormData, STATUS_SUPPLIER_CONFIG, emptySupplierForm } from '@/services/supplierService'

interface Props {
  initialData: Supplier | null
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
  submit: [data: SupplierFormData]
  retry:  []
}>()

const isEdit = computed(() => !!props.initialData)
const form   = ref<SupplierFormData>(emptySupplierForm())

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      const { id, ...rest } = data
      form.value = { ...rest }
    } else {
      form.value = emptySupplierForm()
    }
  },
  { immediate: true }
)

function resetForm() { form.value = emptySupplierForm() }
function handleSubmit() { emit('submit', { ...form.value }) }
</script>