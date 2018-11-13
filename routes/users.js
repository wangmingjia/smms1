var express = require('express');
var router = express.Router();
//1. 引入crypto 模块
var md5 = require("crypto");
// 引入数据苦链接模块
 var connection = require("./mysqlCommon.js");
// 2.链接数据库
// 添加用户路由
router.post('/add',function(req,res,next) {
    let {pass, username, region} = req.body;
    pass = md5.createHash("md5").update(pass).digest("hex");
    // let sqlStr = `insert into member_add(username,userPwd,userGroup) values('${username}','${pass}','${region}')`;
    let sqlStr = "insert into member_add(username,userPwd,userGroup) values(?,?,?)";
    let sqlParams = [username, pass, region];
    connection.query(sqlStr, sqlParams, function (error, results) {
        if (error) throw error;
        if (results.affectedRows > 0) {
            res.send({"isOk": true, "msg": "账号添加成功"})
        }
        else {
            res.send({"isOk": false, "msg": "账号添加失败"});
        }
    });
});

router.get("/list", (req, res) => {
    let sqlStr = "select * from member_add order by u_id DESC";
    connection.query(sqlStr, function (error, userlist) {
        if (error) throw error;
        res.send(userlist);
    })
});

router.get("/del", (req, res) => {
    // 后端路由接受删除的id 返回结果到前端
    let id = req.query.id;
    // 构造sql语句
    let sqlstr = "delete from member_add where u_id=?";
    let sqlParams = [id];
    //   执行删除 sql
    connection.query(sqlstr,sqlParams, (error, result) => {
        if (error) throw error;
        if (result.affectedRows > 0) {
            res.send({"isOk": true, "msg": "账号删除成功"});
        }
        else {
            res.send({"isOk": false, "msg": "账号删除失败"});
        }
    })
});

router.get("/getUserById", (req, res) => {
    let id = req.query.id;
    let sqlStr = "select * from member_add where u_id=?";
    let sqlParams = [id];
    connection.query(sqlStr, sqlParams, function (error, userdata) {
        if (error) throw error;
        res.send(userdata);
        console.log(userdata);
    });
});

router.post('/edit', function (req, res, next) {
    let {pass, username, region, u_id,oldPwd} = req.body;
    let newPass = pass;
    if(oldPwd != newPass){
        pass = md5.createHash("md5").update(newPass).digest("hex");
    }
    let sqlStr = "update member_add set username=?,userPwd=?,userGroup=? where u_id=?";
    let sqlParams = [username, pass, region, u_id];
    connection.query(sqlStr, sqlParams, function (error, results) {
        if (error) throw error;
        if (results.affectedRows > 0) {
            res.send({"isOk": true, "msg": "账号修改成功"})
        }
        else {
            res.send({"isOk": false, "msg": "账号修改失败"});
        }
    });
});

router.post("/loginCheck",(req,res,next)=>{
    let {username,checkPass} = req.body;
    let sqlstr = "select u_id from member_add where username=? and userPwd=?";
    //    md5加密
    checkPass = md5.createHash("md5").update(checkPass).digest("hex");
    let sqlParams = [username,checkPass];
    connection.query(sqlstr,sqlParams,function(err,result){
        if(err) throw err;
        console.log("查询结果",result);
        if(result.length > 0){
            res.cookie("username",username);
            res.cookie("u_id",result[0].u_id);
            res.send({isOk:true,msg:"登陆成功"});
        }else{
            res.send({isOk:false,msg:"登陆失败"});
        }
    })
});
    // 退出登陆就销毁cookie
router.get("/signOut",(req,res)=>{
    // 清除cookie
    res.clearCookie("username");
    res.clearCookie("u_id");
    //  跳转到登陆页面
    res.redirect("/resign.html")
});
// 验证身份合法性，有cookie合法，没有cookie不合法
router.get("/checkState",(req,res)=>{
    // 读取cookie
    var username = req.cookies.username;
    // username不存在就是非法就跳转到登陆页面
    if(!username){
        res.send("alert('非法入侵，请登录');location.href='resign.html';")
    }
    else{
        res.send("");
    }
});
module.exports = router;
