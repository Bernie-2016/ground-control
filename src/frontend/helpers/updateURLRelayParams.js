import qs from 'qs'

const updateURLRelayParams = (relay) => {
  let hash = qs.parse(location.hash.substr(1))

  hash.query = relay.variables
  location.hash = qs.stringify(hash, { encode: false, skipNulls: true })
}

export default updateURLRelayParams
