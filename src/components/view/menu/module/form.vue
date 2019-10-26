<template>
  <div class="w_menu_form">
    <el-dialog
      :title="isAdd ? '新增菜单' : '编辑菜单'"
      :visible.sync="dialogVisible"
      width="540px"
      center
      :append-to-body="true"
      custom-class="menu-dialog"
    >
      <el-form :model="form" ref="form" size="mini" label-width="80px" :rules="rulesForm">
        <el-form-item label="菜单图标" prop="svgIcon">
          <el-popover placement="bottom-start" width="400" trigger="click">
            <!--<el-input type="text">搜索图标哈哈</el-input>-->
            <icon-select @selected="selected"></icon-select>
            <el-input
              slot="reference"
              type="text"
              v-model="form.svgIcon"
              placeholder="点击选择图标"
              readonly
            >
              <svg
                v-if="form.svgIcon"
                slot="prefix"
                class="icon el-input__icon icon-addMu"
                aria-hidden="true"
              >
                <use :xlink:href="form.svgIcon.includes('#') ? form.svgIcon : '#'+form.svgIcon" />
              </svg>
              <i v-else slot="prefix" class="el-input__icon el-icon-search"></i>
            </el-input>
          </el-popover>
        </el-form-item>
        <el-form-item label="菜单名称" prop="name">
          <el-input type="text" v-model="form.name" autocomplete="off" placeholder="名称"></el-input>
        </el-form-item>
        <el-form-item label="菜单排序" prop="id">
          <el-input-number
            type="number"
            v-model="sortId"
            controls-position="right"
            autocomplete="off"
            placeholder="排序"
            :min="minSort"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="内部菜单" prop="iframe">
          <el-radio-group v-model="form.iframe">
            <el-radio
              v-for="item in iframeLabel"
              :label="item.label"
              :key="item.label+'ia'"
            >{{ item.value }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="链接地址" prop="path">
          <el-input type="text" v-model="form.path" autocomplete="off" placeholder="链接地址"></el-input>
        </el-form-item>
        <el-form-item label="组件路径" prop="components">
          <el-input type="text" v-model="form.components" autocomplete="off" placeholder="组件路径"></el-input>
        </el-form-item>
        <el-form-item label="上级菜单" prop="pid">
          <treeselect v-model="form.pid" :options="menus" placeholder="请选择上级类目"></treeselect>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel()">取消</el-button>
        <el-button :loading="loading" type="primary" @click="doSubmit('form')">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import IconSelect from "@/components/common/IconSelect";
import menuList from "@/api/otherApi/menuList";
export default {
  components: {
    Treeselect,
    IconSelect
  },
  props: {
    isAdd: {
      type: Boolean,
      required: true
    },
    sup_this: {
      // 对应的index.vue的this
      type: Object,
      require: null
    }
  },
  data() {
    return {
      dialogVisible: false, // 弹窗是否出现
      loading: false, // 确定
      menus: [], // 所有菜单
      minSort: 1, // 排序的最小值 菜单id最大值
      sortId: 0,
      iframeLabel: [
        { label: true, value: "是" },
        { label: false, value: "否" }
      ],
      form: {
        id: 1,
        name: "",
        svgIcon: "",
        path: "",
        components: "",
        iframe: true,
        pid: 1
      },
      rulesForm: {
        svgIcon: [
          { required: true, message: "请选择菜单图标", trigger: "change" }
        ],
        name: [{ required: true, message: "请输入菜单名称", trigger: "blur" }]
      }
    };
  },
  mounted() {
    // this.sortId = this.form.id; // 后端需要最大值，设置sortId的max   新增时，图标需要手动加#，修改时获取时不需要，修改提交时需要手动加#
  },
  methods: {
    // 取消
    cancel: function() {
      this.loading = false;
      if (this.isAdd) {
        this.dialogVisible = false;
        this.$refs.form.clearValidate(); // 去除验证
      } else {
        this.resetForm();
      }
    },

    // 确定提交
    doSubmit: function(forName) {
      console.log("doSubmit---------", this.form, this.isAdd);
      let _this = this;
      _this.loading = true;
      _this.$refs[forName].validate(valid => {
        if (valid) {
          this.form.svgIcon = `#${this.form.svgIcon}`; // 增加'#'
          if (_this.isAdd) {
            _this.toAdd();
          } else {
            _this.toEdit();
          }
        } else {
          this.loading = false;
          return false;
        }
      });
    },

    // 响应图标子组件发布的事件
    selected: function(name) {
      console.log("parent---------", name);
      this.form.svgIcon = name;
    },

    // 获取菜单
    async getMenus() {
      let menusTemp = await menuList.getMenuList();
      if (menusTemp.data.status == 200) {
        let menuData = menusTemp.data;
        this.menus = menuData.content;
        if (this.isAdd) {
          this.minSort = menuData.maxId; // 获取的id最大值，设置sortId的min
          this.sortId = menuData.maxId;
        } else {
          this.minSort = this.form.id;
          this.sortId = this.form.id;
        }
      }
    },

    // 增加
    async toAdd() {
      let addMenu = await menuList.add(this.form);
      if (addMenu.data.status == 200) {
        this.loading = false;
        this.resetForm();
        console.log(
          "-----this.$parent.$parent------------",
          this.$parent.$parent
        );
        console.log("-----this.$parent.$parent------------", this.sup_this);
        this.$parent.$parent.init(); // 获取表格数据
      } else {
        this.cancel();
      }
    },

    // 修改
    async toEdit() {
      let editMenu = await menuList.edit(this.form);
      console.log("-----------------", editMenu);
      if (editMenu.data.status == 200) {
        this.loading = false;
        this.resetForm();
        console.log("------this.sup_this-----------", this.sup_this);
        this.sup_this.init(); // 获取表格数据
      } else {
        this.cancel();
      }
    },

    // 初始化表单
    resetForm() {
      this.dialogVisible = false;
      this.$refs["form"].resetFields();
      this.form = {
        id: 1,
        name: "",
        svgIcon: "",
        path: "",
        components: "",
        iframe: true,
        pid: 1
      };
    }
  }
};
</script>
<style lang="scss">
.w_menu_form {
}
.menu-dialog {
  .el-input-number {
    width: 100%;
    .el-input__inner {
      text-align: left;
    }
  }
  .icon-addMu {
    width: 18px;
    height: 18px;
    vertical-align: -5px;
    padding-left: 5px;
  }
}
</style>
