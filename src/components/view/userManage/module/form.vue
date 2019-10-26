<template>
  <div class="w_user_form">
    <el-dialog
      :title="isAdd ? '新增用户' : '编辑用户'"
      :visible.sync="dialogVisible"
      width="480px"
      center
      :append-to-body="true"
      custom-class="user-dialog"
    >
      <el-form :model="form" ref="form" size="mini" label-width="80px" :rules="rulesForm">
        <el-form-item label="用户名" prop="name">
          <el-input type="text" v-model="form.name" autocomplete="off" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="alias">
          <el-input type="text" v-model="form.alias" autocomplete="off" placeholder="昵称"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-select v-model="form.roles" multiple placeholder="请选择">
            <el-option v-for="item in options" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" auto-complete="off"></el-input>
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
// import { getPerm, add, edit } from "@/api/otherApi/purview";
import userInfo from "@/api/otherApi/userInfo";
import { getRoles } from "@/api/otherApi/role";
export default {
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
      form: {
        // id: '',
        name: "",
        alias: "",
        password: "",
        roles: []
      },
      rulesForm: {
        name: [{ required: true, message: "用户名不能为空", trigger: "blur" }],
        alias: [{ required: true, message: "昵称不能为空", trigger: "blur" }]
      },
      options: [
        // {
        //   id: '1',
        //   name: '黄金糕'
        // }
      ]
    };
  },
  methods: {
    /* ----------------------------
      【待修】添加选择角色，角色可以多选，其中users_roles表中一次性添加多条数据如：UserRoles.create(['1', '3'])
      【思路】 后台将对象的roles取出，存储对应user，然后单独存储在user_roles表中数据，多条插入
      ------------------------
    */
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
      let _this = this;
      _this.loading = true;
      _this.$refs[forName].validate(valid => {
        if (valid) {
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

    // 获取权限菜单
    // async getPermMenus() {
    //   let menusTemp = await getPerm();
    //   if (menusTemp.data.status == 200) {
    //     let menuData = menusTemp.data;
    //     this.purviews[0].children = menuData.content;
    //   }
    // },

    // 增加
    async toAdd() {
      // console.group('【form】')
      // console.table(this.form)
      let addPerm = await userInfo.add(this.form);
      if (addPerm.data.status == 200) {
        this.loading = false;
        this.resetForm();
        this.$parent.$parent.init(); // 获取表格数据
      } else {
        this.cancel();
      }
    },

    // 修改
    async toEdit() {
      let editPerm = await userInfo.edit(this.form);
      if (editPerm.data.status == 200) {
        this.loading = false;
        this.resetForm();
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
        id: "",
        name: "",
        alias: "",
        password: ""
      };
    },

    // 获取权限信息
    async getRolesList() {
      let allRoles = await getRoles();
      if (allRoles.data.status == 200) {
        this.options = allRoles.data.content;
      }
    },

    // 获取对应用户数据
    async getSingleUser(id) {
      let obj = {};
      let sinUser = await userInfo.getUserById(id);
      if (sinUser.data.status == 200) {
        obj = sinUser.data.data;
      }
      return obj;
    }
  }
};
</script>
<style lang="scss">
.w_user_form {
}
.user-dialog {
  .el-select {
    width: 100%;
  }
}
.el-select-dropdown {
  .el-select-dropdown__item {
    font-size: 12px;
  }
}
</style>
