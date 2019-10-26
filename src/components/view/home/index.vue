<template>
  <div class="my-home">
    <el-container class="my-main">
      <el-menu
        :default-active="$route.path"
        class="el-menu-vertical-demo"
        @open="handleOpen"
        @close="handleClose"
        router
        :collapse="isCollapse"
      >
        <el-header>
          <svg v-if="!isCollapse" class="icon icon-logo" aria-hidden="true">
            <use xlink:href="#icondaxiang1" />
          </svg>
          <svg v-else-if="isCollapse" class="icon icon-small-logo" aria-hidden="true">
            <use xlink:href="#icongouliang_" />
          </svg>
        </el-header>
        <el-scrollbar>
          <template v-for="(item, index) in menuList" v-if="!item.hidden">
            <!-- 通过item.name判断是否有子选项 -->
            <el-submenu v-if="item.name" :index="item.path" :key="item.path">
              <template slot="title">
                <svg class="icon icon-title" aria-hidden="true">
                  <use :xlink:href="item.svgIcon" />
                </svg>
                <span slot="title">{{item.name}}</span>
              </template>
              <el-menu-item
                v-for="child in item.children"
                :index="child.path"
                :key="child.path"
                v-if="!item.hidden"
              >
                <svg class="icon icon-title" aria-hidden="true">
                  <use :xlink:href="child.svgIcon" />
                </svg>
                {{child.name}}
              </el-menu-item>
            </el-submenu>
            <el-menu-item
              v-else
              v-for="child in item.children"
              :index="child.path"
              :key="child.path"
            >
              <svg class="icon icon-title" aria-hidden="true">
                <use :xlink:href="child.svgIcon" />
              </svg>
              {{child.name}}
            </el-menu-item>
          </template>
        </el-scrollbar>
      </el-menu>
      <el-container class="my-cont">
        <el-header style="text-align: right; font-size: 12px">
          <svg class="icon icon-coll" aria-hidden="true" @click="iconControl">
            <use v-if="!isCollapse" xlink:href="#iconcaidan-shousuo" />
            <use v-else-if="isCollapse" xlink:href="#iconzhankai" />
          </svg>
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              用户{{username}}
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <!-- <el-dropdown-item command="a">个人资料</el-dropdown-item> -->
              <el-dropdown-item command="logout">退出</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-header>
        <el-main>
          <transition name="fade" mode="out-in">
            <router-view></router-view>
          </transition>
        </el-main>
        <el-footer class="my-footer">
          <div class="fo-info">
            <p class="fo-author">
              <a href="https://github.com/HilaryHA" target="_blank">{{ footerGithub }}</a>
            </p>
            <p class="fo-copyright">{{ footerDate }}</p>
          </div>
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { getStore, formatDate } from "@/utils/mUtils";
import { mapActions, mapGetters } from "vuex";
export default {
  data() {
    return {
      username: "Hilary",
      isCollapse: false,
      menuList: [],
      defultPath: "",
      footerGithub: "@HilaryHA",
      footerDate: formatDate(new Date(), 3)
    };
  },
  mounted() {
    this.menuList = this.menus;
    this.username = this.user && this.user.alias;
  },
  watch: {
    /* 监听menus数值 */
    menus: function(newVal) {
      if (newVal) {
        this.menuList = this.menus;
      }
    },
    user: function(newVal) {
      if(newVal) {
        this.username = newVal.alias;
      }
    }
  },
  computed: {
    ...mapGetters(["menus", "user"])
  },
  methods: {
    ...mapActions(["loginOut", "removeMenu"]),
    iconControl() {
      this.isCollapse = !this.isCollapse;
    },
    handleOpen() {},
    handleClose() {},

    // 用户操作
    handleCommand(command) {
      switch (command) {
        case "logout":
          this.doLogout();
          break;
        default:
          this.$message("click on item " + command);
          break;
      }
    },

    // 退出登录
    doLogout() {
      this.$confirm("此操作将退出登录，是否继续？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info"
      })
        .then(async () => {
          let user = await this.$api.userInfo.logout();
          if (user.data.status == 200) {
            // 清空数据
            this.loginOut();
            this.removeMenu();
            this.$router.push("/");
          }
        })
        .catch(() => {});
    }
  }
};
</script>

<style lang="scss">
.my-home {
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  .my-main {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
  }
  //默认
  .el-menu {
    width: 200px;
    height: 100%;
    transition: width 0.2s cubic-bezier(0.66, 1.36, 0.73, 0.56);
    .el-header {
      height: 60px;
      text-align: center;
      vertical-align: middle;
      line-height: 60px;
      background-color: #307bc8;
      color: #fff;
      font-size: 20px;
      overflow: hidden;
      .icon-logo {
        width: 100px;
        height: 60px;
      }
      .icon-small-logo {
        width: 32px;
        height: 60px;
        margin-left: -6px;
      }
    }
    .el-scrollbar {
      width: 200px;
      height: calc(100% - 60px);
      overflow: hidden;
      .el-scrollbar__wrap {
        overflow-x: hidden;
      }
    }
  }
  //收起
  .el-menu--collapse {
    height: 100%;
    width: 64px;
    .el-scrollbar {
      width: 64px;
    }
    .el-submenu__title {
      & > span {
        display: none;
      }
      & > .el-icon-arrow-right {
        display: none;
      }
    }
    & + .my-cont {
      left: 64px;
      .el-header {
        left: 65px;
      }
    }
    .el-scrollbar__view {
      .el-menu-item {
        .icon-title {
          padding-right: 30px;
        }
      }
    }
  }
  // 右侧内容
  .my-cont {
    background: #f9f9f9;
    position: absolute;
    left: 200px;
    top: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    z-index: 12;
    .el-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #307bc8;
      height: 60px;
      position: fixed;
      top: 0;
      right: 0;
      left: 201px;
      width: auto;
      z-index: 6;
      .icon-coll {
        color: #fff;
        cursor: pointer;
      }
      .el-dropdown-link {
        cursor: pointer;
        color: #fff;
      }
      .el-icon-arrow-down {
        font-size: 12px;
      }
    }
    .el-main {
      // overflow-y: scroll;
      margin-top: 60px;
      overflow: unset;
      padding: 0;
      // z-index: 9;
    }
    .my-footer {
      text-align: center;
      font-size: 12px;
      color: slategray;
      .fo-info {
        height: 60px;
        .fo-author {
          height: 30px;
          line-height: 30px;
          a {
            color: inherit;
            text-decoration: none;
            transition: all 0.5s ease-in-out;
            &:hover {
              color: #307bc8;
              font-weight: 700;
            }
          }
        }
      }
    }
  }
}
</style>


