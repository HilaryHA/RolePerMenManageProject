<template>
  <div class="bar_com">
    <div id="myBar">

    </div>
  </div>
</template>

<script>
  import echarts from 'echarts';
  export default {
    data() {
      return {
        myBar: '',
      }
    },
    created() {

    },
    mounted() {
      this.$nextTick(() => {
        let _this = this;

        let option = {
          backgroundColor: '#FFF',
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
              // label: {
              //     show: 'true',
              //     color: '#000'
              // },
              shadowStyle: { //
                color: 'rgba(226, 167, 220, 0.3)'
              }
            },
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            textStyle: {
              color: '#323232'
            }
          },
          grid: {
            left: '2%', // grid 组件离左侧的距离
            right: '4%',
            bottom: '14%',
            top: '16%',
            containLabel: true
          },
          legend: {
            data: ['cs1', 'cs2'], // 图例组件,点击图例控制哪些系列不显示
            right: 10,
            top: 12,
            textStyle: {
              color: '#323232'
            },
            itemWidth: 30,
            itemHeight: 15,
            // borderColor: '#323232',
            // shadowBlur: 10,
            // shadowColor: 'rgba(0, 0, 0, 0.5)',
            // borderWidth: 3,
            // borderRadius: 50
          },
          xAxis: {
            type: 'category', // 坐标轴类型
            data: ['2012','2013','2014','2015','2016','2017','2018','2019'],
            axisLine: {
              lineStyle: {
                color: 'rgba(71, 71, 71, 0.5)' // 坐标轴线线的颜色
              }
            },
            axisLabel: { // 坐标轴刻度标签（坐标轴值）
              // show: false,
              textStyle: {
                fontFamily: 'Microsoft YaHei'
              },
              color: '#323232'
            },
            axisTick: { // 坐标轴刻度
              show: false
            }
          },
          yAxis: {
            type: 'value',
            max:'600',
            axisLine: {
              // show: false,
              lineStyle: {
                color: 'rgba(71, 71, 71, 0.68)'
              }
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: 'rgba(0, 0, 0, 0.3)'
              }
            },
            axisLabel: {
              // show: false,
              textStyle: {
                fontFamily: 'Microsoft YaHei'
              },
              color: '#323232'
            },
            axisTick: {
              show: false
            }
          },
          dataZoom: [{ // 区域缩放
            show: 'true',
            type: 'inside'
          }],
          series: [
            {
              name: 'cs1',
              type: 'bar',
              barWidth: '15%',
              itemStyle: {
                normal: { // 默认的颜色
                  color: new echarts.graphic.LinearGradient(
                    0, 0, 0, 1,
                    [
                      {offset: 0, color: '#83bff6'},
                      {offset: 0.5, color: '#188df0'},
                      {offset: 1, color: '#188df0'}
                    ]
                  ),
                  barBorderRadius: [50, 50, 0, 0]
                },
                emphasis: { // 高亮时的颜色
                  color: new echarts.graphic.LinearGradient(
                    0, 0, 0, 1,
                    [
                      {offset: 0, color: 'red'},
                      {offset: 0.7, color: '#2378f7'},
                      {offset: 1, color: 'yellow'}
                    ]
                  )
                }
              },
              data: [400, 400, 300, 300, 300, 400, 400, 400, 300]
            },
            {
              name: 'cs2',
              type: 'bar',
              barWidth: '15%',
              itemStyle: {
                normal: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: '#8bd46e'
                  }, {
                    offset: 1,
                    color: '#09bcb7'
                  }]),
                  barBorderRadius: [50, 50, 0, 0],
                }

              },
              data: [400, 500, 500, 500, 500, 400,400, 500, 500]
            }
          ]
        };

        _this.setBarOptions(option);
        _this.setBarAnimation(_this.myBar, option);
      })
    },
    methods: {
      // 绘制图形
      setBarOptions(option) {
        let _this = this;
        _this.myBar = this.$echarts.init(document.querySelector('#myBar'));
        _this.myBar.setOption(option);
        _this.setResize(_this.myBar);
      },
      // 重置时
      setResize(chart) {
        window.addEventListener('resize', () => {
          chart.resize();
        })
      },
      // 执行动画
      setBarAnimation(myChart, option){
        let app = {
          currentIndex: -1,
        };
        setInterval(function () {
          let dataLen = option.series[0].data.length;
          // 取消之前高亮的图形
          myChart.dispatchAction({
            type: 'downplay',
            seriesIndex: 0,
            dataIndex: app.currentIndex
          });
          app.currentIndex = (app.currentIndex + 1) % dataLen;
          //console.log(app.currentIndex);
          // 高亮当前图形
          myChart.dispatchAction({
            type: 'highlight',
            seriesIndex: 0,
            dataIndex: app.currentIndex,
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
        myChart.on('click', function (params) {
          // console.log(params);
          // console.log(params.dataIndex);
          // console.log(option.xAxis.data);
          let xData = option.xAxis.data;
          // console.log(Math.max(params.dataIndex - zoomSize / 2, 0));
          // console.log(Math.min(params.dataIndex + zoomSize / 2, xData.length - 1));
          myChart.dispatchAction({
            type: 'dataZoom',
            startValue: xData[Math.max(params.dataIndex - zoomSize / 2, 0)],
            endValue: xData[Math.min(params.dataIndex + zoomSize / 2, xData.length - 1)]
          })
        });
      }

    },
    beforeDestroy() {
      this.mapchart.clear();
      this.mapchart.dispose();
    }
  }
</script>

<style lang="scss">
  .bar_com {
    // width: 600px;
    // height: 800px;
    #myBar {
      width: 100%;
      height: 400px;
      background: #FFF;

      /*width: 800px;*/
      /*height: 600px;*/
      /*box-sizing: border-box;*/
      /*margin: 0 auto;*/
      /*canvas {*/
        /*box-sizing: border-box;*/
        /*width: 800px;*/
        /*height: 600px;*/
      /*}*/
    }
  }
</style>


