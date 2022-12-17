<!--
 * @Author: xuyong xuyongshuaige@gmail.com
 * @Date: 2022-11-18 16:56:45
 * @LastEditors: xuyong xuyongshuaige@gmail.com
 * @LastEditTime: 2022-11-30 09:26:38
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


 ## 2022-11-27
 优化stop: 处理active.prop++的异常
 实现多层对象的reactive readlonly
 实现shallowReactive shallowReadonly
 ## 2022-11-28
  实现isProxy: 判断是不是 new Proxy的实例
 ## 2022-11-29
  完成了ref
  思考的地方：
    ref传入一个对象，借助reactive实现，出发了两个get，这里是不是可以优化

 ## 2022-11-30
    完成isRef 和 unRef
 ## 2022-12-01
    完成proxyRefs 和 computed

 ## 2022-12-02
   computed 懒加载

 ## 2022-12-08
   component主流程
   createApp(App).monut(container), 将app变成虚拟节点，然后path（遍历当前节点以及子节点），解析setup 持久化 render

 ## 2022-12-10
   完成componet流程
   实现组件代理对象 => this.$el this.$data

 ## 2022-12-12
   将vnode渲染到页面上
 ## 2022-12-13
  完成代理对象
  shapeFlags --〉 位运算
 ## 2022-12-14
  继续shapeFlags
 ## 2022-12-15
  实现注册事件
  完成props
 ## 2022-12-17
  实现emit
    