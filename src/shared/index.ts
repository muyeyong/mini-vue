export const extend = Object.assign

export const isObject = raw => ( raw !== null && typeof raw === 'object')

export const hasChange = (value1, value2) => !Object.is(value1, value2)