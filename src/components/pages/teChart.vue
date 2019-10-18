<template>
    <div class="my-chart">
        <div class="my-head">
            <span>图表信息</span>
        </div>
        <div class="chart-cont">
            <div id="myBar">
                
            </div>
        </div>
        <div class="chart-map">
            <MapCom></MapCom>
        </div>
    </div>
</template>

<script>
import myBarOption from '../drawChart/barOption';
import MapCom from '../drawChart/mapCom';
export default {
    components: {
        MapCom
    },
    data() {
        return {
            myBar: ''
        }
    },
    created() {
        
    },
    mounted() {
        this.setBarOptions();
        myBarOption.setBarAnimation(this.myBar, myBarOption.option);
        // this.setBarAnimation(this.myBar, myBarOption);
    },
    methods: {
        setBarOptions() {
            let _this = this;
            _this.myBar = this.$echarts.init(document.querySelector('#myBar'));
            _this.myBar.setOption(myBarOption.option);
            window.addEventListener('resize', () => {
                _this.myBar.resize();
            })
            // window.onresize = () => {
            //     _this.myBar.resize();
            // }
        },
    },
    destroyed() {
        // 销毁实例
        this.myBar.dispose();
    }
}
</script>

<style lang="scss">
.my-chart {
    width: 100%;
    height: 100%;
    position: relative;
    background: #fff;
    #myBar {
        width: 100%;
        height: 400px;
        background: #FFF;
    }
}
</style>


