<template>
    <div class="my-login">
        <el-container>
            <el-header></el-header>
            <el-main>
                <el-form :model="form" :rules="myRules" ref="form">
                    <el-form-item label="用户名" prop="name" class="user-input">
                        <el-input type="text" v-model="form.name" auto-complete="off" placeholder="请输入用户名"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="pass">
                        <el-input type="password" v-model="form.pass" auto-complete="off" placeholder="请输入密码" @keyup.enter.native="submitForm('form')"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" :loading="loading" @click="submitForm('form')">
                          <span v-if="!loading">登录</span>
                          <span v-else>登录中</span>
                        </el-button>
                    </el-form-item>
                </el-form>
            </el-main>
        </el-container>
        <div class="wrap">
          <div class="start" v-for="i in 20" :key="i"></div>
        </div>
        <!-- <div class="m_loading">
          <div class="m_obj" v-for="o in 8" :key="o+'obj'"></div>
        </div> -->
        <!-- <div class="m_bubble">
          <div v-for="b in 10" :key="b+'bub'" :class="'bubble b'+b"></div>
        </div> -->
    </div>
</template>

<script>
import { getStore } from '../utils/mUtils';
import { mapGetters, mapActions } from 'vuex';
import store from '@/store';
export default {
    data() {
        return {
            loading: false,
            notification: '',
            form:{
                name: 'wwt',
                pass: 'wwt123'
            },
            myRules: {
              name: [
                { required: true, message: '请输入用户名', trigger: 'blur' }
              ],
              pass: [
                { required: true, message: '请输入密码', trigger: 'blur' }
              ]
            }
        }
    },
    created() {
      this.tipUserInfo();
    },
    mounted() {},
    computed: {
        ...mapGetters(['menus', 'roles'])
    },
    methods: {
        ...mapActions(['addMenu', 'loginSuccess', 'userToken', 'setRoles', 'setUser', 'loginIn']),
        submitForm(formName) {
            let _this = this;
            _this.$refs[formName].validate(async (valid) => {
              if(valid) {
                let user = await _this.$api.userInfo.login(_this.form);
                if ( user.data.status == 200 ) {
                    let tempData = user.data.data;
                    // // 存储登录信息---token
                    // _this.userToken(tempData.userInfo.token);
                    // // 存储登录权限
                    // _this.setRoles(tempData.menuAndPerm[1]);
                    // // 存储用户信息
                    // _this.setUser(tempData.userInfo);

                    // 存储用户信息
                    _this.loginIn(tempData);


                  // 存储到本地菜单 【问题】因为是异步获取菜单，所有登录之后菜单还没存储到localStorage中
                  // 【思路】在Promise的then()回调函数中执行跳转。。。。。。。。。。不行哎
                  // 【方法】在异步addMenu函数中添加一个参数，即登录后获取的菜单数据，可能是moogose查询数据库很慢，所以尽量减少请求接口次数                  

                  let menuList = tempData.menuAndPerm[0];
                  // console.group('-【登录接口菜单数据】---------menuList========');
                  // console.table(menuList);
                  // console.groupEnd();
                  if (menuList.length > 0) {
                    _this.notification.close();
                    // 登录成功
                    _this.loginSuccess(true);
                    // 增加菜单
                    _this.addMenu(menuList);
                    _this.$router.push(menuList[0].redirect ? menuList[0].redirect : menuList[0].children[0].path);                  
                  } else {
                    this.$notify({
                      title: '警告',
                      message: '该账户没有登录权限喔，请管理员添加权限',
                      type: 'warning'
                    })
                  }

                }
              } else {
                return false;
              }
            });
        },
        tipUserInfo() {
          this.notification = this.$notify({
            title: '当当...',
            message: '用户名：wwt，密码：wwt123',
            duration: 0,   // 不会自动关闭
            offset: 50
          })
        }
    }
}
</script>

<style lang="scss" scoped>
$boder_font: #dcdcf9;
$main-color: #307bc8;
.my-login {
  width: 100%;
  height: 100%;
  &:before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-image: url(../../static/img/bg_an4.jpg);
    background-size: cover;
    opacity: 0.9;
  }
  .el-header {
    margin-top: 100px;
  }
  .el-main {
    width: 380px;
    margin: 0 auto;
    border: 1px solid $boder_font;
    background: rgba(255, 255, 255, 0.25);
    border-radius: 3px;
    // sass和less的样式穿透
    /deep/ .el-form-item__label {
      color: $boder_font;
    }
    .el-button {
      width: 100%;
    }
  }

  // 流星动画
  .wrap {
    width: 100%;
    height: 100%;
    position: absolute;    
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transform: rotateZ(45deg); // 倾斜
    z-index: -1;
    
    .start {
      height: 2px;
      background: linear-gradient(-45deg, #c7ecee, rgba(0, 0, 255, 0));
      position: absolute;
      border-radius: 50%;
      filter: drop-shadow(0 0 6px #c7ecee); // 给图像下面设置一个阴影效果
      animation: scaling 2s ease-in-out infinite, moveTo 3s ease-in-out infinite;
      &:nth-child(1) {
        top: 30%;
        left: 25%;
        animation-delay: 6s; // 设置动画延迟
      }
      &:nth-child(2) {
        top: 40%;
        left: 30%;
        animation-delay: 5s;
      }
      &:nth-child(3) {
        top: 50%;
        left: 35%;
        animation-delay: 2.8s;
      }
      &:nth-child(4) {
        top: 60%;
        left: 40%;
        animation-delay: 2.5s;
      }
      &:nth-child(5) {
        top: 35%;
        left: 35%;
        animation-delay: 3s;
      }
      &:nth-child(6) {
        top: 45%;
        left: 25%;
        animation-delay: 2s;
      }
      &:nth-child(7) {
        top: 55%;
        left: 25%;
        animation-delay: 1s;
      }
      &:nth-child(8) {
        top: 65%;
        left: 25%;
        animation-delay: 1.5s;
      }
      &:nth-child(9) {
        top: 65%;
        left: 35%;
        animation-delay: 1.8s;
      }
      &:nth-child(10) {
        top: 60%;
        left: 28%;
        animation-delay: 3.5s;
      }
      &:nth-child(11) {
        top: 60%;
        left: 20%;
        animation-delay: 4s;
      }
      &:nth-child(12) {
        top: 50%;
        left: 20%;
        animation-delay: 5.5s;
      }
      &:nth-child(13) {
        top: 55%;
        left: 45%;
        animation-delay: 1.2s;
      }
      &:nth-child(14) {
        top: 45%;
        left: 45%;
        animation-delay: 3.8s;
      }
      &:nth-child(15) {
        top: 38%;
        left: 25%;
        animation-delay: 3.4s;
      }
      &:nth-child(16) {
        top: 40%;
        left: 40%;
        animation-delay: 0.5s;
      }
      &:nth-child(17) {
        top: 50%;
        left: 50%;
        animation-delay: 5.3s;
      }
      &:nth-child(18) {
        top: 70%;
        left: 28%;
        animation-delay: 4s;
      }
      &:nth-child(19) {
        top: 60%;
        left: 40%;
        animation-delay: 3s;
      }
      &:nth-child(20) {
        top: 40%;
        left: 48%;
        animation-delay: 2s;
      }
    }
    // 拉长动画
    @keyframes scaling {
      0% {
        width: 0;
      }
      50% {
        width: 100px;
      }
      100% {
        width: 0;
      }
    }
    // 移动动画
    @keyframes moveTo {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(300px);
      }
    }
  }

  // 加载动画
  .m_loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); // 居中
    height: 40px;
    display: flex;
    align-items: center;
    
    .m_obj {
      width: 6px;
      height: 40px;
      background: white;
      margin: 0 3px;
      border-radius: 10px;
      animation: loading 0.8s infinite;
      &:nth-child(2) {
        animation-delay: 0.1s;
      }
      &:nth-child(3) {
        animation-delay: 0.2s;
      }
      &:nth-child(4) {
        animation-delay: 0.3s;
      }
      &:nth-child(5) {
        animation-delay: 0.4s;
      }
      &:nth-child(6) {
        animation-delay: 0.5s;
      }
      &:nth-child(7) {
        animation-delay: 0.6s;
      }
      &:nth-child(8) {
        animation-delay: 0.7s;
      }
    }
    // 加载动画
    @keyframes loading {
      0% {
        height: 0;
      }
      50% {
        height: 40px;
      }
      100% {
        height: 0;
      }
    }
  }

  // 泡泡动画
  .m_bubble {
    .bubble {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      position: absolute;
      box-shadow: 0 20px 30px rgba(0,0,0,0.2), inset 0 10px 30px 5px rgba(255, 255, 255, 1);
    }
    .b1 {
      left: -5%;
      top: 5%;
      transform: scale(0.6);  // 缩放比例
      animation: bubble 25s linear infinite, direction 2s ease-in-out infinite alternate;
    }
    .b2 {
      left: 5%;
      top: 80%;
      transform: scale(0.4);
      animation: bubble 20s linear infinite, direction 4s ease-in-out infinite alternate;
    }
    .b3 {
      left: 10%;
      top: 40%;
      transform: scale(0.7);
      animation: bubble 28s linear infinite, direction 2s ease-in-out infinite alternate;
    }
    .b4 {
      left: 20%;
      top: 0%;
      transform: scale(0.3);
      animation: bubble 22s linear infinite, direction 3s ease-in-out infinite alternate;
    }
    .b5 {
      left: 30%;
      top: 50%;
      transform: scale(0.3);
      animation: bubble 29s linear infinite, direction 4s ease-in-out infinite alternate;
    }
    .b6 {
      left: 50%;
      top: 0;
      transform: scale(0.8);
      animation: bubble 21s linear infinite, direction 2s ease-in-out infinite alternate;
    }
    .b7 {
      left: 65%;
      top: 70%;
      transform: scale(0.4);
      animation: bubble 20s linear infinite, direction 2s ease-in-out infinite alternate;
    }
    .b8 {
      left: 80%;
      top: 10%;
      transform: scale(0.3);
      animation: bubble 22s linear infinite, direction 3s ease-in-out infinite alternate;
    }
    .b9 {
      left: 90%;
      top: 50%;
      transform: scale(0.6);
      animation: bubble 29s linear infinite, direction 4s ease-in-out infinite alternate;
    }
    .b10 {
      left: 80%;
      top: 80%;
      transform: scale(0.3);
      animation: bubble 26s linear infinite, direction 2s ease-in-out infinite alternate;
    }
    @keyframes bubble {
      0% {
        margin-top: 100%;      
      }
      100% {
        margin-top: -100%;
      }
    }
    @keyframes direction {
      0% {
        margin-left: 0;
      }
      100% {
        margin-left: 50px;
      }
    }
  }
}
</style>

