<script setup lang="ts">
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import ProfileSwitcherModal from './components/common/ProfileSwitcherModal.vue';
import { useUserStore } from './stores/useUserStore';

const userStore = useUserStore();
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#FDFBF7] font-sans antialiased text-gray-800">
    <Navbar />
    <!-- Added pb-20 on mobile so bottom bar never overlaps content -->
    <main class="flex-1 pb-20 lg:pb-0">
      <router-view />
    </main>
    <!-- Hidden footer on mobile to keep view compact and neat -->
    <Footer class="hidden lg:block" />

    <!-- Global Profile Switcher / Creation Modal -->
    <ProfileSwitcherModal
      :isOpen="userStore.isProfileModalOpen"
      @close="userStore.closeProfileModal"
    />
  </div>
</template>
