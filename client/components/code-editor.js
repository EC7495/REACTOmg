import React, {Component} from 'react'
import Prism, {highlight, languages} from 'prismjs'
import {connect} from 'react-redux'
import socket from '../socket'
import axios from 'axios'
import {sendCode} from '../store/codeEditor'
import Whiteboard from './whiteboard'
import Editor from './editor'
import RoomInput from './room-input'
import {withRouter} from 'react-router-dom'

class CodeEditor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      code: '',
      room: '',
      roomInvite: false,
      roomJoin: false
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleRoomSubmit = this.handleRoomSubmit.bind(this)
    this.toggleRoomInvite = this.toggleRoomInvite.bind(this)
    this.toggleRoomJoin = this.toggleRoomJoin.bind(this)
  }

  componentDidMount() {
    Prism.highlightAll()
    this.setState({room: this.props.roomId})
    socket.emit('room', this.props.roomId)
  }

  componentDidUpdate() {
    if (this.props.stateCode !== this.state.code) {
      this.setState({code: this.props.stateCode})
    }
  }

  handleChange(newCode) {
    this.setState({code: newCode})
    this.props.sendCode(newCode, this.state.room)
  }

  async handleSubmit(evt) {
    evt.preventDefault()
    const code = this.state.code.trim()
    try {
      const res = await axios.post('/api/submit-code', {code})
      console.log('Result Of User Code : ', res)
    } catch (err) {
      console.error('something went wrong :( ', err)
    }
  }

  handleRoomSubmit(roomId) {
    socket.emit('leave-room', this.state.room)
    this.setState({room: roomId})
    this.props.history.push(`/editor/${roomId}`)
    socket.emit('room', roomId)
  }

  toggleRoomInvite() {
    this.setState({roomInvite: !this.state.roomInvite})
  }

  toggleRoomJoin() {
    this.setState({roomJoin: !this.state.roomJoin})
  }

  render() {
    return (
      <div className="editor-container">
        <div className="invite-container">
          {!this.state.roomInvite ? (
            <button
              onClick={this.toggleRoomInvite}
              className="btn btn-invite invite-item"
            >
              Invite to Room
            </button>
          ) : (
            <h4>Room code to share: {this.state.room}</h4>
          )}
          {!this.state.roomJoin ? (
            <button
              onClick={this.toggleRoomJoin}
              className="btn btn-join invite-item"
            >
              Join New Room
            </button>
          ) : (
            <RoomInput handleRoomSubmit={this.handleRoomSubmit} />
          )}
        </div>
        <div className="board-container">
          <Editor
            handleChange={this.handleChange}
            code={this.state.code}
            handleClick={this.handleClick}
            handleSubmit={this.handleSubmit}
          />
          <Whiteboard room={this.state.room} />
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  stateCode: state.codeEditor
})

const mapDispatchToProps = dispatch => ({
  sendCode: (newCode, room) => dispatch(sendCode(newCode, room))
})

export default connect(mapStateToProps, mapDispatchToProps)(
  withRouter(CodeEditor)
)
