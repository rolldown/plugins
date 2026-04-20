// @ts-expect-error not typed
import { Button, Card, Modal } from 'mock-lib'

const app = document.getElementById('app')!

const heading = document.createElement('h1')
heading.textContent = 'Transform Imports Example'
heading.className = 'app-title'
app.appendChild(heading)

const description = document.createElement('p')
description.textContent =
  'These components are imported via barrel import, transformed to individual imports by the plugin.'
description.className = 'app-description'
app.appendChild(description)

app.appendChild(Button())
app.appendChild(Card())
app.appendChild(Modal())
