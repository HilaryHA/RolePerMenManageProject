<template>
  <div class="w_table_head user_head">
    <el-input
      type="text"
      v-model="query.value"
      placeholder="请输入标题进行搜索"
      clearable
      size="mini"
      @keyup.enter.native="toQuery"
    ></el-input>
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
.user_head {
  grid-template-columns: 220px 72px;
}
</style>
