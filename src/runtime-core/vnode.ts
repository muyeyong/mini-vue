import { isObject } from "../shared/index"
import { ShapeFlags } from "../shared/shapeFlags"

export const createVnode = (type, props?, children?) => {
     const vnode =  {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null,
    }
    if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
    } else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
    }

    // component + chuildren is Array
    if (
        (ShapeFlags.STATEFUL_COMPONENT & vnode.shapeFlag) && 
        (isObject(vnode.children))
    ) {
       
        vnode.shapeFlag |= ShapeFlags.SLOAT_CHILDREN
        console.log('vnode', vnode.shapeFlag & ShapeFlags.SLOAT_CHILDREN)
    }
    return vnode
}

function getShapeFlag(type) {
    if (typeof type === 'string') {
        return ShapeFlags.ELEMENT
    } else if (isObject(type)) {
        return ShapeFlags.STATEFUL_COMPONENT
    }
    return 0
}