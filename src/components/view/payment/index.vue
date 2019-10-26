<template>
  <div class="w_content my-pay">
    <div class="my-head">
      <span>沙箱支付</span>
    </div>
    <div class="pay-cont">
      <!-- <el-row type="flex" justify="center">
        <el-col :span="22">
          <el-steps :active="stepActive" simple>
            <el-step title="步骤 1" icon="el-icon-edit"></el-step>
            <el-step title="步骤 2" icon="el-icon-upload"></el-step>
            <el-step title="步骤 3" icon="el-icon-s-check"></el-step>
          </el-steps>
        </el-col>
      </el-row>-->
      <el-row type="flex" justify="center" class="cont-main">
        <el-col :span="22" class="cont-form">
          <el-form
            ref="form"
            :model="form"
            :rules="formRules"
            label-width="80px"
            size="mini"
            v-if="stepActive === 0"
          >
            <el-form-item label="订单名称" required prop="name">
              <el-input v-model="form.name"></el-input>
            </el-form-item>
            <el-form-item label="苹果" prop="fruitApple">
              <el-input-number v-model="form.fruitApple" :min="1" @change="changePrice"></el-input-number>
            </el-form-item>
            <el-form-item label="芒果" prop="fruitMango">
              <el-input-number v-model="form.fruitMango" :min="1" @change="changePrice"></el-input-number>
            </el-form-item>
            <el-form-item label="火龙果" prop="fruitDragonFruit">
              <el-input-number v-model="form.fruitDragonFruit" :min="1" @change="changePrice"></el-input-number>
            </el-form-item>
            <el-form-item label="橙子" prop="fruitOrange">
              <el-input-number v-model="form.fruitOrange" :min="1" @change="changePrice"></el-input-number>
            </el-form-item>
            <el-form-item label="总价" prop="price">
              <el-input v-model="form.price"></el-input>
            </el-form-item>
            <el-form-item label="订单备注" prop="remarks">
              <el-input type="textarea" v-model="form.remarks"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit('form')">支付</el-button>
            </el-form-item>
          </el-form>
          <!-- <el-form ref="formTw" :model="form" label-width="80px" size="mini" v-if="stepActive === 1">
            <el-form-item label="活动名称">
              <el-input v-model="form.name"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmitTw">下一步</el-button>
            </el-form-item>
          </el-form>
          <el-form ref="formThr" :model="form" label-width="80px" size="mini" v-if="stepActive === 2">
            <el-form-item label="恭喜你！">
              <el-input v-model="form.name"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmitThr">完成</el-button>
            </el-form-item>
          </el-form>-->
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { doPay, queryPay } from "@/api/otherApi/payment";
import initPerm from "@/mixins/initPerm";
export default {
  // 混入，分发复用功能（是否有权限打开此页面）
  mixins: [initPerm],
  data() {
    return {
      stepActive: 0,
      form: {
        name: "水果大促销",
        fruitApple: "1",
        fruitMango: "1",
        fruitDragonFruit: "1",
        fruitOrange: "1",
        price: "45",
        remarks: "测试"
      },
      formRules: {
        name: [{ required: true, message: "请输入订单名称", trigger: "blur" }]
      },
      checkPermArr: ["ADMIN", "PAY_CREATE"]
    };
  },
  created() {
    this.queryIfSuccessPay();
  },
  methods: {
    onSubmit(refName) {
      this.$refs[refName].validate(async valid => {
        // 【注意】 标签属性prop的字段名和v-model的属性名一致
        if (valid) {
          let tempDa = await doPay(this.form);
          if (tempDa.data.status == 200) {
            window.open(tempDa.data.data);
          }
          // this.stepActive++;
        } else {
          // console.log('error submit!!');
          return false;
        }
      });
    },

    changePrice() {
      // 价格依次对应： 苹果、芒果、火龙果、橙子
      let aCash = 8,
        mCash = 12,
        dCash = 15,
        oCash = 10;
      this.form.price =
        this.form.fruitApple * aCash +
        this.form.fruitMango * mCash +
        this.form.fruitDragonFruit * dCash +
        this.form.fruitOrange * oCash;
    },

    // 判断是否支付页面跳转过来
    async queryIfSuccessPay() {
      let query = this.$route.query;
      // 判断是否为空对象
      if (Object.keys(query).length > 0) {
        let outTradeNo = query["out_trade_no"];
        let data = await queryPay(outTradeNo);
      }
    }

    // onSubmitTw() {
    //   console.log("submit!");
    //   this.stepActive++;
    // },

    // onSubmitThr() {
    //   console.log("submit!");
    //   this.stepActive = 0;
    // }
  }
};
</script>

<style lang="scss">
.my-pay {
  .pay-cont {
    .cont-main {
      margin-top: 20px;
    }
    .cont-form {
      background: #fff;
      padding: 40px 20px;
      .el-form {
        width: 380px;
        margin: 0 auto;
      }
      .el-button {
        width: 200px;
        height: 36px;
      }
      .el-input-number {
        width: 100%;
      }
    }
    .el-steps--simple {
      background: #fff;
      .el-step__title {
        font-size: 14px;
      }
      .el-step__icon-inner {
        font-size: 16px;
      }
    }
  }
}
</style>


