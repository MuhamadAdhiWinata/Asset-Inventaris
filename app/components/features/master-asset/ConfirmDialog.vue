<!-- components/features/master-asset/ConfirmDialog.vue -->
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="emit('cancel')"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="emit('cancel')" />

        <!-- Dialog -->
        <div class="relative bg-background border rounded-xl shadow-xl w-full max-w-md p-6">
          <!-- Icon -->
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-destructive/10">
              <AlertTriangleIcon class="h-5 w-5 text-destructive" />
            </div>

            <div class="flex-1 min-w-0">
              <h2 class="text-base font-semibold">{{ title }}</h2>
              <p class="text-sm text-muted-foreground mt-1">{{ description }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 mt-6">
            <button
              type="button"
              :disabled="loading"
              @click="emit('cancel')"
              class="inline-flex items-center justify-center h-10 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              Batal
            </button>
            <button
              type="button"
              :disabled="loading"
              @click="emit('confirm')"
              class="inline-flex items-center gap-2 justify-center h-10 px-4 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <Loader2Icon v-if="loading" class="h-4 w-4 animate-spin" />
              Hapus
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { AlertTriangleIcon, Loader2Icon } from 'lucide-vue-next'

interface Props {
  isOpen: boolean
  title: string
  description: string
  loading?: boolean
}

withDefaults(defineProps<Props>(), { loading: false })

const emit = defineEmits<{
  confirm: []
  cancel:  []
}>()
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .relative { transition: transform 0.15s ease, opacity 0.15s ease; }
.modal-enter-from .relative { transform: scale(0.97) translateY(4px); opacity: 0; }
</style>