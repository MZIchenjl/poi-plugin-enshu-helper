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

const URL = 'https://api.senka.com.ru/enshuhelper/query'

export const reactClass = connect(state => poiDataSelector(state))(
  class PluginSenkaViewer extends PureComponent {
    constructor(props) {
      super(props)
      this.state = {
        api_list: []
      }
    }
    handleResponse(e) {
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
              status: enemy.api_state ? -1 : 0
            }))
          })
          break
        default:
          break
      }
    }
    submit() {
      const { api_member_id } = this.props
      const { api_list } = this.state
      const enemies = []
      for (let i = 0, len = api_list.length; i < len; i++) {
        if (!api_list[i].status) {
          enemies.push(api_list[i].id)
        }
      }
      const data = {
        api_member_id: api_member_id,
        api_enemy_list: enemies
      }
      console.log('POST data: ', JSON.stringify(data))
      axios.post(URL, data)
        .then(res => res.data)
        .then(res => {
          switch (res.code) {
            case 1:
              toast(res.info || '未知错误')
              break
            case 2:
              const matchedIds = res.matchlist.map(t => t.memberid)
              enemies.forEach(memberid => {
                const idx = api_list.findIndex(t => t.id === memberid)
                if (idx !== -1) {
                  if (matchedIds.includes(memberid)) {
                    api_list[idx].status = 1
                  } else {
                    api_list[idx].status = 2
                  }
                }
              })
              this.setState({
                api_list: [].concat(api_list)
              })
              break
            default:
              break
          }
        })
        .catch(err => {
          console.log(err)
          notify('接口请求错误: ' + err.toString())
        })
    }
    renderList() {
      const { api_list } = this.state
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
                {...enemy}
              />
            ))}
          </tbody>
        </Table>
      )
    }
    componentDidMount() {
      window.addEventListener('game.response', this.handleResponse.bind(this))
    }
    componentWillUnmount() {
      window.removeEventListener('game.response', this.handleResponse.bind(this))
    }
    render() {
      const { api_member_id } = this.props
      return (
        <div id='enshu-helper'>
          <link rel='stylesheet' href={path.join(__dirname, 'assets/enshu-helper.css')} />
          <div className='member_id'>
            ID: {api_member_id}
          </div>
          {this.state.api_list.length ? (
            <ButtonToolbar className='toolbar'>
              <Button onClick={this.submit.bind(this)} bsStyle='primary'>提交</Button>
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
