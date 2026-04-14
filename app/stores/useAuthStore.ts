// stores/useAuthStore.ts

// ============================================================
// TYPES
// ============================================================

export type Permission =
  // Aset
  | 'asset.view'
  | 'asset.create'
  | 'asset.edit'
  | 'asset.delete'
  | 'aset.view'
  | 'aset.create'
  | 'aset.edit'
  | 'aset.delete'
  // Transaksi
  | 'transaction.view'
  | 'transaction.create'
  | 'transaction.edit'
  | 'transaction.delete'
  // Laporan
  | 'report.view'
  | 'report.export'
  // Master data
  | 'master.view'
  | 'master.create'
  | 'master.edit'
  | 'master.delete'
  // Unit kantor
  | 'unit.view'
  | 'unit.manage'
  // User management
  | 'user.view'
  | 'user.manage'

export interface AuthUser {
  id: number
  name: string
  email: string
  unitId: number | null   // null = admin pusat / super admin (akses semua unit)
  unitName: string | null
  permissions: Permission[]
}

// ============================================================
// MOCK USERS
// Nanti diganti dengan decode JWT dari API
// ============================================================

const MOCK_USERS: Record<string, AuthUser> = {
  // Super Admin — tidak terikat unit, semua permission
  'superadmin': {
    id: 1,
    name: 'Super Admin',
    email: 'superadmin@example.com',
    unitId: null,
    unitName: null,
    permissions: [
      'asset.view', 'asset.create', 'asset.edit', 'asset.delete',
      'transaction.view', 'transaction.create', 'transaction.edit', 'transaction.delete',
      'report.view', 'report.export',
      'master.view', 'master.create', 'master.edit', 'master.delete',
      'unit.view', 'unit.manage',
      'user.view', 'user.manage',
    ],
  },

  // Admin Pusat — tidak terikat unit, bisa lihat & kelola semua tapi tidak manage user/unit
  'adminpusat': {
    id: 2,
    name: 'Admin Pusat',
    email: 'adminpusat@example.com',
    unitId: null,
    unitName: null,
    permissions: [
      'asset.view', 'asset.create', 'asset.edit', 'asset.delete',
      'transaction.view', 'transaction.create', 'transaction.edit', 'transaction.delete',
      'report.view', 'report.export',
      'master.view', 'master.create', 'master.edit', 'master.delete',
      'unit.view',
    ],
  },

  // Admin Unit A — hanya data unit 1
  'adminunita': {
    id: 3,
    name: 'John Doe',
    email: 'john@example.com',
    unitId: 1,
    unitName: 'Unit Kantor A',
    permissions: [
      'asset.view', 'asset.create', 'asset.edit', 'asset.delete',
      'transaction.view', 'transaction.create', 'transaction.edit', 'transaction.delete',
      'report.view',
      'master.view',
    ],
  },

  // Admin Unit B — hanya data unit 2
  'adminunitb': {
    id: 4,
    name: 'Jane Smith',
    email: 'jane@example.com',
    unitId: 2,
    unitName: 'Unit Kantor B',
    permissions: [
      'asset.view', 'asset.create', 'asset.edit', 'asset.delete',
      'transaction.view', 'transaction.create', 'transaction.edit', 'transaction.delete',
      'report.view',
      'master.view',
    ],
  },

  // Pimpinan Unit A — hanya view, tidak bisa edit
  'pimpinanunita': {
    id: 5,
    name: 'Budi Santoso',
    email: 'budi@example.com',
    unitId: 1,
    unitName: 'Unit Kantor A',
    permissions: [
      'asset.view',
      'transaction.view',
      'report.view', 'report.export',
    ],
  },
}

// ============================================================
// STORE
// ============================================================

export const useAuthStore = defineStore('auth', () => {
  // State
  const cookie = useCookie<string | null>('mock_user_key')
  const user = ref<AuthUser | null>((cookie.value && MOCK_USERS[cookie.value]) || null)
  const isLoggedIn = computed(() => !!user.value)

  // Apakah user terikat unit tertentu (bukan admin pusat/super admin)
  const isUnitScoped = computed(() =>
    user.value?.unitId !== null && user.value?.unitId !== undefined
  )

  // unitId aktif — dipakai di semua service untuk filter data
  const activeUnitId = computed(() => user.value?.unitId ?? null)

  // ── Permission helpers ──────────────────────────────────
  function can(permission: Permission): boolean {
    return user.value?.permissions.includes(permission) ?? false
  }

  function canAny(permissions: Permission[]): boolean {
    return permissions.some(p => can(p))
  }

  function canAll(permissions: Permission[]): boolean {
    return permissions.every(p => can(p))
  }

  // ── Auth actions ────────────────────────────────────────
  // Nanti diganti: decode JWT dari response API login
  function login(mockUserKey: string): boolean {
    const mockUser = MOCK_USERS[mockUserKey]
    if (!mockUser) return false
    user.value = mockUser
    // Simulasi simpan ke cookie (nanti = simpan JWT token)
    cookie.value = mockUserKey
    return true
  }

  function logout() {
    user.value = null
    cookie.value = null
  }

  return {
    // State
    user,
    isLoggedIn,
    isUnitScoped,
    activeUnitId,

    // Permission
    can,
    canAny,
    canAll,

    // Actions
    login,
    logout,
  }
})