import { h } from "../h"

export const renderSlots = (slots, key, props) => {
    let slot = slots[key]
    if (typeof slot === 'function') {
        slot = slot(props)
    }
    return h('div', {}, slot)
}
