<template>
  <div class="w_table_edit">
    <el-button type="primary" icon="el-icon-edit" size="mini" @click="toEdit"></el-button>
    <e-form ref="form" :is-add="false" :dicts="dicts" :sup_this="sup_this"></e-form>
  </div>
</template>
<script>
import eForm from './form'
  export default {
    components: {
      eForm
    },
    props:{
      sup_this: {
        type : Object,
        required: true
      },
      data: {   // 父组件传递的值
        type: Object,
        required: true
      },
      dicts: {
        type: Array,
        required: true
      }
    },
    methods: {
      // 打开修改
      toEdit () {
        const _this = this.$refs.form;
        _this.getDepts();
        _this.form = {
          id: this.data.id,
          name: this.data.name,
          pid: this.data.pid,
          enabled: this.data.enabled,
          create_time: this.data.create_time,
          update_time: this.data.update_time
        }
        _this.dialogVisible = true;
      }
    }
  }
</script>

<style lang="scss">

</style>
