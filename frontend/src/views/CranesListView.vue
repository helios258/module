<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCranes } from '../composables/useCranes';
import CraneCard from '../components/CraneCard.vue';

const router = useRouter();
const route = useRoute();

const filters = ref({
  search: (route.query.search as string) || '',
  status: (route.query.status as string) || 'All',
  sortBy: (route.query.sortBy as string) || '',
  sortOrder: (route.query.sortOrder as string) || 'asc'
});

const { data: cranes, isLoading, isError } = useCranes();

watch(filters, (newVal) => {
  router.push({ query: { ...newVal } });
}, { deep: true });

const resetFilters = () => {
  filters.value = { search: '', status: 'All', sortBy: '', sortOrder: 'asc' };
};
</script>

<template>
  <div class="max-w-7xl mx-auto p-6 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Реєстр мостових кранів</h1>
      <router-link to="/cranes/new" class="btn btn-primary">+ Додати кран</router-link>
    </div>

    <div class="card bg-base-100 shadow-sm border border-base-300 p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          v-model="filters.search"
          type="text"
          placeholder="Шифр або цех..."
          class="input input-bordered w-full"
        />
        <select v-model="filters.status" class="select select-bordered w-full">
          <option value="All">Всі стани</option>
          <option value="ready">Готові</option>
          <option value="in_maintenance">На обслуговуванні</option>
          <option value="critical">Критичні</option>
        </select>
        <select v-model="filters.sortBy" class="select select-bordered w-full">
          <option value="">Без сортування</option>
          <option value="capacity">За вантажопідйомністю</option>
          <option value="year">За роком введення</option>
        </select>
        <select v-model="filters.sortOrder" class="select select-bordered w-full" :disabled="!filters.sortBy">
          <option value="asc">За зростанням</option>
          <option value="desc">За спаданням</option>
        </select>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <div v-else-if="isError" class="alert alert-error">
      <span>Помилка завантаження даних із сервера. Перевірте підключення до API.</span>
    </div>

    <div v-else-if="!cranes || cranes.length === 0" class="card bg-base-100 p-10 text-center shadow-sm">
      <h3 class="text-xl font-semibold mb-2">Кранів не знайдено</h3>
      <p class="text-base-content/70 mb-4">Спробуйте змінити параметри пошуку або додайте нове обладнання.</p>
      <div class="flex justify-center gap-3">
        <button @click="resetFilters" class="btn btn-outline">Скинути фільтри</button>
        <router-link to="/cranes/new" class="btn btn-primary">Додати кран</router-link>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CraneCard v-for="crane in cranes" :key="crane.id" :crane="crane" />
    </div>
  </div>
</template>
