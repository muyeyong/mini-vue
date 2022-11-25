<!--
 * @Author: xuyong xuyongshuaige@gmail.com
 * @Date: 2022-11-18 16:56:45
 * @LastEditors: xuyong xuyongshuaige@gmail.com
 * @LastEditTime: 2022-11-25 16:13:28
 * @FilePath: \mini-vue-myself\README.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
## 2022-11-17

初始化项目，引入jest

关于一些初始化jest需要安装的依赖： https://jestjs.io/docs/getting-started

实现reactive && effect && 依赖收集 && 依赖触发
 TODO reactive一个基本数据类型时，怎样处理 reactive(1)
 TODO 依赖触发是在执行Reflect之后触发

 ## 2022-11-18
 完善effect, effect返回runner，可以传入scheduler

 ## 2022-11-21
 完善stop
 写readonly
 ## 2022-11-20
 vscode 文件查找 批量替换 自动导入
 实现effect stop

 ## 2022-11-24
 实现readOnly

 ## 2022-11-25
 实现isReactive isReadonly
 利用Prox的get去判断
