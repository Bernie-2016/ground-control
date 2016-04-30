export default function(data, options) {
  let result = {}
  let addProp = (prop, val) => {
    if (options.ignoreProps && options.ignoreProps.length > 0){
      const props = prop.split('.')
      for (const item of props) {
        if (options.ignoreProps.indexOf(item) > -1)
          return
      }
    }
    result[prop] = val
  }
  let recurse = (cur, prop) => {
    if (Object(cur) !== cur) {
      addProp(prop, cur)
    }
    else if (Array.isArray(cur)) {
      let l=cur.length;
      for(let i=0; i<l; i++)
        recurse(cur[i], `${prop}[${i}]`)

    if (l == 0)
      addProp(prop, [])
    }
    else {
      let isEmpty = true
      for (let p in cur) {
        isEmpty = false
        recurse(cur[p], prop ? `${prop}.${p}` : p)
      }
      if (isEmpty && prop)
        addProp(prop, {})
    }
  }
  recurse(data, '')
  return result
}