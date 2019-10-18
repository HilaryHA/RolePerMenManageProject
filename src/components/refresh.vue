<template>
    <div>
        <h1></h1>
    </div>
</template>

<script>
export default {
    beforeRouteEnter (to, from, next) {
        next(vm => {
            vm.$router.replace(from.fullPath);
        })
    }
}
</script>

<style lang="scss" scoped>

</style>


