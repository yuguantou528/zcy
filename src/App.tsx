import { useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Dropdown, Avatar, Space } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  VideoCameraOutlined,
  NodeIndexOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'

// 页面组件导入（稍后创建）
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import VideoMonitoring from './pages/VideoMonitoring'
import TopologyManagement from './pages/TopologyManagement'
import SystemManagement from './pages/SystemManagement'
import UserManagement from './pages/system/UserManagement'
import RoleManagement from './pages/system/RoleManagement'
import PermissionManagement from './pages/system/PermissionManagement'

const { Header, Sider, Content } = Layout

function App() {
  const [collapsed, setCollapsed] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(true) // 默认已登录，方便开发测试
  const navigate = useNavigate()
  const location = useLocation()

  // 导航菜单配置
  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '态势大屏',
    },
    {
      key: '/video-monitoring',
      icon: <VideoCameraOutlined />,
      label: '视频监控',
    },
    {
      key: '/topology-management',
      icon: <NodeIndexOutlined />,
      label: '拓扑图管理',
    },
    {
      key: '/system',
      icon: <SettingOutlined />,
      label: '系统管理',
      children: [
        { key: '/system/users', label: '用户管理' },
        { key: '/system/roles', label: '角色管理' },
        { key: '/system/permissions', label: '权限管理' },
      ],
    },
  ]

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        setIsLoggedIn(false)
        navigate('/login')
      },
    },
  ]

  // 如果未登录，显示登录页面
  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 - 白色背景主题 */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        style={{ background: '#fff' }}
      >
        {/* Logo区域 - 白色背景 */}
        <div style={{ 
          height: 32, 
          margin: 16, 
          background: '#f0f2f5',  // 浅灰背景区分logo区域
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#1890ff',       // 蓝色文字
          fontWeight: 'bold'
        }}>
          {collapsed ? 'MS' : '管理系统'}
        </div>
        
        {/* 菜单组件 - 浅色主题 */}
        <Menu
          theme="light"          // 使用浅色主题替代深色主题
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['/system']}
          items={menuItems}
          onClick={({ key }) => {
            navigate(key)
          }}
          style={{ 
            background: '#fff',    // 确保菜单背景为白色
            border: 'none'         // 移除默认边框
          }}
        />
      </Sider>

      <Layout>
        {/* 顶部栏 */}
        <Header style={{ 
          padding: '0 16px', 
          background: '#fff', 
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>管理员</span>
            </Space>
          </Dropdown>
        </Header>

        {/* 主内容区 - 重要：设置外边距，透明背景 */}
        <Content style={{
          background: 'transparent',  // 透明背景
          margin: '16px',            // 统一外边距 (重要：距离标题栏、导航栏、屏幕右侧)
          minHeight: 'calc(100vh - 112px)' // 最小高度
        }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/video-monitoring" element={<VideoMonitoring />} />
            <Route path="/topology-management" element={<TopologyManagement />} />
            <Route path="/system" element={<SystemManagement />} />
            <Route path="/system/users" element={<UserManagement />} />
            <Route path="/system/roles" element={<RoleManagement />} />
            <Route path="/system/permissions" element={<PermissionManagement />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
