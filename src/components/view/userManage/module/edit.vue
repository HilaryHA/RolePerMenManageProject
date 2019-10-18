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
      _this.getSingleUser(this.data.id)
      .then(temp => {
        _this.form = {
          /* 赋值部分值给form组件中的form对象 */
          id: temp.id,
          name: temp.name,
          alias: temp.alias,
          password: temp.password,
          roles: temp.roles
        };
        _this.getRolesList();
        _this.dialogVisible = true; // 打开弹窗
      })
    }
  }
};
</script>
<style lang="scss">
</style>
