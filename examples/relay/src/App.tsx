import { graphql } from 'react-relay'
import { getRequest } from 'relay-runtime'

const query = graphql`
  query AppQuery {
    greeting
  }
`

export default function App() {
  return (
    <div>
      <h1 className="relay-title">Relay Example</h1>
      <p className="relay-query-name">{getRequest(query).params.name}</p>
      <p className="relay-query-text">{getRequest(query).params.text}</p>
    </div>
  )
}
