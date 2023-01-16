import { NodeTypes } from "./ast"

export function baseParse(content: string) {
    const context = { source: content }
    return createRoot(parseChildren(context))
}


function parseChildren(context) {
    const rawContent: string = context.source
    const nodes: any[] = []
    let node 
    if (rawContent.startsWith('{{')) {
        node = parseInterpolation(context)
    } else if (rawContent[0] === '<') {
        node = parseElement(context)
    }
    nodes.push(node)
    return nodes
}

function createRoot(children) {
    return {
        children
    }
}

function parseInterpolation(context) {
    advance(context, 2)
    const content = parseContent(context)
    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            content,
            type: NodeTypes.SIMPLE_EXPRESSION
        }
    }
}

function parseContent(context: any) {
    const closeIndex = context.source.indexOf("}}")
    const content = context.source.slice(0, closeIndex)
    advance(context, content.lenght + 2)
    return content
}

function advance(context, steps) {
    context.source = context.source.slice(steps)
}

function parseElement(context: any): any {
   // <div></div>
   const element = parseTag(context)
   parseTag(context)
    return element
}

function parseTag(context) {
    const match: any = /^<\/?([a-z]*)>/i.exec(context.source)
   advance(context, match[0].length)
   const tag = match[1]
   return {
    type: NodeTypes.ELEMENT,
    tag
   }
}
