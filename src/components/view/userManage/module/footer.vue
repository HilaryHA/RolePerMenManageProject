<template>
  <div class="user_footer">
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[10, 20, 50, 100]"
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
    }
  },
  data() {
    return {};
  },
  methods: {
    handleSizeChange(val) {
      // console.log(`每页 ${val} 条`);
      this.$parent.sizeChange(val);
    },
    handleCurrentChange(val) {
      // console.log(`当前页: ${val}`);
      this.$parent.pageChange(val);
    }
  }
};
</script>
<style lang="scss">
.user_footer {
  margin-top: 10px;
}
</style>