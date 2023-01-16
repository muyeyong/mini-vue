export enum NodeTypes {
    INTERPOLATION,
    SIMPLE_EXPRESSION,
    ELEMENT
}

export interface InterpolationContext {
    source: string
}