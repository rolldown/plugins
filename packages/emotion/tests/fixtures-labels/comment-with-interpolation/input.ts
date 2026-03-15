// https://github.com/emotion-js/emotion/blob/main/packages/babel-plugin/__tests__/css-macro/__fixtures__/comment-with-interpolation.js

import { css } from '@emotion/react'

export const doThing = css`
  // color: ${'green'};
  /*

  something: ${'something'};

  */
  color: hotpink;
`

export const doThing2 = css`
  // color: ${'green'};
  /*

  something: ${'something'};

  */
  color: ${'hotpink'};
`
