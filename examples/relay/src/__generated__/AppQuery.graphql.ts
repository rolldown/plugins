const node = {
  kind: 'Request',
  fragment: {
    kind: 'Fragment',
    name: 'AppQuery',
    selections: [{ kind: 'ScalarField', name: 'greeting' }],
  },
  operation: {
    kind: 'Operation',
    name: 'AppQuery',
    selections: [{ kind: 'ScalarField', name: 'greeting' }],
  },
  params: {
    name: 'AppQuery',
    operationKind: 'query',
    text: 'query AppQuery { greeting }',
  },
}
export default node
