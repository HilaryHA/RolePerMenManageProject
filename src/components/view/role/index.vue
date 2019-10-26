<template>
  <div class="w_content role_main">
    <div class="my-head">
      <span>角色管理</span>
    </div>
    <e-header :query="query"></e-header>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="17">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span class="box_name">角色列表</span>
            <el-radio-group
              v-model="radioOption"
              class="box_option"
              size="mini"
              @change="changeRadio"
            >
              <el-radio-button label="菜单分配"></el-radio-button>
              <el-radio-button label="权限分配"></el-radio-button>
            </el-radio-group>
          </div>
          <div class="box_cont">
            <el-table
              v-loading="loading"
              :data="data"
              stripe
              highlight-current-row
              style="100%"
              size="mini"
              @current-change="setCheckedNodes"
            >
              <el-table-column prop="name" label="名称" min-width="80"></el-table-column>
              <el-table-column prop="data_perm" label="数据权限"></el-table-column>
              <el-table-column prop="level" label="角色级别" align="center"></el-table-column>
              <el-table-column prop="describe" label="描述" show-overflow-tooltip></el-table-column>
              <el-table-column
                prop="create_time"
                label="创建时间"
                align="center"
                :formatter="timeFormatter"
              ></el-table-column>
              <el-table-column
                v-if="checkPermission(['ADMIN','ROLE_ALL', 'ROLE_EDIT', 'ROLE_DELETE'])"
                label="操作"
                align="center"
                width="150px"
              >
                <template slot-scope="scope">
                  <e-edit
                    v-permission="['ADMIN','ROLE_ALL', 'ROLE_EDIT']"
                    :sup_this="sup_this"
                    :data="scope.row"
                  ></e-edit>
                  <el-popover
                    v-permission="['ADMIN','ROLE_ALL', 'ROLE_DELETE']"
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
                    <el-button size="mini" icon="el-icon-delete" slot="reference" type="danger"></el-button>
                  </el-popover>
                </template>
              </el-table-column>
            </el-table>
            <e-footer :currentPage="currentPage" :size="size" :total="total" :sup_this="sup_this"></e-footer>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="7">
        <el-card class="box-card" v-if="radioOption == '菜单分配'">
          <div slot="header" class="clearfix">
            <span class="box_name">{{radioOption}}</span>
            <el-button
              class="box_option"
              type="success"
              plain
              icon="el-icon-circle-check"
              size="mini"
              :disabled="disabledTree"
              v-permission="['ADMIN','ROLE_ALL', 'ROLE_EDIT']"
              @click="menusUpdate"
            >保存</el-button>
          </div>
          <div class="box_tree">
            <el-tree
              :data="menus"
              show-checkbox
              node-key="id"
              ref="tree"
              highlight-current
              :props="defaultProps"
              :default-expanded-keys="menuExpand"
              :default-checked-keys="menuChecked"
            ></el-tree>
          </div>
        </el-card>
        <el-card class="box-card" v-else>
          <div slot="header" class="clearfix">
            <span class="box_name">{{radioOption}}</span>
            <el-button
              class="box_option"
              type="success"
              plain
              icon="el-icon-circle-check"
              size="mini"
              :disabled="disabledTree"
              v-permission="['ADMIN','ROLE_ALL', 'ROLE_EDIT']"
              @click="roleUpdate"
            >保存</el-button>
          </div>
          <div class="box_tree">
            <el-tree
              :data="roles"
              show-checkbox
              node-key="id"
              ref="tree"
              highlight-current
              :props="defaultProps"
              :default-expanded-keys="permExpand"
              :default-checked-keys="permChecked"
            ></el-tree>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import checkPermission from "@/utils/permission";
import eEdit from "./module/edit";
import eHeader from "./module/header";
import eFooter from "@/components/common/Footer";
import { formatDate } from "@/utils/mUtils";
import {
  getOneRole,
  setRoleMenus,
  setRolePerms,
  del
} from "@/api/otherApi/role";
import { getPerm } from "@/api/otherApi/purview";
import menuList from "@/api/otherApi/menuList";
import initData from "@/mixins/initData";
export default {
  components: {
    eEdit,
    eHeader,
    eFooter
  },
  // 混入：分发Vue组件中的可复用功能
  mixins: [initData],
  data() {
    return {
      loading: false,
      radioOption: "菜单分配",
      disabledTree: true,
      tableData: [
        {
          id: 1,
          name: "超级管理员",
          data_perm: "全部",
          level: 1,
          describe: "系统所有权"
        }
      ],
      delLoading: false,
      sup_this: this,
      menus: [
        {
          id: 1,
          label: "一级 1",
          children: [
            {
              id: 4,
              label: "二级 1-1",
              children: [
                {
                  id: 9,
                  label: "三级 1-1-1"
                }
              ]
            }
          ]
        }
      ],
      roles: [
        {
          id: 1,
          label: "一级 1",
          children: [
            {
              id: 4,
              label: "二级 1-1",
              children: [
                {
                  id: 9,
                  label: "三级 1-1-1"
                }
              ]
            }
          ]
        }
      ],
      defaultProps: {
        children: "children",
        label: "label"
      },
      menuChecked: [],
      menuExpand: [],
      permChecked: [],
      permExpand: [],
      currentId: 1
    };
  },
  created() {
    // 希望所有子组件视图渲染完毕，再调用对应函数
    let _this = this;
    // 箭头函数，内部的this,默认指向Dom元素最外层this，避免指向window
    // 可以定义一个变量存储当前this
    _this.$nextTick(() => {
      _this.init();
      _this.changeRadio("菜单分配");
    });
  },
  methods: {
    checkPermission,
    // 根据混入必须复写的初始化函数
    beforeInit() {
      this.url = "role";
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

    // 删除一条角色数据
    async subDelete(id) {
      this.delLoading = true;
      let deleteId = await del(id);
      if (deleteId.data && deleteId.data.status == 200) {
        this.delLoading = false;
        this.$refs[id].doClose();
        this.init();
        this.currentId = 1 && this.data[0].id;
      } else {
        this.delLoading = false;
        this.$refs[id].doClose();
      }
    },
    // 选择菜单分配
    setCheckedNodes(row) {
      // 保存按钮可用
      this.disabledTree = false;
      if (row) {
        this.currentId = row.id;
      }
      // 树形控件全部折叠
      let allNodes = this.$refs.tree.store._getAllNodes();
      for (let i = 0; i < allNodes.length; i++) {
        allNodes[i].expanded = false;
      }
      if (this.radioOption.includes("菜单分配")) {
        this.setMenuNodes(row);
      } else {
        this.setRoleNodes(row);
      }
    },
    // 选择菜单分配
    async setMenuNodes(row) {
      this.menuChecked = [];
      this.menuExpand = [];

      // this.$refs.tree.setCheckedKeys([1,2,4,6]);

      let tempId = this.currentId || (row && row.id);

      let oneMenus = await getOneRole(tempId);
      if (oneMenus.data.status == 200) {
        let menuTemp = oneMenus.data.data[0].menus;
        // [问题]：选中有问题。。。。。菜单会选择父节点下的所有子节点，权限配置是正常的
        // [思路]：因为包含父节点的id，所以需要手动将父节点的id删除，同理修改时需要将父节点id增加
        // ES6的深拷贝
        this.menuChecked = [...menuTemp];
        this.menus.forEach(item => {
          // 选择
          this.menuChecked.length &&
            this.menuChecked.map(mt => {
              if (mt === item.id) {
                // 截取元素
                this.menuChecked.splice(this.menuChecked.indexOf(mt), 1);
              }
            });
          // 展开--设置父节点expanded为true，也可设置this.menuExpand = this.menuChecked\
          // 设置子节点的expanded为true,对应的父节点expanded也会为true
          menuTemp.map(mi => {
            if (mi === item.id) {
              this.menuExpand.push(mi);
            }
          });
        });
        this.$refs.tree.setCheckedKeys(this.menuChecked);
      }
    },

    // 菜单修改
    async menusUpdate() {
      // All child nodes are selected(including the id array of the parent node and child nodes),
      // and some child nodes are selected(the corresponding parent node's id array)...
      let currentAllKeys = this.$refs.tree
        .getCheckedKeys()
        .concat(this.$refs.tree.getHalfCheckedKeys());
      // 根据role的id和对应下的menu的id数组，修改菜单
      let roleMenu = await setRoleMenus(this.currentId, currentAllKeys);
    },

    // 选择角色分配
    async setRoleNodes(row) {
      this.permChecked = [];
      this.permExpand = [];
      let onePerms = await getOneRole(row.id);
      if (onePerms.data.status == 200) {
        let permTemp = onePerms.data.data[0].perms;
        this.permChecked = permTemp;
        this.$refs.tree.setCheckedKeys(this.permChecked);
        // Since the permissions are assigned, there is noly the id of the child node
        // and there is no id of the parent node...
        this.permExpand = permTemp;

        // console.log(this.permChecked, permTemp, this.permExpand);

        // No use...
        // this.menus.forEach(item => {
        //   permTemp.map(mi => {
        //     if (mi == item.id) {
        //       this.permExpand.push(mi);
        //     }
        //   })
        // })
      }
    },

    // 角色修改
    async roleUpdate() {
      // All child nodes are selected(including the id array of the parent node and child nodes),
      // and some child nodes are selected(the corresponding parent node's id array)...
      // 权限选中的id数组即可，不要只选中部分子节点对应的父节点所组成的id数组
      // 如只选择了DEPT_SELECT，不能把DEPT_ALL也加进去是吧...
      let currentAllKeys = this.$refs.tree.getCheckedKeys();
      let roleMenu = await setRolePerms(this.currentId, currentAllKeys);
    },

    // 格式化日期
    timeFormatter(row, column) {
      return this.$moment(row.create_time).format("YYYY-MM-DD hh:mm:ss");
    },

    // 改变角色分配
    changeRadio(val) {
      // console.log(val, this.currentId);
      if (val.includes("菜单分配")) {
        this.getAllMenus();
      } else {
        this.getAllPerms();
      }
    },

    // 获取所有菜单
    async getAllMenus() {
      this.menus = [];
      let menusTemp = await menuList.getMenuList({ size: 1000 });
      if (menusTemp.data.status == 200) {
        this.menus = menusTemp.data.content;
        if (this.currentId) {
          this.setCheckedNodes({ id: this.currentId });
        }
      }
    },

    // 获取所有权限
    async getAllPerms() {
      this.roles = [];
      let menusTemp = await getPerm({ size: 1000 });
      if (menusTemp.data.status == 200) {
        this.roles = menusTemp.data.content;
        if (this.currentId) {
          this.setCheckedNodes({ id: this.currentId });
        }
      }
    }
  }
};
</script>

<style lang="scss">
.role_main {
  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both;
  }
  .clearfix {
    line-height: 28px;
  }
  .box_name {
    font-size: 12px;
  }
  .box_option {
    float: right;
  }
  .box_cont {
    .el-table__row {
      cursor: pointer;
    }
  }
}
</style>


