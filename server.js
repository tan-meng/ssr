const Vue = require("vue")
const express = require("express")()
const renderer = require("vue-server-renderer").createRenderer()

// 创建vue实例
const app = new Vue({
   template:`<div style="color:red;"> 服务器端渲染(SSR) </div>` 
})

// 响应请求()
express.get("/",(req,res)=>{
    renderer.renderToString(app,(err,html)=>{
        if(err){
            return res.state(500).end("服务器内部运行错误!")
        }
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta chatset="UTF-8">
                    <title> Demo </title>
                </head>
                <body>
                    ${html}
                </body>
            </html>
        `)
    })
})

// 服务器监听
express.listen("8088",()=>{
    console.log("恭喜,跑通了")
})

// 总结: 服务端渲染的核心就在于：通过vue-server-renderer插件的renderToString()方法，将Vue实例转换为字符串插入到html文件