<template>
  <div class="w_content my-log">
    <div class="my-head">
      <span>日志信息</span>
    </div>
    <log-header :query="query"></log-header>
    <div class="log-cont">
      <el-table
        ref="multipleTable"
        :data="data"
        tooltip-effect="dark"
        style="width: 100%"
        stripe
        size="mini"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" sortable width="65"></el-table-column>
        <el-table-column prop="name" label="姓名" min-width="120" align="center">
          <template slot-scope="scope">
            <el-popover trigger="click" placement="top">
              <p>姓名: {{ scope.row.name }}</p>
              <p>地址: {{ scope.row.address }}</p>
              <div slot="reference" class="name-wrapper">
                <el-tag>{{ scope.row.name }}</el-tag>
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址" show-overflow-tooltip align="center"></el-table-column>
        <el-table-column label="操作日期" align="center" min-width="120">
          <template slot-scope="scope">
            <i class="el-icon-time"></i>
            <span style="margin-left: 10px">{{ formatDate(scope.row.create_time) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="checkPermission(['ADMIN','LOG_ALL', 'LOG_DELETE'])"
          label="操作"
          align="center"
          min-width="100px"
          >
          <template slot-scope="scope">
            <el-popover
              v-permission="['ADMIN','LOG_ALL', 'LOG_DELETE']"
              placement="top"
              width="180"
              :ref="scope.row.id"
              trigger="click"
              popper-class="operat_pop"
            >
              <p class="operat_text">确定删除此条日志信息吗，此操作不能撤销！</p>
              <div class="operat_btn">
                <el-button size="mini" type="text" @click="$refs[scope.row.id].doClose()">取消</el-button>
                <el-button
                  size="mini"
                  :loading="delLoading"
                  type="primary"
                  @click="subDelete(scope.row.id)"
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
import checkPermission from "@/utils/permission";
import LogHeader from "./module/header";
import eFooter from "@/components/common/Footer";
import initData from "@/mixins/initData";
import { formatDate } from "@/utils/mUtils";
export default {
  components: {
    LogHeader,
    eFooter
  },
  mixins: [initData],
  data() {
    return {
      tableData: [
        {
          id: "1",
          date: "2019-05-03",
          name: "夏天",
          detail: "登录成功",
          address: "浙江省杭州市"
        },
        {
          id: "2",
          date: "2019-05-03",
          name: "段沐希",
          detail: "登录成功",
          address: "浙江省杭州市"
        },
        {
          id: "3",
          date: "2019-05-03",
          name: "娜扎",
          detail: "登录成功",
          address: "浙江省杭州市"
        },
        {
          id: "4",
          date: "2019-05-03",
          name: "时秒",
          detail: "登录成功",
          address: "浙江省杭州市"
        },
        {
          id: "5",
          date: "2019-05-03",
          name: "张一寻",
          detail: "登录成功",
          address: "浙江省杭州市"
        }
      ],
      multipleSelection: [],
      delLoading: false,
      sup_this: this
    };
  },
  created() {
    // 希望所有子组件视图渲染完毕，再调用对应函数
    let _this = this;
    // 箭头函数，内部的this,默认指向Dom元素最外层this，避免指向window
    // 可以定义一个变量存储当前this
    this.$nextTick(() => {
      _this.init();
    });
  },
  methods: {
    // 外部函数在此定义
    formatDate,
    checkPermission,
    // 根据混入必须复写的初始化函数
    beforeInit() {
      this.url = "logs";
      const sort = "id,1";
      this.params = {
        page: this.page,
        size: this.size,
        sort: sort
      };
      const query = this.query;
      // 根据自定义的herader组件中对应的字段名
      const value = query.value;
      const value2 = query.value2;
      if (value) {
        this.params["name"] = value;
      }
      if (value2) {
        this.params["date"] = value2;
      }
      return true;
    },
    // 批量删除
    handleSelectionChange(val) {
      this.multipleSelection = val;
      console.log(val);
    },

    subDelete(index) {
      console.log(index);
      this.delLoading = true;
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


