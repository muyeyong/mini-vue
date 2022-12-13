export const createVnode = (type, props?, children?) => {
    return {
        type,
        props,
        children,
        el: null
    }
}