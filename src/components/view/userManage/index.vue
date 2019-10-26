<template>
  <div class="w_content my-user">
    <div class="my-head">
      <span>用户管理</span>
    </div>
    <user-header :query="query"></user-header>
    <div class="user-cont">
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
        <el-table-column prop="id" label="ID" sortable width="65"></el-table-column>
        <el-table-column prop="name" label="姓名" min-width="120" align="center">
          <template slot-scope="scope">
            <el-tag>{{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="alias" label="昵称" align="center"></el-table-column>
        <el-table-column label="创建日期" min-width="120" align="center">
          <template slot-scope="scope">
            <i class="el-icon-time"></i>
            <span style="margin-left: 10px">{{ formatDate(scope.row.create_time)}}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="checkPermission(['ADMIN','USER_ALL', 'USER_EDIT', 'USER_DELETE'])"
          label="操作"
          align="center"
          min-width="100px"
        >
          <template slot-scope="scope">
            <user-edit
              v-permission="['ADMIN','USER_ALL', 'USER_EDIT']"
              :data="scope.row"
              :sup_this="sup_this"
            ></user-edit>
            <el-popover
              v-permission="['ADMIN','USER_ALL', 'USER_DELETE']"
              placement="top"
              width="180"
              :ref="scope.row.id"
              trigger="click"
              popper-class="operat_pop"
            >
              <p class="operat_text">确定删除此条用户信息吗，此操作不能撤销！</p>
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
    <user-footer :currentPage="currentPage" :size="size" :total="total"></user-footer>
  </div>
</template>

<script>
import checkPermission from "@/utils/permission";
import UserHeader from "./module/header";
import UserFooter from "./module/footer";
import UserEdit from "./module/edit";
import initData from "@/mixins/initData";
import { formatDate } from "@/utils/mUtils";
import userInfo from "@/api/otherApi/userInfo";
export default {
  components: {
    UserHeader,
    UserFooter,
    UserEdit
  },
  // 混入：分发Vue组件中的可复用功能
  mixins: [initData],
  data() {
    return {
      sup_this: this,
      delLoading: false
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
      this.url = "user";
      const sort = "id,1";
      this.params = {
        page: this.page,
        size: this.size,
        sort: sort
      };
      const query = this.query;
      // 根据自定义的herader组件中对应的字段名
      const value = query.value;
      if (value) {
        this.params["name"] = value;
      }
      return true;
    },
    // handleSelectionChange(val) {
    //   this.multipleSelection = val;
    //   console.log(val);
    // },

    // handleEdit(index, row) {
    //   console.log(index, row);
    // },

    async subDelete(id) {
      console.log(id);
      this.delLoading = true;
      let deleteId = await userInfo.del(id);
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
.my-user {
}
.el-popper[x-placement^="top"] {
  font-size: 12px;
  letter-spacing: 2px;
  line-height: 20px;
  color: #8c8e90;
}
</style>


