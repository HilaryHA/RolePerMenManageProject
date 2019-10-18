<template>
  <div class="w_table_head menu_head">
    <el-input
      type="text"
      v-model.trim="query.value"
      placeholder="请输入权限名称搜索"
      clearable
      size="mini"
      @keyup.enter.native="toQuery"
    ></el-input>
    <el-button type="success" icon="el-icon-search" size="mini" @click="toQuery">搜索</el-button>
    <div class="head_add" v-permission="['ADMIN','PERMISSION_ALL', 'PERMISSION_CREATE']">
      <el-button type="primary" icon="el-icon-plus" size="mini" @click="add">新增</el-button>
      <e-form ref="form" :is-add="true" />
    </div>
    <div class="head_expand">
      <el-button
        type="warning"
        icon="el-icon-more"
        size="mini"
        @click="toExpand"
      >{{$parent.expand ? '折叠' : '展开'}}</el-button>
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
      this.$parent.expand = false;
      this.$parent.init();
    },

    // 打开新增
    add() {
      this.$refs.form.getPermMenus();
      this.$refs.form.dialogVisible = true;
    },

    // 展开或者收缩
    toExpand() {
      // 通过控制父组件的:expand-all的值，进行展开或折叠
      this.$parent.expand = !this.$parent.expand;
      this.$parent.init();
    }
  }
};
</script>
<style lang="scss">
.menu_head {
  grid-template-columns: 220px 72px 72px 72px;
}
</style>
