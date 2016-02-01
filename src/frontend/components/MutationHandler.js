import React from 'react'
import Relay from 'react-relay'
import {Snackbar} from 'material-ui'
import {BernieColors} from './styles/bernie-css'

export default class MutationHandler extends React.Component {
    static propTypes = {
      mutationClass: React.PropTypes.func,
      onSuccess: React.PropTypes.func,
      onFailure: React.PropTypes.func,
      defaultErrorMessage: React.PropTypes.string,
      successMessage: React.PropTypes.string
    }

    static defaultProps = {
      defaultErrorMessage: 'Something went wrong! Try again in a little bit.',
      successMessage: null
    }

    state = {
      status: null,
      message: '',
      open: false
    }

    clearState() {
      this.setState({
        status: null,
        message: ''
      })
    }

    handleRequestClose = () => {
      this.setState({
        open: false,
      });
    };

    onFailure(transaction) {
      this.clearState()

      let defaultMessage = this.props.defaultErrorMessage
      let error = transaction.getError()
      let errorMessage = null

      if (error.source) {
        errorMessage = error.source.errors[0].message

        try {
          errorMessage = JSON.parse(errorMessage)
          errorMessage = errorMessage.message
        } catch (ex) {
          errorMessage = null
        }
      }

      if (!errorMessage) {
        log.error('Failure in MutationHandler', error)
        errorMessage = defaultMessage
      }

      this.setState({
        status: 'ERROR',
        message: errorMessage,
        open: true
      })

      if (this.props.onFailure)
        this.props.onFailure()
    }

    onSuccess(transaction) {
      this.clearState()

      if (this.props.successMessage)
        this.setState({
          status: 'SUCCESS',
          message: this.props.successMessage,
          open: true
        })

      if (this.props.onSuccess)
        this.props.onSuccess()
    }

    send(args) {
      this.clearState()

      let onFailure = (trans) => this.onFailure(trans)
      let onSuccess = (trans) => this.onSuccess(trans)

      try {
        Relay.Store.update(
          new this.props.mutationClass(args), {onFailure, onSuccess}
        )
      } catch (ex) {
        log.error(ex)
        this.setState({
          status: 'ERROR',
          message: this.props.defaultErrorMessage,
          open: true
        })
      }
    }

    render() {
      return (
        <div>
          <Snackbar
            open={this.state.open}
            message={this.state.message}
            bodyStyle={{
              maxWidth: '100%',
              backgroundColor: (this.state.status === 'SUCCESS') ? BernieColors.blue : BernieColors.red
            }}
            action={null}
            autoHideDuration={10000}
            onRequestClose={this.handleRequestClose}
          />
        </div>
      )
    }
}
