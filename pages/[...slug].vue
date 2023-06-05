<script setup lang="ts">
import type {CurrentRate, RateData} from "~/types";

const LOCAL_KEY = 'rating';
const route = useRoute();
const path = route.path;
const emojis = ['🤔️', '👎', '🤐️', '😄', '😍', '🎉'];
const emojiWrapper = ref<HTMLDivElement>();
let voted:Record<string, number> = {};
const message = ref<string>('');

const { data: rateData, pending } = await useFetch('/api/rate', {
  query: {
    uid: path,
  },
  default() {
    return { r1: 0, r2: 0, r3: 0, r4: 0, r5: 0 };
  },
});
const currentRate = computed<CurrentRate>(() => {
  let total = 0;
  let rate = 0;
  for (let i = 1, len = 5; i <= len; i++) {
    const key = ('r' + i) as keyof RateData;
    const value = rateData.value ? rateData.value[key] : 0;
    if (!value) { continue }
    total += value;
    rate += i * value * 2;
  }
  return {
    rate: total ? Math.round(rate / total * 10) / 10 : 0,
    total,
    rounded: total ? Math.round(rate / total / 2) : 0,
  };
});
const rate = computed<number>(() => {
  return myRate.value || currentRate.value.rounded;
});
const myRate = ref<number>(0);

onMounted(() => {
  const stored = localStorage.getItem(LOCAL_KEY);
  if (stored) {
    voted = JSON.parse(stored);
    myRate.value = voted[path] || 0;
  }
  if (myRate.value) {
    onChange(false);
  }
});

async function onChange(event: Event | false): Promise<void> {
  if (!emojiWrapper.value) return;

  emojiWrapper.value.scrollTo({
    top: myRate.value * emojiWrapper.value.clientHeight,
    behavior: 'smooth',
  });
  if (event === false) return;

  const key = 'r' + myRate.value as keyof RateData;
  const oldRate = voted[path] || 0;
  rateData.value && (rateData.value[key] += 1);
  if (oldRate) {
    const key = 'r' + oldRate as keyof RateData;
    rateData.value && (rateData.value[key] -= 1);
  }
  voted[path] = myRate.value;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(voted));

  message.value = '';
  pending.value = true;
  try {
    const data = await $fetch('/api/rate', {
      method: 'POST',
      body: {
        uid: path,
        rate: myRate.value,
        oldRate,
      },
    });
    rateData.value = data as RateData;
  } catch (e) {
    message.value = (e as Error).message || Object.prototype.toString.call(e);
  }
  pending.value = false;
}
</script>

<template lang="pug">
#app
  .emoji-wrapper.overflow-hidden.row-span-2.p-1(
    ref="emojiWrapper"
  )
    .emoji.w-18.h-18.flex.justify-center.items-center.snap-y.mb-2.text-7xl(
      v-for="emoji in emojis"
      :key="emoji"
    ) {{ emoji }}
  .text-center.leading-8 Your vote: {{myRate || '🤔️'}}
  .rating.flex-row-reverse.justify-center.items-center(
    @change="onChange"
  )
    input.mask.mask-star-2.w-10.h-10(
      v-for="item in 5"
      type="radio"
      name="rating"
      :key="item"
      :class="{active: 6 - item === rate}"
      :disabled="pending"
      :value="6 - item"
      v-model.number="myRate"
    )

  .col-span-2.text-center.pt-1 Ranks: {{ currentRate.rate }}/10 ({{ currentRate.total }})
  .col-span-2.alert.alert-error(v-if="message")
    p {{message}}
</template>
