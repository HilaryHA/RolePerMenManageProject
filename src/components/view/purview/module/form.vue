<template>
  <div class="w_pur_form">
    <el-dialog
      :title="isAdd ? '新增权限' : '编辑权限'"
      :visible.sync="dialogVisible"
      width="480px"
      center
      :append-to-body="true"
      custom-class="pur-dialog"
    >
      <el-form :model="form" ref="form" size="mini" label-width="80px" :rules="rulesForm">
        <el-form-item label="名称" prop="name">
          <el-input type="text" v-model="form.name" autocomplete="off" placeholder="名称"></el-input>
        </el-form-item>
        <el-form-item label="别名" prop="alias">
          <el-input type="text" v-model="form.alias" autocomplete="off" placeholder="别名"></el-input>
        </el-form-item>
        <el-form-item label="上级菜单" prop="pid">
          <treeselect v-model="form.pid" :options="purviews" placeholder="请选择上级类目"></treeselect>
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
import { getPerm, add, edit } from '@/api/otherApi/purview'
export default {
  components: {
    Treeselect
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
      purviews: [{
        label: "顶级类目",
        id: 0,
        name: "TOP_PARENT",
        children: []
      }], // 所有权限
      form: {
        id: 1,
        name: "",
        alias: "",
        pid: 0
      },
      rulesForm: {
        name: [{ required: true, message: "名称不能为空", trigger: "blur" }],
        alias: [{ required: true, message: "别名不能为空", trigger: "blur" }]
      }
    };
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
    async getPermMenus() {
      let menusTemp = await getPerm();
      if (menusTemp.data.status == 200) {
        let menuData = menusTemp.data;
        this.purviews[0].children = menuData.content;
      }
    },

    // 增加
    async toAdd() {
      let addPerm = await add(this.form);
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
      let editPerm = await edit(this.form);
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
        id: 1,
        name: "",
        alias: "",
        pid: 1
      };
    }
  }
};
</script>
<style lang="scss">
.w_pur_form {
}
.pur-dialog {
}
</style>
