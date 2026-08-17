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
    <main class="flex-1">
      <router-view />
    </main>
    <Footer />

    <!-- Global Profile Switcher / Creation Modal -->
    <ProfileSwitcherModal
      :isOpen="userStore.isProfileModalOpen"
      @close="userStore.closeProfileModal"
    />
  </div>
</template>

