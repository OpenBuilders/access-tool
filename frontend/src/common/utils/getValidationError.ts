// frontend/src/common/utils/getValidationError.ts

interface ValidationError {
  type: string
  msg: string
  loc: (string | number)[]
}

export const getValidationError = (arr: ValidationError[]) => {
  let error = ''
  const fields: string[] = []

  arr.forEach((item: ValidationError) => {
    const fieldFromLoc = (item.loc[1] ?? item.loc[item.loc.length - 1]) as
      | string
      | undefined

    if (item.type === 'missing') {
      let fieldName = fieldFromLoc
      if (fieldName === 'expected') {
        fieldName = 'amount'
      }
      if (fieldName) fields.push(fieldName)
    }

    if (item.type.endsWith('_type')) {
      if (fieldFromLoc) fields.push(fieldFromLoc)
    }

    if (!fields.length && item.msg) {
      error = item.msg
    }
  })

  if (fields.length) {
    error = `Fill fields correctly: ${fields.join(', ')}`
  }

  return error || 'Validation error'
}
