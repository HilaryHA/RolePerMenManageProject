<template>
  <div class="w_table_edit">
    <el-button size="mini" icon="el-icon-view" type="warning" @click="toView"></el-button>
    <el-dialog
      title="查看文档"
      :visible.sync="dialogVisible"
      width="800px"
      center
      :append-to-body="true"
      custom-class="user-dialog"
    >
      <el-row class="view_text">
        <el-col :span="22" v-html="docuText"></el-col>
      </el-row>
    </el-dialog>
  </div>
</template>
<script>
export default {
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
  data() {
    return {
      dialogVisible: false,
      docuText: "文档信息"
    };
  },
  methods: {
    // 打开查看
    toView() {
      console.log("data", this.data);
      this.docuText = this.data.html_text;
      this.dialogVisible = true;
    }
  }
};
</script>
<style lang="scss">
.el-dialog {
  .el-dialog__header {
    border-bottom: 3px double #dddee0;
    padding-bottom: 20px;
    .el-dialog__title {
      font-weight: 700;
    }
  }
  .view_text {
    ol,
    ul {
      list-style: decimal;
      li {
        line-height: 26px;
      }
    }
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      font-size: 16px;
      font-weight: bold;
    }
  }
}
</style>
