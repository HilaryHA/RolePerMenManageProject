/**
 *  @author Hilary
 *  @date  2019/05/04
 *  @version 1.0.0
 *  @parameter  api接口的统一出口
 */

// 用户信息模板
import userInfo from '@/api/otherApi/userInfo';
// 菜单信息模板
import menuList from '@/api/otherApi/menuList';
// 权限信息模板
import { getAllPerName } from '@/api/otherApi/purview';

// 导出接口
export default {
    userInfo,
    menuList,
    getAllPerName
}

