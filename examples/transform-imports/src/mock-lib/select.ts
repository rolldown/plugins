export default function Select() {
  const el = document.createElement('select')
  el.className = 'mock-select'
  const option = document.createElement('option')
  option.textContent = 'Select'
  el.appendChild(option)
  return el
}
