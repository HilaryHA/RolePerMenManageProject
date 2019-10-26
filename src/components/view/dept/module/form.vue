<template>
  <div class="w_table_form">
    <el-dialog
      :title="isAdd ? '新增部门': '编辑部门'"
      :visible.sync="dialogVisible"
      width="500px"
      center
      :append-to-body="true"
    >
      <el-form :model="form" ref="form" size="small" label-width="80px">
        <el-form-item
          label="名称"
          prop="name"
          :rules="[{ required: true, message: '名称不能为空', trigger: 'blur' }]"
        >
          <el-input type="text" v-model="form.name" autocomplete="off" placeholder="请输入部门名称"></el-input>
        </el-form-item>
        <el-form-item v-if="form.pid !== 0" label="状态" prop="enabled">
          <el-radio
            v-for="item in dicts"
            v-model="form.enabled"
            :label="item.value"
            :key="item.id+'dt'"
          >{{ item.label }}</el-radio>
        </el-form-item>
        <el-form-item
          v-if="form.pid !== 0"
          label="上级部门"
          prop="pid"
          :rules="[{ required: true, message: '上级部门不能为空', trigger: 'blur' }]"
        >
          <!-- 注意是options有s!!! -->
          <treeselect v-model="form.pid" :options="depts" placeholder="请选择上级类目"></treeselect>
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
/**
 * 引入下拉树组件和对应样式
 */
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { getDepts, add, edit } from "@/api/otherApi/dept";

const sleep = d => new Promise(r => setTimeout(r, d));
let called = false;

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
    },
    dicts: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      dialogVisible: false, // 弹窗是否出现
      loading: false, // 确定
      depts: [], // 上级部门
      form: {
        id: "",
        name: "",
        pid: 1,
        enabled: true
      }
    };
  },
  methods: {
    // 取消
    cancel() {
      this.loading = false;
      if (this.isAdd) {
        this.dialogVisible = false;
        this.$refs["form"].clearValidate();
      } else {
        this.resetForm();
      }
    },
    // 确定提交
    doSubmit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.isAdd) {
            this.doAdd();
          } else {
            this.doEdit();
          }
        } else {
          this.loading = false;
          return false;
        }
      });
    },

    // 增加
    async doAdd() {
      let addForm = await add(this.form);
      if (addForm.data.status == 200) {
        this.loading = false;
        this.resetForm();
        this.$parent.$parent.init(); // $parent为Vue自带属性，对应还有$children
      } else {
        this.cancel();
      }
    },
    // 修改
    async doEdit() {
      let editForm = await edit(this.form);
      if (editForm.data.status == 200) {
        this.loading = false;
        this.resetForm();
        this.sup_this.init();
      } else {
        this.resetForm();
      }
    },

    // 初始化form表单信息
    resetForm() {
      this.dialogVisible = false;
      this.$refs["form"].resetFields(); // ElementUI重置表单方法
      this.form = {
        id: "",
        name: "",
        pid: 1,
        enabled: true
      };
    },

    // 获取部门信息
    async getDepts() {
      let deptsTemp = await getDepts({ enabled: true });
      if (deptsTemp.data.status == 200) {
        this.depts = deptsTemp.data.content;
      }
    }
  }
};
</script>
<style lang="scss">
.w_table_form {
}
</style>
