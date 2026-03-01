/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import styled from '@emotion/styled'

const Title = styled.h1`
  color: hotpink;
  font-size: 2rem;
`

const buttonStyle = css`
  padding: 0.5rem 1rem;
  background-color: #646cff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #535bf2;
  }
`

const Card = styled.div`
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin: 1rem;
`

export default function App() {
  return (
    <div className="emotion-app">
      <Title className="emotion-title">Emotion Works!</Title>
      <Card className="emotion-card">
        <p className="emotion-text">This is a styled card component.</p>
        <button css={buttonStyle} className="emotion-button">
          Styled Button
        </button>
      </Card>
    </div>
  )
}
