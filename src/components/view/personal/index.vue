<template>
  <div class="w_content my-info">
    <div class="my-head">
      <span>个人信息</span>
    </div>
    <info-header :query="query"></info-header>
    <div class="info-cont">
      <el-table :data="data" highlight-current-row default-expand-all style="width: 100%" size="mini">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left" inline class="demo-table-expand">
              <el-form-item label="名称">
                <span>{{ props.row.name }}</span>
              </el-form-item>
              <el-form-item label="出生地">
                <span>{{ props.row.birthplace }}</span>
              </el-form-item>
              <el-form-item label="出生日期">
                <span>{{ props.row.dateOfBirth }}</span>
              </el-form-item>
              <el-form-item label="身高">
                <span>{{ props.row.height }}</span>
              </el-form-item>
              <el-form-item label="星座">
                <span>{{ props.row.constellation }}</span>
              </el-form-item>
              <el-form-item label="描述">
                <span>{{ props.row.description }}</span>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column label="信息 ID" prop="id"></el-table-column>
        <el-table-column label="名称" prop="name"></el-table-column>
        <el-table-column label="出生地" prop="birthplace"></el-table-column>
      </el-table>
    </div>
    <e-footer :currentPage="currentPage" :size="size" :total="total" :sup_this="sup_this"></e-footer>
  </div>
</template>

<script>
import InfoHeader from './module/header';
import eFooter from "@/components/common/Footer";
import initData from '@/mixins/initData';
export default {
  components: {
    InfoHeader,
    eFooter
  },
  // 混入：分发Vue组件中的可复用功能
  mixins: [initData],
  data() {
    return {
      sup_this: this
    };
  },  
  created () {
    // 希望所有子组件视图渲染完毕，再调用对应函数
    let _this = this;
    // 箭头函数，内部的this,默认指向Dom元素最外层this，避免指向window
    // 可以定义一个变量存储当前this
    this.$nextTick(() => {
        _this.init();
    })
  },
  methods: {
    // 根据混入必须复写的初始化函数
    beforeInit () {
        this.url = 'idol';
        const sort = 'id,1';
        this.params = {
            page: this.page,
            size: this.size,
            sort: sort
        };
        const query = this.query;
        // 根据自定义的herader组件中对应的字段名
        const value = query.value;
        if (value) {
            this.params['name'] = value;
        }
        return true;
    }
  }
};
</script>

<style lang="scss">
.my-info {
  .demo-table-expand {
    font-size: 0;
  }
  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
    font-size: 12px;
    margin-left: 10px;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }
}
</style>


