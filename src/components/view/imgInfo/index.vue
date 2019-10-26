<template>
  <div class="w_content my-img">
    <div class="my-head">
      <span>图片信息</span>
    </div>
    <log-header :query="query"></log-header>
    <div class="img-cont">
      <el-table
        ref="multipleTable"
        :data="data"
        tooltip-effect="dark"
        style="width: 100%"
        stripe
        size="mini"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="_id" label="ID" sortable min-width="105"></el-table-column>
        <el-table-column prop="last_modified_user_id" label="用户ID" sortable width="85"></el-table-column>
        <el-table-column prop="name" label="文件名" min-width="120" align="center">
          <template slot-scope="scope">
            <el-popover trigger="click" placement="top">
              <p>文件名: {{ scope.row.name }}</p>
              <p>原始名: {{ scope.row.originalname }}</p>
              <p>编码方式: {{ scope.row.encoding }}</p>
              <p>后缀名: {{ scope.row.suffix_name }}</p>
              <p>大小: {{ scope.row.size }}</p>
              <p>下载地址: {{ scope.row.priview_url }}</p>
              <div slot="reference" class="name-wrapper">
                <el-tag>{{ scope.row.name }}</el-tag>
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="文件名" show-overflow-tooltip align="center"></el-table-column>
        <el-table-column prop="suffix_name" label="后缀名" align="center" width="85"></el-table-column>
        <el-table-column prop="priview_url" label="展示图" align="center" width="100">
          <template slot-scope="scope">
            <el-image
              :src="scope.row.priview_url"
              :preview-src-list="getPriviewUrlList(scope.$index)"
            ></el-image>
          </template>
        </el-table-column>
        <el-table-column label="创建日期" align="center" min-width="120">
          <template slot-scope="scope">
            <i class="el-icon-time"></i>
            <span style="margin-left: 10px">{{ formatDate(scope.row.create_time) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="修改日期" align="center" min-width="120">
          <template slot-scope="scope">
            <i class="el-icon-time"></i>
            <span style="margin-left: 10px">{{ formatDate(scope.row.update_time) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="checkPermission(['ADMIN','FILE_ALL', 'FILE_DELETE'])"
          label="操作"
          align="center"
          min-width="100px"
        >
          <template slot-scope="scope">
            <el-popover
              v-permission="['ADMIN','FILE_ALL', 'FILE_DELETE']"
              placement="top"
              width="180"
              :ref="scope.row._id"
              trigger="click"
              popper-class="operat_pop"
            >
              <p class="operat_text">确定删除此条文件吗，此操作不能撤销！</p>
              <div class="operat_btn">
                <el-button size="mini" type="text" @click="$refs[scope.row._id].doClose()">取消</el-button>
                <el-button
                  size="mini"
                  :loading="delLoading"
                  type="primary"
                  @click="subDelete(scope.row._id)"
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
      </el-table>
    </div>
    <e-footer :currentPage="currentPage" :size="size" :total="total" :sup_this="sup_this"></e-footer>
  </div>
</template>

<script>
import checkPermission from "@/utils/permission";
import LogHeader from "./module/header";
import eFooter from "@/components/common/Footer";
import initData from "@/mixins/initData";
import { formatDate } from "@/utils/mUtils";
import { delImage } from "@/api/otherApi/tinymceImg";
export default {
  components: {
    LogHeader,
    eFooter
  },
  mixins: [initData],
  data() {
    return {
      multipleSelection: [],
      delLoading: false,
      sup_this: this,
      priviewUrlList: []
    };
  },
  created() {
    // 希望所有子组件视图渲染完毕，再调用对应函数
    let _this = this;
    // 箭头函数，内部的this,默认指向Dom元素最外层this，避免指向window
    // 可以定义一个变量存储当前this
    this.$nextTick(() => {
      _this.init();
    });
  },
  watch: {
    data: function(newValue, oldVale) {
      this.getAllImgList(newValue);
    }
  },
  methods: {
    // 外部函数在此定义
    formatDate,
    checkPermission,
    // 根据混入必须复写的初始化函数
    beforeInit() {
      this.url = "tinymceDocu/picture";
      const sort = "_id,1";
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
    // 批量删除
    handleSelectionChange(val) {
      this.multipleSelection = val;
      console.log(val);
    },

    async subDelete(_id) {
      this.delLoading = true;
      let deleteId = await delImage(_id);
      if (deleteId.data && deleteId.data.status == 200) {
        this.delLoading = false;
        this.$refs[_id].doClose();
        this.init();
      } else {
        this.delLoading = false;
        this.$refs[_id].doClose();
      }
    },

    // 图片列表
    getAllImgList(newData) {
      if (newData.length) {
        this.priviewUrlList = [];
        newData.forEach(item => {
          this.priviewUrlList.push(item.priview_url);
        });
      }
    },

    // 大图预览时，定位当前图片的index
    getPriviewUrlList(index) {
      return this.priviewUrlList
        .slice(index)
        .concat(this.priviewUrlList.slice(0, index));
    }
  }
};
</script>

<style lang="scss">
.el-popper[x-placement^="top"] {
  font-size: 12px;
  letter-spacing: 2px;
  line-height: 20px;
  color: #8c8e90;
}
.my-img {
  .el-image {
    width: 100px;
    height: 60px;
  }
}
</style>
