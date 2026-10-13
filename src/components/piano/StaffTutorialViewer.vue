<script setup lang="ts">
import { ref, computed } from 'vue';
import StaffCanvas from './StaffCanvas.vue';
import VirtualKeyboard from './VirtualKeyboard.vue';
import {
  PIANO_TUTORIAL_CHAPTERS,
  TREBLE_STAFF_NOTES,
  BASS_STAFF_NOTES,
  type TutorialChapter,
  type StaffNoteItem
} from '../../data/pianoStaffData';
import { pianoAudio } from '../../utils/pianoAudio';
import { Music2 } from 'lucide-vue-next';

const chapters = PIANO_TUTORIAL_CHAPTERS;
const activeChapterId = ref<string>(chapters[0].id);

const currentChapter = computed<TutorialChapter>(() => {
  return chapters.find(c => c.id === activeChapterId.value) || chapters[0];
});

// Interactive Staff Note Explorer
const selectedClef = ref<'treble' | 'bass'>('treble');
const activeNoteId = ref<string>('treble_C4');

const currentStaffNotes = computed<StaffNoteItem[]>(() => {
  return selectedClef.value === 'treble' ? TREBLE_STAFF_NOTES : BASS_STAFF_NOTES;
});

const currentSelectedNote = computed<StaffNoteItem>(() => {
  return currentStaffNotes.value.find(n => n.id === activeNoteId.value) || currentStaffNotes.value[2];
});

const handleSelectNote = (note: StaffNoteItem) => {
  activeNoteId.value = note.id;
  pianoAudio.playNote(note.pitch);
};

const handleClefChange = (clef: 'treble' | 'bass') => {
  selectedClef.value = clef;
  activeNoteId.value = clef === 'treble' ? 'treble_C4' : 'bass_C3';
  pianoAudio.playNote(clef === 'treble' ? 'C4' : 'C3');
};
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <!-- Chapter Switcher Tabs -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      <button
        v-for="ch in chapters"
        :key="ch.id"
        type="button"
        class="p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-2"
        :class="[
          activeChapterId === ch.id
            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-102'
            : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
        ]"
        @click="activeChapterId = ch.id"
      >
        <div class="flex items-center justify-between">
          <span class="text-xl">{{ ch.icon }}</span>
          <span
            class="text-[10px] font-black px-2 py-0.5 rounded-full"
            :class="activeChapterId === ch.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'"
          >
            {{ ch.badge }}
          </span>
        </div>
        <div>
          <h4 class="text-xs font-black line-clamp-1">{{ ch.title }}</h4>
          <p
            class="text-[10px] font-medium line-clamp-1 mt-0.5"
            :class="activeChapterId === ch.id ? 'text-indigo-100' : 'text-slate-400'"
          >
            {{ ch.subtitle }}
          </p>
        </div>
      </button>
    </div>

    <!-- Chapter Content Card -->
    <div class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200/90 shadow-sm space-y-6">
      <div class="border-b border-slate-100 pb-4">
        <div class="flex items-center gap-2">
          <span class="text-2xl">{{ currentChapter.icon }}</span>
          <div>
            <h3 class="text-lg sm:text-xl font-black text-slate-900">{{ currentChapter.title }}</h3>
            <p class="text-xs text-indigo-600 font-bold mt-0.5">{{ currentChapter.subtitle }}</p>
          </div>
        </div>
        <p class="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mt-3 bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100/70">
          💡 {{ currentChapter.content.lead }}
        </p>
      </div>

      <!-- Sections Grid -->
      <div class="space-y-4">
        <div
          v-for="(sec, idx) in currentChapter.content.sections"
          :key="idx"
          class="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2.5"
        >
          <h4 class="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">
              {{ idx + 1 }}
            </span>
            <span>{{ sec.heading }}</span>
          </h4>
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium pl-8">
            {{ sec.text }}
          </p>

          <div v-if="sec.highlightPoints?.length" class="flex flex-wrap gap-2 pt-1 pl-8">
            <span
              v-for="(pt, pIdx) in sec.highlightPoints"
              :key="pIdx"
              class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs"
            >
              ✓ {{ pt }}
            </span>
          </div>
        </div>
      </div>

      <!-- Rhyme / Mnemonic Songs Card -->
      <div
        v-if="currentChapter.content.rhymes?.length"
        class="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/80 space-y-3"
      >
        <div class="flex items-center gap-2 text-amber-900 font-black text-sm">
          <Music2 class="w-4 h-4 text-amber-600" />
          <span>{{ currentChapter.content.rhymes[0].title }}</span>
        </div>
        <div class="space-y-1.5 pl-2 font-bold text-xs sm:text-sm text-amber-950">
          <p
            v-for="(line, lIdx) in currentChapter.content.rhymes[0].lines"
            :key="lIdx"
            class="flex items-center gap-2"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>{{ line }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Interactive Staff Explorer: Click line/space to hear and inspect! -->
    <div class="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200/90 shadow-sm space-y-5">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 class="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <span>🔍 互动线间探秘台</span>
            <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">点选即响</span>
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">点击下方线/间名称，五线谱与钢琴键立刻同步高亮并演奏真实钢琴音！</p>
        </div>

        <!-- Clef Toggle -->
        <div class="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer transition"
            :class="selectedClef === 'treble' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
            @click="handleClefChange('treble')"
          >
            𝄞 高音谱 (右手)
          </button>
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer transition"
            :class="selectedClef === 'bass' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
            @click="handleClefChange('bass')"
          >
            𝄢 低音谱 (左手)
          </button>
        </div>
      </div>

      <!-- Live Staff Canvas -->
      <div class="p-3 bg-amber-50/20 rounded-2xl border border-amber-100 flex flex-col items-center">
        <StaffCanvas
          :clef="selectedClef"
          :active-note="currentSelectedNote"
          :show-note-name="true"
          :show-position-badge="true"
          :height="170"
        />
      </div>

      <!-- Line & Space Quick Click Tags -->
      <div class="space-y-2">
        <div class="text-xs font-black text-slate-700">👇 点击线与间，听音认谱：</div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="note in currentStaffNotes"
            :key="note.id"
            type="button"
            class="px-3 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5"
            :class="[
              activeNoteId === note.id
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm scale-105'
                : note.isLandmark
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            ]"
            @click="handleSelectNote(note)"
          >
            <span v-if="note.isLandmark">⭐</span>
            <span>{{ note.positionName }}</span>
            <span class="opacity-80">({{ note.pitchClass }} / {{ note.syllable }})</span>
          </button>
        </div>
      </div>

      <!-- Detail Card for Selected Note -->
      <div class="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/70 space-y-1">
        <div class="flex items-center gap-2">
          <span class="text-sm font-black text-indigo-900">
            {{ currentSelectedNote.positionName }} ＝ {{ currentSelectedNote.pitch }} ({{ currentSelectedNote.syllable }} / {{ currentSelectedNote.syllableZh }})
          </span>
          <span v-if="currentSelectedNote.isLandmark" class="text-xs bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
            核心地标音
          </span>
        </div>
        <p class="text-xs text-indigo-950/80 font-medium">
          💡 {{ currentSelectedNote.tip }}
        </p>
        <p class="text-xs text-indigo-900 font-bold">
          🗣️ 口诀：{{ currentSelectedNote.mnemonic }}
        </p>
      </div>

      <!-- Keyboard Anchor -->
      <VirtualKeyboard
        :highlight-pitch="currentSelectedNote.pitch"
        @key-press="(p) => {
          const found = currentStaffNotes.find(n => n.pitch === p);
          if (found) activeNoteId = found.id;
        }"
      />
    </div>
  </div>
</template>

