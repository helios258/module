<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';
import { useCraneDetails } from '../composables/useCranes';
import { craneService } from '../services/craneService';
import { ComponentType } from '../types/crane.types';
import StatusBadge from '../components/StatusBadge.vue';

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();
const craneId = route.params.id as string;

const { data, isLoading, isError, addInspection } = useCraneDetails(craneId);

watch(isError, (err) => {
  if (err) router.replace('/not-found');
});

const newLog = ref<{
  inspectionDate: string;
  inspector: string;
  componentType: ComponentType;
  wearPercentage: number;
  notes: string;
}>({
  inspectionDate: new Date().toISOString().split('T')[0],
  inspector: '',
  componentType: 'cable',
  wearPercentage: 0,
  notes: ''
});

const submitInspection = () => {
  addInspection.mutate({ ...newLog.value });
  newLog.value.inspector = '';
  newLog.value.wearPercentage = 0;
  newLog.value.notes = '';
};

const handleDeleteCrane = async () => {
  if (!window.confirm('Видалити цей кран та всі його акти огляду?')) return;
  await craneService.delete(craneId);
  queryClient.invalidateQueries({ queryKey: ['cranes'] });
  router.push('/cranes');
};

const handleDeleteInspection = async (logId: string) => {
  await craneService.deleteInspection(logId);
  queryClient.invalidateQueries({ queryKey: ['crane', craneId] });
  queryClient.invalidateQueries({ queryKey: ['cranes'] });
};

const componentLabels: Record<ComponentType, string> = {
  cable: 'Вантажний трос',
  brake: 'Гальмівний шків',
  hook: 'Гакова підвіска'
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <div v-if="isLoading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <template v-else-if="data">
      <div class="card bg-base-100 shadow-sm border border-base-300 p-6">
        <div class="flex flex-wrap justify-between items-start gap-4">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-3xl font-bold">{{ data.crane.code }}</h1>
              <StatusBadge :status="data.crane.status" />
            </div>
            <p class="opacity-70 mt-1">{{ data.crane.workshop }} • {{ data.crane.maxCapacityTons }} т • {{ data.crane.commissioningYear }} р.</p>
          </div>
          <div class="flex gap-2">
            <router-link :to="`/cranes/${craneId}/edit`" class="btn btn-outline btn-sm">Редагувати</router-link>
            <button @click="handleDeleteCrane" class="btn btn-error btn-sm">Видалити кран</button>
          </div>
        </div>

        <div class="stats stats-vertical lg:stats-horizontal shadow-sm bg-base-200 mt-6 w-full">
          <div class="stat">
            <div class="stat-title">Залишок безпечного ресурсу</div>
            <div class="stat-value text-xl">{{ Math.max(0, 100 - data.metrics.averageWear) }}%</div>
          </div>
          <div class="stat">
            <div class="stat-title">Середній знос вузлів</div>
            <div class="stat-value text-xl">{{ data.metrics.averageWear }}%</div>
          </div>
          <div class="stat">
            <div class="stat-title">Найбільш зношений вузол</div>
            <div class="stat-value text-xl">
              {{ data.metrics.mostWornComponent ? `${componentLabels[data.metrics.mostWornComponent.componentType]} (${data.metrics.mostWornComponent.wearPercentage}%)` : 'Немає даних' }}
            </div>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 shadow-sm border border-base-300 p-6">
        <h2 class="text-xl font-bold mb-4">Додати акт технічного огляду</h2>
        <form @submit.prevent="submitInspection" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input v-model="newLog.inspectionDate" type="date" required class="input input-bordered w-full" />
          <input v-model="newLog.inspector" placeholder="ПІБ / табельний № експерта" minlength="3" required class="input input-bordered w-full" />
          <select v-model="newLog.componentType" class="select select-bordered w-full">
            <option value="cable">Вантажний трос</option>
            <option value="brake">Гальмівний шків</option>
            <option value="hook">Гакова підвіска</option>
          </select>
          <input v-model.number="newLog.wearPercentage" type="number" min="0" max="100" placeholder="Відсоток зносу (0-100)" required class="input input-bordered w-full" />
          <input v-model="newLog.notes" maxlength="300" placeholder="Текстовий висновок (до 300 символів)" class="input input-bordered w-full md:col-span-2" />
          <button type="submit" class="btn btn-primary md:col-span-2">Зберегти акт огляду</button>
        </form>
      </div>

      <div class="card bg-base-100 shadow-sm border border-base-300 p-6">
        <h2 class="text-xl font-bold mb-4">Журнал дефектоскопії ({{ data.inspections.length }})</h2>
        <div v-if="data.inspections.length === 0" class="opacity-60">Актів огляду ще немає.</div>
        <div v-else class="space-y-3">
          <div v-for="log in data.inspections" :key="log.id" class="p-4 rounded-lg bg-base-200 flex justify-between items-center gap-4">
            <div>
              <div class="font-bold">{{ log.inspectionDate }} — {{ componentLabels[log.componentType] }}</div>
              <div class="text-sm opacity-80">Експерт: {{ log.inspector }}</div>
              <div v-if="log.notes" class="text-sm mt-1 italic">{{ log.notes }}</div>
            </div>
            <div class="flex items-center gap-4">
              <span class="badge badge-lg font-bold" :class="log.wearPercentage >= 80 ? 'badge-error' : log.wearPercentage >= 50 ? 'badge-warning' : 'badge-success'">
                {{ log.wearPercentage }}%
              </span>
              <button @click="handleDeleteInspection(log.id)" class="btn btn-ghost btn-xs text-error">✕</button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
