<template>
  <div class="w_table_edit">
    <el-button
      size="mini"
      icon="el-icon-edit"
      type="primary"
      @click="toEdit"
      :disabled="data.pid==0"
    ></el-button>
    <e-form ref="form" :is-add="false" :sup_this="sup_this"></e-form>
  </div>
</template>
<script>
import eForm from "./form";
export default {
  components: {
    eForm
  },
  props: {
    sup_this: {
      type: Object,
      required: true
    },
    data: {
      // 父组件传递的值
      type: Object,
      required: true
    }
  },
  methods: {
    // 打开编辑
    toEdit() {
      const _this = this.$refs.form;
      _this.getMenus(); // 执行form组件中获取菜单的方法
      _this.form = {
        // 赋值给form组件中的form对象
        id: this.data.id,
        name: this.data.name,
        svgIcon: this.data.svgIcon,
        path: this.data.path,
        components: this.data.components,
        iframe: this.data.iframe,
        pid: this.data.pid
      };
      _this.form.svgIcon = _this.form.svgIcon.slice(1);
      _this.dialogVisible = true; // 打开弹窗
    }
  }
};
</script>
<style lang="scss">
</style>
