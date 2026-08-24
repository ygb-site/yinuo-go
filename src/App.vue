<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import ProfileSwitcherModal from './components/common/ProfileSwitcherModal.vue';
import CartoonAlertModal from './components/common/CartoonAlertModal.vue';
import UnlockCelebrationModal from './components/common/UnlockCelebrationModal.vue';
import AuthModal from './components/common/AuthModal.vue';
import AiTutorFloatModal from './components/common/AiTutorFloatModal.vue';
import { useUserStore } from './stores/useUserStore';

const userStore = useUserStore();
const route = useRoute();

const isImmersiveView = computed(() => route.path.startsWith('/lesson/'));

onMounted(() => {
  userStore.initCloudSession();
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#FDFBF7] font-sans antialiased text-gray-800">
    <Navbar />
    <!-- Hide bottom pb on immersive lesson view so content fits within 1 screen -->
    <main class="flex-1" :class="isImmersiveView ? 'pb-2 lg:pb-0' : 'pb-24 lg:pb-6'">
      <router-view />
    </main>
    <!-- Hidden footer on mobile to keep view compact and neat -->
    <Footer class="hidden lg:block" />

    <!-- Global AI Tutor Assistant Floating Button & Modal -->
    <AiTutorFloatModal />

    <!-- Global Profile Switcher / Creation Modal -->
    <ProfileSwitcherModal
      :isOpen="userStore.isProfileModalOpen"
      @close="userStore.closeProfileModal"
    />

    <!-- Global Parent Cloud Auth / Multi-Device Sync Modal -->
    <AuthModal
      :isOpen="userStore.showAuthModal"
      @close="userStore.closeAuthModal"
    />

    <!-- Global Milestone / Feature Unlock Celebration Modal -->
    <UnlockCelebrationModal />

    <!-- Global Cute Cartoon Alert / Confirm Modal -->
    <CartoonAlertModal />
  </div>
</template>
