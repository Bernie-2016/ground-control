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
      errorMessage: null,
      statusMessage: null
    }

    clearState() {
      this.setState({
        errorMessage: null,
        statusMessage: null
      })
    }

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

      this.setState({errorMessage: errorMessage})

      if (this.props.onFailure)
        this.props.onFailure()
    }

    onSuccess(transaction) {
      this.clearState()

      if (this.props.successMessage)
        this.setState({statusMessage: this.props.successMessage})

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
        log.error(ex.message, ex.stack)
        this.setState({errorMessage: this.props.defaultErrorMessage})
      }
    }

    render() {
      let globalSnack = <div></div>

      if (this.state.errorMessage) {
        globalSnack = <Snackbar
          message={this.state.errorMessage}
          autoHideDuration={10000}
          openOnMount={true}
          style={{'backgroundColor' : BernieColors.red}}
          action={null} />
      } else if (this.state.statusMessage) {
        globalSnack = <Snackbar
          message={this.state.statusMessage}
          autoHideDuration={10000}
          openOnMount={true}
          style={{'backgroundColor' : BernieColors.blue}}
          action={null} />
      }

      return (
        <div>
          {globalSnack}
        </div>
      )
    }
}
