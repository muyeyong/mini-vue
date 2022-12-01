export class ComputedImpl {
    private _getter: any
    constructor(getter) {
        this._getter = getter
    }
    get value() {
        return this._getter()
    }
}

export const computed = (getter) => {
    return new ComputedImpl(getter)
}