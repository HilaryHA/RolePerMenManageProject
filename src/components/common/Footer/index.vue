<template>
  <div class="w_table_footer">
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[5, 10, 20, 50]"
      :page-size="size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>
  </div>
</template>
<script>
export default {
  props: {
    // 当前页数
    currentPage: {
      type: Number,
      required: true
    },
    // 每页展示条数
    size: {
      type: Number,
      required: true
    },
    // 总条数
    total: {
      type: Number,
      required: true
    },
    // 确保获取父组件的this
    sup_this: {
      type: Object,
      required: null
    }
  },
  data() {
    return {};
  },
  methods: {
    handleSizeChange(val) {
      if (this.sup_this instanceof Object) {
        this.sup_this.sizeChange(val);
      } else {
        this.$parent.sizeChange(val);
      }
    },
    handleCurrentChange(val) {
      if (this.sup_this instanceof Object) {
        this.sup_this.pageChange(val);
      } else {
        this.$parent.pageChange(val);
      }
    }
  }
};
</script>
<style lang="scss">
.w_table_footer {
  margin-top: 10px;
}
</style>