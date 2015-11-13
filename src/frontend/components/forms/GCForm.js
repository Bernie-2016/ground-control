import React from 'react';
import Form from 'react-formal';

export default class GCForm extends React.Component {
  state = {
    formErrors: null
  }

  renderChildren(children) {
    return React.Children.map(children, (child) => {
      if (child.type === Form.Field) {
        let name = child.props.name;
        let error = this.state.formErrors ? this.state.formErrors[name] : null;
        if (error) {
          error = error[0] ? error[0].message.replace(name, child.props.label) : null;
          return React.cloneElement(child, {
            errorText: error
          })
        }
        return child;
      }
      else if (child.props && child.props.children)
        return this.renderChildren(child.props.children)
      else
        return child;
    })
  }

  render() {
    return (
      <Form
        onError={(errors) => {this.setState({formErrors: errors})}}
        {...this.props}>
        {this.renderChildren(this.props.children)}
      </Form>
    )
  }
}