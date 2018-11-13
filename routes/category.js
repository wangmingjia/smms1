var express = require("express");
var router = express.Router();
// 引入数据库链接模块
var connection = require("./mysqlCommon");
// 添加商品分类的路由
    router.post("/add",function(req,res,next){
        // 2.后端路由接受前端数据
        let {cg_fatherID,cg_name,cg_isLocked} = req.body;
        // 3.链接数据库，把数据库写入数据库
        // 定义sql语句
        let sqlStr = "insert into categoryGoods(cg_fatherID,cg_name,cg_isLocked) values(?,?,?)";
        let sqlParams  = [cg_fatherID,cg_name,cg_isLocked];
        // 执行sql语句
        console.log(res);
        connection.query(sqlStr,sqlParams,function(error,result){
            if(error) throw error;
        // 4.返回处理的结果到前端
        //    根据执行sql语句的结果返回json给前端
        //    "affectedRows"：1，返回受影响的行数 如果大于0 表示成功
            if(result.affectedRows > 0){
                res.send({isOk:true,"msg":"分类添加成功"});
            }
            else{
                res.send({isOk:true,"msg":"分类添加失败"});
            }
        });
    });
    router.get("/list",(req,res)=>{
        let sqlStr = "select t1.*,t2.cg_name as father_name from categoryGoods as t1 left join categorygoods as t2 on t1.cg_fatherID=t2.cg_id";
        connection.query(sqlStr,(err,categoryList)=>{
            if(err) throw err;
            res.send(categoryList);
        });
    });
    router.get("/del",(req,res)=>{
        // 后端路由接收删除的id返回结果到前端
        let id = req.query.id;
        //    构造sql语句
        let sqlStr = "delete from categorygoods where cg_id=?";
        let sqlParams = [id];
        //    执行删除sql
        connection.query(sqlStr,sqlParams,(error,result)=>{
            if (error) throw error;
            if(result.affectedRows > 0){
                res.send({isOk:true,"msg":"商品类别删除成功"});
            }
            else{
                res.send({isOk:false,"msg":"商品类别删除失败"})
            }
        })
    });
router.get("/getCategoryById", (req, res) => {
    let id = req.query.id;
    let sqlStr = "select * from categorygoods where cg_id=?";
    let sqlParams = [id];
    connection.query(sqlStr, sqlParams, function (error, goodsData) {
        if (error) throw error;
        res.send(goodsData);
        console.log("打印结果是",goodsData);
    });
});
router.post("/edit",(req,res)=>{
    let {cg_fatherID,cg_name,cg_isLocked,cg_id} = req.body;
    let sqlStr = "update categorygoods set cg_fatherID=?,cg_name=?,cg_isLocked=? where cg_id=?";
    let sqlParams = [cg_fatherID,cg_name,cg_isLocked,cg_id];
    connection.query(sqlStr,sqlParams,function(error,result){
        if(error) throw error;
        if(result.affectedRows > 0){
            res.send({"isOk": true, "msg": "商品分类修改成功"})
        }
        else {
            res.send({"isOk": false, "msg": "商品分类修改失败"});
        }
    });
})

module.exports = router;
