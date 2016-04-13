import React from 'react'
import ReactDOM from 'react-dom'
import GCFormField from './GCFormField'
import RichTextEditor from 'react-rte'

export default class GCRichTextField extends GCFormField {
  static propTypes = {
    onChange: React.PropTypes.func,
    value: React.PropTypes.string
  }

  constructor(props) {
    super(props)

    let intitialValue
    if (this.props.value) {
      intitialValue = RichTextEditor.createValueFromString(this.props.value, 'html')
    }
    else
      intitialValue = RichTextEditor.createEmptyValue()

    this.state = {
      value: intitialValue
    }
  }

  onChange = (value) => {
    this.setState({value})
    if (this.props.onChange) {
      // Send the changes up to the parent component as an HTML string.
      // This is here to demonstrate using `.toString()` but in a real app it
      // would be better to avoid generating a string on each change.
      this.props.onChange(
        value.toString('html')
      )
    }
  }

  render () {
    return (
      <RichTextEditor
        value={this.state.value}
        onChange={this.onChange}
      />
    )
  }
}
