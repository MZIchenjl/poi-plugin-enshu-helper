import path from 'path'
import { connect } from 'react-redux'
import React, { PureComponent } from 'react'
import { createSelector } from 'reselect'
import { Table, Button, Well } from 'react-bootstrap'

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
  class PluginEnshuHelper extends PureComponent {
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
              status: enemy.api_state ? -1 : 0,
              comment: '--',
              qqgroup: '--'
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
      const enemies = api_list.reduce((acc, enemy) => {
        const ret = acc
        if (!enemy.status) {
          ret.push(enemy.id)
        }
        return ret
      }, [])
      const data = {
        api_member_id: api_member_id,
        api_enemy_list: enemies
      }
      const reqBody = JSON.stringify(data)
      console.log('POST data: ', reqBody)
      fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: reqBody
      })
        .then(res => res.json())
        .then(res => {
          switch (res.code) {
            case 1:
              toast(res.info || '未知错误')
              enemies.forEach(memberid => {
                const idx = api_list.findIndex(t => t.id === memberid)
                if (idx !== -1) {
                  api_list[idx].status = 2
                }
              })
              break
            case 2:
              const matchedIds = res.matchlist.map(t => t.memberid)
              const infoList = res.matchlist.reduce((acc, t) => {
                const ret = acc
                ret[t.memberid] = {
                  comment: t.comments,
                  qqgroup: t.qqgroup
                }
                return ret
              }, {})
              enemies.forEach(memberid => {
                const idx = api_list.findIndex(t => t.id === memberid)
                if (idx !== -1) {
                  if (matchedIds.includes(memberid)) {
                    api_list[idx].status = 1
                    api_list[idx].comment = infoList[memberid].comment
                    api_list[idx].qqgroup = infoList[memberid].qqgroup
                  } else {
                    api_list[idx].status = 2
                  }
                }
              })
              break
            default:
              break
          }
          this.setState({
            api_list: [].concat(api_list)
          })
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
              <th>Q群</th>
              <th>签名</th>
            </tr>
          </thead>
          <tbody>
            {_.map(api_list, enemy => (
              <EnemyInfo key={enemy.id} {...enemy} />
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
      const { api_list } = this.state
      const { api_member_id } = this.props
      return (
        <div id='enshu-helper'>
          <link rel='stylesheet' href={path.join(__dirname, 'assets/enshu-helper.css')}/>
          <div className='member_id'>ID: {api_member_id}</div>
          {api_list.length ? (
            <Button
              bsStyle='primary'
              onClick={this.submit.bind(this)}
              disabled={api_list.every(enemy => !!enemy.status)}
            >提交</Button>
          ) : null}
          {this.renderList()}
        </div>
      )
    }
  }
)

const switchPluginPath = ['/kcsapi/api_get_member/practice']

export { switchPluginPath }
