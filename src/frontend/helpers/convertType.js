const convertType = (value) => {
  if (typeof value === 'object'){
    let updatedValue = {}
    Object.keys(value).forEach((key) => {
      const currentValue = convertType(value[key])
      if (currentValue != undefined)
        value[key] = currentValue
    })
    return value
  }
  else if (value === 'none')
    return null
  else if (value === 'true')
    return true
  else if (value === 'false')
    return false
  else if (value != '' && !isNaN(value) && String(Number(value)) === value)
    return Number(value)
  else if (value)
    return String(value)
  else {
    return undefined
  }
}

export default convertType
