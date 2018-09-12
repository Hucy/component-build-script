<template>
    <div :class="$style.red">{{ msg }}</div>
</template>

<script>
export default {
  data () {
    return {
      msg: 'Hello world!'
    }
  }
}
</script>

<style module>
.red {
  color: red;
}
</style>