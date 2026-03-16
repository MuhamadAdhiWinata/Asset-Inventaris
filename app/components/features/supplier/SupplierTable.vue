<!-- components/features/supplier/SupplierTable.vue -->
<template>
  <div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <div class="relative flex-1 max-w-sm">
        <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari kode atau nama supplier..."
          class="w-full pl-9 pr-4 h-10 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <select v-model="selectedStatus"
        class="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <option value="Semua">Semua Status</option>
        <option value="Aktif">Aktif</option>
        <option value="Tidak Aktif">Tidak Aktif</option>
      </select>
    </div>

    <!-- Table card -->
    <div class="rounded-lg border overflow-hidden">

      <div v-if="loading" class="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2Icon class="h-4 w-4 animate-spin" /> Memuat data...
      </div>

      <div v-else-if="error" class="flex flex-col items-center justify-center py-16 gap-3">
        <p class="text-sm text-destructive">{{ error }}</p>
        <button @click="emit('retry')" class="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-input bg-background text-sm hover:bg-accent transition-colors">
          <RefreshCwIcon class="h-4 w-4" /> Coba Lagi
        </button>
      </div>

      <div v-else-if="!loading && items.length === 0" class="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
        <TruckIcon class="h-8 w-8 opacity-40" />
        <p class="text-sm">Tidak ada supplier ditemukan</p>
      </div>

      <template v-else>
        <!-- Desktop -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full caption-bottom text-sm">
            <thead class="border-b bg-muted/40">
              <tr>
                <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Kode</th>
                <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nama Supplier</th>
                <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden lg:table-cell">Kontak</th>
                <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden xl:table-cell">Email</th>
                <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden lg:table-cell">Alamat</th>
                <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th class="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id" class="border-b transition-colors hover:bg-muted/50 last:border-0">
                <td class="px-4 py-3 align-middle font-mono text-xs font-medium">{{ item.kode }}</td>
                <td class="px-4 py-3 align-middle">
                  <p class="font-medium">{{ item.nama }}</p>
                  <p class="text-xs text-muted-foreground lg:hidden mt-0.5">{{ item.kontak }}</p>
                </td>
                <td class="px-4 py-3 align-middle text-sm text-muted-foreground hidden lg:table-cell">{{ item.kontak }}</td>
                <td class="px-4 py-3 align-middle text-sm text-muted-foreground hidden xl:table-cell">{{ item.email }}</td>
                <td class="px-4 py-3 align-middle text-sm text-muted-foreground hidden lg:table-cell max-w-[200px] truncate">{{ item.alamat }}</td>
                <td class="px-4 py-3 align-middle">
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" :class="STATUS_SUPPLIER_CONFIG[item.status].class">
                    {{ STATUS_SUPPLIER_CONFIG[item.status].label }}
                  </span>
                </td>
                <td class="px-4 py-3 align-middle">
                  <div class="flex items-center justify-center gap-1">
                    <button @click="emit('edit', item)" class="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                      <PencilIcon class="h-4 w-4" />
                    </button>
                    <button @click="emit('delete', item)" class="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2Icon class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile -->
        <div class="md:hidden divide-y">
          <div v-for="item in items" :key="item.id" class="p-4 hover:bg-muted/30 transition-colors">
            <div class="flex items-start justify-between gap-2 mb-3">
              <div>
                <span class="font-mono text-xs text-muted-foreground">{{ item.kode }}</span>
                <p class="font-medium text-sm mt-0.5">{{ item.nama }}</p>
              </div>
              <div class="flex gap-1 flex-shrink-0">
                <button @click="emit('edit', item)" class="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent transition-colors">
                  <PencilIcon class="h-4 w-4 text-muted-foreground" />
                </button>
                <button @click="emit('delete', item)" class="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-destructive/10 transition-colors">
                  <Trash2Icon class="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <span class="text-muted-foreground">Kontak</span><span>{{ item.kontak }}</span>
              <span class="text-muted-foreground">Email</span><span class="truncate">{{ item.email }}</span>
              <span class="text-muted-foreground">Status</span>
              <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium w-fit" :class="STATUS_SUPPLIER_CONFIG[item.status].class">{{ item.status }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && !error && totalItems > 0" class="flex items-center justify-between px-1 py-4">
      <p class="text-sm text-muted-foreground">Menampilkan {{ startItem }}–{{ endItem }} dari {{ totalItems }} supplier</p>
      <div class="flex items-center gap-1">
        <button @click="emit('page-change', currentPage - 1)" :disabled="currentPage === 1"
          class="inline-flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background text-sm hover:bg-accent transition-colors disabled:pointer-events-none disabled:opacity-50">
          <ChevronLeftIcon class="h-4 w-4" />
        </button>
        <button v-for="page in visiblePages" :key="page" @click="emit('page-change', page)"
          class="inline-flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background text-sm hover:bg-accent transition-colors"
          :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary': currentPage === page }">
          {{ page }}
        </button>
        <button @click="emit('page-change', currentPage + 1)" :disabled="currentPage === totalPages"
          class="inline-flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background text-sm hover:bg-accent transition-colors disabled:pointer-events-none disabled:opacity-50">
          <ChevronRightIcon class="h-4 w-4" />
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import {
  SearchIcon, Loader2Icon, RefreshCwIcon, TruckIcon,
  PencilIcon, Trash2Icon, ChevronLeftIcon, ChevronRightIcon,
} from 'lucide-vue-next'
import { type Supplier, STATUS_SUPPLIER_CONFIG } from '@/services/supplierService'

interface Props {
  items: Supplier[]
  loading: boolean
  error: string | null
  currentPage: number
  totalItems: number
  itemsPerPage: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit:            [item: Supplier]
  delete:          [item: Supplier]
  'page-change':   [page: number]
  'filter-change': [filters: { search: string; status: string }]
  retry:           []
}>()

const searchQuery    = ref('')
const selectedStatus = ref('Semua')

watch([searchQuery, selectedStatus], () => {
  emit('filter-change', { search: searchQuery.value, status: selectedStatus.value })
})

const totalPages = computed(() =>
  props.itemsPerPage > 0 ? Math.ceil(props.totalItems / props.itemsPerPage) : 1
)
const startItem  = computed(() => props.totalItems === 0 ? 0 : (props.currentPage - 1) * props.itemsPerPage + 1)
const endItem    = computed(() => Math.min(props.currentPage * props.itemsPerPage, props.totalItems))
const visiblePages = computed(() => {
  const max = 5, half = Math.floor(max / 2)
  let start = Math.max(1, props.currentPage - half)
  const end = Math.min(totalPages.value, start + max - 1)
  if (end - start + 1 < max) start = Math.max(1, end - max + 1)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})
</script>