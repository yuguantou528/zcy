import React, { useState } from 'react'
import { Form, Input, Button, Card, Checkbox, message, Space, Typography } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { delay } from '@/lib/utils'

const { Title, Text } = Typography

interface LoginProps {
  onLogin: () => void
}

interface LoginForm {
  username: string
  password: string
  remember: boolean
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const handleSubmit = async (values: LoginForm) => {
    setLoading(true)
    
    try {
      // 模拟登录请求 (1秒延迟)
      await delay(1000)
      
      // 验证测试账号
      if (values.username === 'admin' && values.password === '123456') {
        message.success('登录成功！')
        onLogin()
      } else {
        message.error('用户名或密码错误！')
      }
    } catch (error) {
      message.error('登录失败，请重试！')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card
        style={{
          width: 400,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          borderRadius: '8px'
        }}
        bodyStyle={{ padding: '40px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
            管理系统
          </Title>
          <Text type="secondary">请输入您的账号信息</Text>
        </div>

        <Form
          form={form}
          name="login"
          initialValues={{ 
            username: 'admin',
            password: '123456',
            remember: true 
          }}
          onFinish={handleSubmit}
          size="large"
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名！' },
              { min: 2, message: '用户名至少2个字符！' },
              { max: 20, message: '用户名最多20个字符！' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码！' },
              { min: 6, message: '密码至少6个字符！' },
              { max: 20, message: '密码最多20个字符！' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>记住密码</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%', height: '40px' }}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Form.Item>
        </Form>

        {/* 测试账号信息展示 */}
        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          background: '#f0f2f5', 
          borderRadius: '6px' 
        }}>
          <Text strong style={{ display: 'block', marginBottom: '8px' }}>
            测试账号信息：
          </Text>
          <Space direction="vertical" size={4}>
            <Text type="secondary">用户名: admin</Text>
            <Text type="secondary">密码: 123456</Text>
          </Space>
        </div>
      </Card>
    </div>
  )
}

export default Login
