<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { onBeforeRouteLeave, useRouter, useRoute } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';
import { craneService } from '../services/craneService';

const router = useRouter();
const route = useRoute();
const queryClient = useQueryClient();
const isEditMode = computed(() => Boolean(route.params.id));

const isDirty = ref(false);
const serverErrors = ref<string[]>([]);
const form = ref({
  code: '',
  workshop: '',
  maxCapacityTons: 10,
  commissioningYear: new Date().getFullYear()
});

onMounted(async () => {
  if (isEditMode.value) {
    try {
      const data = await craneService.getById(route.params.id as string);
      form.value = {
        code: data.crane.code,
        workshop: data.crane.workshop,
        maxCapacityTons: data.crane.maxCapacityTons,
        commissioningYear: data.crane.commissioningYear
      };
    } catch {
      router.replace('/not-found');
    }
  }
});

onBeforeRouteLeave(() => {
  if (isDirty.value && !window.confirm('У вас є незбережені зміни. Ви дійсно хочете покинути сторінку?')) {
    return false;
  }
});

const submitForm = async () => {
  serverErrors.value = [];
  try {
    if (isEditMode.value) {
      await craneService.update(route.params.id as string, form.value);
    } else {
      await craneService.create(form.value);
    }
    isDirty.value = false;
    queryClient.invalidateQueries({ queryKey: ['cranes'] });
    router.push('/cranes');
  } catch (err: any) {
    serverErrors.value = err.response?.data?.errors || ['Помилка збереження даних'];
  }
};
</script>

<template>
  <div class="max-w-xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">{{ isEditMode ? 'Редагувати кран' : 'Новий мостовий кран' }}</h1>

    <div v-if="serverErrors.length" class="alert alert-error mb-4">
      <ul class="list-disc list-inside text-sm">
        <li v-for="e in serverErrors" :key="e">{{ e }}</li>
      </ul>
    </div>

    <form @input="isDirty = true" @submit.prevent="submitForm" class="card bg-base-100 shadow-sm border border-base-300 p-6 space-y-4">
      <div class="form-control">
        <label class="label"><span class="label-text">Інвентарний шифр (4–12 символів)</span></label>
        <input v-model="form.code" required minlength="4" maxlength="12" placeholder="CR-104-A" class="input input-bordered w-full" />
      </div>

      <div class="form-control">
        <label class="label"><span class="label-text">Цех</span></label>
        <input v-model="form.workshop" required placeholder="Ливарний цех №2" class="input input-bordered w-full" />
      </div>

      <div class="form-control">
        <label class="label"><span class="label-text">Вантажопідйомність (1–250 т)</span></label>
        <input v-model.number="form.maxCapacityTons" type="number" min="1" max="250" required class="input input-bordered w-full" />
      </div>

      <div class="form-control">
        <label class="label"><span class="label-text">Рік введення в експлуатацію</span></label>
        <input v-model.number="form.commissioningYear" type="number" min="1980" :max="new Date().getFullYear()" required class="input input-bordered w-full" />
      </div>

      <div class="pt-4 flex gap-3">
        <button type="submit" class="btn btn-primary flex-1">Зберегти</button>
        <router-link to="/cranes" class="btn btn-ghost">Скасувати</router-link>
      </div>
    </form>
  </div>
</template>
