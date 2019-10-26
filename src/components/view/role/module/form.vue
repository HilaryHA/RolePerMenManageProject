<template>
  <div class="w_role_form">
    <el-dialog
      :title="isAdd ? '新增角色': '编辑角色'"
      :visible.sync="dialogVisible"
      :append-to-body="true"
      center
      width="500px"
      custom-class="role-dialog"
    >
      <el-form :model="form" ref="form" :rules="rulesForm" size="mini" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" autocomplete="off" placeholder="名称"></el-input>
        </el-form-item>
        <el-form-item label="角色级别" prop="level">
          <el-input-number
            type="number"
            v-model="form.level"
            controls-position="right"
            :min="1"
            autocomplete="off"
            placeholder="角色级别"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="数据范围" prop="data_perm">
          <el-select v-model="form.data_perm" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述信息" prop="describe">
          <el-input
            type="textarea"
            v-model="form.describe"
            autocomplete="off"
            maxlength="100"
            show-word-limit
            placeholder="描述内容"
            rows="5"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel()">取 消</el-button>
        <el-button :loading="loading" type="primary" @click="doSubmit('form')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { add, edit } from "@/api/otherApi/role";
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
      dialogVisible: false,
      formLabelWidth: "80px",
      loading: false, // 确定
      form: {
        name: "",
        level: 1,
        describe: "",
        data_perm: "自定义"
      },
      rulesForm: {
        name: [{ required: true, message: "请输入角色名称", trigger: "blur" }]
      },
      options: [
        {
          value: "全部",
          label: "全部"
        },
        {
          value: "自定义",
          label: "自定义"
        }
      ]
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

    // 增加
    async toAdd() {
      let addMenu = await add(this.form);
      if (addMenu.data.status == 200) {
        this.loading = false;
        this.resetForm();
        this.$parent.$parent.init(); // 获取表格数据
      } else {
        this.cancel();
      }
    },

    // 修改
    async toEdit() {
      let editMenu = await edit(this.form);
      if (editMenu.data.status == 200) {
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
        name: "",
        level: 1,
        describe: "",
        data_perm: "自定义"
      };
    }
  }
};
</script>
<style lang="scss">
.w_role_form {
}
$el-width: 100%;
.role-dialog {
  .el-input-number {
    width: $el-width;
    .el-input__inner {
      text-align: left;
    }
  }
  .el-select {
    width: $el-width;
  }
}
</style>


