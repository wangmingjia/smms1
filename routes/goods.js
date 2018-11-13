var express = require("express");
var router = express.Router();
// 引入数据库链接模块
var connection = require("./mysqlCommon");
router.post('/add', function(req,res,next) {
    //2. 后端路由接收前端的数据
    let {cg_id,barcode,goodsname,goodsprice,marketprice,saleprice,stockNum,weigth,unit,promotion,discount,goodsDetails}= req.body;

    //3. 链接数据库，把数据库写入数据库
    //定义sql语句
    let sqlStr="insert into goodsTable(cg_id,barcode,goodsname,goodsprice,marketprice,saleprice,stockNum,weigth,unit,promotion,discount,goodsDetails) values(?,?,?,?,?,?,?,?,?,?,?,?)"; //占位符
    let sqlParams=[cg_id,barcode,goodsname,goodsprice,marketprice,saleprice,stockNum,weigth,unit,promotion,discount,goodsDetails]; //参数数组
    //执行sql语句
    connection.query(sqlStr,sqlParams, function (error, results) {
        if (error) throw error; //出错对象
        //4. 返回处理的结果到前端
        //"affectedRows":1, 返回受影响的行数，如果大于0就表示成功
        if(results.affectedRows>0){
            res.send({"isOk":true,"msg":"商品信息添加成功!"});
        }
        else{
            res.send({"isOk":false,"msg":"商品信息失败!"});
        }
    });
});
router.get("/list",(req,res)=>{
    let sqlStr = "select t1.*,t2.cg_name from goodsTable as t1 left join categorygoods as t2 on t1.cg_id = t2.cg_id";
    connection.query(sqlStr,(err,categoryList)=>{
        if(err) throw err;
        res.send(categoryList);
    })
});
// 根据查询的关键词个分类返回结果（查询）
router.get("/listSearch",(req,res)=>{
    // 构造sql
    // let sqlStr = "select t1.*t2.cg_name from goodsTable as t1 left join categorygoods as t2 on t1.cg_id where 4%4 = 0";
    let sqlStr="select t1.*,t2.cg_name from goodsTable as t1 left join categorygoods as t2 on t1.cg_id=t2.cg_id where 1=1";

    //   接收关键词和分类
    let {keywords,category} = req.query;
    if(keywords.length > 0){
        sqlStr+=` and (t1.barcode like '%${keywords}%' or t1.goodsname like '%${keywords}%')`;
    }
    if(category.length > 0){
        sqlStr+=` and t1.cg_id = ${category}`;
    }
    connection.query(sqlStr,(err,categoryList)=>{
        if(err) throw err;
        res.send(categoryList);
    })
});
// 获取商品分页的数据信息
router.get("/listPager",(req,res)=>{
    // 接收页码和每页大小
    let {currentPage,pageSize} = req.query;
    // 构造sql
    // let sqlStr = "select t1.*,t2.cg_name from goodsTable as t1 left join categorygoods as t2 on on t1.cg_id = t2.cg_id";
    let sqlStr="select t1.*,t2.cg_name from goodsTable as t1 left join categorygoods as t2 on t1.cg_id=t2.cg_id";
    // 执行全表sql查询：获取总的记录条数
    connection.query(sqlStr,(err,goodsList)=>{
        if(err) throw err;
        // 记录条数
        let total = goodsList.length;
        // 定义分页参数数组
        let skip = (currentPage - 1)*pageSize;
        console.log(typeof pageSize);
        let sqlParams = [skip,parseInt(pageSize)];
        sqlStr += " limit ?,?";
        connection.query(sqlStr,sqlParams,(err,goodsPager)=>{
            if(err) throw err;
            res.send({"total":total,"datalist":goodsPager})
        })
    })
})

module.exports = router;