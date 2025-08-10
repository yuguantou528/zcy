import React, { useState, useEffect } from 'react'
import { FloatButton, Typography, Card, Row, Col, Statistic, Progress, Space, Button, List, Tag } from 'antd'
import {
  EnvironmentOutlined,
  MenuOutlined,
  CloudOutlined,
  CarOutlined,
  AlertOutlined,
  SafetyOutlined,
  RadarChartOutlined,
  CloseOutlined,
  VideoCameraOutlined,
  PhoneOutlined,
  TeamOutlined,
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'

const { Title } = Typography

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date())

  // 浮动面板状态管理
  const [panels, setPanels] = useState({
    environment: false,
    ships: false,
    alerts: false,
    emergency: false,
    statistics: false
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 切换面板显示状态
  const togglePanel = (panelName: keyof typeof panels) => {
    setPanels(prev => ({
      ...prev,
      [panelName]: !prev[panelName]
    }))
  }

  // 关闭面板
  const closePanel = (panelName: keyof typeof panels) => {
    setPanels(prev => ({
      ...prev,
      [panelName]: false
    }))
  }

  // 环境数据实时监测
  const environmentData = [
    { label: '水质指数', value: 85, unit: 'WQI', status: 'good', color: '#52c41a' },
    { label: '水温', value: 24.5, unit: '°C', status: 'normal', color: '#1890ff' },
    { label: '盐度', value: 35.2, unit: 'PSU', status: 'normal', color: '#722ed1' },
    { label: '溶解氧', value: 7.8, unit: 'mg/L', status: 'good', color: '#52c41a' },
    { label: '风速', value: 12.3, unit: 'm/s', status: 'warning', color: '#faad14' },
    { label: '浪高', value: 2.1, unit: 'm', status: 'normal', color: '#1890ff' }
  ]

  // 船舶动态统计
  const shipData = [
    { type: '货船', count: 45, color: '#1890ff' },
    { type: '客船', count: 12, color: '#52c41a' },
    { type: '渔船', count: 28, color: '#faad14' },
    { type: '军舰', count: 8, color: '#f5222d' },
    { type: '其他', count: 15, color: '#722ed1' }
  ]

  // 预警告警中心数据
  const alertData = [
    { id: 1, type: '海洋污染', level: 'warning', message: '东海区域检测到油污泄漏', time: '10:30' },
    { id: 2, type: '非法捕捞', level: 'danger', message: '禁渔区发现非法作业船只', time: '09:45' },
    { id: 3, type: '船舶偏航', level: 'info', message: '货船"海运001"偏离预定航线', time: '09:20' },
    { id: 4, type: '气象预警', level: 'warning', message: '预计12小时后有强风暴', time: '08:55' }
  ]

  // 应急资源与方案调度
  const emergencyResources = [
    { name: '救援船只', total: 15, available: 12, inUse: 3 },
    { name: '救援飞机', total: 8, available: 6, inUse: 2 },
    { name: '救援人员', total: 120, available: 95, inUse: 25 },
    { name: '应急物资', total: 500, available: 420, inUse: 80 }
  ]

  // 数据统计概览
  const overviewStats = [
    { title: '监控设备', value: 156, unit: '台', icon: <VideoCameraOutlined />, color: '#1890ff' },
    { title: '在线船舶', value: 108, unit: '艘', icon: <CarOutlined />, color: '#52c41a' },
    { title: '预警事件', value: 4, unit: '起', icon: <AlertOutlined />, color: '#faad14' },
    { title: '应急资源', value: 643, unit: '项', icon: <SafetyOutlined />, color: '#722ed1' }
  ]

  const getAlertColor = (level: string) => {
    const colorMap = {
      danger: '#ff4d4f',
      warning: '#faad14',
      info: '#1890ff'
    }
    return colorMap[level as keyof typeof colorMap] || '#1890ff'
  }

  const getAlertIcon = (level: string) => {
    const iconMap = {
      danger: <WarningOutlined />,
      warning: <AlertOutlined />,
      info: <CheckCircleOutlined />
    }
    return iconMap[level as keyof typeof iconMap] || <CheckCircleOutlined />
  }

  // 浮动面板样式
  const floatingPanelStyle = {
    position: 'absolute' as const,
    background: 'rgba(15, 20, 25, 0.95)',
    border: '1px solid rgba(64, 169, 255, 0.5)',
    borderRadius: '8px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(10px)',
    zIndex: 1000,
    maxHeight: '400px',
    overflow: 'auto'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 页面标题 */}
      <div style={{
        textAlign: 'center',
        padding: '20px 0',
        background: 'rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid rgba(64, 169, 255, 0.3)'
      }}>
        <Title level={2} style={{ color: '#ffffff', margin: 0 }}>
          海洋监控数据中心大屏
        </Title>
        <Typography.Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
          {currentTime.toLocaleString('zh-CN')}
        </Typography.Text>
      </div>

      {/* 主要内容区域 */}
      <Row gutter={[16, 16]} style={{ padding: '20px', height: 'calc(100vh - 120px)' }}>
        {/* 左侧区域 */}
        <Col xs={24} lg={6}>
          <Card
            title="海域态势总览"
            style={{
              height: '100%',
              background: 'rgba(15, 20, 25, 0.8)',
              border: '1px solid rgba(64, 169, 255, 0.3)'
            }}
            headStyle={{ color: '#ffffff', borderBottom: '1px solid rgba(64, 169, 255, 0.3)' }}
            bodyStyle={{ color: '#ffffff' }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center'
            }}>
              <EnvironmentOutlined style={{ fontSize: '48px', color: '#40a9ff', marginBottom: '16px' }} />
              <Title level={4} style={{ color: '#40a9ff', margin: '8px 0' }}>
                海域态势总览
              </Title>
              <Typography.Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
                与实时监控
              </Typography.Text>
              <Typography.Text style={{ color: '#8c8c8c', fontSize: '12px', marginTop: '8px' }}>
                实时监控海域动态、船舶、海洋环境数据，为海洋管理提供全面的态势感知能力
              </Typography.Text>
            </div>
          </Card>
        </Col>

        {/* 中央区域 */}
        <Col xs={24} lg={12}>
          <Card
            style={{
              height: '100%',
              background: 'rgba(15, 20, 25, 0.8)',
              border: '1px solid rgba(64, 169, 255, 0.3)'
            }}
            bodyStyle={{
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}
          >
            <div style={{
              textAlign: 'center',
              padding: '40px'
            }}>
              <div style={{
                width: '200px',
                height: '200px',
                background: 'rgba(64, 169, 255, 0.1)',
                border: '2px solid #40a9ff',
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <EnvironmentOutlined style={{ fontSize: '60px', color: '#40a9ff', marginBottom: '10px' }} />
                <Title level={3} style={{ color: '#40a9ff', margin: 0 }}>
                  海域态势总览
                </Title>
                <Typography.Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
                  与实时监控
                </Typography.Text>
              </div>
              <Typography.Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
                实时监控海域动态、船舶、海洋环境数据，为海洋管理提供全面的态势感知能力
              </Typography.Text>
            </div>
          </Card>
        </Col>

        {/* 右侧区域 */}
        <Col xs={24} lg={6}>
          <Space direction="vertical" style={{ width: '100%', height: '100%' }} size="middle">
            <Card
              title="实时监控"
              size="small"
              style={{
                background: 'rgba(15, 20, 25, 0.8)',
                border: '1px solid rgba(64, 169, 255, 0.3)'
              }}
              headStyle={{ color: '#ffffff', borderBottom: '1px solid rgba(64, 169, 255, 0.3)' }}
              bodyStyle={{ color: '#ffffff' }}
            >
              <Statistic
                title="在线设备"
                value={156}
                suffix="台"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>

            <Card
              title="船舶统计"
              size="small"
              style={{
                background: 'rgba(15, 20, 25, 0.8)',
                border: '1px solid rgba(64, 169, 255, 0.3)'
              }}
              headStyle={{ color: '#ffffff', borderBottom: '1px solid rgba(64, 169, 255, 0.3)' }}
              bodyStyle={{ color: '#ffffff' }}
            >
              <Statistic
                title="在线船舶"
                value={108}
                suffix="艘"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>

            <Card
              title="预警状态"
              size="small"
              style={{
                background: 'rgba(15, 20, 25, 0.8)',
                border: '1px solid rgba(64, 169, 255, 0.3)'
              }}
              headStyle={{ color: '#ffffff', borderBottom: '1px solid rgba(64, 169, 255, 0.3)' }}
              bodyStyle={{ color: '#ffffff' }}
            >
              <Statistic
                title="预警事件"
                value={4}
                suffix="起"
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Space>
        </Col>
      </Row>

      {/* 浮动控制按钮组 */}
      <FloatButton.Group
        trigger='click'
        type='primary'
        style={{ right: 24, bottom: 24 }}
        icon={<MenuOutlined />}
      >
        <FloatButton
          icon={<CloudOutlined />}
          tooltip='环境数据监测'
          onClick={() => togglePanel('environment')}
        />
        <FloatButton
          icon={<CarOutlined />}
          tooltip='船舶动态统计'
          onClick={() => togglePanel('ships')}
        />
        <FloatButton
          icon={<AlertOutlined />}
          tooltip='预警告警中心'
          onClick={() => togglePanel('alerts')}
        />
        <FloatButton
          icon={<SafetyOutlined />}
          tooltip='应急资源调度'
          onClick={() => togglePanel('emergency')}
        />
        <FloatButton
          icon={<RadarChartOutlined />}
          tooltip='数据统计概览'
          onClick={() => togglePanel('statistics')}
        />
      </FloatButton.Group>

      {/* 环境数据监测浮动面板 */}
      {panels.environment && (
        <div style={{
          ...floatingPanelStyle,
          top: '80px',
          left: '20px',
          width: '320px'
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(64, 169, 255, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Space>
              <CloudOutlined style={{ color: '#40a9ff' }} />
              <span style={{ color: '#ffffff', fontWeight: 'bold' }}>环境数据实时监测</span>
            </Space>
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={() => closePanel('environment')}
              style={{ color: '#8c8c8c' }}
            />
          </div>
          <div style={{ padding: '16px' }}>
            <Row gutter={[8, 8]}>
              {environmentData.map((item, index) => (
                <Col span={12} key={index}>
                  <div style={{
                    textAlign: 'center',
                    padding: '8px',
                    background: 'rgba(64, 169, 255, 0.1)',
                    borderRadius: '4px',
                    border: `1px solid ${item.color}`
                  }}>
                    <div style={{ color: item.color, fontSize: '16px', fontWeight: 'bold' }}>
                      {item.value}
                    </div>
                    <div style={{ color: '#8c8c8c', fontSize: '11px' }}>
                      {item.label}
                    </div>
                    <div style={{ color: '#8c8c8c', fontSize: '10px' }}>
                      {item.unit}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      )}

      {/* 船舶动态统计浮动面板 */}
      {panels.ships && (
        <div style={{
          ...floatingPanelStyle,
          top: '80px',
          right: '20px',
          width: '280px'
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(64, 169, 255, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Space>
              <CarOutlined style={{ color: '#40a9ff' }} />
              <span style={{ color: '#ffffff', fontWeight: 'bold' }}>船舶动态统计</span>
            </Space>
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={() => closePanel('ships')}
              style={{ color: '#8c8c8c' }}
            />
          </div>
          <div style={{ padding: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {shipData.map((ship, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px',
                  background: 'rgba(64, 169, 255, 0.1)',
                  borderRadius: '4px'
                }}>
                  <Space>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: ship.color
                    }} />
                    <span style={{ color: '#ffffff' }}>{ship.type}</span>
                  </Space>
                  <span style={{ color: ship.color, fontWeight: 'bold' }}>{ship.count}艘</span>
                </div>
              ))}
            </Space>
          </div>
        </div>
      )}

      {/* 预警告警中心浮动面板 */}
      {panels.alerts && (
        <div style={{
          ...floatingPanelStyle,
          bottom: '120px',
          left: '20px',
          width: '350px'
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(64, 169, 255, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Space>
              <AlertOutlined style={{ color: '#faad14' }} />
              <span style={{ color: '#ffffff', fontWeight: 'bold' }}>预警告警中心</span>
            </Space>
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={() => closePanel('alerts')}
              style={{ color: '#8c8c8c' }}
            />
          </div>
          <div style={{ padding: '16px' }}>
            <List
              dataSource={alertData}
              renderItem={(item) => (
                <List.Item style={{ border: 'none', padding: '8px 0' }}>
                  <div style={{ width: '100%' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px'
                    }}>
                      <Space>
                        {getAlertIcon(item.level)}
                        <Tag color={getAlertColor(item.level)} style={{ margin: 0 }}>
                          {item.type}
                        </Tag>
                      </Space>
                      <Typography.Text style={{ color: '#8c8c8c', fontSize: '12px' }}>{item.time}</Typography.Text>
                    </div>
                    <Typography.Text style={{ color: '#ffffff', fontSize: '12px' }}>{item.message}</Typography.Text>
                  </div>
                </List.Item>
              )}
            />
          </div>
        </div>
      )}

      {/* 应急资源调度浮动面板 */}
      {panels.emergency && (
        <div style={{
          ...floatingPanelStyle,
          bottom: '120px',
          right: '20px',
          width: '320px'
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(64, 169, 255, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Space>
              <SafetyOutlined style={{ color: '#52c41a' }} />
              <span style={{ color: '#ffffff', fontWeight: 'bold' }}>应急资源调度</span>
            </Space>
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={() => closePanel('emergency')}
              style={{ color: '#8c8c8c' }}
            />
          </div>
          <div style={{ padding: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {emergencyResources.map((resource, index) => (
                <div key={index} style={{
                  padding: '12px',
                  background: 'rgba(64, 169, 255, 0.1)',
                  borderRadius: '4px',
                  border: '1px solid rgba(82, 196, 26, 0.3)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{resource.name}</span>
                    <span style={{ color: '#52c41a' }}>
                      {resource.available}/{resource.total}
                    </span>
                  </div>
                  <Progress
                    percent={Math.round((resource.available / resource.total) * 100)}
                    strokeColor="#52c41a"
                    trailColor="rgba(255, 255, 255, 0.1)"
                    size="small"
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '4px',
                    fontSize: '12px'
                  }}>
                    <span style={{ color: '#52c41a' }}>可用: {resource.available}</span>
                    <span style={{ color: '#faad14' }}>使用中: {resource.inUse}</span>
                  </div>
                </div>
              ))}
            </Space>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <Button type="primary" icon={<PhoneOutlined />} style={{ marginRight: '8px' }} size="small">
                应急通讯
              </Button>
              <Button icon={<TeamOutlined />} size="small">
                指挥调度
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 数据统计概览浮动面板 */}
      {panels.statistics && (
        <div style={{
          ...floatingPanelStyle,
          top: '50px',
          right: '300px',
          width: '280px'
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(64, 169, 255, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Space>
              <RadarChartOutlined style={{ color: '#722ed1' }} />
              <span style={{ color: '#ffffff', fontWeight: 'bold' }}>数据统计概览</span>
            </Space>
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={() => closePanel('statistics')}
              style={{ color: '#8c8c8c' }}
            />
          </div>
          <div style={{ padding: '16px' }}>
            {/* 主要统计指标 */}
            <Row gutter={[8, 8]} style={{ marginBottom: '16px' }}>
              {overviewStats.map((stat, index) => (
                <Col span={12} key={index}>
                  <div style={{
                    textAlign: 'center',
                    padding: '8px',
                    background: 'rgba(64, 169, 255, 0.1)',
                    borderRadius: '4px',
                    border: `1px solid ${stat.color}`
                  }}>
                    <div style={{ color: stat.color, fontSize: '14px', marginBottom: '4px' }}>
                      {stat.icon}
                    </div>
                    <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }}>
                      {stat.value}
                    </div>
                    <div style={{ color: '#8c8c8c', fontSize: '10px' }}>
                      {stat.title}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>

            {/* 系统状态指标 */}
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <div style={{
                padding: '8px',
                background: 'rgba(64, 169, 255, 0.1)',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#722ed1', fontSize: '18px', fontWeight: 'bold' }}>
                  98.5%
                </div>
                <div style={{ color: '#8c8c8c', fontSize: '11px' }}>
                  设备在线率
                </div>
              </div>

              <div style={{
                padding: '8px',
                background: 'rgba(64, 169, 255, 0.1)',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#1890ff', fontSize: '18px', fontWeight: 'bold' }}>
                  24h
                </div>
                <div style={{ color: '#8c8c8c', fontSize: '11px' }}>
                  连续监控时长
                </div>
              </div>

              <div style={{
                padding: '8px',
                background: 'rgba(64, 169, 255, 0.1)',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#52c41a', fontSize: '18px', fontWeight: 'bold' }}>
                  99.2%
                </div>
                <div style={{ color: '#8c8c8c', fontSize: '11px' }}>
                  数据准确率
                </div>
              </div>
            </Space>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
