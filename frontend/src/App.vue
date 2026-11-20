<template>
  <div class="min-h-screen bg-base-200 text-base-content">
    <div class="navbar bg-base-100 shadow-sm px-6">
      <div class="flex-1">
        <router-link to="/cranes" class="btn btn-ghost text-xl font-bold">🏭 Диспетчер кранів</router-link>
      </div>
      <div class="flex-none gap-2">
        <router-link to="/cranes" class="btn btn-ghost btn-sm">Реєстр</router-link>
        <router-link to="/cranes/new" class="btn btn-primary btn-sm">+ Новий кран</router-link>
      </div>
    </div>
    <main>
      <router-view />
    </main>
  </div>
</template>
