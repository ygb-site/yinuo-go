import { onMounted, ref } from 'vue';
import { sound } from '../utils/sound';

const SESSION_KEY = 'yinuo_parent_gate_ok';

function randomGateFactor(): number {
  return Math.floor(Math.random() * 6) + 4;
}

/** 家长空间共用一道乘法锁；同一会话里学情页和手册之间不用重复验证。 */
export function useParentGate() {
  const isUnlocked = ref(false);
  const gateNum1 = ref(7);
  const gateNum2 = ref(8);
  const gateAnswer = ref('');
  const gateError = ref(false);

  function generateGateQuestion() {
    gateNum1.value = randomGateFactor();
    gateNum2.value = randomGateFactor();
    gateAnswer.value = '';
    gateError.value = false;
  }

  function verifyParentGate() {
    const correct = gateNum1.value * gateNum2.value;
    if (parseInt(gateAnswer.value, 10) === correct) {
      isUnlocked.value = true;
      sessionStorage.setItem(SESSION_KEY, '1');
      sound.playStarSound();
      return;
    }
    gateError.value = true;
    sound.playErrorSound();
    generateGateQuestion();
  }

  onMounted(() => {
    if (sessionStorage.getItem(SESSION_KEY) === '1') {
      isUnlocked.value = true;
      return;
    }
    generateGateQuestion();
  });

  return {
    isUnlocked,
    gateNum1,
    gateNum2,
    gateAnswer,
    gateError,
    verifyParentGate
  };
}
