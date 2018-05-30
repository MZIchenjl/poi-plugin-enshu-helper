import React, { PureComponent } from 'react'

const stateMap = ['-', 'E', 'D', 'C', 'B', 'A', 'S']
const stateColorMap = ['', '#246af2', '#07f64c', '#2bf224', '#ff9914', '#e9513d', '#feed6f']
const statusMap = {
    [-1]: '已对战', 0: '未确定', 1: '已成功', 2: '已失败'
}
const statusColorMap = {
    [-1]: '#fbfbfb', 0: '#07f64c', 1: '#feed6f', 2: '#e9513d'
}

export default class extends PureComponent {
    render() {
        const { name, level, state, rank, status } = this.props
        return (
            <tr className='enemy-list-item'>
                <td>
                    {name}
                    (<span style={{ color: stateColorMap[state] }}>{stateMap[state]}</span>)
                </td>
                <td>{`Lv ${level}`}</td>
                <td>{rank}</td>
                <td style={{
                    color: statusColorMap[status]
                }}>{statusMap[status]}</td>
            </tr>
        )
    }
}
