<template>
  <div class="w_icon_select">
    <el-input v-model="name" placehold="请输入图标名称" @input.native="filterIcons" @clear="reset" clearable>
      <i slot="suffix" class="el-icon-search el-input__icon" />
    </el-input>
    <div class="icon_list">
      <div class="icon_init" v-for="(item, index) in iconList" :key="index+'ics'" @click="selectedIcon(item)">
        <svg class="icon icon-menu" aria-hidden="true">
          <use :xlink:href="'#'+item"></use>
        </svg>
        <span class="text_icon">{{ item }}</span>
      </div>
    </div>
  </div>
</template>
<script>
  import icons from './requireIcons'
  export default {
    data() {
      return {
        name: '',
        iconList: icons
      }
    },
    methods: {
      // 选择图标
      selectedIcon(name) {
        console.log('child---------', name);
        this.$emit('selected', name); // 子组件发布函数给父组件 菜单form.vue
        document.body.click();   // 可以关闭菜单图标组件
      },

      // 重置图标
      reset() {
        console.log('==================', icons);
        this.name = '';
        this.iconList = icons;
      },

      // 筛选图标
      filterIcons() {
        if (this.name) {
          this.iconList = this.iconList.filter(item => item.includes(this.name));
          console.log('--------------filter=--------', this.iconList);
        } else {
          this.iconList = icons;
        }
      }
    }
  }
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
  .w_icon_select {
    width: 100%;
    padding: 10px;
    .icon_list {
      height: 200px;
      overflow-y: scroll;
      .icon_init {
        height: 30px;
        line-height: 30px;
        margin-bottom: -3px;
        cursor: pointer;
        width: 50%;
        float: left;
        .icon-menu {
          width: 18px;
          height: 18px;
          vertical-align: 5px;
        }
      }
      .text_icon {
        display: inline-block;
        vertical-align: -.15em;
        fill: blue;
        overflow: hidden;
      }
    }
  }
</style>
