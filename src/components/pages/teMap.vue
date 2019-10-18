<template>
    <div class="my-map">
        <div class="my-head">
            <span>坐标地图</span>
        </div>
        <div class="map-cont">
            <!-- <div id="myMap"> -->
                <map-com> </map-com>
            <!-- </div> -->
        </div>
    </div>
</template>

<script>
import MapCom from '../drawChart/mapCom'
export default {
    components: {
        'map-com':MapCom
    },
    data() {
        return {
            myMap: ''
        }
    },
    created() {
        
    },
    mounted() {
        
    },
    methods: {
         
    },
    destroyed() {
        // this.myMap.dispose();
    }
}
</script>

<style lang="scss">
$boxSizing: 'border-box';
.my-map {
    width: 100%;
    height: 100%;
    position: relative;
    background: #fff;
    .map-cont {
        width: 100%;
        height: 600px;
        box-sizing: $boxSizing;
        background: #FFF;
    }
}
</style>


