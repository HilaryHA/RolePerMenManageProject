<template>
  <div class="bar_com">
    <div id="myBar"></div>
  </div>
</template>

<script>
import echarts from "echarts";
import { debounce } from "@/utils/mUtils";

const animationDuration = 1000; // 更新动画的时长

export default {
  data() {
    return {
      myBar: null
    };
  },
  mounted() {
    this.$nextTick(() => {
      let _this = this;
      _this.initChart();
      _this.__resizeHandler = debounce(() => {
        if (_this.myBar) {
          this.myBar.resize();
        }
      }, 100);
      window.addEventListener("resize", _this.__resizeHandler);
    });
  },
  methods: {
    // 绘制图形
    initChart() {
      let _this = this;
      let option = {
        backgroundColor: "#FFF",
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
            // label: {
            //     show: 'true',
            //     color: '#000'
            // },
            shadowStyle: {
              color: "rgba(238, 238, 238, 0.5)"
            }
          },
          backgroundColor: "rgba(148, 148, 148, 1)",
          textStyle: {
            color: "#FFF"
          }
        },
        grid: {
          left: "2%", // grid 组件离左侧的距离
          right: "4%",
          bottom: "14%",
          top: "16%",
          containLabel: true
        },
        legend: {
          data: ["cs1", "cs2"], // 图例组件,点击图例控制哪些系列不显示
          right: 10,
          top: 12,
          textStyle: {
            color: "#323232"
          },
          itemWidth: 30,
          itemHeight: 15
          // borderColor: '#323232',
          // shadowBlur: 10,
          // shadowColor: 'rgba(0, 0, 0, 0.5)',
          // borderWidth: 3,
          // borderRadius: 50
        },
        xAxis: {
          type: "category", // 坐标轴类型
          data: [
            "2012",
            "2013",
            "2014",
            "2015",
            "2016",
            "2017",
            "2018",
            "2019"
          ],
          axisLine: {
            lineStyle: {
              color: "#008acd" // 坐标轴线线的颜色
            }
          },
          axisLabel: {
            // 坐标轴刻度标签（坐标轴值）
            // show: false,
            textStyle: {
              fontFamily: "Microsoft YaHei"
            },
            color: "#323232"
          },
          // 坐标轴刻度
          axisTick: {
            show: true,
            lineStyle: {
              color: "#333333"
            }
          }
        },
        yAxis: {
          type: "value",
          max: "600",
          axisLine: {
            // show: false,
            lineStyle: {
              color: "#008acd"
            }
          },
          // y轴坐标轴区域内分割线
          splitLine: {
            show: true,
            lineStyle: {
              // color: 'rgba(0, 0, 0, 0.3)'
              color: "#eeeeee"
            }
          },
          // y轴坐标轴分隔区域
          splitArea: {
            show: true,
            areaStyle: {
              color: ["#f2f2f2", "#f7f7f7"]
            }
          },
          axisLabel: {
            // show: false,
            textStyle: {
              fontFamily: "Microsoft YaHei"
            },
            color: "#323232"
          },
          axisTick: {
            show: false
          }
        },
        dataZoom: [
          {
            // 区域缩放
            show: "true",
            type: "inside"
          }
        ],
        series: [
          {
            name: "cs1",
            type: "bar",
            barWidth: "15%",
            itemStyle: {
              normal: {
                // 默认的颜色
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: "#83bff6" },
                  { offset: 0.5, color: "#188df0" },
                  { offset: 1, color: "#188df0" }
                ]),
                barBorderRadius: [50, 50, 0, 0]
              },
              emphasis: {
                // 高亮时的颜色
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: "#d87a80" },
                  { offset: 0.3, color: "#ffb980" },
                  { offset: 0.7, color: "#5ab1ef" },
                  { offset: 1, color: "#b6a2de" }
                ])
              }
            },
            data: [400, 400, 300, 300, 300, 400, 400, 400, 300]
          },
          {
            name: "cs2",
            type: "bar",
            barWidth: "15%",
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: "#8bd46e"
                  },
                  {
                    offset: 1,
                    color: "#09bcb7"
                  }
                ]),
                barBorderRadius: [50, 50, 0, 0]
              }
            },
            data: [400, 500, 500, 500, 500, 400, 400, 500, 500]
          }
        ],
        animationDuration: animationDuration
      };
      _this.myBar = this.$echarts.init(document.querySelector("#myBar"));
      _this.myBar.setOption(option);
      _this.setBarAnimation(_this.myBar, option);
    },
    // 执行动画
    setBarAnimation(myChart, option) {
      let app = {
        currentIndex: -1
      };
      setInterval(function() {
        let dataLen = option.series[0].data.length;
        // 取消之前高亮的图形
        myChart.dispatchAction({
          type: "downplay",
          seriesIndex: 0,
          dataIndex: app.currentIndex
        });
        app.currentIndex = (app.currentIndex + 1) % dataLen;
        //console.log(app.currentIndex);
        // 高亮当前图形
        myChart.dispatchAction({
          type: "highlight",
          seriesIndex: 0,
          dataIndex: app.currentIndex
        });
        // 显示 tooltip
        // myChart.dispatchAction({
        //   type: 'showTip',
        //   seriesIndex: 0,
        //   dataIndex: app.currentIndex
        // });
      }, 1000);

      // 点击柱状图数据区域缩放
      let zoomSize = 6;
      myChart.on("click", function(params) {
        let xData = option.xAxis.data;
        myChart.dispatchAction({
          type: "dataZoom",
          startValue: xData[Math.max(params.dataIndex - zoomSize / 2, 0)],
          endValue:
            xData[Math.min(params.dataIndex + zoomSize / 2, xData.length - 1)]
        });
      });
    }
  },
  beforeDestroy() {
    if (!this.myBar) {
      return;
    }
    window.removeEventListener("resize", this.__resizeHandler);
    this.myBar.clear();
    this.myBar.dispose(); // 销毁实例
    this.myBar = null;
  }
};
</script>

<style lang="scss">
.bar_com {
  #myBar {
    width: 100%;
    height: 500px;
    // background: #FFF;
  }
}
</style>


