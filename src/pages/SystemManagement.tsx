import React from 'react'
import { Card, Row, Col, Statistic, Button, Space, List, Avatar, Tag } from 'antd'
import {
  UserOutlined,
  SafetyOutlined,
  KeyOutlined,
  SettingOutlined,
  ArrowRightOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const SystemManagement: React.FC = () => {
  const navigate = useNavigate()

  // 模块卡片样式
  const moduleCardStyle = {
    background: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,21,41,.08)',
    border: '1px solid #f0f0f0',
    marginBottom: '16px'
  }

  // 系统管理统计数据
  const systemStats = [
    {
      title: '用户总数',
      value: 1234,
      prefix: <UserOutlined style={{ color: '#1890ff' }} />,
      suffix: '人',
      description: '系统注册用户总数'
    },
    {
      title: '角色数量',
      value: 12,
      prefix: <SafetyOutlined style={{ color: '#722ed1' }} />,
      suffix: '个',
      description: '系统配置角色数量'
    },
    {
      title: '权限数量',
      value: 45,
      prefix: <KeyOutlined style={{ color: '#fa8c16' }} />,
      suffix: '项',
      description: '系统权限配置总数'
    },
    {
      title: '在线用户',
      value: 89,
      prefix: <TeamOutlined style={{ color: '#52c41a' }} />,
      suffix: '人',
      description: '当前在线用户数量'
    }
  ]

  // 管理模块快捷入口
  const managementModules = [
    {
      title: '用户管理',
      description: '管理系统用户账号、权限分配和用户状态',
      icon: <UserOutlined style={{ fontSize: '32px', color: '#1890ff' }} />,
      path: '/system/users',
      features: ['用户列表', '新增用户', '编辑用户', '用户状态管理']
    },
    {
      title: '角色管理',
      description: '配置系统角色、分配权限和管理角色关系',
      icon: <SafetyOutlined style={{ fontSize: '32px', color: '#722ed1' }} />,
      path: '/system/roles',
      features: ['角色列表', '权限分配', '角色编辑', '用户关联']
    },
    {
      title: '权限管理',
      description: '设置系统权限结构、管理访问控制规则',
      icon: <KeyOutlined style={{ fontSize: '32px', color: '#fa8c16' }} />,
      path: '/system/permissions',
      features: ['权限树结构', '权限类型', '访问控制', '权限继承']
    }
  ]

  // 最近操作记录
  const recentOperations = [
    {
      id: '1',
      operator: '管理员',
      operation: '新增用户',
      target: '张三',
      time: '5分钟前',
      status: 'success'
    },
    {
      id: '2',
      operator: '管理员',
      operation: '编辑角色',
      target: '编辑员角色',
      time: '15分钟前',
      status: 'success'
    },
    {
      id: '3',
      operator: '管理员',
      operation: '删除权限',
      target: '临时权限',
      time: '30分钟前',
      status: 'success'
    },
    {
      id: '4',
      operator: '管理员',
      operation: '修改用户状态',
      target: '李四',
      time: '1小时前',
      status: 'warning'
    },
    {
      id: '5',
      operator: '管理员',
      operation: '创建角色',
      target: '审核员角色',
      time: '2小时前',
      status: 'success'
    }
  ]

  // 获取操作状态标签
  const getStatusTag = (status: string) => {
    const statusMap = {
      success: { color: 'success', icon: <CheckCircleOutlined />, text: '成功' },
      warning: { color: 'warning', icon: <ClockCircleOutlined />, text: '处理中' },
      error: { color: 'error', icon: <ClockCircleOutlined />, text: '失败' }
    }
    const config = statusMap[status as keyof typeof statusMap] || statusMap.success
    return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>
  }

  return (
    <div style={{ background: 'transparent' }}> {/* 禁止设置 padding */}
      {/* 欢迎信息 */}
      <Card style={moduleCardStyle}>
        <Row align="middle">
          <Col flex="auto">
            <Space size="large">
              <SettingOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
              <div>
                <h2 style={{ margin: 0, color: '#262626' }}>系统管理</h2>
                <p style={{ margin: '4px 0 0 0', color: '#8c8c8c' }}>
                  管理系统用户、角色和权限配置
                </p>
              </div>
            </Space>
          </Col>
          <Col>
            <Tag color="processing">管理模式</Tag>
          </Col>
        </Row>
      </Card>

      {/* 统计数据 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        {systemStats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card style={moduleCardStyle}>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
              />
              <p style={{ 
                margin: '8px 0 0 0', 
                color: '#8c8c8c', 
                fontSize: '12px' 
              }}>
                {stat.description}
              </p>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 管理模块 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        {managementModules.map((module, index) => (
          <Col xs={24} lg={8} key={index}>
            <Card
              style={moduleCardStyle}
              hoverable
              actions={[
                <Button 
                  type="primary" 
                  icon={<ArrowRightOutlined />}
                  onClick={() => navigate(module.path)}
                >
                  进入管理
                </Button>
              ]}
            >
              <Card.Meta
                avatar={module.icon}
                title={module.title}
                description={module.description}
              />
              <div style={{ marginTop: '16px' }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: 500, color: '#262626' }}>
                  主要功能：
                </p>
                <Space wrap>
                  {module.features.map((feature, idx) => (
                    <Tag key={idx} color="blue">{feature}</Tag>
                  ))}
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 最近操作和系统状态 */}
      <Row gutter={[16, 16]}>
        {/* 最近操作 */}
        <Col xs={24} lg={16}>
          <Card title="最近操作记录" style={moduleCardStyle}>
            <List
              dataSource={recentOperations}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <Space>
                        <span>{item.operator}</span>
                        <span style={{ color: '#8c8c8c' }}>{item.operation}</span>
                        <span style={{ fontWeight: 500 }}>{item.target}</span>
                        {getStatusTag(item.status)}
                      </Space>
                    }
                    description={item.time}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 系统状态 */}
        <Col xs={24} lg={8}>
          <Card title="系统状态" style={moduleCardStyle}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>用户服务</span>
                <Tag color="success">正常</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>权限服务</span>
                <Tag color="success">正常</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>认证服务</span>
                <Tag color="success">正常</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>数据库连接</span>
                <Tag color="success">正常</Tag>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>缓存服务</span>
                <Tag color="warning">警告</Tag>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default SystemManagement
