/*
 * @Author: xuyong xuyongshuaige@gmail.com
 * @Date: 2022-11-21 11:42:14
 * @LastEditors: xuyong xuyongshuaige@gmail.com
 * @LastEditTime: 2022-11-21 11:44:01
 * @FilePath: \mini-vue-myself\src\shared\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export const extend = (obj, property) => Object.assign(obj, property)

export const isObject = raw => ( raw !== null && typeof raw === 'object')