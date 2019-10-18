<template>
  <div class="w_content my-pay">
    <div class="my-head">
      <span>支付管理</span>
    </div>
    <pay-header :query="query"></pay-header>
    <div class="pay-cont">
      <el-table
        ref="multipleTable"
        :data="data"
        tooltip-effect="dark"
        style="width: 100%"
        stripe
        size="mini"
        v-loading="loading"
        >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="orderId" label="订单号" sortable width="200"></el-table-column>
        <el-table-column prop="name" label="订单标题" min-width="120" align="center">
          <template slot-scope="scope">
            <el-tag>{{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fruitApple" label="苹果" align="center"></el-table-column>
        <el-table-column prop="fruitMango" label="芒果" align="center"></el-table-column>
        <el-table-column prop="fruitDragonFruit" label="火龙果" align="center"></el-table-column>
        <el-table-column prop="fruitOrange" label="橙子" align="center"></el-table-column>
        <el-table-column prop="price" label="总价" align="center"></el-table-column>
        <el-table-column prop="remarks" label="备注信息" align="center"></el-table-column>
        <el-table-column label="创建日期" min-width="160" align="center">
          <template slot-scope="scope">
            <i class="el-icon-time"></i>
            <span style="margin-left: 10px">{{ formatDate(scope.row.create_time)}}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="checkPermission(['ADMIN','PAY_ALL', 'PAY_DELETE'])" label="操作" align="center" min-width="100px">
          <template slot-scope="scope">
            <el-popover
              v-permission="['ADMIN','PAY_ALL', 'PAY_DELETE']"
              placement="top"
              width="180"
              :ref="scope.row.orderId"
              trigger="click"
              popper-class="operat_pop"
              >
              <p class="operat_text">确定删除此条订单信息吗，此操作不能撤销！</p>
              <div class="operat_btn">
                <el-button size="mini" type="text" @click="$refs[scope.row.orderId].doClose()">取消</el-button>
                <el-button
                  size="mini"
                  :loading="delLoading"
                  type="primary"
                  @click="subDelete(scope.row.orderId)"
                >确定</el-button>
              </div>
              <el-button
                size="mini"
                icon="el-icon-delete"
                slot="reference"
                type="danger"
                title="删除"
              ></el-button>
            </el-popover>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <e-footer :currentPage="currentPage" :size="size" :total="total" :sup_this="sup_this"></e-footer>
  </div>
</template>

<script>
import checkPermission from '@/utils/permission';
import PayHeader from "./module/header";
import eFooter from "@/components/common/Footer";
import initData from '@/mixins/initData';
import { formatDate } from '@/utils/mUtils';
import { del } from "@/api/otherApi/payment";
export default {
  components: {
    PayHeader,
    eFooter
  },
  // 混入：分发Vue组件中的可复用功能
  mixins: [initData],
  data() {
    return {
      // tableData: [],
      sup_this: this,
      delLoading: false
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
    // 外部函数在此定义
    formatDate,
    checkPermission,
    // 根据混入必须复写的初始化函数
    beforeInit () {
        this.url = 'alipay';
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
    },

    // 删除
    async subDelete(id) {
      console.log(id);
      this.delLoading = true;
      let deleteId = await del(id);
      if (deleteId.data && deleteId.data.status == 200) {
        this.delLoading = false;
        this.$refs[id].doClose();
        this.init();
      } else {
        this.delLoading = false;
        this.$refs[id].doClose();
      }
    }
  }
};
</script>

<style lang="scss">
.el-popper[x-placement^="top"] {
  font-size: 12px;
  letter-spacing: 2px;
  line-height: 20px;
  color: #8c8e90;
}
</style>


