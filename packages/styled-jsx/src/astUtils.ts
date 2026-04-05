import type { ESTree } from 'vite'

export function isStyledJsxElement(opening: ESTree.JSXOpeningElement): boolean {
  if (opening.name.type !== 'JSXIdentifier' || opening.name.name !== 'style') return false
  return hasAttribute(opening, 'jsx')
}

export function hasAttribute(opening: ESTree.JSXOpeningElement, attributeName: string): boolean {
  return opening.attributes.some(
    (attribute) =>
      attribute.type === 'JSXAttribute' &&
      attribute.name.type === 'JSXIdentifier' &&
      attribute.name.name === attributeName,
  )
}

export function extractVarName(declarator: ESTree.VariableDeclarator): string | null {
  if (declarator.id.type === 'Identifier') return declarator.id.name
  if (declarator.id.type !== 'ObjectPattern') return null

  for (const property of declarator.id.properties) {
    if (property.type === 'Property' && property.value.type === 'Identifier') {
      return property.value.name
    }
  }

  return null
}

export function collectSiblingsFromChildren(
  children: ESTree.JSXChild[],
): ESTree.JSXOpeningElement[] {
  const result: ESTree.JSXOpeningElement[] = []

  for (const child of children) {
    if (child.type === 'JSXElement') {
      if (isStyledJsxElement(child.openingElement)) continue
      result.push(child.openingElement)
      collectDescendantsFromChildren(child.children, result)
    } else if (child.type === 'JSXFragment') {
      collectDescendantsFromChildren(child.children, result)
    } else if (
      child.type === 'JSXExpressionContainer' &&
      child.expression.type !== 'JSXEmptyExpression'
    ) {
      collectJSXFromExpression(child.expression, result)
    }
  }

  return result
}

function collectDescendantsFromChildren(
  children: ESTree.JSXChild[],
  result: ESTree.JSXOpeningElement[],
): void {
  for (const child of children) {
    if (child.type === 'JSXElement') {
      result.push(child.openingElement)
      collectDescendantsFromChildren(child.children, result)
    } else if (child.type === 'JSXFragment') {
      collectDescendantsFromChildren(child.children, result)
    } else if (
      child.type === 'JSXExpressionContainer' &&
      child.expression.type !== 'JSXEmptyExpression'
    ) {
      collectJSXFromExpression(child.expression, result)
    }
  }
}

function collectJSXFromExpression(node: ESTree.Node, result: ESTree.JSXOpeningElement[]): void {
  switch (node.type) {
    case 'JSXElement':
      result.push(node.openingElement)
      collectDescendantsFromChildren(node.children, result)
      return
    case 'JSXFragment':
      collectDescendantsFromChildren(node.children, result)
      return
    case 'LogicalExpression':
      collectJSXFromExpression(node.left, result)
      collectJSXFromExpression(node.right, result)
      return
    case 'ConditionalExpression':
      collectJSXFromExpression(node.consequent, result)
      collectJSXFromExpression(node.alternate, result)
      return
    case 'SequenceExpression':
      for (const expr of node.expressions) {
        collectJSXFromExpression(expr, result)
      }
      return
    case 'CallExpression':
      for (const arg of node.arguments) {
        collectJSXFromExpression(arg, result)
      }
      return
    case 'NewExpression':
      for (const arg of node.arguments) {
        collectJSXFromExpression(arg, result)
      }
      return
    case 'ArrowFunctionExpression':
      if (node.body.type !== 'BlockStatement') {
        collectJSXFromExpression(node.body, result)
      }
      return
    case 'ArrayExpression':
      for (const el of node.elements) {
        if (el) collectJSXFromExpression(el, result)
      }
      return
    case 'SpreadElement':
      collectJSXFromExpression(node.argument, result)
      return
    case 'AssignmentExpression':
      collectJSXFromExpression(node.right, result)
      return
    case 'UnaryExpression':
      collectJSXFromExpression(node.argument, result)
      return
  }
}

export function findInsertPosition(program: ESTree.Program): number {
  for (const statement of program.body) {
    // Skip directive prologues like "use client", "use strict"
    if (
      statement.type === 'ExpressionStatement' &&
      statement.expression.type === 'Literal' &&
      typeof statement.expression.value === 'string'
    ) {
      continue
    }
    return statement.start
  }
  return program.body.length > 0 ? program.body[program.body.length - 1].end : 0
}
