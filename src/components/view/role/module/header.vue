<template>
  <div class="w_table_head role_head">
    <el-input
      type="text"
      v-model="query.value"
      placeholder="请输入菜单名称搜索"
      clearable
      size="mini"
      @keyup.enter.native="toQuery"
    ></el-input>
    <el-button type="success" icon="el-icon-search" size="mini" @click="toQuery">搜索</el-button>
    <div v-permission="['ADMIN','ROLE_ALL', 'ROLE_CREATE']" class="head_add">
      <el-button type="primary" icon="el-icon-plus" size="mini" @click="add">新增</el-button>
      <e-form ref="form" :is-add="true" />
    </div>
  </div>
</template>
<script>
import eForm from "./form";
export default {
  components: {
    eForm
  },
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
    },
    // 打开新增
    add() {
      let _this = this.$refs.form;
      _this.dialogVisible = true;
    }
  }
};
</script>
<style lang="scss">
.role_head {
  grid-template-columns: 220px 72px 72px;
}
</style>


