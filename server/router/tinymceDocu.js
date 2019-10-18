/**
 * 富文本编辑器相关接口
 * @type {createApplication}
 */
//引入express模块
const express = require("express");
const fs = require("fs"); // 图片路径
const multer = require("multer");// 上传图片
// const multipart = require("connect-multiparty");// 接收formData数据
// const multipartMiddleware = multipart();

//定义路由级中间件
const router = express.Router();
//引入数据模型模块
const db = require("../models/db");
const { createFolder, isPresenceFile, verifyToken } = require("../util/util");

let Users = db.Users;
let UploadImg = db.UploadImg;
let DocuTinymce = db.DocuTinymce;


// 【注意】upload文件夹与app.js使用的静态文件夹路径(相对于app.js的路径)一致
let uploadFolder = './upload/tinymce';
createFolder(uploadFolder);
// 通过 filename 属性定制
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 保存的路径，备注：需要自己创建
        cb(null, uploadFolder);
    },
    filename: function (req, file, cb) {
        /**
         *  将保存文件名设置为 字段名 + 时间戳，比如 tinymce_file_1478521468943.jpg
         *  【注意】 Date.now()时间戳不能单独定义，如let date = Date.now()来使用，会造成，请求此接口时，时间戳都是同一个值，文件会被覆盖
        */
        cb(null, `tinymce_${file.fieldname}_${Date.now()}.${file.originalname.split('.')[1]}`);
    }
});
// 通过 storage 选项来对 上传行为 进行定制化
let upload = multer({ storage: storage });

/**
 * 添加单个图片路由'file'为添加formData的字段名 -- 我要哭了 -- 获取FormData对象需要安装中间件
 * upload.single('file')  https://segmentfault.com/a/1190000012918178
 *  // router.post("/addPicture", multipartMiddleware, upload.single('file') , (req, res) => {
 */
router.post("/addPicture", upload.single('file'), (req, res) => {
    // 相对于util.js的地址
    isPresenceFile(`../upload/tinymce/${req['file'].filename}`)
        .then(flag => {
            if (flag) {
                let token = req.headers['authorization'];
                token = token.split('"')[1]; // 去掉多余双引号
                Users.find({ token })
                    .then(user => {
                        let url = `http://localhost:3000/tinymce/${req['file'].filename}`;
                        let da = { ...req.file };
                        let obj = {
                            "last_modified_user_id": user[0].id,
                            "name": da.filename,
                            "originalname": da.originalname,
                            "priview_url": url,
                            "encoding": da.encoding,
                            "suffix_name": da.originalname.split('.')[1],
                            "size": da.size
                        };
                        UploadImg.create(obj)
                            .then(upImg => {
                                return res.send({ status: 200, info: '上传成功', data: upImg })
                            })
                            .catch(err => {
                                return res.send({ status: -1, info: `图片上传失败。${err.name}: ${err.message}` })
                            })
                    })
                    .catch(err => {
                        return res.send({ status: -1, info: `用户token值传递有误。${err.name}: ${err.message}` })
                    })
            } else {
                return res.send({ status: -1, info: `文件上传失败，请联系管理员_1` })
            }
        })
        .catch(err => {
            return res.send({ status: -1, info: `文件上传失败，请联系管理员_0。${err.name}: ${err.message}` })
        })
});

/**
 * 获取所有图片信息 -- 可分页、模糊查询
 */
router.get("/picture", verifyToken, (req, res) => {
    // 获取接口参数
    let queryTemp = req.query;
    // 初始化排序变量
    let sortTemp = {}, size = 10, page = 0;
    // 判断参数传递是否为空
    if (Object.keys(queryTemp).length > 0) {
        if (queryTemp.sort) {
            // sort对应值为"id,1",mongoose中'1'表示根据id进行正序排序,反之'-1'表示倒序
            let tmp = queryTemp.sort.split(',');
            // 将字符串转换为数字，如"1" --> 1
            tmp[1] = ~~tmp[1];
            sortTemp[tmp[0]] = tmp[1];
        }
        // 查询条数
        if (queryTemp.size) {
            // 将字符串转换为数字
            size = queryTemp.size >> 0;
        }
        // 查询页数
        if (queryTemp.page) {
            // 将字符串转换为数字
            page = queryTemp.page * 1;
        }
    }
    // 搜索条件、'i'不区分大小写
    const nameReg = new RegExp(queryTemp.name, 'i');
	/**
	 * $or 模糊查询 可多条件 满足一个即可, 此处是可以通过name或者birthplace进行模糊查询
	 * sort 根据如{id : 1} 进行正序排序，倒序排序为-1
	 * skip 跳过多少条数据
	 * limit 限制返回条数（此分页适用于少数据）
	 * 【--】大数据时，可以参考通过前端传递'_id'，然后根据'_id'倒序排序，查找'$lt'小于此'_id'的值，然后结合limit
	 *      例如.find({'_id': {"$lt": id}}).sort({'_id':-1}).limit(5)
	 */
    UploadImg.find(
        {
            $or: [
                { name: { $regex: nameReg } },
                { suffix_name: { $regex: nameReg } }
            ]
        })
        .sort(sortTemp)
        .skip(page * size)
        .limit(size)
        .then(docu => {
            if (docu) {
                /**
                 * 返回数据总数、保证模糊查询时返回对应数据的条数
                 */
                UploadImg.find({ $or: [ { name: { $regex: nameReg } }, { suffix_name: { $regex: nameReg } } ] }).count()
                    .then(co => {
                        return res.json({ status: 200, info: '查询成功', content: docu, totalElements: co });
                    })
                    .catch(err => {
                        return res.json({ status: -1, info: `查询失败_2：${err.name}: ${err.message}` });
                    });
            } else {
                return res.json({ status: -1, info: '查询失败_1' });
            }
        })
        .catch(err => {
            return res.json({ status: -1, info: `查询失败：${err.name}: ${err.message}` });
        });
})

/**
 * 删除单个图片信息、并删除对应文件
 */
router.delete("/picture/:_id", verifyToken, (req, res) => {
    let _id = req.params._id;
    let token = req.headers['authorization'];
    token = token.split('"')[1]; // 去掉多余双引号
    Users.find({ token })
        .then(user => {
            UploadImg.findOneAndDelete(
                {
                    _id: _id
                }
            )
                .then(docu => {
                    /* 删除文件【注意】地址为绝对路径 */
                    fs.unlinkSync(`D:/Workspace/TestExercise/vueDemo/my-vue/server/upload/tinymce/${docu.name}`);
                    return res.send({ status: 200, info: '删除成功', data: docu })
                })
                .catch(err => {
                    return res.send({ status: -1, info: `删除失败。${err.name}: ${err.message}` })
                })
        })
        .catch(err => {
            return res.send({ status: -1, info: `用户token值传递有误。${err.name}: ${err.message}` })
        })
})

/**
 * 获取所有文档信息 -- 可分页、模糊查询
 */
router.get("/userDocu", verifyToken, (req, res) => {
    // 获取接口参数
    let queryTemp = req.query;
    // 初始化排序变量
    let sortTemp = {}, size = 10, page = 0;
    // 判断参数传递是否为空
    if (Object.keys(queryTemp).length > 0) {
        if (queryTemp.sort) {
            // sort对应值为"id,1",mongoose中'1'表示根据id进行正序排序,反之'-1'表示倒序
            let tmp = queryTemp.sort.split(',');
            // 将字符串转换为数字，如"1" --> 1
            tmp[1] = ~~tmp[1];
            sortTemp[tmp[0]] = tmp[1];
        }
        // 查询条数
        if (queryTemp.size) {
            // 将字符串转换为数字
            size = queryTemp.size >> 0;
        }
        // 查询页数
        if (queryTemp.page) {
            // 将字符串转换为数字
            page = queryTemp.page * 1;
        }
    }
    // 搜索条件、'i'不区分大小写
    const titleReg = new RegExp(queryTemp.title, 'i');
	/**
	 * $or 模糊查询 可多条件 满足一个即可, 此处是可以通过name或者birthplace进行模糊查询
	 * sort 根据如{id : 1} 进行正序排序，倒序排序为-1
	 * skip 跳过多少条数据
	 * limit 限制返回条数（此分页适用于少数据）
	 * 【--】大数据时，可以参考通过前端传递'_id'，然后根据'_id'倒序排序，查找'$lt'小于此'_id'的值，然后结合limit
	 *      例如.find({'_id': {"$lt": id}}).sort({'_id':-1}).limit(5)
	 */
    DocuTinymce.find(
        {
            $or: [
                { title: { $regex: titleReg } }
            ]
        })
        .sort(sortTemp)
        .skip(page * size)
        .limit(size)
        .then(docu => {
            if (docu) {
                /**
                 * 返回数据总数、保证模糊查询时返回对应数据的条数
                 */
                DocuTinymce.find({ $or: [{ title: { $regex: titleReg } }] }).count()
                    .then(co => {
                        return res.json({ status: 200, info: '查询成功', content: docu, totalElements: co });
                    })
                    .catch(err => {
                        return res.json({ status: -1, info: `查询失败_2：${err.name}: ${err.message}` });
                    });
            } else {
                return res.json({ status: -1, info: '查询失败_1' });
            }
        })
        .catch(err => {
            return res.json({ status: -1, info: `查询失败：${err.name}: ${err.message}` });
        });
})

/**
 * 添加文档信息
 */
router.post("/userDocu", verifyToken, (req, res) => {
    let obj = req.body;
    let token = req.headers['authorization'];
    token = token.split('"')[1]; // 去掉多余双引号
    Users.find({ token })
        .then(user => {
            obj.last_modified_user_id = user[0].id;
            obj.create_time = new Date();
            obj.update_time = obj.create_time;
            DocuTinymce.create(obj)
                .then(docu => {
                    return res.send({ status: 200, info: '新增成功', data: docu })
                })
                .catch(err => {
                    return res.send({ status: -1, info: `新增失败。${err.name}: ${err.message}` })
                })
        })
        .catch(err => {
            return res.send({ status: -1, info: `用户token值传递有误。${err.name}: ${err.message}` })
        })
})

/**
 * 更新文档信息
 */
router.put("/userDocu/:_id", verifyToken, (req, res) => {
    let _id = req.params._id;
    let obj = req.body;
    let token = req.headers['authorization'];
    token = token.split('"')[1]; // 去掉多余双引号
    Users.find({ token })
        .then(user => {
            obj.last_modified_user_id = user[0].id;
            obj.update_time = new Date();
            DocuTinymce.findOneAndUpdate(
                {
                    _id: _id
                },
                {
                    $set: obj
                },
                {
                    new: true
                }
            )
                .then(docu => {
                    return res.send({ status: 200, info: '更新成功', data: docu })
                })
                .catch(err => {
                    return res.send({ status: -1, info: `更新失败。${err.name}: ${err.message}` })
                })
        })
        .catch(err => {
            return res.send({ status: -1, info: `用户token值传递有误。${err.name}: ${err.message}` })
        })
})

/**
 * 删除文档信息
 */
router.delete("/userDocu/:_id", verifyToken, (req, res) => {
    let _id = req.params._id;
    let token = req.headers['authorization'];
    token = token.split('"')[1]; // 去掉多余双引号
    Users.find({ token })
        .then(user => {
            DocuTinymce.findOneAndDelete(
                {
                    _id: _id
                }
            )
                .then(docu => {
                    return res.send({ status: 200, info: '删除成功', data: docu })
                })
                .catch(err => {
                    return res.send({ status: -1, info: `删除失败。${err.name}: ${err.message}` })
                })
        })
        .catch(err => {
            return res.send({ status: -1, info: `用户token值传递有误。${err.name}: ${err.message}` })
        })
})

module.exports = router; // 注意是exports