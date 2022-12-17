export const extend = Object.assign

export const isObject = raw => ( raw !== null && typeof raw === 'object')

export const hasChange = (value1, value2) => !Object.is(value1, value2)

export const capitalize = (str: string) => {
    return str.charAt(0).toLocaleUpperCase() + str.slice(1)
}

export const camelize = (str: string) => {
    return str.replace(/-(\w)/g, (_, c: string) => {
        return  c.toLocaleUpperCase()
    })
}