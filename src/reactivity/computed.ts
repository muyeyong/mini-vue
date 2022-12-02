export class ComputedImpl {
    private _getter: any
    private _lazily: any
    constructor(getter) {
        this._getter = getter
        this._lazily = null
    }
    get value() {
        if (!this._lazily) {
            this._lazily =  this._getter()
        }
        return this._lazily
    }
}

export const computed = (getter) => {
    return new ComputedImpl(getter)
}