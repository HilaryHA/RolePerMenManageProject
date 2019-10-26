/**
 * webpack 管理依赖
 */
const req = require.context('../../../icons/svg', false, /\.svg$/); // 三个参数：一个要搜索的目录，一个标记表示是否还搜索其子目录， 以及一个匹配文件的正则表达式
const requireAll = requireContext => {
  let tmp = requireContext.keys();
  return tmp; // 文件名组成的数组,如[./add.svg, ./alipay.svg, ...]
};

const re = /\.\/(.*)\.svg/

// const icons = requireAll(req).map(i => {
//   return i.match(re)[1]; // 返回值为name值，如add、alipay ...
// })

// 需要的图标，手动添加到此数组中
const icons = ['iconanquan', 'iconalipay', 'iconemail', 'iconbumenguanli', 'iconhome', 'iconHOME', 'iconlvhang-', 'iconyun', 'iconsea__easyiconnet',
  'iconditu1', 'iconditu', 'icongouliang_', 'icondaxiang1', 'iconzhanshi', 'iconxitongquanxian', 'iconedit', 'iconcaidan',
  'iconjiaoseguanli', 'iconfuwenbenkuang', 'icontubiao', 'iconbiaoge', 'iconyonghu', 'iconyonghu1', 'iconzhifu', 'iconweibiaoti--'];

export default icons;   // name值组成的数组,如[add, alipay, ...]

