<template>
  <el-row :gutter="30" class="panel_group">
    <el-col :xs="12" :sm="12" :lg="6" class="panel_card">
      <div class="card_wrapper">
        <div class="card_svg">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#iconHOME"></use>
          </svg>
        </div>
        <div class="card_panel_description">
          <div class="card_panel_text">Your Home</div>
          <count-to :start-val="0" :end-val="count.visits" :duration="2800" class="card_panel_num"></count-to>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="panel_card">
      <div class="card_wrapper">
        <div class="card_svg">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#iconlvhang-"></use>
          </svg>
        </div>
        <div class="card_panel_description">
          <div class="card_panel_text">Your Travel</div>
          <count-to :start-val="0" :end-val="count.ip" :duration="2800" class="card_panel_num"></count-to>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="panel_card">
      <div class="card_wrapper">
        <div class="card_svg">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#iconyun"></use>
          </svg>
        </div>
        <div class="card_panel_description">
          <div class="card_panel_text">Your Cloud</div>
          <count-to :start-val="0" :end-val="count.recentVisits" :duration="2800" class="card_panel_num"></count-to>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="panel_card">
      <div class="card_wrapper">
        <div class="card_svg">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#iconsea__easyiconnet"></use>
          </svg>
        </div>
        <div class="card_panel_description">
          <div class="card_panel_text">Your Sea</div>
          <count-to :start-val="0" :end-val="count.recentIp" :duration="2800" class="card_panel_num"></count-to>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
  import CountTo from 'vue-count-to'
  export default {
    components: {
      CountTo
    },
    data() {
      return {
        count: {
          visits: 3200,
          ip: 200,
          recentVisits: 380,
          recentIp: 100
        }
      }
    }
  }
</script>

<style lang="scss">
  .panel_group {
    margin-top: 10px;
    .panel_card {
      margin-bottom: 20px;
      .card_wrapper {
        background: #FFF;
        height: 108px;
        font-size: 12px;
        color: #666;
        box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.05);
        border-color: rgba(0, 0, 0, 0.05);
        display: table-cell;
        display: flex;
        justify-content: space-between;
        padding-left: 20px;
        padding-right: 20px;
      }
      .card_svg {
        transition: all 0.38s ease-out;
        .icon {
          width: 50px;
          height: 100%;
        }
      }
      .card_panel_description {
        padding: 26px 10px;
        padding-left: 0;
        font-weight: bold;
        text-align: center;
        .card_panel_text {
          font-size: 16px;
          color: rgba(0,0,0,0.45);
          margin-bottom: 12px;
        }
        .card_panel_num {
          font-size: 20px;
        }
      }
    }
  }
</style>
