<template>
  <div class="tinymce-editor">
    <editor v-model="myValue" :init="init" :disabled="disabled"></editor>
  </div>
</template>
<script>
import tinymce from "tinymce/tinymce";
import Editor from "@tinymce/tinymce-vue";
import "tinymce/themes/silver";
// 编辑器插件plugins
// 更多插件参考：https://www.tiny.cloud/docs/plugins/
import "tinymce/plugins/image"; // 插入上传图片插件
import "tinymce/plugins/media"; // 插入视频插件
import "tinymce/plugins/table"; // 插入表格插件
import "tinymce/plugins/lists"; // 列表插件
import "tinymce/plugins/wordcount"; // 字数统计插件
import "tinymce/plugins/link"; // 插入链接插件
import { uploadImage } from "@/api/otherApi/tinymceImg"; // 封装的上传图片函数，注意请求头类型需要设置为FormData
export default {
  components: {
    Editor
  },
  props: {
    value: {
      type: String,
      default: ""
    },
    disabled: {
      type: Boolean,
      default: false
    },
    plugins: {
      type: [String, Array],
      default: "lists image media table wordcount link"
    },
    toolbar: {
      type: [String, Array],
      default:
        "undo redo |  formatselect | bold italic forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | lists image media table link | removeformat"
    }
  },
  data() {
    return {
      init: {
        language_url: `/static/tinymce/langs/zh_CN.js`, // 因为文件存储在static文件夹下，不用考虑开发和生产环境
        language: "zh_CN",
        skin_url: `/static/tinymce/skins/ui/oxide`,
        content_css: `/static/tinymce/skins/content/default/content.css`,
        // skin_url: `/static/tinymce/skins/ui/oxide-dark`, // 暗色系
        // content_css: `/static/tinymce/skins/content/dark/content.css`, // 暗色系
        height: 500,
        plugins: this.plugins,
        toolbar: this.toolbar,
        branding: false,
        menubar: false,
        // [方法一] 此处为图片上传处理函数，以下是直接base64的图片形式上传图片
        // [方法二] axios上传可参考https://www.tiny.cloud/docs/configure/file-image-upload/#images_upload_handler
        images_upload_handler: async (blobInfo, success, failure) => {
          // 【方法二】 通过axios上传图片
          let formData = new FormData();
          formData.append("file", blobInfo.blob(), blobInfo.filename());
          // 获取添加的file对象
          // console.log('formData', formData.keys());
          // console.table(formData.get("file"));

          let imgData = await uploadImage(formData);
          if (imgData.data.status == 200) {
            /* 需要返回图片路径 */
            success(imgData.data.data.priview_url);
          } else {
            /* 失败提示信息 */
            failure(imgData.data.info);
            return;
          }

          //  【方法一】不借助后端，直接存储为base64图片
          // const img = 'data:image/jpeg;base64,' + blobInfo.base64();
          // success(img)
        }
      },
      myValue: this.value
    };
  },
  mounted() {
    /* 初始化富文本 */
    tinymce.init({});
  },
  methods: {
    // 添加相关的事件，可用的事件参照文档=> https://github.com/tinymce/tinymce-vue => All available events
    // 自定义事件，清空内容
    clear() {
      this.myValue = "";
    }
  },
  watch: {
    value(newValue) {
      this.myValue = newValue;
    },
    myValue(newValue) {
      // 【改变】value属性的值
      this.$emit("input", newValue);
    }
  }
};
</script>