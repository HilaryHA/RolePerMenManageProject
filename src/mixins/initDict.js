/**
 * 获取数据字典
 * @author Hilary
 * @date 2019/06/06
 */
import { get } from '@/api/otherApi/dictDetail'

export default {
  data() {
    return {
      dicts: []
    }
  },
  methods: {
    async getDict(name) {
      let dictDetail = await get(name);
      if (dictDetail.data.status == 200) {
        this.dicts = dictDetail.data.content;
      }
    }
  }
}
