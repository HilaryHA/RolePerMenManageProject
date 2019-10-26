<template>
  <div class="w_content my-other">
    <div class="my-head">
      <span>文档信息</span>
    </div>
    <docu-header :query="query"></docu-header>
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
        <el-table-column prop="_id" label="ID" sortable min-width="105"></el-table-column>
        <el-table-column prop="last_modified_user_id" label="用户ID" min-width="120" align="center">
          <template slot-scope="scope">
            <el-tag>{{ scope.row.last_modified_user_id }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" align="center"></el-table-column>
        <el-table-column label="创建日期" min-width="120" align="center">
          <template slot-scope="scope">
            <i class="el-icon-time"></i>
            <span style="margin-left: 10px">{{ formatDate(scope.row.create_time)}}</span>
          </template>
        </el-table-column>
        <el-table-column label="更新日期" min-width="120" align="center">
          <template slot-scope="scope">
            <i class="el-icon-time"></i>
            <span style="margin-left: 10px">{{ formatDate(scope.row.update_time)}}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="checkPermission(['ADMIN','EDITINFO_ALL', 'EDITINFO_SELECT', 'EDITINFO_EDIT', 'EDITINFO_DELETE'])"
          label="操作"
          align="center"
          min-width="140px"
        >
          <template slot-scope="scope">
            <docu-view
              v-permission="['ADMIN','EDITINFO_ALL', 'EDITINFO_SELECT']"
              :data="scope.row"
              :sup_this="sup_this"
            ></docu-view>
            <el-button
              v-permission="['ADMIN','EDITINFO_ALL', 'EDITINFO_EDIT']"
              size="mini"
              icon="el-icon-edit"
              type="primary"
              @click="handleEdit(scope, scope.row)"
            ></el-button>
            <el-popover
              v-permission="['ADMIN','EDITINFO_ALL', 'EDITINFO_DELETE']"
              placement="top"
              width="180"
              :ref="scope.row._id"
              trigger="click"
              popper-class="operat_pop"
            >
              <p class="operat_text">确定删除此条文档信息吗，此操作不能撤销！</p>
              <div class="operat_btn">
                <el-button size="mini" type="text" @click="$refs[scope.row._id].doClose()">取消</el-button>
                <el-button
                  size="mini"
                  :loading="delLoading"
                  type="primary"
                  @click="subDelete(scope.row._id)"
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
import DocuHeader from "./module/header";
import DocuView from "./module/view";
import eFooter from "@/components/common/Footer";
import initData from "@/mixins/initData";
import { formatDate } from "@/utils/mUtils";
import { del } from "@/api/otherApi/tinymceImg";
import { mapActions } from "vuex";
export default {
  components: {
    DocuHeader,
    DocuView,
    eFooter
  },
  // 混入：分发Vue组件中的可复用功能
  mixins: [initData],
  data() {
    return {
      sup_this: this,
      delLoading: false,
      isEdit: false // 是否编辑
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
    // 引入store函数
    ...mapActions(["editInymce"]),
    // 根据混入必须复写的初始化函数
    beforeInit() {
      this.url = "tinymceDocu/userDocu";
      const sort = "_id,1";
      this.params = {
        page: this.page,
        size: this.size,
        sort: sort
      };
      const query = this.query;
      // 根据自定义的herader组件中对应的字段名
      const value = query.value;
      if (value) {
        this.params["title"] = value;
      }
      return true;
    },

    async subDelete(_id) {
      console.log(_id);
      /* 注意是通过'_id'进行操作 */
      this.delLoading = true;
      let deleteId = await del(_id);
      if (deleteId.data && deleteId.data.status == 200) {
        this.delLoading = false;
        this.$refs[_id].doClose();
        this.init();
      } else {
        this.delLoading = false;
        this.$refs[_id].doClose();
      }
    },

    handleEdit(index, row) {
      console.log(index, row);
      this.editInymce(row);
      this.isEdit = true;
      this.$router.push({ path: "/ed/editDocu" });
    }
  },
  beforeDestroy() {
    console.log("beforeDestroy");
    console.log(this.isEdit);
    if (!this.isEdit) {
      /* 没点击编辑按钮，就清空store的编辑对象 */
      this.editInymce({});
    }
  }
};
</script>

<style lang="scss">
.my-other {
}
</style>


