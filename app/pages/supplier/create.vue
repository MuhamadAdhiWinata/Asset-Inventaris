<!-- pages/supplier/create.vue -->
<template>
  <main class="p-4 md:px-6">
    <SupplierForm
      :initial-data="null"
      :submitting="submitting"
      @submit="handleSubmit"
    />
  </main>
</template>

<script setup lang="ts">
import { supplierService, type SupplierFormData } from '@/services/supplierService'
import SupplierForm from '@/components/features/supplier/SupplierForm.vue'

definePageMeta({
  layout: 'default',
  middleware: ['permission'],
  requiredPermission: 'master.create',
})

const submitting = ref(false)

async function handleSubmit(data: SupplierFormData) {
  submitting.value = true
  try {
    await supplierService.createItem(data)
    await navigateTo('/supplier')
  } catch (err) {
    console.error('handleSubmit error:', err)
  } finally {
    submitting.value = false
  }
}
</script>