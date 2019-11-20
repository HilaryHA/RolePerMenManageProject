/**
 * 判断是否有权限操作此页面
 * @author Hilary
 * @date 2019/10/24
 */
import checkPermission from '@/utils/permission';
export default {
    beforeRouteEnter(to, from, next) {
        next(vm => {
            // 必须有"checkPermArr"字段才能检验
            if (vm.checkPermArr && vm.checkPermArr.length) {
                // vm.checkPermArr = ['test']
                let flag = checkPermission(vm.checkPermArr);
                if (!flag) {
                    // 若没有支付权限，则跳转到401页面
                    vm.$router.push('/401');
                }
            }
        })
    }
}