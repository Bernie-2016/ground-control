import React from 'react'
import ReactDOM from 'react-dom'
import GCFormField from './GCFormField'
import RichTextEditor from 'jlegrone-react-rte'

export default class GCRichTextField extends GCFormField {
  static propTypes = {
    onChange: React.PropTypes.func,
    value: React.PropTypes.string,
    label: React.PropTypes.string,
    placeholder: React.PropTypes.string
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
      <div>
        <label>{this.props.label}</label>
        <RichTextEditor
          placeholder={this.props.placeholder || this.props.label}
          value={this.state.value}
          onChange={this.onChange}
          spellCheck={true}
        />
      </div>
    )
  }
}
