<template>
    <div v-if="network" class="network-box">
        <div class="net-cont">
            <h3 class="no-net">断网啦</h3>
            <div @click="onRefresh" class="net-refresh">刷新</div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
    name: 'noNetwork',
    data() {
        return {
            // network: false,  // 有computed时，此处不用定义
        }
    },
    created() {
        // console.log('========',this.network);
    },
    computed: {
        ...mapGetters(['network'])
    },
    methods: {
        // 通过跳转一个空页面再返回的方式来实现刷新当前页面数据的目的
        onRefresh () {
            // this.$router.replace('/refresh');
            console.log(this.network);
            this.$router.go(0);
        }
    }
}
</script>

<style lang="scss">
.network-box {
    box-sizing: border-box;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0,0,0,.3);
    z-index: 10;
    .net-cont {
        width: 380px;
        height: 310px;
        background: #FFF;
        margin: 160px auto 0;
        text-align: center;
        border-radius: 3px;
        .no-net {
            font-size: 26px;
            line-height: 200px;
            height: 200px;
            color: #323232;
        }
        .net-refresh {
            font-size: 16px;
            width: 70px;
            margin: 0 auto;
            padding: 10px 20px;
            border-radius: 5px;
            border: 1px solid #CCC;
            background: #CCC;
            color: #323232;
            cursor: pointer;
            &:hover {
                border: 1px solid #307BC8;
                background: #307BC8;
                color: #FFF;
            }
        }
    }
}
</style>

