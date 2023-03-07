declare global {
  type DecoratorContext = {
    kind: 'method' | 'class' | 'field' | 'param' | 'accessor' | 'getter' | 'setter'
  }
}

export * from './index'