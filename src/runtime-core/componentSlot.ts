import { ShapeFlags } from "../shared/shapeFlags"

export const initSlots = (instance: any, children: any) => {
    if (!(instance.vnode.shapeFlag & ShapeFlags.SLOAT_CHILDREN)) return
    const slots = {}
    for (const key in children) {
        const value = children[key]
        if (typeof value === 'function') {
            slots[key] = (props) => normalizeSlotValue(value(props))
        } else {
            slots[key] = normalizeSlotValue(value)
        }
    }
    instance.slots = slots
}

const normalizeSlotValue = (slot) => {
    return Array.isArray(slot) ? slot : [slot]
}
