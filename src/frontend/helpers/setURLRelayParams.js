import qs from 'qs'

const setURLRelayParams = (relay, queryProp='query') => {
  let hash = qs.parse(location.hash.substr(1))

  hash[queryProp] = relay.variables
  location.hash = qs.stringify(hash, { encode: false, skipNulls: true })
}

export default setURLRelayParams
