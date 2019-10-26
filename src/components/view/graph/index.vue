<template>
  <div class="w_content my-index">
    <div class="my-head">
      <span>首页</span>
    </div>
    <div class="my-content">
      <div class="w_panel">
        <panel-group />
      </div>
      <div class="w_map">
        <map-chart></map-chart>
      </div>
      <el-row class="w_pie_bar">
        <el-col :span="12">
          <pie-chart></pie-chart>
        </el-col>
        <el-col :span="12">
          <bar-chart></bar-chart>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import BarChart from "./components/BarChart";
import MapChart from "./components/MapChart";
import PanelGroup from "./components/PanelGroup";
import PieChart from "./components/PieChart";
export default {
  components: {
    BarChart,
    MapChart,
    PanelGroup,
    PieChart
  },
  data() {
    return {};
  }
};
</script>

<style lang="scss">
.my-index {
  .w_pie_bar {
    background: #fff;
    margin-top: 20px;
  }
}
</style>


