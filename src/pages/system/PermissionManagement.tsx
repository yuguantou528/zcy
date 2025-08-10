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
  Select,
  message,
  Popconfirm,
  Row,
  Col,
  Descriptions,
  TreeSelect
} from 'antd'
import { 
  PlusOutlined, 
  SearchOutlined, 
  KeyOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  MenuOutlined,
  ApiOutlined,
  ControlOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { delay } from '@/lib/utils'

// 权限数据接口
interface Permission {
  id: string
  permissionName: string  // 权限名称
  permissionCode: string  // 权限代码
  permissionType: 'menu' | 'button' | 'api'  // 权限类型
  parentId: string | null // 父级权限
  description: string     // 权限描述
  status: 'active' | 'inactive'
  createTime: string
}

const PermissionManagement: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: '1',
      permissionName: '系统管理',
      permissionCode: 'system',
      permissionType: 'menu',
      parentId: null,
      description: '系统管理模块菜单权限',
      status: 'active',
      createTime: '2024-01-01 00:00:00'
    },
    {
      id: '2',
      permissionName: '用户管理',
      permissionCode: 'system:user',
      permissionType: 'menu',
      parentId: '1',
      description: '用户管理页面访问权限',
      status: 'active',
      createTime: '2024-01-01 00:00:00'
    },
    {
      id: '3',
      permissionName: '用户查看',
      permissionCode: 'user:read',
      permissionType: 'api',
      parentId: '2',
      description: '查看用户信息的API权限',
      status: 'active',
      createTime: '2024-01-01 00:00:00'
    },
    {
      id: '4',
      permissionName: '用户编辑',
      permissionCode: 'user:write',
      permissionType: 'api',
      parentId: '2',
      description: '编辑用户信息的API权限',
      status: 'active',
      createTime: '2024-01-01 00:00:00'
    },
    {
      id: '5',
      permissionName: '新增用户按钮',
      permissionCode: 'user:add:button',
      permissionType: 'button',
      parentId: '2',
      description: '新增用户按钮显示权限',
      status: 'active',
      createTime: '2024-01-01 00:00:00'
    },
    {
      id: '6',
      permissionName: '角色管理',
      permissionCode: 'system:role',
      permissionType: 'menu',
      parentId: '1',
      description: '角色管理页面访问权限',
      status: 'active',
      createTime: '2024-01-01 00:00:00'
    },
    {
      id: '7',
      permissionName: '角色查看',
      permissionCode: 'role:read',
      permissionType: 'api',
      parentId: '6',
      description: '查看角色信息的API权限',
      status: 'active',
      createTime: '2024-01-01 00:00:00'
    },
    {
      id: '8',
      permissionName: '权限管理',
      permissionCode: 'system:permission',
      permissionType: 'menu',
      parentId: '1',
      description: '权限管理页面访问权限',
      status: 'active',
      createTime: '2024-01-01 00:00:00'
    }
  ])

  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [viewingPermission, setViewingPermission] = useState<Permission | null>(null)
  const [form] = Form.useForm()

  // 模块卡片样式
  const moduleCardStyle = {
    background: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,21,41,.08)',
    border: '1px solid #f0f0f0',
    marginBottom: '16px'
  }

  // 权限类型标签和图标
  const getPermissionTypeTag = (type: string) => {
    const typeMap = {
      'menu': { color: 'blue', text: '菜单', icon: <MenuOutlined /> },
      'button': { color: 'green', text: '按钮', icon: <ControlOutlined /> },
      'api': { color: 'orange', text: 'API', icon: <ApiOutlined /> }
    }
    const config = typeMap[type as keyof typeof typeMap] || { color: 'default', text: '未知', icon: null }
    return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>
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

  // 获取父级权限名称
  const getParentName = (parentId: string | null) => {
    if (!parentId) return '-'
    const parent = permissions.find(p => p.id === parentId)
    return parent ? parent.permissionName : '-'
  }

  // 构建树形选择器数据
  const buildTreeData = () => {
    const treeData: any[] = []
    const rootPermissions = permissions.filter(p => p.parentId === null)
    
    const buildNode = (permission: Permission): any => {
      const children = permissions.filter(p => p.parentId === permission.id)
      return {
        title: permission.permissionName,
        value: permission.id,
        key: permission.id,
        children: children.map(child => buildNode(child))
      }
    }
    
    rootPermissions.forEach(root => {
      treeData.push(buildNode(root))
    })
    
    return treeData
  }

  // 表格列配置
  const columns: ColumnsType<Permission> = [
    {
      title: '权限信息',
      dataIndex: 'permissionName',
      key: 'permissionName',
      width: 200,
      align: 'center',
      render: (text: string) => (
        <Space size={4} style={{ whiteSpace: 'nowrap' }}>
          <KeyOutlined style={{ color: '#fa8c16', fontSize: '14px' }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      )
    },
    {
      title: '权限代码',
      dataIndex: 'permissionCode',
      key: 'permissionCode',
      width: 150,
      align: 'center',
      render: (text: string) => (
        <Tag style={{ fontFamily: 'monospace' }}>{text}</Tag>
      )
    },
    {
      title: '权限类型',
      dataIndex: 'permissionType',
      key: 'permissionType',
      width: 100,
      align: 'center',
      render: (type: string) => getPermissionTypeTag(type)
    },
    {
      title: '父级权限',
      dataIndex: 'parentId',
      key: 'parentId',
      width: 120,
      align: 'center',
      render: (parentId: string | null) => getParentName(parentId)
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
      render: (_: any, record: Permission) => (
        <Space size={8}>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} size="small">
            详情
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small">
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个权限吗？"
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

  // 筛选权限数据
  const filteredPermissions = permissions.filter(permission =>
    permission.permissionName.toLowerCase().includes(searchText.toLowerCase()) ||
    permission.permissionCode.toLowerCase().includes(searchText.toLowerCase()) ||
    permission.description.toLowerCase().includes(searchText.toLowerCase())
  )

  // 处理新增权限
  const handleAdd = () => {
    setEditingPermission(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  // 处理编辑权限
  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission)
    form.setFieldsValue(permission)
    setIsModalVisible(true)
  }

  // 处理查看详情
  const handleViewDetail = (permission: Permission) => {
    setViewingPermission(permission)
    setIsDetailModalVisible(true)
  }

  // 处理删除权限
  const handleDelete = async (permission: Permission) => {
    setLoading(true)
    try {
      await delay(500)
      setPermissions(permissions.filter(p => p.id !== permission.id))
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
      
      if (editingPermission) {
        // 编辑权限
        setPermissions(permissions.map(permission => 
          permission.id === editingPermission.id 
            ? { ...permission, ...values }
            : permission
        ))
        message.success('编辑成功！')
      } else {
        // 新增权限
        const newPermission: Permission = {
          id: Date.now().toString(),
          ...values,
          createTime: new Date().toLocaleString('zh-CN')
        }
        setPermissions([...permissions, newPermission])
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
              placeholder="搜索权限名称、代码或描述..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ maxWidth: 400 }}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增权限
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 数据列表区 */}
      <Card style={moduleCardStyle}>
        <Table
          columns={columns}
          dataSource={filteredPermissions}
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

      {/* 新增/编辑权限模态框 */}
      <Modal
        title={editingPermission ? '编辑权限' : '新增权限'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="permissionName"
                label="权限名称"
                rules={[
                  { required: true, message: '请输入权限名称！' },
                  { min: 2, max: 50, message: '权限名称长度为2-50个字符！' }
                ]}
              >
                <Input placeholder="请输入权限名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="permissionCode"
                label="权限代码"
                rules={[
                  { required: true, message: '请输入权限代码！' },
                  { pattern: /^[a-z:_]+$/, message: '权限代码只能包含小写字母、冒号和下划线！' }
                ]}
              >
                <Input placeholder="请输入权限代码" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="permissionType"
                label="权限类型"
                rules={[{ required: true, message: '请选择权限类型！' }]}
              >
                <Select placeholder="请选择权限类型">
                  <Select.Option value="menu">菜单</Select.Option>
                  <Select.Option value="button">按钮</Select.Option>
                  <Select.Option value="api">API</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="parentId"
                label="父级权限"
              >
                <TreeSelect
                  placeholder="请选择父级权限"
                  allowClear
                  treeData={buildTreeData()}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="权限描述"
            rules={[{ required: true, message: '请输入权限描述！' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入权限描述" />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态！' }]}
          >
            <Select placeholder="请选择状态">
              <Select.Option value="active">启用</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingPermission ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 权限详情模态框 */}
      <Modal
        title="权限详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {viewingPermission && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="权限名称">{viewingPermission.permissionName}</Descriptions.Item>
            <Descriptions.Item label="权限代码">{viewingPermission.permissionCode}</Descriptions.Item>
            <Descriptions.Item label="权限类型">{getPermissionTypeTag(viewingPermission.permissionType)}</Descriptions.Item>
            <Descriptions.Item label="父级权限">{getParentName(viewingPermission.parentId)}</Descriptions.Item>
            <Descriptions.Item label="状态">{getStatusTag(viewingPermission.status)}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{viewingPermission.createTime}</Descriptions.Item>
            <Descriptions.Item label="权限描述" span={2}>{viewingPermission.description}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default PermissionManagement
