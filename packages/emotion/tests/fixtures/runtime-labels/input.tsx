import styled from '@emotion/styled'
import { css, keyframes } from '@emotion/react'
import * as emotion from '@emotion/react'

const Component = 'div'

export const StyledMemberTag = styled.button`color: hotpink;`
export const StyledComponentTag = styled(Component)`color: hotpink;`
export const StyledNestedCall = styled('button', {
  shouldForwardProp: () => true,
})({ color: 'hotpink' })
export const StyledMemberCall = styled.button({ color: 'hotpink' })
export const cssTag = css`color: hotpink;`
export const keyframesTag = keyframes`from { opacity: 0; } to { opacity: 1; }`
export const cssCall = css({ color: 'hotpink' })
export const keyframesCall = keyframes({ from: { opacity: 0 }, to: { opacity: 1 } })
export const namespaceCssTag = emotion.css`color: hotpink;`
export const namespaceKeyframesTag = emotion.keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`
export const namespaceCssCall = emotion.css({ color: 'hotpink' })
export const namespaceKeyframesCall = emotion.keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
})
