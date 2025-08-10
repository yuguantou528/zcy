import React from 'react'
import { Empty as AntEmpty, Button } from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'

interface EmptyProps {
  /** 空状态描述文字 */
  description?: string
  /** 是否显示操作按钮 */
  showAction?: boolean
  /** 操作按钮文字 */
  actionText?: string
  /** 操作按钮点击事件 */
  onAction?: () => void
  /** 操作按钮类型 */
  actionType?: 'primary' | 'default'
  /** 操作按钮图标 */
  actionIcon?: React.ReactNode
  /** 自定义图片 */
  image?: React.ReactNode
  /** 容器样式 */
  style?: React.CSSProperties
  /** 容器类名 */
  className?: string
}

const Empty: React.FC<EmptyProps> = ({
  description = '暂无数据',
  showAction = false,
  actionText = '新增',
  onAction,
  actionType = 'primary',
  actionIcon = <PlusOutlined />,
  image,
  style,
  className
}) => {
  return (
    <div 
      style={{ 
        padding: '40px 20px',
        textAlign: 'center',
        ...style 
      }}
      className={className}
    >
      <AntEmpty
        image={image}
        description={description}
      >
        {showAction && onAction && (
          <Button
            type={actionType}
            icon={actionIcon}
            onClick={onAction}
          >
            {actionText}
          </Button>
        )}
      </AntEmpty>
    </div>
  )
}

// 预设的空状态组件变体
export const EmptyData: React.FC<Omit<EmptyProps, 'description' | 'actionIcon'>> = (props) => (
  <Empty
    description="暂无数据"
    actionIcon={<ReloadOutlined />}
    actionText="刷新"
    {...props}
  />
)

export const EmptySearch: React.FC<Omit<EmptyProps, 'description' | 'showAction'>> = (props) => (
  <Empty
    description="未找到相关数据，请尝试其他搜索条件"
    showAction={false}
    {...props}
  />
)

export const EmptyCreate: React.FC<Omit<EmptyProps, 'description' | 'actionIcon' | 'actionText'>> = (props) => (
  <Empty
    description="还没有任何数据，立即创建第一条记录吧"
    actionIcon={<PlusOutlined />}
    actionText="立即创建"
    showAction={true}
    {...props}
  />
)

export default Empty
