<template>
  <div class="w_table_edit">
    <el-button size="mini" icon="el-icon-edit" type="primary" @click="toEdit"></el-button>
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
      _this.form = {
        // 赋值给form组件中的form对象
        id: this.data.id,
        name: this.data.name,
        // permission: this.data.data_perm === '自定义' ? 2 : 1,
        data_perm: this.data.data_perm,
        level: this.data.level,
        describe: this.data.describe
      };
      _this.dialogVisible = true; // 打开弹窗
      // 设置父组件的currentId
      this.sup_this.currentId = this.data.id;
    }
  }
};
</script>
<style lang="scss">
</style>


