import React from 'react';
import Form from 'react-formal';
import GCSubmitButton from './GCSubmitButton';
import {RefreshIndicator} from 'material-ui';
import {BernieColors} from '../styles/bernie-css';

export default class GCForm extends React.Component {
  state = {
    formErrors: null,
    isSubmitting: false,
    model: null
  }

  renderChildren(children) {
    return React.Children.map(children, (child) => {
      if (child.type === Form.Field) {
        let name = child.props.name;
        let error = this.state.formErrors ? this.state.formErrors[name] : null;
        let clonedElement = child
        if (error) {
          error = error[0] ? error[0].message.replace(name, child.props.label) : null;
          clonedElement = React.cloneElement(child, {
            errorText: error
          })
        }
        return React.cloneElement(clonedElement, {
          events: ['onBlur']
        })
      }
      else if (child.type === Form.Button) {
        return React.cloneElement(child, {
          component: GCSubmitButton
        })
      }
      else if (child.props && child.props.children) {
        return React.cloneElement(child, {
          children: this.renderChildren(child.props.children)
        })
      }
      else
        return child;
    })
  }

  render() {
    return (
        <Form
          value = {this.props.value || this.state.model || this.props.defaultValue}
          onChange = {model => {
            this.setState({model})
            if (this.props.onChange)
              this.props.onChange(model)
          }}
          onError={(errors) => {
            this.setState({formErrors: errors})
          }}
          {...this.props} >
          {this.renderChildren(this.props.children)}
        </Form>
    )
  }
}