import {get} from '@/api/otherApi/dictDetail'

export default {
  data() {
    return {
      dicts: [] // 数据字典
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
