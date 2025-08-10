import React, { useState } from 'react'
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  message,
  Popconfirm,
  Row,
  Col,
  Descriptions,
  Checkbox,
  Divider
} from 'antd'
import { 
  PlusOutlined, 
  SearchOutlined, 
  SafetyOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  TeamOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { delay } from '@/lib/utils'

// 角色数据接口
interface Role {
  id: string
  roleName: string      // 角色名称
  roleCode: string      // 角色代码
  description: string   // 角色描述
  userCount: number     // 用户数量
  permissions: string[] // 权限列表
  status: 'active' | 'inactive'
  createTime: string
}

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      roleName: '超级管理员',
      roleCode: 'SUPER_ADMIN',
      description: '拥有系统所有权限的超级管理员',
      userCount: 1,
      permissions: ['user:read', 'user:write', 'user:delete', 'role:read', 'role:write', 'role:delete', 'permission:read', 'permission:write'],
      status: 'active',
      createTime: '2024-01-01 00:00:00'
    },
    {
      id: '2',
      roleName: '管理员',
      roleCode: 'ADMIN',
      description: '系统管理员，拥有大部分管理权限',
      userCount: 3,
      permissions: ['user:read', 'user:write', 'role:read', 'permission:read'],
      status: 'active',
      createTime: '2024-01-15 10:30:00'
    },
    {
      id: '3',
      roleName: '编辑员',
      roleCode: 'EDITOR',
      description: '内容编辑员，负责内容的编辑和管理',
      userCount: 5,
      permissions: ['user:read', 'content:read', 'content:write'],
      status: 'active',
      createTime: '2024-02-01 14:20:00'
    },
    {
      id: '4',
      roleName: '审核员',
      roleCode: 'AUDITOR',
      description: '内容审核员，负责内容的审核工作',
      userCount: 2,
      permissions: ['user:read', 'content:read', 'audit:read', 'audit:write'],
      status: 'active',
      createTime: '2024-02-15 09:45:00'
    },
    {
      id: '5',
      roleName: '普通用户',
      roleCode: 'USER',
      description: '系统普通用户，只有基本的查看权限',
      userCount: 15,
      permissions: ['user:read'],
      status: 'active',
      createTime: '2024-03-01 16:15:00'
    }
  ])

  // 可用权限列表
  const availablePermissions = [
    { value: 'user:read', label: '用户查看' },
    { value: 'user:write', label: '用户编辑' },
    { value: 'user:delete', label: '用户删除' },
    { value: 'role:read', label: '角色查看' },
    { value: 'role:write', label: '角色编辑' },
    { value: 'role:delete', label: '角色删除' },
    { value: 'permission:read', label: '权限查看' },
    { value: 'permission:write', label: '权限编辑' },
    { value: 'content:read', label: '内容查看' },
    { value: 'content:write', label: '内容编辑' },
    { value: 'audit:read', label: '审核查看' },
    { value: 'audit:write', label: '审核操作' }
  ]

  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [viewingRole, setViewingRole] = useState<Role | null>(null)
  const [form] = Form.useForm()

  // 模块卡片样式
  const moduleCardStyle = {
    background: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,21,41,.08)',
    border: '1px solid #f0f0f0',
    marginBottom: '16px'
  }

  // 状态标签
  const getStatusTag = (status: string) => {
    const statusMap = {
      'active': { color: 'success', text: '启用' },
      'inactive': { color: 'error', text: '禁用' }
    }
    const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: '未知' }
    return <Tag color={config.color}>{config.text}</Tag>
  }

  // 权限标签
  const getPermissionTags = (permissions: string[]) => {
    return permissions.slice(0, 3).map(permission => {
      const permissionInfo = availablePermissions.find(p => p.value === permission)
      return (
        <Tag key={permission} style={{ margin: '2px' }}>
          {permissionInfo?.label || permission}
        </Tag>
      )
    }).concat(
      permissions.length > 3 ? [
        <Tag key="more" style={{ margin: '2px' }}>
          +{permissions.length - 3}
        </Tag>
      ] : []
    )
  }

  // 表格列配置
  const columns: ColumnsType<Role> = [
    {
      title: '角色信息',
      dataIndex: 'roleName',
      key: 'roleName',
      width: 180,
      align: 'center',
      render: (text: string, record: Role) => (
        <Space size={4} style={{ whiteSpace: 'nowrap' }}>
          <SafetyOutlined style={{ color: '#722ed1', fontSize: '14px' }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
          <Tag style={{ margin: 0, fontSize: '11px', padding: '0 4px' }}>
            {record.roleCode}
          </Tag>
        </Space>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      align: 'center',
      ellipsis: true
    },
    {
      title: '用户数量',
      dataIndex: 'userCount',
      key: 'userCount',
      width: 100,
      align: 'center',
      render: (count: number) => (
        <Space>
          <TeamOutlined style={{ color: '#1890ff' }} />
          <span>{count}</span>
        </Space>
      )
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions',
      width: 200,
      align: 'center',
      render: (permissions: string[]) => (
        <div style={{ textAlign: 'center' }}>
          {getPermissionTags(permissions)}
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      align: 'center',
      sorter: true
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      align: 'center',
      render: (_: any, record: Role) => (
        <Space size={8}>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} size="small">
            详情
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small">
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个角色吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  // 筛选角色数据
  const filteredRoles = roles.filter(role =>
    role.roleName.toLowerCase().includes(searchText.toLowerCase()) ||
    role.roleCode.toLowerCase().includes(searchText.toLowerCase()) ||
    role.description.toLowerCase().includes(searchText.toLowerCase())
  )

  // 处理新增角色
  const handleAdd = () => {
    setEditingRole(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  // 处理编辑角色
  const handleEdit = (role: Role) => {
    setEditingRole(role)
    form.setFieldsValue(role)
    setIsModalVisible(true)
  }

  // 处理查看详情
  const handleViewDetail = (role: Role) => {
    setViewingRole(role)
    setIsDetailModalVisible(true)
  }

  // 处理删除角色
  const handleDelete = async (role: Role) => {
    setLoading(true)
    try {
      await delay(500)
      setRoles(roles.filter(r => r.id !== role.id))
      message.success('删除成功！')
    } catch (error) {
      message.error('删除失败！')
    } finally {
      setLoading(false)
    }
  }

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      await delay(1000)
      
      if (editingRole) {
        // 编辑角色
        setRoles(roles.map(role => 
          role.id === editingRole.id 
            ? { ...role, ...values }
            : role
        ))
        message.success('编辑成功！')
      } else {
        // 新增角色
        const newRole: Role = {
          id: Date.now().toString(),
          ...values,
          userCount: 0,
          createTime: new Date().toLocaleString('zh-CN')
        }
        setRoles([...roles, newRole])
        message.success('新增成功！')
      }
      
      setIsModalVisible(false)
      form.resetFields()
    } catch (error) {
      message.error('操作失败！')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'transparent' }}> {/* 禁止设置 padding */}
      {/* 筛选操作区 */}
      <Card style={moduleCardStyle}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Input.Search
              placeholder="搜索角色名称、代码或描述..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ maxWidth: 400 }}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增角色
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 数据列表区 */}
      <Card style={moduleCardStyle}>
        <Table
          columns={columns}
          dataSource={filteredRoles}
          rowKey="id"
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
          }}
        />
      </Card>

      {/* 新增/编辑角色模态框 */}
      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roleName"
                label="角色名称"
                rules={[
                  { required: true, message: '请输入角色名称！' },
                  { min: 2, max: 20, message: '角色名称长度为2-20个字符！' }
                ]}
              >
                <Input placeholder="请输入角色名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="roleCode"
                label="角色代码"
                rules={[
                  { required: true, message: '请输入角色代码！' },
                  { pattern: /^[A-Z_]+$/, message: '角色代码只能包含大写字母和下划线！' }
                ]}
              >
                <Input placeholder="请输入角色代码" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="角色描述"
            rules={[{ required: true, message: '请输入角色描述！' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入角色描述" />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态！' }]}
          >
            <Checkbox.Group>
              <Checkbox value="active">启用</Checkbox>
            </Checkbox.Group>
          </Form.Item>
          <Divider>权限分配</Divider>
          <Form.Item
            name="permissions"
            label="权限列表"
            rules={[{ required: true, message: '请选择至少一个权限！' }]}
          >
            <Checkbox.Group>
              <Row gutter={[16, 8]}>
                {availablePermissions.map(permission => (
                  <Col span={8} key={permission.value}>
                    <Checkbox value={permission.value}>
                      {permission.label}
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingRole ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 角色详情模态框 */}
      <Modal
        title="角色详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {viewingRole && (
          <>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="角色名称">{viewingRole.roleName}</Descriptions.Item>
              <Descriptions.Item label="角色代码">{viewingRole.roleCode}</Descriptions.Item>
              <Descriptions.Item label="用户数量">{viewingRole.userCount}</Descriptions.Item>
              <Descriptions.Item label="状态">{getStatusTag(viewingRole.status)}</Descriptions.Item>
              <Descriptions.Item label="创建时间" span={2}>{viewingRole.createTime}</Descriptions.Item>
              <Descriptions.Item label="角色描述" span={2}>{viewingRole.description}</Descriptions.Item>
            </Descriptions>
            <Divider>权限列表</Divider>
            <div>
              {viewingRole.permissions.map(permission => {
                const permissionInfo = availablePermissions.find(p => p.value === permission)
                return (
                  <Tag key={permission} style={{ margin: '4px' }}>
                    {permissionInfo?.label || permission}
                  </Tag>
                )
              })}
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}

export default RoleManagement
