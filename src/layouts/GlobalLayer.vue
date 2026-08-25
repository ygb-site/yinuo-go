<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import GlobalLoadingBar from '../components/common/GlobalLoadingBar.vue';
import CartoonAlertModal from '../components/common/CartoonAlertModal.vue';
import AuthModal from '../components/common/AuthModal.vue';
import ProfileSwitcherModal from '../components/common/ProfileSwitcherModal.vue';
import UnlockCelebrationModal from '../components/common/UnlockCelebrationModal.vue';
import AiTutorFloatModal from '../components/common/AiTutorFloatModal.vue';
import { useUserStore } from '../stores/useUserStore';
import FontStudioModal from '../components/common/FontStudioModal.vue';

const route = useRoute();
const userStore = useUserStore();

const showAiTutor = computed(() => {
  return route.meta.aiTutor !== false;
});
</script>

<template>
  <div class="global-layer">
    <!-- Global Loading Progress Bar -->
    <GlobalLoadingBar />

    <!-- AI Tutor Floating Assistant Modal -->
    <AiTutorFloatModal v-if="showAiTutor" />

    <!-- Global Profile Switcher / Creation Modal -->
    <ProfileSwitcherModal
      :is-open="userStore.isProfileModalOpen"
      @close="userStore.closeProfileModal"
    />

    <!-- Global Parent Cloud Auth / Multi-Device Sync Modal -->
    <AuthModal
      :is-open="userStore.showAuthModal"
      @close="userStore.closeAuthModal"
    />

    <!-- Global Milestone / Feature Unlock Celebration Modal -->
    <UnlockCelebrationModal />

    <!-- Global Cartoon Alert / Confirm Modal -->
    <CartoonAlertModal />

    <!-- Global Font Studio & Layout Center Modal -->
    <FontStudioModal />
  </div>
</template>


