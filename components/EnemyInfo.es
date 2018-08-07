import React, { PureComponent } from 'react'

const stateText = ['-', 'E', 'D', 'C', 'B', 'A', 'S']
const stateColor = ['', '#246af2', '#07f64c', '#2bf224', '#ff9914', '#e9513d', '#feed6f']
const statusText = {
  [-1]: '演习完成', 0: '状态未知', 1: '匹配成功', 2: '无法匹配'
}
const statusColor = {
  [-1]: '#fbfbfb', 0: '#07f64c', 1: '#feed6f', 2: '#e9513d'
}

export default class extends PureComponent {
  render() {
    const { name, level, state, rank, status, comment, qqgroup } = this.props
    return (
      <tr className='enemy-list-item'>
        <td>
          {name}
          (<span style={{ color: stateColor[state] }}>{stateText[state]}</span>)
        </td>
        <td>{`Lv ${level}`}</td>
        <td>{rank}</td>
        <td style={{
          color: statusColor[status]
        }}>{statusText[status]}</td>
        <td>{qqgroup}</td>
        <td>{comment}</td>
      </tr>
    )
  }
}
