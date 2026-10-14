<script setup>
// Campo di ricerca con lente e "x" per svuotarlo. Il filtro lo fa chi lo usa:
// qui c'e' solo il testo, in v-model.
const text = defineModel({ type: String, default: '' });

defineProps({
    placeholder: { type: String, default: 'Cerca' },
});
</script>

<template>
    <IconField class="search-box">
        <InputIcon class="pi pi-search" />
        <InputText v-model="text" :placeholder="placeholder" :aria-label="placeholder" class="w-full" />
        <InputIcon v-if="text" class="pi pi-times search-box-clear" role="button" aria-label="Svuota"
                   @click="text = ''" />
    </IconField>
</template>
