<template>
  <div class="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background text-foreground">
    <div class="w-full max-w-sm">
      <div class="flex flex-col gap-6">
        <form @submit.prevent="handleLogin" class="flex flex-col gap-6">
          <Card class="border-border shadow-sm">
            <CardContent class="py-8">
              <div class="flex flex-col items-center gap-2 text-center pb-6">
                <div class="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-2">
                  <img src="../assets/vue.svg" alt="Logo" class="h-10 w-10" />
                </div>
                <div>
                  <h1 class="text-xl font-bold text-card-foreground">Inventaris Asset</h1>
                  <p class="text-xs text-muted-foreground uppercase tracking-widest">-</p>
                </div>
              </div>

              <!-- Dev hint: mock user keys -->
              <div class="mb-6 p-3 bg-primary/5 rounded-lg border border-primary/10 space-y-1">
                <p class="text-[11px] text-primary text-center font-medium mb-2">Mock Users (dev only)</p>
                <div class="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-muted-foreground">
                  <span class="font-mono font-medium text-foreground">superadmin</span><span>Super Admin</span>
                  <span class="font-mono font-medium text-foreground">adminpusat</span><span>Admin Pusat</span>
                  <span class="font-mono font-medium text-foreground">adminunita</span><span>Admin Unit A</span>
                  <span class="font-mono font-medium text-foreground">adminunitb</span><span>Admin Unit B</span>
                  <span class="font-mono font-medium text-foreground">pimpinanunita</span><span>Pimpinan Unit A</span>
                </div>
                <p class="text-[11px] text-primary text-center font-medium mt-2">password: <b>123456</b></p>
              </div>

              <div class="grid gap-5">
                <div class="grid gap-2">
                  <Label for="username" class="text-sm font-medium">Username</Label>
                  <Input
                    id="username"
                    v-model="formData.username"
                    type="text"
                    placeholder="Masukkan username"
                    :class="{ 'border-destructive focus-visible:ring-destructive': errors.username }"
                    :disabled="submitting"
                  />
                  <p v-if="errors.username" class="text-[11px] text-destructive font-medium">
                    {{ errors.username }}
                  </p>
                </div>

                <div class="grid gap-2">
                  <Label for="password" class="text-sm font-medium">Password</Label>
                  <div class="relative">
                    <Input
                      id="password"
                      v-model="formData.password"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="Masukkan password"
                      :class="{ 'border-destructive focus-visible:ring-destructive': errors.password }"
                      :disabled="submitting"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      class="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      @click="showPassword = !showPassword"
                      :disabled="submitting"
                    >
                      <Eye v-if="!showPassword" class="h-4 w-4 text-muted-foreground" />
                      <EyeOff v-else class="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                  <p v-if="errors.password" class="text-[11px] text-destructive font-medium">
                    {{ errors.password }}
                  </p>
                </div>

                <!-- Error login -->
                <p v-if="loginError" class="text-[11px] text-destructive font-medium text-center -mt-2">
                  {{ loginError }}
                </p>

                <Button
                  type="submit"
                  class="w-full bg-primary text-primary-foreground hover:opacity-90 h-11 transition-opacity"
                  :disabled="submitting"
                >
                  <span v-if="submitting" class="h-4 w-4 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></span>
                  {{ submitting ? 'Memproses...' : 'Masuk' }}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div class="text-center text-xs text-muted-foreground">
            Belum Punya Akun?
            <button type="button" class="font-bold text-primary hover:underline ml-1">
              Hubungi Bagian Pusat
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/useAuthStore'

definePageMeta({ layout: 'auth' })

const authStore = useAuthStore()

// Redirect jika sudah login
if (authStore.isLoggedIn) {
  await navigateTo('/dashboard')
}

const submitting  = ref(false)
const showPassword = ref(false)
const loginError  = ref('')

const formData = reactive({ username: '', password: '' })
const errors   = reactive({ username: '', password: '' })

// Password mock — sama untuk semua user di dev
const MOCK_PASSWORD = '123456'

function validateForm(): boolean {
  errors.username = ''
  errors.password = ''
  let isValid = true

  if (!formData.username.trim()) {
    errors.username = 'Username wajib diisi'
    isValid = false
  }
  if (!formData.password.trim()) {
    errors.password = 'Password wajib diisi'
    isValid = false
  }
  return isValid
}

async function handleLogin() {
  if (!validateForm()) return

  submitting.value = true
  loginError.value = ''

  // Simulasi network delay
  await new Promise(resolve => setTimeout(resolve, 800))

  // Validasi password mock
  if (formData.password !== MOCK_PASSWORD) {
    loginError.value = 'Username atau password salah.'
    submitting.value = false
    return
  }

  // Login via authStore — cukup ganti ini dengan $fetch('/api/login') nanti
  const success = authStore.login(formData.username)

  if (success) {
    await navigateTo('/dashboard')
  } else {
    loginError.value = 'Username atau password salah.'
  }

  submitting.value = false
}
</script>