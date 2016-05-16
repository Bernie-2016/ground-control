import qs from 'qs'

const updateURLRelayParams = (relay, queryProp='query') => {
  let hash = qs.parse(location.hash.substr(1))

  hash[queryProp] = relay.variables
  location.hash = qs.stringify(hash, { encode: false, skipNulls: true })
}

export default updateURLRelayParams
