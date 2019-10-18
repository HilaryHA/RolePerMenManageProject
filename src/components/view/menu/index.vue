<template>
  <div class="w_content my-menu">
    <div class="my-head">
      <span>菜单管理</span>
    </div>
    <e-header :query="query"></e-header>
    <tree-table
      v-loading="loading"
      :expand-all="expand"
      :data="data"
      :columns="columns"
      size="mini"
    >
      <el-table-column label="图标" prop="svgIcon" align="center" width="80px">
        <template slot-scope="scope">
          <svg class="icon menu-icon" aria-hidden="true">
            <use :xlink:href="scope.row.svgIcon ? scope.row.svgIcon : '#iconbiaoqing'" />
          </svg>
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sort" align="center" min-width="100px">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.id }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="链接地址" prop="path" :show-overflow-tooltip="true" min-width="150px"></el-table-column>
      <el-table-column
        label="组件路径"
        prop="components"
        :show-overflow-tooltip="true"
        min-width="150px"
      ></el-table-column>
      <el-table-column label="内部菜单" prop="iframe" min-width="100px" align="center">
        <template slot-scope="scope">
          <span v-if="scope.row.iframe">是</span>
          <span v-else>否</span>
        </template>
      </el-table-column>
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
      <el-table-column
        v-if="checkPermission(['ADMIN','MENU_ALL', 'MENU_EDIT', 'MENU_DELETE'])"
        label="操作"
        align="center"
        min-width="150px"
        >
        <template slot-scope="scope">
          <e-edit
            v-permission="['ADMIN','MENU_ALL', 'MENU_EDIT']"
            :data="scope.row"
            :sup_this="sup_this"
          ></e-edit>
          <el-popover
            v-permission="['ADMIN','MENU_ALL', 'MENU_DELETE']"
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
              :disabled="scope.row.pid==0"
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
import menuList from "@/api/otherApi/menuList";
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
        {
          text: "名称",
          value: "name",
          width: "150px"
        }
      ],
      delLoading: false,
      sup_this: this,
      expand: false // 默认展开/收缩值
    };
  },
  created() {
    this.$nextTick(() => {
      this.init();
    });
  },
  methods: {
    formatDate,
    checkPermission,
    // 初始化表格数据
    beforeInit() {
      this.url = "menu";
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

    // 删除一条部门数据
    async subDelete(id) {
      this.delLoading = true;
      let deleteId = await menuList.del(id);
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
.my-menu {
  .menu-icon {
    width: 18px;
  }
}
</style>


