<template>
  <!-- '$attrs'表示子组件在父作用域中不作为 prop 被识别 (且获取) 的特性绑定 (class 和 style 除外) -->
  <el-table
    :data="formatData"
    :row-style="showRow"
    v-bind="$attrs"
    :row-key="getRowKeys"
    class="tree_table"
  >
    <!-- 表示children为空的父元素 -->
    <el-table-column v-if="columns.length === 0" width="150">
      <template slot-scope="scope">
        <span v-for="(space, spIndex) in scope.row._level" :key="spIndex+'sp'" class="w_tree_space"></span>
        <span v-if="iconShow(0, scope.row)" class="icon_tree" @click="toggleExpanded(scope.row)">
          <!-- 默认是'+' -->
          <i v-if="!scope.row._expanded" class="el-icon-plus"></i>
          <i v-else class="el-icon-minus"></i>
        </span>
        {{ space.$rowIndex }}
      </template>
    </el-table-column>
    <el-table-column
      v-for="(column, index) in columns"
      v-else
      :key="column.value"
      :label="column.text"
      :width="column.width"
    >
      <template slot-scope="scope">
        <span
          v-for="space in scope.row._level"
          :key="space+'sc'"
          v-if="index === 0"
          class="w_tree_space"
        ></span>
        <span
          v-if="iconShow(index, scope.row)"
          class="icon_tree"
          @click="toggleExpanded(scope.row)"
        >
          <i v-if="!scope.row._expanded" class="el-icon-plus"></i>
          <i v-else class="el-icon-minus"></i>
        </span>
        <!-- column.value此处为name -->
        {{ scope.row[column.value] ? scope.row[column.value] : 'Top category' }}
      </template>
    </el-table-column>
    <!-- 匿名slot只能作为没有slot属性的元素的插槽 -->
    <slot />
  </el-table>
</template>

<script>
/**
 * @author: Hilary
 * @Date: 2019/06/10
 */
import treeToArray from "./eval";
export default {
  name: "TreeTable",
  props: {
    /*跳过eslint的检验*/
    /* eslint-disable */
    data: {
      type: [Array, Object],
      required: true
    },
    columns: {
      type: Array,
      defalut: () => []
    },
    evalFunc: Function,
    evalArgs: Array,
    expandAll: {
      // 对应dept的index.vue中传递的值expand-all
      type: Boolean,
      default: false
    }
  },
  watch: {
    data: {
      handler(newValue, oldValue) {
        return newValue;
      },
      deep: true,
      immediate: false // 若为true,即在watch声明之后，立即执行handler方法，false表示不会再绑定时执行
    }
  },
  data() {
    return {
      rowKey: [],
      tmpIndex: 0
    };
  },
  computed: {
    // 格式化数据源
    formatData: function() {
      let tmp;
      let tmpData, agrs;
      // 判断是否为数组
      if (!Array.isArray(this.data)) {
        tmp = [this.data];
      } else {
        tmp = this.data;
      }
      const func = this.evalFunc || treeToArray;
      // evalArgs的值: 通过控制this.expandAll实现展开、收缩全部，每一个元素都有_expanded属性
      const args = this.evalArgs
        ? Array.concat([tmp, this.expandAll], this.evalArgs)
        : [tmp, this.expandAll];

      [tmpData, ...agrs] = func.apply(null, args);
      return this.getEndData(tmpData, ...args);

      // 以下方法获取表格数据，渲染过程有问题，rowKey会报错，二层子级开始会循环两次
      // return func.apply(null, args); // 第一个参数与'null'，函数体内的this会默认指向宿主对象，在浏览器环境中，就是window
      // apply第二个参数为ArrayLike,(数组或类数组 -- 如对象{'0': '2', '1', '5', 'length': '2'})
    }
  },
  methods: {
    /**
     * 模糊查询时，默认获取数组第一个元素，模糊查询时，可能第一个元素并不是父元素
     * @param firstData 第一个元素(Object)
     * @param endArgs   其它元素(Array)
     * @returns {Array}
     */
    getEndData: function(firstData, endArgs) {
      let arr = [];
      if (firstData !== undefined && firstData !== null && firstData !== "") {
        arr.push(firstData); // 默认情况
        if (endArgs.length && endArgs.length > 0) {
          endArgs.map(item => {
            let arrTmp = this.getComParent(item, firstData.id);
            if (arrTmp) {
              arr = arr.concat(arrTmp); // 连接第一个元素和模糊查询的数组
            }
          });
        }
      }
      return arr;
    },

    /**
     * 递归查询父元素是否相等
     * @param data  需要对比的对象 (Object)
     * @param id    对比项的id (Number)
     * @returns {*}
     */
    getComParent(data, id) {
      if (data.id == id) {
        return false;
      } else if (data.parent && data.parent.length > 0) {
        this.getComParent(data.parent, id);
      } else {
        return data;
      }
    },

    // 行的style的回调函数
    showRow: function(row) {
      const show = row.row.parent
        ? row.row.parent._expanded && row.row.parent._show
        : true;
      row.row._show = show;
      return show
        ? "animation:treeTableShow .5s;-webkit-animation:treeTableShow .5s;"
        : "display: none";
    },
    // 切换是否展开下级
    toggleExpanded: function(row) {
      // scope属性有store、$index、row等
      this.findById(row.id);

      // 以下方法展开收缩有问题
      // const record = this.formatData[paIndex];
      // record._expanded = !record._expanded;
    },

    // 查找formatData中对应id的数据
    findById(subId) {
      let tmp = this.formatData;
      tmp = this.changeExpanded(tmp, subId);
    },

    // 通过改变_expanded的值，实现收缩、展开
    changeExpanded(data, subId) {
      data.map((item, index) => {
        if (item.id == subId) {
          item._expanded = !item._expanded;
          return item;
        } else if (item.children && item.children.length > 0) {
          this.changeExpanded(item.children, subId);
        }
      });
      return data;
    },

    // 是否显示图标
    iconShow: function(index, record) {
      return index === 0 && record.children && record.children.length > 0;
    },
    // 设置row-key
    getRowKeys(row) {
      // 直接返回row.id，若做其他操作，容易出现死循环
      return row.id;
    }
  }
};
</script>

<style rel="stylesheet/css">
@keyframes treeTableShow {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@-webkit-keyframes treeTableShow {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
<style lang="scss" rel="stylesheet/scss">
$color-blue: #2196f3;
$space-width: 18px;
.tree_table {
  .w_tree_space {
    // 模仿空格，制造出层级关系
    position: relative;
    top: 1px;
    display: inline-block;
    font-style: normal;
    font-weight: 400;
    width: $space-width;
    height: 14px;
    &::before {
      content: "";
    }
  }

  table td {
    line-height: 26px;
  }

  .icon_tree {
    position: relative;
    cursor: pointer;
    color: $color-blue;
    margin-left: -$space-width;
  }

  .el-table__expand-icon {
    // 去除默认的icon
    width: 0;
    i::before {
      content: "";
    }
  }
}
</style>
