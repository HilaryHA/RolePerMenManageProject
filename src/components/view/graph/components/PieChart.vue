<template>
  <div class="my_pie">
    <div ref="myPie" class="pie-cont"></div>
  </div>
</template>
<script>
import echarts from "echarts";
import { debounce } from "@/utils/mUtils";

// 更新动画的时长
const animationDuration = 1000;

export default {
  data() {
    return {
      pieData: {}
    };
  },
  mounted() {
    let _this = this;
    _this.$nextTick(() => {
      _this.initChart();
      _this.__resizeHandler = debounce(() => {
        if (_this.pieData) {
          _this.pieData.resize();
        }
      }, 100);
      window.addEventListener("resize", _this.__resizeHandler);
    });
  },
  methods: {
    // 绘制图形
    initChart() {
      let option = {
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b}: {c} ({d}%)",
          padding: [8, 14, 8, 14]
        },
        legend: {
          orient: "vertical",
          x: "left",
          left: '40',
          top: '40',
          data: [
            "直达",
            "营销广告",
            "搜索引擎",
            "邮件营销",
            "联盟广告",
            "视频广告",
            "百度",
            "谷歌",
            "必应",
            "其他"
          ]
        },
        series: [
          {
            name: "访问来源",
            type: "pie",
            // 是否支持多选: false/true; single/multiple
            selectedMode: "single",
            radius: [0, "20%"],
            // hover上去是否有动画
            hoverAnimation: false,

            label: {
              normal: {
                position: "inner"
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data: [
              { value: 335, name: "直达", selected: true , itemStyle: {color: '#2ec7c9'}},
              { value: 679, name: "营销广告" , itemStyle: {color: '#b6a2de'}},
              { value: 1548, name: "搜索引擎" , itemStyle: {color: '#5ab1ef'}}
            ]
          },
          {
            name: "访问来源",
            type: "pie",
            radius: ["25%", "40%"],
            // label: {
            //   normal: {
            //     formatter: "{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ",
            //     backgroundColor: "#eee",
            //     borderColor: "#aaa",
            //     borderWidth: 1,
            //     borderRadius: 4,
            //     // shadowBlur:3,
            //     // shadowOffsetX: 2,
            //     // shadowOffsetY: 2,
            //     // shadowColor: '#999',
            //     // padding: [0, 7],
            //     rich: {
            //       a: {
            //         color: "#999",
            //         lineHeight: 22,
            //         align: "center"
            //       },
            //       // abg: {
            //       //     backgroundColor: '#333',
            //       //     width: '100%',
            //       //     align: 'right',
            //       //     height: 22,
            //       //     borderRadius: [4, 4, 0, 0]
            //       // },
            //       hr: {
            //         borderColor: "#aaa",
            //         width: "100%",
            //         borderWidth: 0.5,
            //         height: 0
            //       },
            //       b: {
            //         fontSize: 16,
            //         lineHeight: 33
            //       },
            //       per: {
            //         color: "#eee",
            //         backgroundColor: "#334455",
            //         padding: [2, 4],
            //         borderRadius: 2
            //       }
            //     }
            //   }
            // },
            data: [
              { value: 335, name: "直达" , itemStyle: {color: '#2ec7c9'}},
              { value: 310, name: "邮件营销" , itemStyle: {color: '#ffb980'}},
              { value: 234, name: "联盟广告" , itemStyle: {color: '#d87a80'}},
              { value: 135, name: "视频广告" , itemStyle: {color: '#8d98b3'}},
              { value: 1048, name: "百度" , itemStyle: {color: '#e5cf0d'}},
              { value: 251, name: "谷歌" , itemStyle: {color: '#97b552'}},
              { value: 147, name: "必应" , itemStyle: {color: '#95706d'}},
              { value: 102, name: "其他" , itemStyle: {color: '#dc69aa'}}
            ]
          }
        ]
      };
      this.pieData = this.$echarts.init(this.$refs.myPie);
      this.pieData.setOption(option);
    }
  }
};
</script>
<style lang="scss">
.my_pie {
  .pie-cont {
    width: 100%;
    height: 500px;
    // background: #fff;
  }
}
</style>