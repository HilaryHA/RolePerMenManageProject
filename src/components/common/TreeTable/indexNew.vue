<template>
  <div class="tree_table">
    <el-table ref="treeTable" :data="formatData" :row-style="showRow"
              :default-expand-all="expandAll" :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
              :row-key="getRowKeys" :expand-row-keys="treeExpands" @expand-change="expandSelect">
      <el-table-column v-for="(column, index) in columns" v-if="columns.length !== 0" :key="column.value" :label="column.text" :width="column.width" >
        <template slot-scope="scope">
          {{ scope.row[column.value] }}
        </template>
      </el-table-column>
      <slot />
    </el-table>

  </div>
</template>

<script>
  /**
   * @author: Hilary
   * @Date: 2019/06/10
   */
  import treeToArray from './eval'
  export default {
    name: 'TreeTable',
    props: { /*跳过eslint的检验*/
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
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        treeExpands: []
      }
    },
    computed: {
      // 格式化数据源
      formatData: function() {
        return this.data;

        // return [
        //   {
        //     "children": [
        //       {
        //         "children": [
        //           {
        //             "_id": "5cf8b7cec61029850536445d",
        //             "name": "研发部",
        //             "pid": 2,
        //             "create_time": "2019-06-06T06:50:54.398Z",
        //             "enabled": true,
        //             "id": 6
        //           }
        //         ],
        //         "_id": "5cf8b75bc61029850536445b",
        //         "name": "华南分部",
        //         "pid": 1,
        //         "create_time": "2019-06-06T06:48:59.585Z",
        //         "enabled": true,
        //         "id": 2
        //       },
        //       {
        //         "_id": "5cf8b7a2c61029850536445c",
        //         "name": "华北分部",
        //         "pid": 1,
        //         "create_time": "2019-06-06T06:50:10.642Z",
        //         "enabled": true,
        //         "id": 3
        //       }
        //     ],
        //     "_id": "5cf8b6cfc61029850536445a",
        //     "name": "wwtadmin",
        //     "pid": 0,
        //     "create_time": "2019-06-06T06:46:39.250Z",
        //     "enabled": true,
        //     "id": 1
        //   }
        // ]
      }
    },
    watch: {
      data: {
        handler (nv) {
          console.log(nv);
          return nv
        },
        deep: true,
        immediate: false // 若为true,即在watch声明之后，立即执行handler方法，false表示不会再绑定时执行
      }
    },
    methods: {
      // 行的style的回调函数
      showRow: function (row) {
        const show = (row.row.parent ? (row.row.parent._expanded && row.row.parent._show) : true );
        row.row._show = show;
        return show ? 'animation:treeTableShow 1s;-webkit-animation:treeTableShow 1s;' : 'display: none';
      },
      // 切换是否展开下级
      toggleExpanded: function (paIndex) {
        const record = this.formatData[paIndex];
        record._expanded = !record._expanded;
      },
      // 是否显示图标
      iconShow: function (index, record) {
        return (index === 0 && record.children && record.children.length > 0);
      },
      openOrClose() {
        // console.log(this.expandAll);
        // console.log(this.$refs.treeTable.store);
        // this.expandAll = !this.expandAll;
        // for(var i=0;i<this.$refs.tree.store._getAllNodes().length;i++){
        //   this.$refs.tree.store._getAllNodes()[i].expanded=this.expandAll;
        // }

      },

      // 设置row-key
      getRowKeys (row) {
        return row.id;
      },

      expandSelect (row, expandedRows) {
        console.log('===============data===============');
        console.log('===============data===============',row, expandedRows);
      }

    }
  }
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
<style lang="scss" rel="stylesheet/scss" scoped>
  $color-blue: #2196F3;
  $space-width: 8px;
  @mixin icon-before($cont) {
    &:before {
      content: $cont;
    }
  }
  .tree_table {
    table td {
      line-height: 26px;
    }

    .el-table__expand-icon {
      color: $color-blue;
      margin-left: $space-width;
      margin-right: $space-width;
      font-size: 16px;
      .el-icon{
        margin-top: -$space-width;
        margin-left: -$space-width;
        @include icon-before("\e6d9");
      }
    }

    .el-table__expand-icon--expanded {
      transform: rotate(0deg);
      .el-icon{
        @include icon-before("\e6d8");
      }
    }

  }

</style>
