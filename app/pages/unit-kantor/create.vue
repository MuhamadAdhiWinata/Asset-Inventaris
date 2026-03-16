<!-- pages/unit-kantor/create.vue -->
<template>
  <main class="p-4 md:px-6">
    <UnitKantorForm
      :initial-data="null"
      :submitting="submitting"
      @submit="handleSubmit"
    />
  </main>
</template>

<script setup lang="ts">
import { unitKantorService, type UnitKantorFormData } from '@/services/unitKantorService'
import UnitKantorForm from '@/components/features/unit-kantor/UnitKantorForm.vue'

definePageMeta({
  layout: 'default',
  middleware: ['permission'],
  requiredPermission: 'unit.manage',
})

const submitting = ref(false)

async function handleSubmit(data: UnitKantorFormData) {
  submitting.value = true
  try {
    await unitKantorService.createItem(data)
    await navigateTo('/unit-kantor')
  } catch (err) {
    console.error('handleSubmit error:', err)
  } finally {
    submitting.value = false
  }
}
</script>