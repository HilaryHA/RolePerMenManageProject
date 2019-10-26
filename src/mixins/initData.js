/**
 * 获取表格数据
 * @author Hilary
 * @date 2019/06/06
 */
import { getInitData } from '@/api/otherApi/data'

export default {
  data() {
    return {
      loading: false,  // v-loading加载
      data: [],       // 表格数据
      page: 0,        // 后端当前页数
      currentPage: 1, // 前端当前页数
      size: 10,       // 每页展示条数
      total: 0,       // 总条数
      url: '',        // 接口地址
      params: {},     // 接口参数
      query: {},      // 模糊查询参数
      time: 170       // 延迟时间
    }
  },
  methods: {
    /**
     * 获取表格数据
     */
    async init() {
      if (!await this.beforeInit()) {
        return;
      }
      return new Promise((resolve, reject) => {
        this.loading = true;
        getInitData(this.url, this.params).then(res => {
          // console.table(res.data)
          if (res.data.status == 200) {
            this.total = res.data.totalElements;
            if (res.data.content) {
              this.data = res.data.content;
            } else if (res.data.data) {
              this.data = res.data.data;
            }
            // console.log(this.data);
          }
          setTimeout(() => {
            this.loading = false;
          }, this.time);
          resolve(res); // 成功时必须要执行此回调
        }).catch(err => {
          // console.log('err================', err);
          this.loading = false;
          reject(err); // 失败时必须要执行此回调
        })
      });
    },
    /**
     * 初始化表格数据--对应组件需要复写此函数
     */
    beforeInit() {
      return true;
    },
    /**
     * 改变当前页
     * @param e
     */
    pageChange(e) {
      this.page = e - 1;
      this.currentPage = e;
      this.init();
    },
    /**
     * 改变每页展示数
     * @param e
     */
    sizeChange(e) {
      this.page = 0;
      this.currentPage = 1;
      this.size = e;
      this.init();
    }
  }
}
