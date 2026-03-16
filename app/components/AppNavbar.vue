<template>
  <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="flex h-14 bg-sidebar items-center px-4 gap-4">

      <!-- Sidebar toggle -->
      <SidebarTrigger class="flex-shrink-0" />

      <!-- Breadcrumb -->
      <nav class="flex-1 flex items-center gap-1.5 text-sm min-w-0">
        <template v-for="(crumb, i) in breadcrumbs" :key="crumb.path">
          <!-- Separator -->
          <ChevronRightIcon
            v-if="i > 0"
            class="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0"
          />
          <!-- Last crumb (current page) -->
          <span
            v-if="i === breadcrumbs.length - 1"
            class="font-medium text-sidebar-foreground truncate"
          >
            {{ crumb.label }}
          </span>
          <!-- Parent crumb (clickable) -->
          <button
            v-else
            @click="navigateTo(crumb.path)"
            class="text-muted-foreground hover:text-sidebar-foreground transition-colors truncate"
          >
            {{ crumb.label }}
          </button>
        </template>
      </nav>

      <!-- User dropdown -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" class="relative h-8 gap-2 flex-shrink-0">
            <Avatar class="h-7 w-7">
              <AvatarFallback class="bg-primary text-white text-xs">
                {{ getUserInitials() }}
              </AvatarFallback>
            </Avatar>
            <span class="hidden sm:inline-block text-sm font-medium">
              {{ username }}
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" class="w-56">
          <DropdownMenuLabel class="font-normal">
            <div class="flex flex-col space-y-1">
              <p class="text-sm font-medium leading-none">{{ username }}</p>
              <p class="text-xs leading-none text-muted-foreground">{{ email }}</p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem @click="handleLogout" class="text-red-600 cursor-pointer">
            <LogOut class="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ChevronRightIcon, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'

const route     = useRoute()
const { toast } = useToast()
const authStore = useAuthStore()

// ── User dari store ───────────────────────────────────────────
const username = computed(() => authStore.user?.name ?? '')
const email    = computed(() => authStore.user?.email ?? '')

function getUserInitials(): string {
  const names: string[] = username.value.split(" ")
  const first  = names[0]?.charAt(0) ?? ""
  const second = names[1]?.charAt(0) ?? ""
  if (names.length >= 2 && second) return (first + second).toUpperCase()
  return username.value.substring(0, 2).toUpperCase()
}

// ── Route → label map ─────────────────────────────────────────
// Tambahkan route baru di sini seiring project berkembang
const ROUTE_LABELS: Record<string, string> = {
  'dashboard':    'Dashboard',
  'master-asset': 'Master Aset',
  'kategori':     'Kategori',
  'barang':       'Barang',
  'supplier':     'Supplier',
  'create':       'Tambah',
  'edit':         'Edit',
  'pembelian':    'Pembelian',
  'penjualan':    'Penjualan',
  'transfer':     'Transfer',
  'disposal':     'Disposal',
  'maintenance':  'Maintenance',
  'depresiasi':   'Depresiasi',
  'laporan':      'Laporan',
  'unit-kantor':  'Unit Kantor',
  'pengaturan':   'Pengaturan',
  'aset':         'Daftar Aset',
}

// ── Build breadcrumbs from route.path ─────────────────────────
interface Crumb {
  label: string
  path: string
}

const breadcrumbs = computed<Crumb[]>(() => {
  const segments = route.path
    .split('/')
    .filter(Boolean) // buang string kosong

  if (segments.length === 0) {
    return [{ label: 'Dashboard', path: '/dashboard' }]
  }

  const crumbs: Crumb[] = []
  let accumulated = ''

  for (const segment of segments) {
    accumulated += `/${segment}`

    // Skip segmen yang murni angka (dynamic param: /master-asset/1/edit → skip "1")
    if (/^\d+$/.test(segment)) continue

    const label = ROUTE_LABELS[segment] ?? toTitleCase(segment)
    crumbs.push({ label, path: accumulated })
  }

  return crumbs
})

function toTitleCase(str: string): string {
  return str
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

// ── Auth ──────────────────────────────────────────────────────
async function handleLogout() {
  authStore.logout()
  await navigateTo('/login')
  toast({
    title: 'Logged out',
    description: "You've been logged out successfully.",
    variant: 'success',
  })
}
</script>