<template>
  <div class="w_content my_dept">
    <div class="my-head">
      <span>部门管理</span>
    </div>
    <e-header :query="query" :dicts="dicts"></e-header>
    <!-- loading值在mixins的initData中定义过 -->
    <tree-table
      v-loading="loading"
      :expand-all="expand"
      :data="data"
      :columns="columns"
      size="small"
    >
      <el-table-column label="状态" align="center" min-width="100px">
        <template slot-scope="scope">
          <div v-for="item in dicts" :key="item.sort">
            <el-tag
              v-if="scope.row.enabled === item.value"
              :type="scope.row.enabled ? '': 'info'"
            >{{ item.label }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="create_time" min-width="150px">
        <template slot-scope="scope">
          <span>{{ formatDate(scope.row.create_time) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" prop="update_time" min-width="150px">
        <template slot-scope="scope">
          <span>{{ formatDate(scope.row.update_time) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="checkPermission(['ADMIN','DEPT_ALL', 'DEPT_EDIT', 'DEPT_DELETE'])"
        label="操作"
        align="center"
        min-width="150px"
      >
        <template slot-scope="scope">
          <e-edit
            v-permission="['ADMIN','DEPT_ALL', 'DEPT_EDIT']"
            :data="scope.row"
            :dicts="dicts"
            :sup_this="sup_this"
          ></e-edit>
          <el-popover
            v-permission="['ADMIN','DEPT_ALL', 'DEPT_DELETE']"
            placement="top"
            width="180"
            :ref="scope.row.id"
            trigger="click"
            popper-class="operat_pop"
          >
            <p class="operat_text">确定删除{{ scope.row.name }}数据吗？</p>
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
              slot="reference"
              :disabled="scope.row.id === 1"
              type="danger"
              icon="el-icon-delete"
              size="mini"
            ></el-button>
          </el-popover>
        </template>
      </el-table-column>
    </tree-table>
    <e-footer :currentPage="currentPage" :size="size" :total="total" :sup_this="sup_this"></e-footer>
  </div>
</template>

<script>
import checkPermission from "@/utils/permission";
import treeTable from "@/components/common/TreeTable";
import initData from "@/mixins/initData";
import initDict from "@/mixins/initDict";
import eHeader from "./module/header";
import eEdit from "./module/edit";
import eFooter from "@/components/common/Footer";
import { formatDate } from "@/utils/mUtils";
import { del } from "@/api/otherApi/dept";
export default {
  components: {
    treeTable,
    eHeader,
    eEdit,
    eFooter
  },
  mixins: [initData, initDict], // 混入初始化的值
  data() {
    return {
      columns: [
        {
          text: "名称",
          value: "name", // 对应后台数据提供的字段名
          width: "200px"
        }
      ],
      delLoading: false, // 删除加载
      sup_this: this,
      expand: false // 头部组件传递该值:expand-all可以控制收缩、展开
    };
  },
  created() {
    // 初始化表格数据 获取表格数据
    this.$nextTick(() => {
      // $nextTick子组件也都一起被挂载，整个视图渲染完毕之后
      this.init(); // initData中定义的函数
      // 加载数据字典
      this.getDict("dept_status");
    });
  },
  methods: {
    formatDate, // 此处调用外部函数，组件中就可以直接使用
    checkPermission,
    // 初始化表格数据
    beforeInit() {
      this.url = "dept";
      const sort = "pid, 1";
      this.params = {
        page: this.page,
        size: this.size,
        sort: sort
      };
      const query = this.query; // 头部搜索
      const value = query.value;
      const enabled = query.enabled;
      if (value) {
        this.params["name"] = value;
      }
      if (enabled !== "" && enabled !== null && enabled !== undefined) {
        this.params["enabled"] = enabled;
      }
      return true;
    },

    // 删除一条部门数据
    async subDelete(id) {
      this.delLoading = true;
      let deleteId = await del(id);
      if (deleteId.data && deleteId.data.status == 200) {
        this.delLoading = false;
        this.$refs[id].doClose(); // el-popover自带关闭函数
        this.init();
      } else {
        this.delLoading = false;
        this.$refs[id].deClose();
      }
    }
  }
};
</script>

<style lang="scss">
.my_dept {
  .el-tag {
    cursor: pointer;
  }
}
</style>


