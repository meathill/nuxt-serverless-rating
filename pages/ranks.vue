<script setup lang="ts">
import type {RankItem} from "~/types";
import {getAvg} from "~/utils";

const { data, pending } = useFetch('/api/ranks', {
  default() {
    return {};
  },
});
const formattedData = computed<RankItem[]>(() => {
  const items = [] as RankItem[];
  if (!data.value) return items;
  for (const key in data.value) {
    const value = data.value[key] || '';
    if (value) {
      const item = JSON.parse(value);
      const [avg, voted] = getAvg(item);
      items.push({
        uid: key.replace(/^\${3}-/, ''),
        avg,
        voted,
        ...item,
      });
    }
  }
  return items;
});
</script>

<template lang="pug">
.container.p-4(class="sm:px-0 sm:mx-auto sm:pb-0")
  header.flex.items-center.mb-2
    h1.text-2xl.font-bold Ranks
    span.w-3.h-3.rounded-full.animate-ping.bg-sky-400.ml-4(v-if="pending")

  table.table.table-compact.w-full
    thead
      tr
        th Uid
        th r1
        th r2
        th r3
        th r4
        th r5
        th avg
        th voted
    tbody
      tr(
        v-for="item in formattedData"
        :key="item.uid"
      )
        td {{item.uid}}
        td {{item.r1}}
        td {{item.r2}}
        td {{item.r3}}
        td {{item.r4}}
        td {{item.r5}}
        td {{item.avg}}
        td {{item.voted}}
</template>
