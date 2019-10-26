<template>
  <div class="w_content my-edit">
    <div class="my-head">
      <span>编辑文档</span>
    </div>
    <el-row class="edit_tit">
      <el-col :span="6">
        <el-input placeholder="请输入标题..." size="mini" v-model="textData.title"></el-input>
      </el-col>
    </el-row>
    <div class="edit-cont">
      <!-- {{ textData.html_text }} -->
      <tinymce-editor ref="editor" v-model="textData.html_text" :disabled="disabled"></tinymce-editor>
      <el-row class="edit_footer">
        <el-button type="primary" size="mini" @click="clear">清空内容</el-button>
        <el-button type="danger" size="mini" @click="disabled = true">禁用</el-button>
        <el-button type="warning" size="mini" @click="disabled = false">启用</el-button>
        <el-button type="success" size="mini" @click="doSubmit">{{ isEdit ? '修改' : '保存' }}</el-button>        
      </el-row>
    </div>
  </div>
</template>

<script>
import TinymceEditor from "./module/tinymce-editor";
import { mapGetters } from "vuex";
import { add, edit } from "@/api/otherApi/tinymceImg";
import initPerm from "@/mixins/initPerm";
export default {
  components: {
    TinymceEditor
  },
  // 混入，分发复用功能（是否有权限打开此页面）
  mixins: [initPerm],
  data() {
    return {
      textData: {        
        title: "Here enter your title.",
        html_text: "Welcome to Use Tinymce Editor"
      },
      disabled: false,
      isEdit: false, // 是否编辑
      checkPermArr: ['ADMIN', 'EDITINFO_CREATE', 'EDITINFO_EDIT']
    };
  },
  created() {
    this.initMsg();
  },
  computed: {
    ...mapGetters(["tinymceInfo"])
  },
  methods: {
    // 清空内容
    clear() {
      /* 插件中自定义的clear函数 */
      this.$refs.editor.clear();
    },
    // 判断是否有编辑信息
    initMsg() {
      if (
        this.tinymceInfo instanceof Object &&
        Object.keys(this.tinymceInfo).length
      ) {
        this.textData = Object.assign({}, this.tinymceInfo);
        this.isEdit = true;
      }
    },
    // 保存文档
    async doSubmit() {
      let obj = {...this.textData};
      if (this.isEdit) {
        let editDa = await edit(obj);
        if(editDa.data.status == 200) {
          this.textData = {};
          this.$router.push({ path: '/ed/docuInfo' });
        }
      } else {        
        let addDa = await add(obj);
        if(addDa.data.status == 200) {
          this.textData = {};
          this.$router.push({ path: '/ed/docuInfo' });
        }
      }
    }
  }
};
</script>

<style lang="scss">
.my-edit {
  min-width: 1110px;
  .edit_tit {
    padding-bottom: 10px;
  }
  .edit_footer {
    padding-top: 20px;
    display: grid;
    grid-column-gap: 3px;
    justify-items: start;
    justify-content: start;
    grid-template-columns: 0px 86px 66px 66px 66px;
  }
}
</style>


