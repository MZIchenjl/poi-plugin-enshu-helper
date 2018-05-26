import React, { PureComponent } from 'react'

const stateMap = ['', 'E', 'D', 'C', 'B', 'A', 'S']
const stateColorMap = ['', '#246af2', '#07f64c', '#2bf224', '#ff9914', '#e9513d', '#feed6f']

const statusMap = ['待确定', '成功', '失败']
const statusColorMap = ['#07f64c', '#feed6f', '#e9513d']

export default class extends PureComponent {
    render() {
        const { name, level, state, rank, status, disabled, active, onClick } = this.props
        let className = 'enemy-list-item'
        if (disabled) {
            className += ' disabled'
        } else if (active) {
            className += ' active'
        }
        return (
            <tr type='button' onClick={onClick} disabled={disabled} className={className}>
                <td>
                    {name}
                    {
                        disabled ? (
                            <span style={{ color: stateColorMap[state] }}>({stateMap[state]})</span>
                        ) : null
                    }
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
