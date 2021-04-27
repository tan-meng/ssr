#!/usr/bin/env node

const fs = require('fs');
// const fse = require("fs-extra")   //替代fs
const commander = require('commander');
const handlebars = require('handlebars'); //修改模版文件内容

const download = require('download-git-repo'); //下载模版文件 

const chalk = require('chalk'); 
const symbols = require('log-symbols'); 

const ora = require('ora'); //提示下载
var inquirer = require('inquirer'); //提示文本

const package = require('./package.json'); //获取版本信息
const re = new RegExp("^[0-9a-zA-Z]+$"); //检查文件名是否是英文，只支持英文大小写

/**
 * 不需要修改名称的文件
 */
const includes = ['index.ts', 'index.tsx', 'index.js', 'README.md']

/**
 * 模版对应分支
 */
const getType = {
    "react-component---ES6组件": "component",
    "react-function---函数组件": "master",

}

const basePath = "./src/" //加入生成指定根路径


commander
    .version(package.version, '-v,--version')
    .command('init <name>')
    .action(name => {
        //正则匹配新建文件名
        if (!re.test(name)) {
            console.log(symbols.error, chalk.red('输入名称不符合约定,请重新输入'));
            return
        }
        if (!fs.existsSync(`./src/${name}`)) {
            inquirer
                .prompt([{
                    type: 'list',
                    name: 'type',
                    message: '请选择模版类型?',
                    choices: [
                        'react-component---ES6组件',
                        'react-function---函数组件'
                    ],
                }])
                .then(res => {
                    console.log(symbols.success, chalk.green('开始创建,请稍候...'));
                    const spinner = ora('正在下载模板中...');
                    spinner.start();
                    const type = getType[res.type]
                    download(`github:NewPrototype/template/#${type}`, `./src/${name}`, err => {
                        if (err) {
                            spinner.fail("模板下载失败.");
                        } else {
                            spinner.succeed("模板下载成功.");
                            //========================================================================== 
                            var files = fs.readdirSync(`./src/${name}`); //[ 'index.js', 'README.md', 'template.js', 'template.styl' ]
                            for (let i = 0; i < files.length; i++) {
                                let fileName = `./src/${name}/${files[i]}`;
                                if (fs.existsSync(`./src/${name}/${files[i]}`)) {
                                    const content = fs.readFileSync(fileName).toString();
                                    const result = handlebars.compile(content)({ template: name, });
                                    fs.writeFileSync(fileName, result);
                                }

                            }
                            // let count = 0; //所有文件修改完成，提示
                            for (let i = 0; i < files.length; i++) {
                                if (includes.includes(files[i])) { //是否需要修改名称
                                    continue
                                }
                                //获取文件列表
                                var index = files[i].indexOf('.');
                                fs.rename(
                                    `./src/${name}/${files[i]}`,
                                    `./src/${name}/${name}${files[i].substring(index)}`,
                                    err => {
                                        if (err) {
                                            console.log(symbols.error, chalk.red('重命名错误.'));
                                        }
                                        // count++;
                                        // if (count + 1 == files.length) { //排除index.js文件
                                        //     console.log(symbols.success, chalk.green('创建成功.'));
                                        // }
                                    }
                                );
                            }
                            console.log(symbols.success, chalk.green('创建成功.'));
                            //========================================================================== 
                        }
                    });
                });
        } else {
            console.log(symbols.error, chalk.red('有相同名称模版'));
        }
    });

commander.parse(process.argv);