const INVALID_LABEL_SPACES = /\s+/g

const INVALID_CSS_CLASS_NAME_CHARS = /[!"#$%&'()*+,./:;<=>?@[\\\]^`|}~{]/g

export function sanitizeLabelPart(part: string): string {
  // Existing @emotion/babel-plugin behaviour is to replace all spaces
  // with a single hyphen
  return part.replace(INVALID_LABEL_SPACES, '-').replace(INVALID_CSS_CLASS_NAME_CHARS, '-')
}

export function createLabelWithInfo(
  labelFormat: string,
  context: string | null,
  fileStem: string,
  dirName: string,
  withPrefix: boolean,
): string {
  // Existing @emotion/babel-plugin behaviour is to
  // not provide a label if there is no available identifier
  if (context == null) return ''

  const prefix = withPrefix ? 'label:' : ''
  let label = `${prefix}${labelFormat}`
  label = label.replace('[local]', sanitizeLabelPart(context))
  if (fileStem) {
    label = label.replace('[filename]', sanitizeLabelPart(fileStem))
  }
  if (dirName) {
    label = label.replace('[dirname]', sanitizeLabelPart(dirName))
  }
  return label
}
