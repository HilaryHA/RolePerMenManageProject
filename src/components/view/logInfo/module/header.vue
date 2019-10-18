<template>
  <div class="w_table_head log_head">
    <el-input
      type="text"
      v-model="query.value"
      placeholder="请输入名称进行搜索"
      clearable
      size="mini"
      @keyup.enter.native="toQuery"
    ></el-input>
    <el-date-picker
      v-model="query.value2"
      align="right"
      type="date"
      placeholder="选择日期"
      size="mini"
      :picker-options="pickerOptions"
      @change="toQuery"
    ></el-date-picker>
    <el-button type="success" icon="el-icon-search" size="mini" @click="toQuery">搜索</el-button>
  </div>
</template>
<script>
export default {
  props: {
    query: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
        shortcuts: [
          {
            text: "今天",
            onClick(picker) {
              picker.$emit("pick", new Date());
            }
          },
          {
            text: "昨天",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", date);
            }
          },
          {
            text: "一周前",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", date);
            }
          }
        ]
      }
    };
  },
  methods: {
    // 模糊查询搜索
    toQuery() {
      this.$parent.page = 0;
      this.$parent.init();
    }
  }
};
</script>
<style lang="scss">
.log_head {
  grid-template-columns: 220px 220px 72px;
}
</style>


