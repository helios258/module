<script setup lang="ts">
import { Crane } from '../types/crane.types';
import StatusBadge from './StatusBadge.vue';

defineProps<{ crane: Crane }>();
</script>

<template>
  <router-link
    :to="`/cranes/${crane.id}`"
    class="card bg-base-100 shadow-sm border border-base-300 hover:shadow-md transition-shadow"
  >
    <div class="card-body">
      <div class="flex justify-between items-start gap-2">
        <h2 class="card-title">{{ crane.code }}</h2>
        <StatusBadge :status="crane.status" />
      </div>
      <p class="text-sm opacity-80"><strong>Цех:</strong> {{ crane.workshop }}</p>
      <p class="text-sm opacity-80"><strong>Вантажопідйомність:</strong> {{ crane.maxCapacityTons }} т</p>
      <p class="text-sm opacity-80"><strong>Рік введення:</strong> {{ crane.commissioningYear }}</p>
    </div>
  </router-link>
</template>
