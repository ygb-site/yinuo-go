<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import NoteQuizGame from '../components/piano/NoteQuizGame.vue';
import MusicTheoryViewer from '../components/piano/MusicTheoryViewer.vue';
import VirtualKeyboard from '../components/piano/VirtualKeyboard.vue';
import StaffCanvas from '../components/piano/StaffCanvas.vue';
import { TREBLE_STAFF_NOTES, BASS_STAFF_NOTES, type StaffNoteItem } from '../data/pianoStaffData';
import { sound } from '../utils/sound';
import {
  Music,
  BookOpen,
  Gamepad2,
  Sparkles,
  ChevronLeft
} from 'lucide-vue-next';

const router = useRouter();

type TabType = 'quiz' | 'theory' | 'play';
const activeTab = ref<TabType>('quiz');

// Free play note state
const freePlayNote = ref<StaffNoteItem>(TREBLE_STAFF_NOTES[2]); // C4
const freePlayClef = ref<'treble' | 'bass'>('treble');

const handleKeyboardNote = (pitch: string) => {
  const found = TREBLE_STAFF_NOTES.find(n => n.pitch === pitch) || BASS_STAFF_NOTES.find(n => n.pitch === pitch);
  if (found) {
    freePlayNote.value = found;
    freePlayClef.value = found.clef;
  }
};

const goBackHome = () => {
  sound.playButtonSound();
  router.push('/');
};
</script>

<template>
  <div class="min-h-screen bg-[#F6F3EB] pb-16 pt-4 px-3 sm:px-6">
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Top Navigation & Header Banner -->
      <div class="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
        <!-- Background decorative notes -->
        <div class="absolute -right-6 -bottom-6 text-indigo-700/30 text-9xl font-serif pointer-events-none select-none">
          𝄞
        </div>

        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition backdrop-blur-xs"
              @click="goBackHome"
            >
              <ChevronLeft class="w-5 h-5" />
            </button>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-2xl">🎹</span>
                <h1 class="text-xl sm:text-2xl font-black tracking-tight">一诺钢琴识谱乐园</h1>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wide">
                  小汤 · 拜厄 · 乐理宝典
                </span>
              </div>
              <p class="text-xs sm:text-sm text-indigo-200 mt-1 font-medium">
                符干朝向规律 · 全面乐理知识 · ABCD 音符竞猜 · 88键真钢全键盘
              </p>
            </div>
          </div>

          <!-- Feature Tag Pills -->
          <div class="flex items-center gap-2 text-xs font-black">
            <span class="px-3 py-1 rounded-xl bg-white/15 text-indigo-100 border border-white/10 flex items-center gap-1">
              <Sparkles class="w-3.5 h-3.5 text-amber-300" />
              <span>专治认谱慢</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Main Navigation Tabs (3 Clean Tabs) -->
      <div class="flex items-center p-1.5 bg-white rounded-2xl border-2 border-slate-200/80 shadow-xs max-w-lg mx-auto">
        <button
          type="button"
          class="flex-1 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
          :class="[
            activeTab === 'quiz'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          ]"
          @click="activeTab = 'quiz'; sound.playButtonSound();"
        >
          <Gamepad2 class="w-4 h-4" />
          <span>识谱大闯关</span>
        </button>

        <button
          type="button"
          class="flex-1 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
          :class="[
            activeTab === 'theory'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          ]"
          @click="activeTab = 'theory'; sound.playButtonSound();"
        >
          <BookOpen class="w-4 h-4" />
          <span>乐理知识宝典</span>
        </button>

        <button
          type="button"
          class="flex-1 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
          :class="[
            activeTab === 'play'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          ]"
          @click="activeTab = 'play'; sound.playButtonSound();"
        >
          <Music class="w-4 h-4" />
          <span>自由琴房看谱</span>
        </button>
      </div>

      <!-- Tab 1: Quiz Mini-game (Requested from User Image) -->
      <div v-if="activeTab === 'quiz'" class="animate-fade-in">
        <NoteQuizGame />
      </div>

      <!-- Tab 2: Comprehensive Music Theory Viewer (Requested: 包含符干指向等全面乐理知识) -->
      <div v-else-if="activeTab === 'theory'" class="animate-fade-in">
        <MusicTheoryViewer />
      </div>

      <!-- Tab 3: Free Piano & Staff Playground (88 keys) -->
      <div v-else class="animate-fade-in space-y-6">
        <div class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200/90 shadow-sm space-y-6 max-w-2xl mx-auto">
          <div class="text-center space-y-1">
            <h3 class="text-lg font-black text-slate-900">自由弹琴与实时识谱联动</h3>
            <p class="text-xs text-slate-500 font-medium">
              在下方点击任意琴键，听真实琴声，上方五线谱将实时为你画出它对应的线与间！
            </p>
          </div>

          <!-- Staff Display -->
          <div class="p-4 bg-amber-50/20 rounded-2xl border border-amber-100 flex flex-col items-center">
            <StaffCanvas
              :clef="freePlayClef"
              :active-note="freePlayNote"
              :show-note-name="true"
              :show-position-badge="true"
              :height="170"
            />
          </div>

          <!-- Mnemonic summary badge -->
          <div class="p-3.5 rounded-2xl bg-indigo-50 text-indigo-900 border border-indigo-200 text-center text-xs font-bold">
            <span>💡 {{ freePlayNote.positionName }}：{{ freePlayNote.mnemonic }}</span>
          </div>

          <!-- Virtual Keyboard (88 keys) -->
          <VirtualKeyboard
            :highlight-pitch="freePlayNote.pitch"
            @key-press="handleKeyboardNote"
          />
        </div>
      </div>
    </div>
  </div>
</template>

