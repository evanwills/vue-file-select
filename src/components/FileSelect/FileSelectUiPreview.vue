<template>
  <section>
    <slot><!-- canvas goes here --></slot>
  </section>
</template>

<script setup>

const props = defineProps({
  canvas: { required: true },
})
</script>
