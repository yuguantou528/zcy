import React from 'react'
import { Card, Row, Col, Statistic, Avatar, List, Tag, Space } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  SafetyOutlined,
  KeyOutlined,
  ArrowUpOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LoginOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { formatRelativeTime } from '@/lib/utils'

const Home: React.FC = () => {
  const navigate = useNavigate()

  // 模块卡片样式
  const moduleCardStyle = {
    background: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,21,41,.08)',
    border: '1px solid #f0f0f0',
    marginBottom: '16px'
  }

  // 数据统计数据
  const statisticsData = [
    {
      title: '总用户数',
      value: 1234,
      prefix: <UserOutlined style={{ color: '#52c41a' }} />,
      suffix: <ArrowUpOutlined style={{ color: '#52c41a' }} />,
      valueStyle: { color: '#52c41a' }
    },
    {
      title: '在线用户',
      value: 89,
      prefix: <TeamOutlined style={{ color: '#1890ff' }} />,
      valueStyle: { color: '#1890ff' }
    },
    {
      title: '系统角色',
      value: 12,
      prefix: <SafetyOutlined style={{ color: '#722ed1' }} />,
      valueStyle: { color: '#722ed1' }
    },
    {
      title: '权限数量',
      value: 45,
      prefix: <KeyOutlined style={{ color: '#fa8c16' }} />,
      valueStyle: { color: '#fa8c16' }
    }
  ]

  // 快捷操作数据
  const quickActions = [
    {
      title: '用户管理',
      description: '管理系统用户信息',
      icon: <UserOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      path: '/system/users'
    },
    {
      title: '角色管理',
      description: '配置用户角色权限',
      icon: <SafetyOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
      path: '/system/roles'
    },
    {
      title: '权限管理',
      description: '设置系统访问权限',
      icon: <KeyOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />,
      path: '/system/permissions'
    }
  ]

  // 最近活动数据
  const recentActivities = [
    {
      id: '1',
      user: '张三',
      action: '登录系统',
      type: 'login',
      time: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      user: '李四',
      action: '编辑用户信息',
      type: 'edit',
      time: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      user: '王五',
      action: '新增角色',
      type: 'create',
      time: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      user: '赵六',
      action: '删除权限',
      type: 'delete',
      time: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    },
    {
      id: '5',
      user: '钱七',
      action: '登录系统',
      type: 'login',
      time: new Date(Date.now() - 60 * 60 * 1000).toISOString()
    }
  ]

  // 获取操作类型标签
  const getActionTag = (type: string) => {
    const typeMap: Record<string, { color: string; icon: React.ReactNode }> = {
      login: { color: 'blue', icon: <LoginOutlined /> },
      edit: { color: 'orange', icon: <EditOutlined /> },
      create: { color: 'green', icon: <PlusOutlined /> },
      delete: { color: 'red', icon: <DeleteOutlined /> }
    }
    const config = typeMap[type] || { color: 'default', icon: null }
    return (
      <Tag color={config.color} icon={config.icon}>
        {type === 'login' ? '登录' : type === 'edit' ? '编辑' : type === 'create' ? '新增' : '删除'}
      </Tag>
    )
  }

  return (
    <div style={{ background: 'transparent' }}> {/* 禁止设置 padding */}
      {/* 欢迎信息卡片 */}
      <Card style={moduleCardStyle}>
        <Row align="middle">
          <Col flex="auto">
            <h2 style={{ margin: 0, color: '#262626' }}>
              欢迎回来，管理员！
            </h2>
            <p style={{ margin: '8px 0 0 0', color: '#8c8c8c' }}>
              今天是 {new Date().toLocaleDateString('zh-CN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}，系统运行正常
            </p>
          </Col>
          <Col>
            <Tag color="success">系统正常</Tag>
          </Col>
        </Row>
      </Card>

      {/* 数据统计区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        {statisticsData.map((item, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card style={moduleCardStyle}>
              <Statistic
                title={item.title}
                value={item.value}
                prefix={item.prefix}
                suffix={item.suffix}
                valueStyle={item.valueStyle}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 功能区域 */}
      <Row gutter={[16, 16]} style={{ display: 'flex', alignItems: 'stretch', marginBottom: '16px' }}>
        {/* 左侧: 快捷操作卡片网格 */}
        <Col xs={24} lg={12} style={{ display: 'flex' }}>
          <Card 
            title="快捷操作"
            style={{ 
              width: '100%',
              display: 'flex', 
              flexDirection: 'column',
              ...moduleCardStyle
            }}
            bodyStyle={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column' 
            }}
          >
            <Row gutter={[16, 16]}>
              {quickActions.map((action, index) => (
                <Col span={24} key={index}>
                  <Card
                    hoverable
                    style={{ cursor: 'pointer' }}
                    bodyStyle={{ padding: '16px' }}
                    onClick={() => navigate(action.path)}
                  >
                    <Space>
                      {action.icon}
                      <div>
                        <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                          {action.title}
                        </div>
                        <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
                          {action.description}
                        </div>
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* 右侧: 最近活动列表 */}
        <Col xs={24} lg={12} style={{ display: 'flex' }}>
          <Card 
            title="最近活动"
            style={{ 
              width: '100%',
              display: 'flex', 
              flexDirection: 'column',
              ...moduleCardStyle
            }}
            bodyStyle={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column' 
            }}
          >
            <List
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <Space>
                        <span>{item.user}</span>
                        {getActionTag(item.type)}
                      </Space>
                    }
                    description={
                      <Space>
                        <span>{item.action}</span>
                        <span style={{ color: '#8c8c8c' }}>
                          {formatRelativeTime(item.time)}
                        </span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 系统状态区域 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card title="系统状态" style={moduleCardStyle}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>CPU使用率</span>
                <Tag color="green">23%</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>内存使用率</span>
                <Tag color="blue">45%</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>磁盘使用率</span>
                <Tag color="orange">67%</Tag>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="访问统计" style={moduleCardStyle}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>今日访问</span>
                <span style={{ fontWeight: 500 }}>1,234</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>本周访问</span>
                <span style={{ fontWeight: 500 }}>8,567</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>本月访问</span>
                <span style={{ fontWeight: 500 }}>34,890</span>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="系统信息" style={moduleCardStyle}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>系统版本</span>
                <span>v1.0.0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>运行时间</span>
                <span>15天</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>最后更新</span>
                <span>2024-08-09</span>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Home
