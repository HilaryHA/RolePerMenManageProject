<template>
  <div class="w_table_head dept_head">
    <el-input v-model.trim="query.value" placeholder="请输入部门名称搜索" clearable size="mini" @keyup.enter.native="toQuery"></el-input>
    <el-select v-model="query.enabled" clearable placeholder="请选择" size="mini" @change="toQuery">
      <el-option v-for="item in enabledTypeOptions"
                 :key="item.key"
                 :label="item.display_name"
                 :value="item.key">
      </el-option>
    </el-select>
    <el-button type="success" icon="el-icon-search" size="mini" @click="toQuery">搜索</el-button>
    <div v-permission="['ADMIN','DEPT_ALL', 'DEPT_CREATE']" class="head_add">
      <el-button type="primary" icon="el-icon-plus" size="mini" @click="add">新增</el-button>
      <e-form ref="form" :is-add="true" :dicts="dicts" />
    </div>
    <div class="head_expand">
      <el-button type="warning" icon="el-icon-more"
                 size="mini" @click="toExpand">{{$parent.expand ?  '折叠' :  '展开'}}</el-button>
      <!--<eForm ref="form" :is-add="true" :dicts="dicts"/>-->
    </div>
  </div>
</template>
<script>
  import eForm from './form'
  export default {
    components: {
      eForm
    },
    props: {
      query: {
        type: Object,
        required: true
      },
      dicts: {
        type: Array,
        required: true
      }
    },
    data(){
      return {
        enabledTypeOptions: [
          { key: true, display_name: '正常'},
          { key: false, display_name: '禁用'}
        ]
      }
    },
    methods: {
      // 模糊查询搜索
      toQuery () {
        this.$parent.page = 0;
        this.$parent.expand = false;
        this.$parent.init();
      },
      // 打开新增
      add () {
        this.$refs.form.getDepts();
        this.$refs.form.dialogVisible = true;
      },
      // 展开或者收缩
      toExpand () {
        // 通过控制父组件的:expand-all的值，进行展开或折叠
        this.$parent.expand = !this.$parent.expand;
        this.$parent.init();
      }

    }
  }
</script>
<style lang="scss">
  .dept_head {
    grid-template-columns: 220px 100px 72px 72px 72px;
  }
  .el-select-dropdown__item {
    font-size: 12px;
  }
</style>
