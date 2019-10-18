<template>
  <div class="w_content my-purview">
    <div class="my-head">
      <span>权限管理</span>
    </div>
    <e-header :query="query"></e-header>
    <tree-table
      v-loading="loading"
      :expand-all="expand"
      :data="data"
      :columns="columns"
      size="mini"
      >
      <el-table-column label="别名" prop="alias" align="center"></el-table-column>
      <el-table-column label="创建时间" prop="crate_time" min-width="150px">
        <template slot-scope="scope">
          <span>{{ formatDate(scope.row.create_time) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" prop="update_time" min-width="150px">
        <template slot-scope="scope">
          <span>{{ formatDate(scope.row.update_time) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="checkPermission(['ADMIN','PERMISSION_ALL', 'PERMISSION_EDIT', 'PERMISSION_DELETE'])" label="操作" align="center" min-width="150px">
        <template slot-scope="scope">
          <e-edit v-permission="['ADMIN','PERMISSION_ALL', 'PERMISSION_EDIT']" :data="scope.row" :sup_this="sup_this"></e-edit>
          <el-popover
            v-permission="['ADMIN','PERMISSION_ALL', 'PERMISSION_DELETE']"
            placement="top"
            width="180"
            :ref="scope.row.id"
            trigger="click"
            popper-class="operat_pop"
            >
            <p class="operat_text">确定删除吗,如果存在下级节点则一并删除，此操作不能撤销！</p>
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
    </tree-table>
    <e-footer :currentPage="currentPage" :size="size" :total="total" :sup_this="sup_this"></e-footer>
  </div>
</template>
<script>
import checkPermission from '@/utils/permission';
import treeTable from "@/components/common/TreeTable";
import initData from "@/mixins/initData";
import initDict from "@/mixins/initDict";
import eHeader from "./module/header";
import eEdit from "./module/edit";
import eFooter from "@/components/common/Footer";
import { formatDate } from "@/utils/mUtils";
import { del } from '@/api/otherApi/purview';
export default {
  components: {
    treeTable,
    eHeader,
    eEdit,
    eFooter
  },
  mixins: [initDict, initData],
  data() {
    return {
      columns: [
        // 第一列字段名 宽度
        {
          text: "名称",
          value: "name",
          width: "230px"
        }
      ],
      delLoading: false,
      sup_this: this,
      expand: false // 默认展开/收缩值
    };
  },
  created() {
    // 保证能在此生命周期可以操作this $el等
    this.$nextTick(() => {
      this.init();
    });
  },
  methods: {
    checkPermission, // 检查权限
    formatDate, // 引入外部函数，即可在表格中使用
    // 初始化表格数据
    beforeInit() {
      this.url = "permission";
      const sort = "id,1";
      this.params = {
        page: this.page,
        size: this.size,
        sort: sort
      };
      const query = this.query; // 头部搜索
      const value = query.value;
      if (value) {
        this.params["name"] = value;
      }
      return true;
    },

    // 删除一条权限数据
    async subDelete(id) {
      this.delLoading = true;
      let deleteId = await del(id);
      if (deleteId.data && deleteId.data.status == 200) {
      this.delLoading = false;
        this.$refs[id].doClose();
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
.my-purview {
}
</style>
