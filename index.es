import path from 'path'
import axios from 'axios'
import { connect } from 'react-redux'
import React, { PureComponent } from 'react'
import { createSelector } from 'reselect'
import { Table, ButtonToolbar, Button, Well } from 'react-bootstrap'

import { basicSelector } from 'views/utils/selectors'

const poiDataSelector = createSelector(
  [basicSelector],
  basic => ({
    api_member_id: basic.api_member_id
  })
)

import EnemyInfo from './components/EnemyInfo'

const { _, notify, toast } = window

export const reactClass = connect(state => poiDataSelector(state))(
  class PluginSenkaViewer extends PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        selected: [],
        api_list: []
      }
    }
    handleResponse = e => {
      const { path: _path, body } = e.detail
      switch (_path) {
        case '/kcsapi/api_get_member/practice':
          const { api_list } = body
          this.setState({
            api_list: _.map(api_list, enemy => ({
              id: enemy.api_enemy_id,
              name: enemy.api_enemy_name,
              state: enemy.api_state,
              level: enemy.api_enemy_level,
              rank: enemy.api_enemy_rank,
              status: 0
            }))
          })
          break
        default:
          break
      }
    }
    resetAll() {
      this.setState({
        selected: []
      })
    }
    submit() {
      const { api_member_id } = this.props
      const { selected } = this.state
      console.log(JSON.stringify({
        api_member_id: api_member_id,
        api_enemy_list: selected
      }))
    }
    handleSelect(enemy_id) {
      const { selected, api_list } = this.state
      const enemy = _.find(api_list, enemy => enemy.id === enemy_id)
      if (!enemy) {
        return
      }
      if (!!enemy.state) {
        return
      }
      const idx = _.indexOf(selected, enemy_id)
      if (idx === -1) {
        selected.push(enemy_id)
      } else {
        selected.splice(idx, 1)
      }
      this.setState({
        selected: [...selected]
      })
    }
    renderList() {
      const { api_list, selected } = this.state
      if (!api_list.length) {
        return (
          <Well className='message'>未获取到演习数据，请点击演习获取相关数据</Well>
        )
      }
      return (
        <Table className='enemy-list' bordered condensed>
          <thead>
            <tr>
              <th>名字</th>
              <th>等级</th>
              <th>军衔</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {_.map(api_list, enemy => (
              <EnemyInfo
                key={enemy.id}
                onClick={this.handleSelect.bind(this, enemy.id)}
                disabled={!!enemy.state}
                active={_.includes(selected, enemy.id)}
                {...enemy}
              />
            ))}
          </tbody>
        </Table>
      )
    }
    componentDidMount() {
      window.addEventListener('game.response', this.handleResponse)
    }
    componentWillUnmount() {
      window.removeEventListener('game.response', this.handleResponse)
    }
    render() {
      const { selected } = this.state
      const { api_member_id } = this.props
      return (
        <div id='enshu-helper'>
          <link rel='stylesheet' href={path.join(__dirname, 'assets/enshu-helper.css')} />
          <div className='member_id'>
            ID: {api_member_id}
          </div>
          {this.state.api_list.length ? (
            <ButtonToolbar className='toolbar'>
              <Button disabled={!selected.length} onClick={this.resetAll.bind(this)}>清空</Button>
              <Button disabled={!selected.length} onClick={this.submit.bind(this)} bsStyle='primary'>提交</Button>
            </ButtonToolbar>
          ) : null}
          {this.renderList()}
        </div>
      )
    }
  }
)

const switchPluginPath = [
  '/kcsapi/api_get_member/practice'
]

export {
  switchPluginPath
}
