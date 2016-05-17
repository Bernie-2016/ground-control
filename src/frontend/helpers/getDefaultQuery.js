import qs from 'qs'
import convertType from './convertType'

export default function(defaultParams) {
  const hashParams = convertType(qs.parse(location.hash.substr(1), { strictNullHandling: true }))
  if (hashParams.query){
    try {
      let newQueryParams = {...defaultParams, ...hashParams.query}
      newQueryParams.filters = {...defaultParams.filters, ...hashParams.query.filters}
      return newQueryParams
    }
    catch(ex) {
      console.error('Invalid query parameters', ex)
    }
  }

  return defaultParams
}
