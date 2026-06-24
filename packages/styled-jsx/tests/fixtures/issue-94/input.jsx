import css from 'styled-jsx/css'

// & :global() — leading & should become scope class, not .jsx-HASH:scope
export const style1 = css`
  & :global(.foo) {
    display: flex;
  }
`

// & .localClass — leading & should become scope class
export const style2 = css`
  & .bar {
    color: red;
  }
`
