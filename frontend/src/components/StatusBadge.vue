<script setup lang="ts">
import { CraneStatus } from '../types/crane.types';

defineProps<{ status: CraneStatus }>();

const statusConfig: Record<CraneStatus, { label: string; badgeClass: string }> = {
  ready: { label: 'Готовий', badgeClass: 'badge-success' },
  in_maintenance: { label: 'На обслуговуванні', badgeClass: 'badge-warning' },
  critical: { label: 'Критичний', badgeClass: 'badge-error' }
};
</script>

<template>
  <span class="badge font-semibold" :class="statusConfig[status]?.badgeClass">
    {{ statusConfig[status]?.label }}
  </span>
</template>
