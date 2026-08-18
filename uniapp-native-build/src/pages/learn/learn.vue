<script setup lang="ts">
import { ref } from 'vue';
import Navbar from '../../components/Navbar.vue';
import { CHAPTERS_DATA, type Lesson } from '../../data/chapters';
import { useUserStore } from '../../stores/userStore';
import { sound } from '../../utils/sound';
import {
  Star,
  Lock,
  Play,
  Gamepad2,
  Coins
} from 'lucide-vue-next';

const userStore = useUserStore();
const activeChapterId = ref<number>(1);

const selectChapter = (id: number) => {
  activeChapterId.value = id;
  sound.playButtonSound();
};

const isLessonUnlocked = (lessonId: string): boolean => {
  if (lessonId === 'lesson_1_1' || lessonId === 'c1_l1') return true;
  const allLessons: Lesson[] = [];
  for (const c of CHAPTERS_DATA) {
    allLessons.push(...c.lessons);
  }
  const idx = allLessons.findIndex(l => l.id === lessonId);
  if (idx <= 0) return true;
  const prevLesson = allLessons[idx - 1];
  return !!userStore.progress[prevLesson.id]?.completed;
};

const getLessonStars = (lessonId: string): number => {
  const rec = userStore.progress[lessonId];
  return rec ? rec.stars : 0;
};

const startLesson = (lesson: Lesson) => {
  if (!isLessonUnlocked(lesson.id)) {
    sound.playErrorSound();
    uni.showToast({ title: '请先通关上一关解锁哦！', icon: 'none' });
    return;
  }
  sound.playButtonSound();
  uni.navigateTo({ url: '/pages/lesson/lesson?id=' + lesson.id });
};
</script>

<template>
  <view class="min-h-screen bg-[#FDFBF7] flex flex-col font-sans select-none pb-24">
    <Navbar />

    <view class="flex-1 py-3 px-3 sm:px-6">
      <view class="max-w-6xl mx-auto space-y-4">

        <!-- Header Hero Card (1:1 with Web) -->
        <view class="bg-white rounded-3xl p-4 sm:p-6 border-2 border-orange-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <view class="space-y-1.5 text-center sm:text-left">
            <view class="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-black">
              <Gamepad2 class="w-3.5 h-3.5 text-orange-800" />
              <text>少儿启蒙闯关大冒险 (Adventure Map)</text>
            </view>
            <view class="text-2xl sm:text-3xl font-cartoon font-bold text-gray-900">
              围棋小精灵成长之路
            </view>
            <view class="text-xs sm:text-sm text-gray-600 font-medium">
              跟着萌宠小诺一起闯关，从认识星位到掌握绝妙吃子手筋，收集满天繁星！
            </view>
          </view>

          <!-- User Stats Pill Header -->
          <view class="flex items-center gap-4 bg-amber-50 rounded-2xl p-3 border border-amber-200 shadow-2xs flex-shrink-0">
            <view class="text-center">
              <view class="text-[10px] font-extrabold text-amber-700">收集星星</view>
              <view class="text-xl sm:text-2xl font-black text-amber-900 flex items-center justify-center gap-1">
                <Star class="w-4 h-4 text-amber-500 fill-current" />
                <text>{{ userStore.totalStars || 3 }}</text>
              </view>
            </view>
            <view class="w-px h-7 bg-amber-200"></view>
            <view class="text-center">
              <view class="text-[10px] font-extrabold text-amber-700">金币奖励</view>
              <view class="text-xl sm:text-2xl font-black text-amber-900 flex items-center justify-center gap-1">
                <Coins class="w-4 h-4 text-amber-500" />
                <text>{{ userStore.coins || 180 }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- Horizontal Chapter Scrollable Tabs -->
        <scroll-view class="flex items-center gap-2 overflow-x-auto py-1 whitespace-nowrap" scroll-x="true">
          <view
            v-for="chap in CHAPTERS_DATA"
            :key="`mobile-chap-${chap.id}`"
            @click="selectChapter(chap.id)"
            class="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-black mr-2 cursor-pointer active:scale-95"
            :class="
              activeChapterId === chap.id
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-md'
                : 'bg-white text-gray-700 border-orange-200/80 shadow-2xs'
            "
          >
            <text class="text-base">{{ chap.icon }}</text>
            <text>第{{ chap.id }}章 ({{ chap.lessons.length }}关)</text>
          </view>
        </scroll-view>

        <!-- Current Chapter Adventure Path Grid -->
        <view
          v-for="chap in CHAPTERS_DATA"
          :key="`map-${chap.id}`"
          v-show="activeChapterId === chap.id"
          class="space-y-4"
        >
          <!-- Chapter Header Banner -->
          <view class="bg-gradient-to-r rounded-3xl p-4 sm:p-6 text-white shadow-md" :class="chap.themeColor">
            <view class="text-[11px] font-black uppercase opacity-90">{{ chap.titleEn }}</view>
            <view class="text-xl sm:text-2xl font-cartoon font-bold mt-0.5">{{ chap.title }}</view>
            <view class="text-xs font-medium opacity-90 mt-1 max-w-xl">
              {{ chap.description }}
            </view>
          </view>

          <!-- Lessons Cards Path Grid -->
          <view class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <view
              v-for="(lesson, idx) in chap.lessons"
              :key="lesson.id"
              @click="startLesson(lesson)"
              class="rounded-3xl p-4 sm:p-5 border-2 transition-all flex flex-col justify-between cursor-pointer active:scale-98"
              :class="
                isLessonUnlocked(lesson.id)
                  ? 'bg-white border-gray-100 shadow-sm'
                  : 'bg-gray-50/75 border-gray-200 opacity-60'
              "
            >
              <!-- Top Row: Index Badge, Type Tag & Star Rating -->
              <view class="flex items-center justify-between mb-2">
                <view class="flex items-center gap-2">
                  <view
                    class="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-sm"
                    :class="isLessonUnlocked(lesson.id) ? 'bg-gradient-to-tr from-orange-500 to-amber-500' : 'bg-gray-400'"
                  >
                    {{ chap.id }}-{{ idx + 1 }}
                  </view>
                  <view
                    class="text-[10px] font-black px-2 py-0.5 rounded-full"
                    :class="lesson.type === 'story' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'"
                  >
                    {{ lesson.type === 'story' ? '📖 趣味故事' : '🎯 围棋死活' }}
                  </view>
                </view>

                <!-- Stars Earned -->
                <view class="flex items-center gap-1">
                  <Star
                    v-for="s in 3"
                    :key="s"
                    class="w-4 h-4"
                    :class="s <= getLessonStars(lesson.id) ? 'text-amber-400 fill-current' : 'text-gray-200'"
                  />
                </view>
              </view>

              <!-- Title & Description -->
              <view class="space-y-1 my-1">
                <view class="text-base font-black text-gray-900 flex items-center gap-1.5">
                  <text>{{ lesson.title }}</text>
                  <Lock v-if="!isLessonUnlocked(lesson.id)" class="w-3.5 h-3.5 text-gray-400 inline" />
                </view>
                <view class="text-xs text-gray-500 font-medium line-clamp-2">
                  {{ lesson.description }}
                </view>
              </view>

              <!-- Bottom Target & Reward / Action -->
              <view class="pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs font-bold mt-2">
                <text class="text-orange-600 font-black">
                  目标：{{ lesson.goalText }}
                </text>

                <view
                  class="px-3.5 py-1 rounded-xl font-black text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                  :class="
                    isLessonUnlocked(lesson.id)
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  "
                >
                  <Play class="w-3 h-3 fill-current text-white" />
                  <text>{{ getLessonStars(lesson.id) > 0 ? '再次挑战' : '开始闯关' }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

      </view>
    </view>
  </view>
</template>

