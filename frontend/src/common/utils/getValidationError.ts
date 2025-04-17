interface ValidationError {
  type: string
  msg: string
  loc: string[]
}

export const getValidationError = (arr: ValidationError[]) => {
  let error = ''
  const fields: string[] = []
  arr.forEach((item: ValidationError) => {
    if (item.type === 'value_error') {
      error = item.msg.replace('Value error,', '')
    }

    if (item.type === 'missing') {
      let fieldName = item.loc.pop()
      if (fieldName === 'expected') {
        fieldName = 'amount'
      }
      if (fieldName) {
        fields.push(fieldName)
      }
    }
  })

  if (fields.length) {
    error = `Fill fields correctly: ${fields.join(', ')}`
  }

  return error
}
