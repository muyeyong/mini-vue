import { createRenderer } from '../runtime-core'

 function createElement(type) {
    return document.createElement(type)
}

 function insert(el, container) {
    container.append(el)
}

 function patchProp(el ,key, value) {
     const isEvent = str => /^on[A-Z]/.test(str)
     if (isEvent(key)) {
            const eventName = key.slice(2).toLocaleLowerCase()
            el.addEventListener(eventName, value)
        } else {
            if (value === undefined || value === null) {
                el.removeAttribute(key)
            } else {
                el.setAttribute(key, value)
            }
            
     }
}

 function remove(child) {
    const parent = child.parentNode
    if (parent) {
        parent.removeChild(child)
    }
 }

 function setElementText(el, text) {
    el.textContent = text
 }

const render: any = createRenderer({ createElement, insert, patchProp, remove, setElementText})


export function createApp(...args) {
    return render.createApp(...args)
}
