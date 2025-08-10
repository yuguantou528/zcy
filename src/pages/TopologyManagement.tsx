import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Card, Row, Col, Space, Button, Tag, List, Avatar, Badge, Input, Select, Tooltip, message, Radio, Checkbox, Tree } from 'antd'
import type { DataNode } from 'antd/es/tree'
import {
  NodeIndexOutlined, ReloadOutlined, ExportOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined, WifiOutlined,
  DeploymentUnitOutlined, SearchOutlined, AimOutlined, FullscreenOutlined,
  FullscreenExitOutlined, ZoomInOutlined, ZoomOutOutlined, CompressOutlined,
  CameraOutlined, MonitorOutlined, UserOutlined, TeamOutlined, BankOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined
} from '@ant-design/icons'

// Types
type NodeType = 'gateway' | 'relay' | 'terminal'
type NodeStatus = 'online' | 'offline' | 'warning'
type CustomerType = 'enterprise' | 'government' | 'education' | 'healthcare'

interface MeshNode {
  id: string; name: string; type: NodeType; status: NodeStatus;
  mac: string; ip: string; links: string[]; x: number; y: number; rssi: number;
  frequency: number; // 工作频率，单位MHz
  customerId: string; // 关联到客户
}

interface MeshLink {
  id: string; source: string; target: string;
  bandwidth: number; latency: number; distance: number; rssi: number;
  customerId: string; // 关联到客户
}

interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  contact: string;
  email: string;
  deviceCount: number;
  status: 'active' | 'inactive';
  createTime: string;
}

interface TopologyMap {
  id: string;
  name: string;
  customerId: string;
  nodes: MeshNode[];
  links: MeshLink[];
  layoutPreference: 'force' | 'hierarchy';
  labelMode: 'latency' | 'distance' | 'rssi' | 'bandwidth' | 'none';
  description?: string;
  createTime: string;
}

// Sample customer data - 简化为一级结构
const initialCustomers: Customer[] = [
  { id: 'c1', name: '华为技术有限公司', type: 'enterprise', contact: '张经理', email: 'zhang@huawei.com', deviceCount: 18, status: 'active', createTime: '2024-01-15' },
  { id: 'c2', name: '北京大学', type: 'education', contact: '陈教授', email: 'chen@pku.edu.cn', deviceCount: 18, status: 'active', createTime: '2024-01-20' }
]

// Sample topology maps for different customers
const topologyMaps: TopologyMap[] = [
  // 华为技术有限公司的拓扑图
  {
    id: 'topo-c1-1',
    name: '总部网络拓扑',
    customerId: 'c1',
    description: '华为总部办公楼网络拓扑图',
    createTime: '2024-01-15',
    layoutPreference: 'hierarchy',
    labelMode: 'latency',
    nodes: [
      { id: 'c1-t1-n1', name: '总部-网关A', type: 'gateway', status: 'online', mac: 'AA:BB:CC:DD:EE:01', ip: '192.168.1.1', links: ['c1-t1-n2','c1-t1-n3'], x: 300, y: 200, rssi: -45, frequency: 2400, customerId: 'c1' },
      { id: 'c1-t1-n2', name: '总部-中继1', type: 'relay', status: 'online', mac: 'AA:BB:CC:DD:EE:02', ip: '192.168.1.2', links: ['c1-t1-n1','c1-t1-n4'], x: 520, y: 240, rssi: -60, frequency: 2450, customerId: 'c1' },
      { id: 'c1-t1-n3', name: '总部-中继2', type: 'relay', status: 'warning', mac: 'AA:BB:CC:DD:EE:03', ip: '192.168.1.3', links: ['c1-t1-n1','c1-t1-n5'], x: 280, y: 380, rssi: -72, frequency: 2450, customerId: 'c1' },
      { id: 'c1-t1-n4', name: '总部-终端1', type: 'terminal', status: 'online', mac: 'AA:BB:CC:DD:EE:11', ip: '192.168.1.11', links: ['c1-t1-n2'], x: 720, y: 180, rssi: -55, frequency: 2480, customerId: 'c1' },
      { id: 'c1-t1-n5', name: '总部-终端2', type: 'terminal', status: 'online', mac: 'AA:BB:CC:DD:EE:12', ip: '192.168.1.12', links: ['c1-t1-n3'], x: 220, y: 520, rssi: -68, frequency: 2480, customerId: 'c1' },
    ],
    links: [
      { id: 'c1-t1-l1', source: 'c1-t1-n1', target: 'c1-t1-n2', bandwidth: 48, latency: 8, distance: 35, rssi: -58, customerId: 'c1' },
      { id: 'c1-t1-l2', source: 'c1-t1-n1', target: 'c1-t1-n3', bandwidth: 22, latency: 15, distance: 48, rssi: -68, customerId: 'c1' },
      { id: 'c1-t1-l3', source: 'c1-t1-n2', target: 'c1-t1-n4', bandwidth: 36, latency: 10, distance: 28, rssi: -54, customerId: 'c1' },
      { id: 'c1-t1-l4', source: 'c1-t1-n3', target: 'c1-t1-n5', bandwidth: 18, latency: 22, distance: 56, rssi: -73, customerId: 'c1' },
    ]
  },
  {
    id: 'topo-c1-2',
    name: '研发中心网络',
    customerId: 'c1',
    description: '华为研发中心实验室网络',
    createTime: '2024-02-01',
    layoutPreference: 'force',
    labelMode: 'bandwidth',
    nodes: [
      { id: 'c1-t2-n1', name: '研发-主网关', type: 'gateway', status: 'online', mac: 'AA:BB:CC:DD:EE:21', ip: '192.168.2.1', links: ['c1-t2-n2','c1-t2-n3'], x: 400, y: 250, rssi: -42, frequency: 5800, customerId: 'c1' },
      { id: 'c1-t2-n2', name: '研发-实验室中继', type: 'relay', status: 'online', mac: 'AA:BB:CC:DD:EE:22', ip: '192.168.2.2', links: ['c1-t2-n1','c1-t2-n4','c1-t2-n5'], x: 200, y: 150, rssi: -58, frequency: 5850, customerId: 'c1' },
      { id: 'c1-t2-n3', name: '研发-测试中继', type: 'relay', status: 'online', mac: 'AA:BB:CC:DD:EE:23', ip: '192.168.2.3', links: ['c1-t2-n1','c1-t2-n6'], x: 600, y: 150, rssi: -55, frequency: 5850, customerId: 'c1' },
      { id: 'c1-t2-n4', name: '研发-设备1', type: 'terminal', status: 'online', mac: 'AA:BB:CC:DD:EE:31', ip: '192.168.2.11', links: ['c1-t2-n2'], x: 100, y: 50, rssi: -65, frequency: 5900, customerId: 'c1' },
      { id: 'c1-t2-n5', name: '研发-设备2', type: 'terminal', status: 'online', mac: 'AA:BB:CC:DD:EE:32', ip: '192.168.2.12', links: ['c1-t2-n2'], x: 150, y: 300, rssi: -62, frequency: 5900, customerId: 'c1' },
      { id: 'c1-t2-n6', name: '研发-测试设备', type: 'terminal', status: 'warning', mac: 'AA:BB:CC:DD:EE:33', ip: '192.168.2.13', links: ['c1-t2-n3'], x: 700, y: 50, rssi: -78, frequency: 5800, customerId: 'c1' },
    ],
    links: [
      { id: 'c1-t2-l1', source: 'c1-t2-n1', target: 'c1-t2-n2', bandwidth: 52, latency: 6, distance: 28, rssi: -52, customerId: 'c1' },
      { id: 'c1-t2-l2', source: 'c1-t2-n1', target: 'c1-t2-n3', bandwidth: 48, latency: 7, distance: 32, rssi: -54, customerId: 'c1' },
      { id: 'c1-t2-l3', source: 'c1-t2-n2', target: 'c1-t2-n4', bandwidth: 30, latency: 12, distance: 45, rssi: -62, customerId: 'c1' },
      { id: 'c1-t2-l4', source: 'c1-t2-n2', target: 'c1-t2-n5', bandwidth: 28, latency: 14, distance: 38, rssi: -60, customerId: 'c1' },
      { id: 'c1-t2-l5', source: 'c1-t2-n3', target: 'c1-t2-n6', bandwidth: 15, latency: 25, distance: 55, rssi: -75, customerId: 'c1' },
    ]
  },
  {
    id: 'topo-c1-3',
    name: '生产基地网络',
    customerId: 'c1',
    description: '华为生产基地车间网络',
    createTime: '2024-02-15',
    layoutPreference: 'hierarchy',
    labelMode: 'rssi',
    nodes: [
      { id: 'c1-t3-n1', name: '生产-核心网关', type: 'gateway', status: 'online', mac: 'AA:BB:CC:DD:EE:41', ip: '192.168.3.1', links: ['c1-t3-n2','c1-t3-n3','c1-t3-n4'], x: 400, y: 200, rssi: -38, frequency: 2400, customerId: 'c1' },
      { id: 'c1-t3-n2', name: '生产-车间1中继', type: 'relay', status: 'online', mac: 'AA:BB:CC:DD:EE:42', ip: '192.168.3.2', links: ['c1-t3-n1','c1-t3-n5','c1-t3-n6'], x: 200, y: 100, rssi: -52, frequency: 2420, customerId: 'c1' },
      { id: 'c1-t3-n3', name: '生产-车间2中继', type: 'relay', status: 'online', mac: 'AA:BB:CC:DD:EE:43', ip: '192.168.3.3', links: ['c1-t3-n1','c1-t3-n7','c1-t3-n8'], x: 600, y: 100, rssi: -50, frequency: 2440, customerId: 'c1' },
      { id: 'c1-t3-n4', name: '生产-质检中继', type: 'relay', status: 'warning', mac: 'AA:BB:CC:DD:EE:44', ip: '192.168.3.4', links: ['c1-t3-n1','c1-t3-n9'], x: 400, y: 400, rssi: -68, frequency: 2460, customerId: 'c1' },
      { id: 'c1-t3-n5', name: '生产-设备A', type: 'terminal', status: 'online', mac: 'AA:BB:CC:DD:EE:51', ip: '192.168.3.11', links: ['c1-t3-n2'], x: 100, y: 50, rssi: -58, frequency: 2420, customerId: 'c1' },
      { id: 'c1-t3-n6', name: '生产-设备B', type: 'terminal', status: 'online', mac: 'AA:BB:CC:DD:EE:52', ip: '192.168.3.12', links: ['c1-t3-n2'], x: 250, y: 50, rssi: -60, frequency: 2420, customerId: 'c1' },
      { id: 'c1-t3-n7', name: '生产-设备C', type: 'terminal', status: 'online', mac: 'AA:BB:CC:DD:EE:53', ip: '192.168.3.13', links: ['c1-t3-n3'], x: 550, y: 50, rssi: -56, frequency: 2440, customerId: 'c1' },
      { id: 'c1-t3-n8', name: '生产-设备D', type: 'terminal', status: 'offline', mac: 'AA:BB:CC:DD:EE:54', ip: '192.168.3.14', links: ['c1-t3-n3'], x: 700, y: 50, rssi: -88, frequency: 2440, customerId: 'c1' },
      { id: 'c1-t3-n9', name: '生产-质检设备', type: 'terminal', status: 'warning', mac: 'AA:BB:CC:DD:EE:55', ip: '192.168.3.15', links: ['c1-t3-n4'], x: 400, y: 500, rssi: -75, frequency: 2460, customerId: 'c1' },
    ],
    links: [
      { id: 'c1-t3-l1', source: 'c1-t3-n1', target: 'c1-t3-n2', bandwidth: 60, latency: 4, distance: 22, rssi: -48, customerId: 'c1' },
      { id: 'c1-t3-l2', source: 'c1-t3-n1', target: 'c1-t3-n3', bandwidth: 58, latency: 5, distance: 24, rssi: -46, customerId: 'c1' },
      { id: 'c1-t3-l3', source: 'c1-t3-n1', target: 'c1-t3-n4', bandwidth: 35, latency: 18, distance: 42, rssi: -65, customerId: 'c1' },
      { id: 'c1-t3-l4', source: 'c1-t3-n2', target: 'c1-t3-n5', bandwidth: 42, latency: 8, distance: 28, rssi: -55, customerId: 'c1' },
      { id: 'c1-t3-l5', source: 'c1-t3-n2', target: 'c1-t3-n6', bandwidth: 40, latency: 9, distance: 30, rssi: -57, customerId: 'c1' },
      { id: 'c1-t3-l6', source: 'c1-t3-n3', target: 'c1-t3-n7', bandwidth: 38, latency: 10, distance: 32, rssi: -53, customerId: 'c1' },
      { id: 'c1-t3-l7', source: 'c1-t3-n3', target: 'c1-t3-n8', bandwidth: 0, latency: 0, distance: 35, rssi: -85, customerId: 'c1' },
      { id: 'c1-t3-l8', source: 'c1-t3-n4', target: 'c1-t3-n9', bandwidth: 20, latency: 28, distance: 48, rssi: -72, customerId: 'c1' },
    ]
  },
  // 北京大学的拓扑图
  {
    id: 'topo-c2-1',
    name: '校园主干网络',
    customerId: 'c2',
    description: '北京大学校园主干网络拓扑',
    createTime: '2024-01-20',
    layoutPreference: 'force',
    labelMode: 'bandwidth',
    nodes: [
      { id: 'c2-t1-n1', name: '北大-主网关', type: 'gateway', status: 'online', mac: 'BB:CC:DD:EE:FF:01', ip: '10.0.0.1', links: ['c2-t1-n2','c2-t1-n3','c2-t1-n4'], x: 400, y: 300, rssi: -40, frequency: 5200, customerId: 'c2' },
      { id: 'c2-t1-n2', name: '北大-教学楼中继', type: 'relay', status: 'online', mac: 'BB:CC:DD:EE:FF:02', ip: '10.0.0.2', links: ['c2-t1-n1','c2-t1-n5'], x: 200, y: 200, rssi: -55, frequency: 5220, customerId: 'c2' },
      { id: 'c2-t1-n3', name: '北大-宿舍中继', type: 'relay', status: 'online', mac: 'BB:CC:DD:EE:FF:03', ip: '10.0.0.3', links: ['c2-t1-n1','c2-t1-n6'], x: 600, y: 200, rssi: -58, frequency: 5240, customerId: 'c2' },
      { id: 'c2-t1-n4', name: '北大-图书馆中继', type: 'relay', status: 'warning', mac: 'BB:CC:DD:EE:FF:04', ip: '10.0.0.4', links: ['c2-t1-n1','c2-t1-n7'], x: 400, y: 500, rssi: -65, frequency: 5260, customerId: 'c2' },
      { id: 'c2-t1-n5', name: '北大-实验室终端', type: 'terminal', status: 'online', mac: 'BB:CC:DD:EE:FF:11', ip: '10.0.0.11', links: ['c2-t1-n2'], x: 100, y: 100, rssi: -70, frequency: 5220, customerId: 'c2' },
      { id: 'c2-t1-n6', name: '北大-宿舍终端', type: 'terminal', status: 'online', mac: 'BB:CC:DD:EE:FF:12', ip: '10.0.0.12', links: ['c2-t1-n3'], x: 700, y: 100, rssi: -72, frequency: 5240, customerId: 'c2' },
      { id: 'c2-t1-n7', name: '北大-阅览室终端', type: 'terminal', status: 'offline', mac: 'BB:CC:DD:EE:FF:13', ip: '10.0.0.13', links: ['c2-t1-n4'], x: 400, y: 600, rssi: -85, frequency: 5260, customerId: 'c2' },
    ],
    links: [
      { id: 'c2-t1-l1', source: 'c2-t1-n1', target: 'c2-t1-n2', bandwidth: 54, latency: 5, distance: 25, rssi: -50, customerId: 'c2' },
      { id: 'c2-t1-l2', source: 'c2-t1-n1', target: 'c2-t1-n3', bandwidth: 48, latency: 6, distance: 30, rssi: -52, customerId: 'c2' },
      { id: 'c2-t1-l3', source: 'c2-t1-n1', target: 'c2-t1-n4', bandwidth: 36, latency: 12, distance: 40, rssi: -60, customerId: 'c2' },
      { id: 'c2-t1-l4', source: 'c2-t1-n2', target: 'c2-t1-n5', bandwidth: 24, latency: 18, distance: 50, rssi: -65, customerId: 'c2' },
      { id: 'c2-t1-l5', source: 'c2-t1-n3', target: 'c2-t1-n6', bandwidth: 30, latency: 15, distance: 45, rssi: -62, customerId: 'c2' },
      { id: 'c2-t1-l6', source: 'c2-t1-n4', target: 'c2-t1-n7', bandwidth: 0, latency: 0, distance: 35, rssi: -80, customerId: 'c2' },
    ]
  },
  {
    id: 'topo-c2-2',
    name: '计算机学院网络',
    customerId: 'c2',
    description: '北大计算机学院实验室网络',
    createTime: '2024-03-01',
    layoutPreference: 'hierarchy',
    labelMode: 'latency',
    nodes: [
      { id: 'c2-t2-n1', name: '计院-核心交换机', type: 'gateway', status: 'online', mac: 'BB:CC:DD:EE:FF:21', ip: '10.1.0.1', links: ['c2-t2-n2','c2-t2-n3'], x: 350, y: 200, rssi: -35, frequency: 6000, customerId: 'c2-1' },
      { id: 'c2-t2-n2', name: '计院-实验室1中继', type: 'relay', status: 'online', mac: 'BB:CC:DD:EE:FF:22', ip: '10.1.0.2', links: ['c2-t2-n1','c2-t2-n4','c2-t2-n5'], x: 200, y: 350, rssi: -48, frequency: 6020, customerId: 'c2-1' },
      { id: 'c2-t2-n3', name: '计院-实验室2中继', type: 'relay', status: 'online', mac: 'BB:CC:DD:EE:FF:23', ip: '10.1.0.3', links: ['c2-t2-n1','c2-t2-n6'], x: 500, y: 350, rssi: -52, frequency: 6040, customerId: 'c2-1' },
      { id: 'c2-t2-n4', name: '计院-服务器1', type: 'terminal', status: 'online', mac: 'BB:CC:DD:EE:FF:31', ip: '10.1.0.11', links: ['c2-t2-n2'], x: 100, y: 450, rssi: -58, frequency: 6020, customerId: 'c2-1' },
      { id: 'c2-t2-n5', name: '计院-服务器2', type: 'terminal', status: 'online', mac: 'BB:CC:DD:EE:FF:32', ip: '10.1.0.12', links: ['c2-t2-n2'], x: 250, y: 500, rssi: -62, frequency: 6020, customerId: 'c2-1' },
      { id: 'c2-t2-n6', name: '计院-工作站', type: 'terminal', status: 'warning', mac: 'BB:CC:DD:EE:FF:33', ip: '10.1.0.13', links: ['c2-t2-n3'], x: 600, y: 450, rssi: -75, frequency: 6040, customerId: 'c2-1' },
    ],
    links: [
      { id: 'c2-t2-l1', source: 'c2-t2-n1', target: 'c2-t2-n2', bandwidth: 48, latency: 3, distance: 18, rssi: -42, customerId: 'c2-1' },
      { id: 'c2-t2-l2', source: 'c2-t2-n1', target: 'c2-t2-n3', bandwidth: 45, latency: 4, distance: 20, rssi: -45, customerId: 'c2-1' },
      { id: 'c2-t2-l3', source: 'c2-t2-n2', target: 'c2-t2-n4', bandwidth: 32, latency: 8, distance: 25, rssi: -55, customerId: 'c2-1' },
      { id: 'c2-t2-l4', source: 'c2-t2-n2', target: 'c2-t2-n5', bandwidth: 28, latency: 12, distance: 32, rssi: -58, customerId: 'c2-1' },
      { id: 'c2-t2-l5', source: 'c2-t2-n3', target: 'c2-t2-n6', bandwidth: 18, latency: 22, distance: 45, rssi: -72, customerId: 'c2-1' },
    ]
  }
]

// Helpers
const statusConf = (s: NodeStatus) => s==='online'
  ? { color:'#52c41a', text:'在线', badge:'success' as const, icon:<CheckCircleOutlined/> }
  : s==='offline'
  ? { color:'#ff4d4f', text:'离线', badge:'error' as const, icon:<CloseCircleOutlined/> }
  : { color:'#faad14', text:'异常', badge:'warning' as const, icon:<ExclamationCircleOutlined/> }

const formatFrequency = (freq: number) => {
  if (freq >= 6000) {
    return `${(freq/1000).toFixed(1)} GHz`
  } else if (freq >= 1000) {
    return `${(freq/1000).toFixed(1)} GHz`
  } else {
    return `${freq} MHz`
  }
}

const typeConf = (t: NodeType) => t==='gateway'
  ? { color:'#1890ff', text:'网关' }
  : t==='relay'
  ? { color:'#722ed1', text:'中继' }
  : { color:'#13c2c2', text:'终端' }

const customerTypeConf = (t: CustomerType) => t==='enterprise'
  ? { color:'#1890ff', text:'企业' }
  : t==='government'
  ? { color:'#722ed1', text:'政府' }
  : t==='education'
  ? { color:'#52c41a', text:'教育' }
  : { color:'#fa8c16', text:'医疗' }

const cardStyle = {
  background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
  borderRadius: 12,
  boxShadow: '0 4px 12px rgba(0,21,41,.08), 0 2px 4px rgba(0,21,41,.04)',
  border: '1px solid rgba(240,240,240,0.8)',
  marginBottom: 20,
  transition: 'all 0.3s ease'
}

const TopologyManagement: React.FC = () => {
  // 客户管理相关状态
  const [customers] = useState<Customer[]>(initialCustomers)
  const [allTopologyMaps] = useState<TopologyMap[]>(topologyMaps)
  const [selectedTopologyId, setSelectedTopologyId] = useState<string>('topo-c1-1') // 默认选择第一个拓扑图
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(['c1', 'c2']) // 默认展开的客户节点

  // 当前选中的拓扑图数据
  const currentTopology = useMemo(() =>
    allTopologyMaps.find(topo => topo.id === selectedTopologyId) || allTopologyMaps[0],
    [selectedTopologyId]
  )

  // 当前客户信息
  const currentCustomer = useMemo(() =>
    customers.find(c => c.id === currentTopology.customerId),
    [customers, currentTopology.customerId]
  )

  const [nodes, setNodes] = useState<MeshNode[]>(currentTopology.nodes)
  const [links, setLinks] = useState<MeshLink[]>(currentTopology.links)
  const [selected, setSelected] = useState<MeshNode | null>(null)
  const [now, setNow] = useState<Date>(new Date())
  const [keyword, setKeyword] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<'all'|NodeStatus>('all')
  const [typeFilter, setTypeFilter] = useState<'all'|NodeType>('all')
  const [scale, setScale] = useState<number>(1)
  const [panning, setPanning] = useState<boolean>(false)
  const [layout, setLayout] = useState<'force'|'hierarchy'>(currentTopology.layoutPreference)
  const [labelMode, setLabelMode] = useState<'latency'|'distance'|'rssi'|'bandwidth'|'none'>(currentTopology.labelMode)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [showSidebar, setShowSidebar] = useState<boolean>(true) // 控制侧边栏显示
  const [showNodeDetails, setShowNodeDetails] = useState<boolean>(false) // 控制节点详情弹窗显示

  const [nodeVisibility, setNodeVisibility] = useState<Record<string, boolean>>(() => {
    // 初始化当前客户的所有节点为可见状态
    const initialVisibility: Record<string, boolean> = {}
    currentTopology.nodes.forEach(node => {
      initialVisibility[node.id] = true
    })
    return initialVisibility
  })

  const svgRef = useRef<SVGSVGElement>(null)
  const viewRef = useRef<HTMLDivElement>(null)
  const fullscreenRef = useRef<HTMLDivElement>(null) // 用于全屏的容器ref
  const dragRef = useRef<{id:string, offsetX:number, offsetY:number}|null>(null)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t)
  }, [])

  // 拓扑图切换时同步数据
  useEffect(() => {
    const topology = allTopologyMaps.find(topo => topo.id === selectedTopologyId)
    if (topology) {
      setNodes(topology.nodes)
      setLinks(topology.links)
      setLayout(topology.layoutPreference)
      setLabelMode(topology.labelMode)

      // 重置节点可见性
      const newVisibility: Record<string, boolean> = {}
      topology.nodes.forEach(node => {
        newVisibility[node.id] = true
      })
      setNodeVisibility(newVisibility)
    }
  }, [selectedTopologyId])

  const stats = useMemo(() => {
    const total = nodes.length
    const online = nodes.filter(n => n.status === 'online').length
    const offline = nodes.filter(n => n.status === 'offline').length
    const warning = nodes.filter(n => n.status === 'warning').length
    const avgLatency = Math.round(links.filter(l => l.latency > 0).reduce((s, l) => s + l.latency, 0) / Math.max(1, links.filter(l => l.latency > 0).length))
    const coverage = Math.round((online / Math.max(1, total)) * 100)

    // 频率统计
    const frequencies = nodes.map(n => n.frequency)
    const avgFrequency = frequencies.length > 0 ? Math.round(frequencies.reduce((s, f) => s + f, 0) / frequencies.length) : 0

    return { total, online, offline, warning, coverage, avgLatency, avgFrequency }
  }, [nodes, links])

  // Enhanced hierarchical layout
  const hierarchicalLayout = () => {
    const gateways = nodes.filter(n => n.type === 'gateway')
    const relays = nodes.filter(n => n.type === 'relay')
    const terminals = nodes.filter(n => n.type === 'terminal')

    const canvasWidth = 1600
    const canvasHeight = 1000
    const layerHeight = canvasHeight / 4

    const calculatePositions = (arr: MeshNode[], layerY: number) => {
      if (arr.length === 0) return [] as MeshNode[]
      const spacing = Math.min(220, canvasWidth / (arr.length + 1))
      const startX = (canvasWidth - (arr.length - 1) * spacing) / 2
      return arr.map((n, i) => ({ ...n, x: startX + i * spacing, y: layerY }))
    }

    const positioned: MeshNode[] = [
      ...calculatePositions(gateways, layerHeight),
      ...calculatePositions(relays, layerHeight * 2),
      ...calculatePositions(terminals, layerHeight * 3),
    ]

    setNodes(prev => prev.map(n => positioned.find(p => p.id === n.id) || n))
  }

  // Enhanced force-directed layout (single pass with iterations)
  const forceDirectedLayout = (iterations = 40) => {
    const repulsion = 1000 // node-node repulsive force
    const attraction = 0.02 // edge attractive force
    const maxMove = 6

    let current = nodes.map(n => ({ ...n }))

    for (let iter = 0; iter < iterations; iter++) {
      const forces = new Map<string, { fx: number; fy: number }>()
      current.forEach(n => forces.set(n.id, { fx: 0, fy: 0 }))

      // Repulsive forces between all pairs
      for (let i = 0; i < current.length; i++) {
        for (let j = i + 1; j < current.length; j++) {
          const a = current[i], b = current[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.max(1, Math.hypot(dx, dy))
          const force = repulsion / (dist * dist)
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force
          const fa = forces.get(a.id)!; fa.fx += fx; fa.fy += fy
          const fb = forces.get(b.id)!; fb.fx -= fx; fb.fy -= fy
        }
      }

      // Attractive forces along edges
      links.forEach(l => {
        const a = current.find(n => n.id === l.source)
        const b = current.find(n => n.id === l.target)
        if (!a || !b) return
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.max(1, Math.hypot(dx, dy))
        const force = attraction * dist
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        const fa = forces.get(a.id)!; fa.fx += fx; fa.fy += fy
        const fb = forces.get(b.id)!; fb.fx -= fx; fb.fy -= fy
      })

      // Apply step with limits and bounds
      current = current.map(n => {
        const { fx, fy } = forces.get(n.id)!
        const clampedFx = Math.max(-maxMove, Math.min(maxMove, fx))
        const clampedFy = Math.max(-maxMove, Math.min(maxMove, fy))
        return {
          ...n,
          x: Math.max(40, Math.min(1760, n.x + clampedFx)),
          y: Math.max(40, Math.min(1160, n.y + clampedFy)),
        }
      })
    }

    setNodes(prev => prev.map(n => current.find(c => c.id === n.id) || n))
  }

  const autoLayout = () => {
    console.log('Auto Layout called, current layout:', layout)
    if (layout === 'hierarchy') {
      hierarchicalLayout()
      message.success('🏗️ 已应用层次布局')
    } else {
      forceDirectedLayout()
      message.success('🔄 已应用力导向布局')
    }
  }

  // 切换节点可见性
  const toggleNodeVisibility = (nodeId: string, visible: boolean) => {
    setNodeVisibility(prev => ({
      ...prev,
      [nodeId]: visible
    }))
  }

  // 拓扑图切换处理
  const handleTopologySelect = (topologyId: string) => {
    const topology = allTopologyMaps.find(topo => topo.id === topologyId)
    if (!topology) return

    setSelectedTopologyId(topologyId)
    setNodes(topology.nodes)
    setLinks(topology.links)
    setLayout(topology.layoutPreference)
    setLabelMode(topology.labelMode)
    setSelected(null) // 清除选中的节点

    // 重置节点可见性
    const newVisibility: Record<string, boolean> = {}
    topology.nodes.forEach(node => {
      newVisibility[node.id] = true
    })
    setNodeVisibility(newVisibility)

    const customer = customers.find(c => c.id === topology.customerId)
    message.success(`已切换到拓扑图：${customer?.name} - ${topology.name}`)
  }

  // 构建客户树形数据 - 简化为一级结构
  const buildCustomerTree = (): DataNode[] => {
    const buildNode = (customer: Customer): DataNode => {
      const customerTopologies = allTopologyMaps.filter(topo => topo.customerId === customer.id)

      const getIcon = () => {
        switch (customer.type) {
          case 'enterprise': return <BankOutlined />
          case 'government': return <BankOutlined />
          case 'education': return <TeamOutlined />
          case 'healthcare': return <UserOutlined />
          default: return <UserOutlined />
        }
      }

      // 构建拓扑图子节点
      const topologyNodes: DataNode[] = customerTopologies.map(topo => ({
        title: (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            lineHeight: '1.5'
          }}>
            <Space align="center">
              <span style={{
                fontWeight: selectedTopologyId === topo.id ? 600 : 400,
                color: selectedTopologyId === topo.id ? '#1890ff' : '#262626',
                lineHeight: '1.5'
              }}>
                {topo.name}
              </span>
              <Tag color="cyan" style={{ fontSize: 10, lineHeight: '1.2' }}>
                {topo.nodes.length} 节点
              </Tag>
            </Space>
          </div>
        ),
        key: topo.id,
        icon: <MonitorOutlined style={{ color: '#52c41a' }} />,
        isLeaf: true,
      }))

      return {
        title: (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            lineHeight: '1.5'
          }}>
            <Space align="center">
              <span style={{
                fontWeight: 600,
                lineHeight: '1.5'
              }}>{customer.name}</span>
              <Tag color={customer.status === 'active' ? 'green' : 'red'} style={{ lineHeight: '1.2' }}>
                {customer.status === 'active' ? '活跃' : '停用'}
              </Tag>
            </Space>
            <Tag color="blue" style={{ lineHeight: '1.2' }}>{customer.deviceCount} 设备</Tag>
          </div>
        ),
        key: customer.id,
        icon: getIcon(),
        children: topologyNodes.length > 0 ? topologyNodes : undefined,
        isLeaf: topologyNodes.length === 0,
        selectable: false, // 客户节点不可选择，只能选择拓扑图
      }
    }

    return customers.map(buildNode)
  }

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setScale(s => Math.max(0.4, Math.min(2.5, s - e.deltaY * 0.0015)))
  }

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-node]')) return
    setPanning(true)
  }

  const onMouseUp = () => setPanning(false)

  const onMouseMove = (e: React.MouseEvent) => {
    if (!panning || !viewRef.current) return
    const el = viewRef.current
    el.scrollLeft -= e.movementX
    el.scrollTop -= e.movementY
  }

  const onNodeMouseDown = (node: MeshNode, e: React.MouseEvent) => {
    e.stopPropagation() // 阻止事件冒泡
    e.preventDefault()  // 阻止默认行为

    // 获取SVG容器的边界矩形，用于坐标转换
    const svgElement = svgRef.current
    if (!svgElement) return

    const rect = svgElement.getBoundingClientRect()
    // 考虑缩放比例的坐标计算
    const svgX = (e.clientX - rect.left) / scale
    const svgY = (e.clientY - rect.top) / scale

    dragRef.current = {
      id: node.id,
      offsetX: svgX - node.x,
      offsetY: svgY - node.y
    }
  }



  const goFullscreen = () => {
    if (fullscreenRef.current?.requestFullscreen) {
      fullscreenRef.current.requestFullscreen()
      setIsFullscreen(true)
    }
  }

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const zoomIn = () => {
    setScale(s => {
      const newScale = Math.min(3, s * 1.2)
      console.log('Zoom In:', s, '->', newScale)
      return newScale
    })
  }

  const zoomOut = () => {
    setScale(s => {
      const newScale = Math.max(0.3, s / 1.2)
      console.log('Zoom Out:', s, '->', newScale)
      return newScale
    })
  }

  const resetView = () => {
    console.log('Reset View called')
    setScale(1)
    if (viewRef.current) {
      viewRef.current.scrollLeft = 0
      viewRef.current.scrollTop = 0
      console.log('View reset: scale=1, scroll=(0,0)')
    }

    // 重置节点位置到初始状态
    const topology = allTopologyMaps.find(topo => topo.id === selectedTopologyId)
    if (topology) {
      setNodes(topology.nodes.map(n => ({ ...n }))) // 深拷贝初始位置
      console.log('Nodes reset to initial positions')
      message.success('🔄 视图已重置到初始状态')
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // 监听窗口大小变化，在全屏模式下更新SVG尺寸
  useEffect(() => {
    const handleResize = () => {
      if (isFullscreen && svgRef.current) {
        const newWidth = showSidebar ? window.innerWidth - 350 : window.innerWidth
        const newHeight = window.innerHeight
        svgRef.current.setAttribute('width', newWidth.toString())
        svgRef.current.setAttribute('height', newHeight.toString())
      }
    }

    if (isFullscreen) {
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [isFullscreen, showSidebar])

  // 添加全局鼠标事件监听器，确保拖拽能够正确结束
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      dragRef.current = null
    }

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!dragRef.current || !svgRef.current) return

      const rect = svgRef.current.getBoundingClientRect()
      const svgX = (e.clientX - rect.left) / scale
      const svgY = (e.clientY - rect.top) / scale

      const { id, offsetX, offsetY } = dragRef.current
      const x = svgX - offsetX
      const y = svgY - offsetY

      const boundedX = Math.max(50, Math.min(1750, x))
      const boundedY = Math.max(50, Math.min(1150, y))

      setNodes(prev => prev.map(n => n.id === id ? { ...n, x: boundedX, y: boundedY } : n))
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('mousemove', handleGlobalMouseMove)

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('mousemove', handleGlobalMouseMove)
    }
  }, [scale]) // 依赖scale，当缩放改变时重新绑定事件

  const filteredNodes = useMemo(() => nodes.filter(n =>
    (statusFilter === 'all' || n.status === statusFilter) &&
    (typeFilter === 'all' || n.type === typeFilter) &&
    (!keyword || n.name.includes(keyword) || n.ip.includes(keyword) || n.mac.includes(keyword))
  ), [nodes, statusFilter, typeFilter, keyword])

  // 获取在拓扑图中显示的节点（同时满足筛选条件和可见性条件）
  const visibleNodes = useMemo(() => nodes.filter(n =>
    nodeVisibility[n.id] === true
  ), [nodes, nodeVisibility])

  // 获取在拓扑图中显示的连线（只显示两端节点都可见的连线）
  const visibleLinks = useMemo(() => links.filter(l =>
    nodeVisibility[l.source] === true && nodeVisibility[l.target] === true
  ), [links, nodeVisibility])



  return (
    <div style={{ background: 'transparent' }}>
      {/* 顶部标题与操作 */}
      <Card style={{...cardStyle, marginBottom: 24}} bodyStyle={{ padding: '20px 24px' }}>
        <Space size={16}>
          <div style={{
            background: 'linear-gradient(135deg, #1890ff, #36cfc9)',
            borderRadius: 12,
            padding: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(24,144,255,0.3)'
          }}>
            <NodeIndexOutlined style={{ fontSize: 24, color: '#fff' }} />
          </div>
          <div>
            <h2 style={{
              margin: 0,
              color: '#1a1a1a',
              fontSize: 24,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #1890ff, #722ed1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>MESH 自组网拓扑图</h2>
            <div style={{
              color: '#8c8c8c',
              fontSize: 13,
              marginTop: 4,
              fontWeight: 500
            }}>实时监控 · {now.toLocaleString('zh-CN')}</div>
          </div>
        </Space>
      </Card>



      <Row gutter={[16,16]}>
        {/* 最左侧：客户管理面板 */}
        <Col xs={24} xl={5}>
          <Card
            style={{
              ...cardStyle,
              background: 'linear-gradient(135deg, #fff9e6 0%, #fff2cc 100%)',
              border: '1px solid rgba(250,140,22,0.2)',
              height: 'calc(100vh - 200px)', // 动态高度，减去顶部标题和间距
              display: 'flex',
              flexDirection: 'column'
            }}
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{
                  background: 'linear-gradient(135deg, #fa8c16, #ffa940)',
                  borderRadius: 8,
                  padding: 8,
                  marginRight: 12,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <TeamOutlined style={{ color: '#fff', fontSize: 16 }} />
                </span>
                <span style={{ color: '#fa8c16', fontWeight: 600 }}>客户管理</span>
              </div>
            }
            bodyStyle={{ padding: '16px', flex: 1, overflow: 'auto' }}
          >
            {/* 当前选中客户信息 */}
            {currentCustomer && (
              <div style={{
                marginBottom: 16,
                padding: 12,
                background: 'linear-gradient(135deg, #fff, #fafafa)',
                borderRadius: 8,
                border: '1px solid #f0f0f0'
              }}>
                <div style={{ fontWeight: 600, color: '#262626', marginBottom: 4 }}>
                  {currentCustomer.name}
                </div>
                <Space size={4} wrap>
                  <Tag color={customerTypeConf(currentCustomer.type).color}>{customerTypeConf(currentCustomer.type).text}</Tag>
                  <Tag color="green">{currentCustomer.deviceCount} 设备</Tag>
                </Space>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                  联系人：{currentCustomer.contact}
                </div>
              </div>
            )}

            {/* 客户树形列表 */}
            <Tree
              showIcon
              defaultExpandedKeys={expandedKeys}
              selectedKeys={[selectedTopologyId]}
              treeData={buildCustomerTree()}
              onSelect={(selectedKeys) => {
                if (selectedKeys.length > 0) {
                  const selectedKey = selectedKeys[0] as string
                  // 只有拓扑图节点才能被选择（以 'topo-' 开头）
                  if (selectedKey.startsWith('topo-')) {
                    handleTopologySelect(selectedKey)
                  }
                }
              }}
              onExpand={(expandedKeys) => {
                setExpandedKeys(expandedKeys)
              }}
              style={{
                background: 'transparent',
                fontSize: 13
              }}
            />
          </Card>
        </Col>

        {/* 右侧：拓扑图主视图 */}
        <Col xs={24} xl={19}>
          <div>
            <Card
              style={{
                ...cardStyle,
                display:'flex',
                flexDirection:'column',
                height: 'calc(100vh - 200px)', // 与左侧客户管理面板保持相同高度
                background: 'linear-gradient(135deg, #001529 0%, #002140 100%)',
                border: '1px solid rgba(24,144,255,0.3)'
              }}
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    background: 'linear-gradient(135deg, #1890ff, #36cfc9)',
                    borderRadius: 8,
                    padding: 8,
                    marginRight: 12,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <MonitorOutlined style={{ color: '#fff', fontSize: 16 }} />
                  </span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>
                    {currentCustomer?.name} - 拓扑图视图
                  </span>
                  <Tag
                    color="blue"
                    style={{
                      marginLeft: 12,
                      background: 'rgba(24,144,255,0.2)',
                      border: '1px solid rgba(24,144,255,0.4)',
                      color: '#40a9ff'
                    }}
                  >
                    缩放: {Math.round(scale * 100)}%
                  </Tag>
                </div>
              }
              bodyStyle={{
                display:'flex',
                flex:1,
                padding:0,
                overflow: 'hidden',
                height: 'calc(100vh - 280px)' // 减去Card标题和边距的高度
              }}
              extra={
                <Space size={8} wrap>
                  <Radio.Group
                    value={labelMode}
                    onChange={e=>setLabelMode(e.target.value)}
                    style={{ borderRadius: 6 }}
                    size="small"
                  >
                    <Radio.Button value="latency" style={{ borderRadius: '6px 0 0 6px' }}>延迟</Radio.Button>
                    <Radio.Button value="distance">距离</Radio.Button>
                    <Radio.Button value="rssi">信号</Radio.Button>
                    <Radio.Button value="bandwidth">带宽</Radio.Button>
                    <Radio.Button value="none" style={{ borderRadius: '0 6px 6px 0' }}>隐藏</Radio.Button>
                  </Radio.Group>
                  <Tooltip title={showSidebar ? "隐藏侧边栏" : "显示侧边栏"} placement="bottom">
                    <Button
                      icon={showSidebar ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                      onClick={() => setShowSidebar(!showSidebar)}
                      size="small"
                      style={{
                        borderRadius: 6,
                        background: showSidebar ? 'linear-gradient(135deg, #722ed1, #9254de)' : 'linear-gradient(135deg, #52c41a, #73d13d)',
                        borderColor: showSidebar ? '#722ed1' : '#52c41a',
                        color: '#fff',
                        boxShadow: showSidebar ? '0 2px 6px rgba(114,46,209,0.3)' : '0 2px 6px rgba(82,196,26,0.3)'
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="放大" placement="bottom">
                    <Button
                      icon={<ZoomInOutlined />}
                      onClick={zoomIn}
                      size="small"
                      style={{
                        borderRadius: 6,
                        background: 'linear-gradient(135deg, #13c2c2, #36cfc9)',
                        borderColor: '#13c2c2',
                        color: '#fff',
                        boxShadow: '0 2px 6px rgba(19,194,194,0.3)'
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="缩小" placement="bottom">
                    <Button
                      icon={<ZoomOutOutlined />}
                      onClick={zoomOut}
                      size="small"
                      style={{
                        borderRadius: 6,
                        background: 'linear-gradient(135deg, #13c2c2, #36cfc9)',
                        borderColor: '#13c2c2',
                        color: '#fff',
                        boxShadow: '0 2px 6px rgba(19,194,194,0.3)'
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="重置视图" placement="bottom">
                    <Button
                      icon={<CompressOutlined />}
                      onClick={resetView}
                      size="small"
                      style={{
                        borderRadius: 6,
                        background: 'linear-gradient(135deg, #fa8c16, #ffa940)',
                        borderColor: '#fa8c16',
                        color: '#fff',
                        boxShadow: '0 2px 6px rgba(250,140,22,0.3)'
                      }}
                    />
                  </Tooltip>

                  <Tooltip title="刷新数据" placement="bottom">
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={()=>{
                        const topology = allTopologyMaps.find(topo => topo.id === selectedTopologyId)
                        if (topology) {
                          setNodes(topology.nodes);
                          setLinks(topology.links);
                        }
                      }}
                      size="small"
                      style={{
                        borderRadius: 6,
                        background: 'linear-gradient(135deg, #1890ff, #40a9ff)',
                        borderColor: '#1890ff',
                        color: '#fff',
                        boxShadow: '0 2px 6px rgba(24,144,255,0.3)'
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="导出SVG" placement="bottom">
                    <Button
                      icon={<ExportOutlined />}
                      onClick={()=>{
                        const svg = svgRef.current
                        if (!svg) return
                        const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml;charset=utf-8' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a'); a.href=url; a.download=`${currentCustomer?.name || 'topology'}.svg`; a.click(); URL.revokeObjectURL(url)
                        message.success('已导出为SVG')
                      }}
                      size="small"
                      style={{
                        borderRadius: 6,
                        background: 'linear-gradient(135deg, #fa8c16, #ffa940)',
                        borderColor: '#fa8c16',
                        color: '#fff',
                        boxShadow: '0 2px 6px rgba(250,140,22,0.3)'
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="全屏显示" placement="bottom">
                    <Button
                      icon={<FullscreenOutlined />}
                      onClick={goFullscreen}
                      size="small"
                      style={{
                        background: 'linear-gradient(135deg, #1890ff, #40a9ff)',
                        borderColor: '#1890ff',
                        color: '#fff',
                        borderRadius: 6,
                        boxShadow: '0 2px 6px rgba(24,144,255,0.3)'
                      }}
                    />
                  </Tooltip>
                </Space>
              }
            >
              <div
                ref={fullscreenRef}
                style={{
                  display: 'flex',
                  height: isFullscreen ? '100vh' : '100%',
                  width: '100%',
                  overflow: 'hidden'
                }}
              >
                {/* 侧边栏 */}
                {showSidebar && (
                  <div style={{
                    width: 350,
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                    borderRight: '1px solid rgba(24,144,255,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.3)'
                  }}>
                    <div
                      style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'transparent'
                      }}
                      className="sidebar-panels"
                    >
                      {/* 网络概览面板 */}
                      <div
                        style={{
                          height: isFullscreen ? '400px' : '380px',
                          flexShrink: 0,
                          marginBottom: '20px'
                        }}
                        className="panel-overview"
                      >
                        {/* 面板标题 */}
                        <div style={{
                          background: 'rgba(24,144,255,0.05)',
                          borderRadius: '8px',
                          marginBottom: '4px',
                          padding: '12px 16px',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <WifiOutlined style={{ color: '#40a9ff', marginRight: 8 }} />
                          <span style={{ fontWeight: 600, color: '#ffffff' }}>网络概览</span>
                        </div>

                        {/* 面板内容 */}
                        <div style={{
                          height: isFullscreen ? '360px' : '340px',
                          overflow: 'hidden'
                        }}>
                        <div style={{ padding: '0 8px 16px' }}>
                          {/* 统计卡片 */}
                          <Row gutter={[8,8]} style={{ marginBottom: 16 }}>
                            {[
                              {t:'总节点', v:stats.total, c:'#1890ff', icon:'🔗'},
                              {t:'在线', v:stats.online, c:'#52c41a', icon:'🟢'},
                              {t:'离线', v:stats.offline, c:'#ff4d4f', icon:'🔴'},
                              {t:'异常', v:stats.warning, c:'#faad14', icon:'🟡'}
                            ].map((s,i)=>(
                              <Col span={12} key={i}>
                                <div style={{
                                  background: 'rgba(255,255,255,0.08)',
                                  padding: 12,
                                  borderRadius: 8,
                                  border: `1px solid ${s.c}40`,
                                  textAlign: 'center',
                                  backdropFilter: 'blur(10px)'
                                }}>
                                  <div style={{ fontSize: 16, marginBottom: 4 }}>{s.icon}</div>
                                  <div style={{ fontSize: 18, fontWeight: 700, color: s.c }}>{s.v}</div>
                                  <div style={{ fontSize: 12, color: '#d9d9d9' }}>{s.t}</div>
                                </div>
                              </Col>
                            ))}
                          </Row>

                          {/* 网络指标 */}
                          <Space direction="vertical" size={8} style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: '#d9d9d9', fontSize: 13 }}>覆盖率：</span>
                              <Tag color="blue" style={{ borderRadius: 4 }}>{stats.coverage}%</Tag>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: '#d9d9d9', fontSize: 13 }}>平均延迟：</span>
                              <Tag color="purple" style={{ borderRadius: 4 }}>{stats.avgLatency} ms</Tag>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: '#d9d9d9', fontSize: 13 }}>连接数：</span>
                              <Tag color="geekblue" style={{ borderRadius: 4 }}>{links.length}</Tag>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: '#d9d9d9', fontSize: 13 }}>平均频率：</span>
                              <Tag color="orange" style={{ borderRadius: 4 }}>
                                {formatFrequency(stats.avgFrequency)}
                              </Tag>
                            </div>
                          </Space>
                        </div>
                        </div>
                      </div>

                      {/* 节点列表面板 */}
                      <div
                        style={{
                          flex: 1,
                          minHeight: '200px',
                          marginTop: '8px',
                          marginBottom: '8px'
                        }}
                        className="panel-nodes"
                      >
                        {/* 面板标题 */}
                        <div style={{
                          background: 'rgba(24,144,255,0.05)',
                          borderRadius: '8px',
                          marginBottom: '4px',
                          padding: '12px 16px',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <CameraOutlined style={{ color: '#b37feb', marginRight: 8 }} />
                            <span style={{ fontWeight: 600, color: '#ffffff' }}>节点列表</span>
                          </div>
                          <Badge count={filteredNodes.length} style={{ backgroundColor: '#722ed1' }} />
                        </div>

                        {/* 面板内容 */}
                        <div style={{
                          height: 'calc(100% - 44px)',
                          overflow: 'hidden'
                        }}>
                        <div style={{
                          padding: '0 8px',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          {/* 搜索和筛选工具栏 */}
                          <div style={{ marginBottom: 12, flexShrink: 0 }}>
                            <Space direction="vertical" size={8} style={{ width: '100%' }}>
                              <Input
                                allowClear
                                prefix={<SearchOutlined style={{ color: '#722ed1' }} />}
                                placeholder="搜索名称/IP/MAC"
                                value={keyword}
                                onChange={e=>setKeyword(e.target.value)}
                                size="small"
                                style={{ borderRadius: 4 }}
                              />
                              <Row gutter={6}>
                                <Col span={12}>
                                  <Select
                                    value={statusFilter}
                                    style={{ width: '100%' }}
                                    size="small"
                                    onChange={v=>setStatusFilter(v as any)}
                                    options={[
                                      {label:'📊 全部',value:'all'},
                                      {label:'🟢 在线',value:'online'},
                                      {label:'🔴 离线',value:'offline'},
                                      {label:'🟡 异常',value:'warning'}
                                    ]}
                                  />
                                </Col>
                                <Col span={12}>
                                  <Select
                                    value={typeFilter}
                                    style={{ width: '100%' }}
                                    size="small"
                                    onChange={v=>setTypeFilter(v as any)}
                                    options={[
                                      {label:'🔗 全部',value:'all'},
                                      {label:'🌐 网关',value:'gateway'},
                                      {label:'📡 中继',value:'relay'},
                                      {label:'📱 终端',value:'terminal'}
                                    ]}
                                  />
                                </Col>
                              </Row>
                            </Space>
                          </div>

                          {/* 节点列表 */}
                          <div
                            className="custom-scrollbar"
                            style={{
                              flex: 1,
                              minHeight: 0,
                              overflow: 'auto'
                            }}
                          >
                            <List
                              dataSource={filteredNodes}
                              size="small"
                              renderItem={n=>{
                                const sc = statusConf(n.status); const tc=typeConf(n.type)
                                const isSelected = selected?.id === n.id
                                return (
                                  <List.Item
                                    style={{
                                      cursor: 'pointer',
                                      background: isSelected ? 'rgba(24,144,255,0.2)' : 'rgba(255,255,255,0.05)',
                                      borderRadius: 6,
                                      padding: '8px 4px',
                                      marginBottom: 4,
                                      border: isSelected ? '1px solid #40a9ff' : '1px solid rgba(255,255,255,0.1)',
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                      <Checkbox
                                        checked={nodeVisibility[n.id] ?? true}
                                        onChange={(e) => {
                                          e.stopPropagation()
                                          toggleNodeVisibility(n.id, e.target.checked)
                                        }}
                                        style={{ marginRight: 8 }}
                                      />

                                      <div
                                        style={{ flex: 1, display: 'flex', alignItems: 'center' }}
                                        onClick={() => {
                                          setSelected(n)
                                          setShowNodeDetails(true)
                                        }}
                                      >
                                        <Badge status={sc.badge} dot style={{ marginRight: 8 }}>
                                          <Avatar
                                            icon={<DeploymentUnitOutlined/>}
                                            size="small"
                                            style={{
                                              background: tc.color,
                                              border: `1px solid ${sc.color}`
                                            }}
                                          />
                                        </Badge>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          <div style={{
                                            fontWeight: 600,
                                            fontSize: 12,
                                            color: '#ffffff',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                          }}>
                                            {n.name}
                                          </div>
                                          <div style={{ fontSize: 10, color: '#40a9ff', marginTop: 1 }}>
                                            {n.ip}
                                          </div>
                                          <div style={{ fontSize: 11, color: '#d9d9d9', marginTop: 2 }}>
                                            <Space size={4}>
                                              <Tag color={tc.color}>{tc.text}</Tag>
                                              <Tag color={sc.color}>{sc.text}</Tag>
                                            </Space>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </List.Item>
                                )
                              }}
                            />
                          </div>
                        </div>
                        </div>
                      </div>


                    </div>
                  </div>
                )}

                {/* 主拓扑图视图区域 */}
                <div
                  ref={viewRef}
                  onWheel={onWheel}
                  onMouseDown={onMouseDown}
                  onMouseUp={onMouseUp}
                  onMouseMove={onMouseMove}
                  style={{
                    flex: 1,
                    height: '100%',
                    overflow:'auto',
                    background: isFullscreen
                      ? 'radial-gradient(ellipse at center, #001529 0%, #000000 100%)'
                      : 'radial-gradient(ellipse at center, #0a1628 0%, #001529 100%)',
                    borderRadius: isFullscreen ? 0 : (showSidebar ? '0 8px 8px 0' : 8),
                    position: 'relative',
                    border: isFullscreen ? 'none' : '2px solid rgba(24,144,255,0.1)'
                  }}
                  className="topology-view"
                >
                {/* Fullscreen toolbar */}
                {isFullscreen && (
                  <div style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    background: 'linear-gradient(135deg, rgba(0,21,41,0.95), rgba(0,33,64,0.95))',
                    borderRadius: 12,
                    padding: '12px 16px',
                    zIndex: 1000,
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(24,144,255,0.3)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                  }}>
                    <Space>
                      <Radio.Group value={labelMode} onChange={e=>setLabelMode(e.target.value)} size="small">
                        <Radio.Button value="latency">延迟</Radio.Button>
                        <Radio.Button value="distance">距离</Radio.Button>
                        <Radio.Button value="rssi">信号</Radio.Button>
                        <Radio.Button value="bandwidth">带宽</Radio.Button>
                        <Radio.Button value="none">隐藏</Radio.Button>
                      </Radio.Group>
                      <Tooltip title={showSidebar ? "隐藏侧边栏" : "显示侧边栏"}>
                        <Button
                          size="small"
                          icon={showSidebar ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                          onClick={() => setShowSidebar(!showSidebar)}
                        />
                      </Tooltip>
                      <Tooltip title="放大"><Button size="small" icon={<ZoomInOutlined />} onClick={zoomIn} /></Tooltip>
                      <Tooltip title="缩小"><Button size="small" icon={<ZoomOutOutlined />} onClick={zoomOut} /></Tooltip>
                      <Tooltip title="重置视图"><Button size="small" icon={<CompressOutlined />} onClick={resetView} /></Tooltip>

                      <Tooltip title="退出全屏"><Button size="small" icon={<FullscreenExitOutlined />} onClick={exitFullscreen} /></Tooltip>
                    </Space>
                  </div>
                )}

                <div style={{
                  width: isFullscreen ? (showSidebar ? 'calc(100vw - 350px)' : '100vw') : 1800,
                  height: isFullscreen ? '100vh' : 1200
                }}>
                  <svg
                    ref={svgRef}
                    width={isFullscreen ? (showSidebar ? window.innerWidth - 350 : window.innerWidth) : 1800}
                    height={isFullscreen ? window.innerHeight : 1200}
                    style={{ transform:`scale(${scale})`, transformOrigin:'0 0' }}
                  >
                    <defs>
                      <marker id="arrow-blue" markerWidth="4" markerHeight="4" refX="4" refY="2" orient="auto">
                        <path d="M0,0 L4,2 L0,4 Z" fill="#40a9ff" />
                      </marker>
                      <marker id="arrow-cyan" markerWidth="4" markerHeight="4" refX="4" refY="2" orient="auto">
                        <path d="M0,0 L4,2 L0,4 Z" fill="#36cfc9" />
                      </marker>
                      <marker id="arrow-red" markerWidth="4" markerHeight="4" refX="4" refY="2" orient="auto">
                        <path d="M0,0 L4,2 L0,4 Z" fill="#ff4d4f" />
                      </marker>
                    </defs>

                    {/* Links */}
                    {visibleLinks.map(l=>{
                      const s = visibleNodes.find(n=>n.id===l.source)!; const t = visibleNodes.find(n=>n.id===l.target)!
                      const active = l.bandwidth>0
                      const upColor = active ? '#40a9ff' : '#ff4d4f'
                      const downColor = active ? '#36cfc9' : '#ff4d4f'

                      // 统一连线宽度规则：活跃连接2-4px，断开连接1.5px
                      const width = active
                        ? Math.min(4, Math.max(2, 2 + l.bandwidth/30)) // 活跃连接：2-4px范围
                        : 1.5 // 断开连接：固定1.5px

                      const dx = t.x - s.x; const dy = t.y - s.y
                      const len = Math.max(1, Math.hypot(dx, dy))
                      const nx = -dy / len; const ny = dx / len
                      const offset = 4

                      const sizeS = s.type==='gateway'?20: s.type==='relay'?16:12
                      const sizeT = t.type==='gateway'?20: t.type==='relay'?16:12

                      const x1u = s.x + nx*offset + (dx/len)* (sizeS+2)
                      const y1u = s.y + ny*offset + (dy/len)* (sizeS+2)
                      const x2u = t.x + nx*offset - (dx/len)* (sizeT+4)
                      const y2u = t.y + ny*offset - (dy/len)* (sizeT+4)

                      const x1d = t.x - nx*offset + (-dx/len)* (sizeT+2)
                      const y1d = t.y - ny*offset + (-dy/len)* (sizeT+2)
                      const x2d = s.x - nx*offset - (-dx/len)* (sizeS+4)
                      const y2d = s.y - ny*offset - (-dy/len)* (sizeS+4)

                      return (
                        <g key={l.id}>
                          <line
                            x1={x1u} y1={y1u} x2={x2u} y2={y2u}
                            stroke={upColor}
                            strokeWidth={width}
                            opacity={active ? 0.9 : 0.6}
                            strokeDasharray={active ? 'none' : '4,2'}
                            markerEnd={`url(#${active?'arrow-blue':'arrow-red'})`}
                          />
                          <line
                            x1={x1d} y1={y1d} x2={x2d} y2={y2d}
                            stroke={downColor}
                            strokeWidth={width}
                            opacity={active ? 0.8 : 0.5}
                            strokeDasharray={active ? 'none' : '4,2'}
                            markerEnd={`url(#${active?'arrow-cyan':'arrow-red'})`}
                          />
                          {labelMode !== 'none' && (
                            <text x={(s.x+t.x)/2} y={(s.y+t.y)/2 - 6} fill="#8c8c8c" fontSize={10} textAnchor="middle">
                              {labelMode==='latency' && `${l.latency}ms`}
                              {labelMode==='distance' && `${l.distance}m`}
                              {labelMode==='rssi' && `${l.rssi}dBm`}
                              {labelMode==='bandwidth' && `${l.bandwidth}Mbps`}
                            </text>
                          )}
                        </g>
                      )
                    })}

                    {/* Nodes */}
                    {visibleNodes.map(n=>{
                      const sc = statusConf(n.status); const tc = typeConf(n.type)
                      const size = n.type==='gateway' ? 20 : n.type==='relay' ? 16 : 12
                      const fill = n.type==='gateway' ? '#1890ff' : n.type==='relay' ? '#722ed1' : '#13c2c2'
                      return (
                        <g key={n.id} data-node onMouseDown={(e)=>onNodeMouseDown(n,e)} onClick={()=>{
                          setSelected(n)
                          setShowNodeDetails(true)
                        }}>
                          <circle cx={n.x} cy={n.y} r={size+1.5} fill={fill} opacity={0.15} />
                          <circle cx={n.x} cy={n.y} r={size} fill={fill} stroke={sc.color} strokeWidth={2} />
                          <text x={n.x+size+6} y={n.y+4} fill="#ffffff" fontSize={12}>{n.name}</text>
                          <text x={n.x+size+6} y={n.y+18} fill="#8c8c8c" fontSize={10}>{tc.text} · RSSI {n.rssi}dBm</text>
                        </g>
                      )
                    })}
                  </svg>

                  {/* 节点详情浮动弹窗 */}
                  {showNodeDetails && selected && (
                    <div
                      style={{
                        position: 'absolute',
                        top: isFullscreen ? '80px' : '20px', // 全屏模式下避开工具栏
                        right: '20px',
                        width: '320px',
                        maxHeight: isFullscreen ? 'calc(100% - 100px)' : 'calc(100% - 40px)',
                        background: 'linear-gradient(135deg, rgba(26,26,46,0.95) 0%, rgba(22,33,62,0.95) 50%, rgba(15,52,96,0.95) 100%)',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid rgba(24,144,255,0.3)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                        zIndex: 1001,
                        overflow: 'auto'
                      }}
                    >
                      {/* 弹窗标题 */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '16px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid rgba(24,144,255,0.2)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <AimOutlined style={{ color: '#ffc53d', marginRight: 8 }} />
                          <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '16px' }}>节点详情</span>
                        </div>
                        <Button
                          type="text"
                          size="small"
                          onClick={() => setShowNodeDetails(false)}
                          style={{
                            color: '#8c8c8c',
                            border: 'none',
                            background: 'transparent'
                          }}
                        >
                          ✕
                        </Button>
                      </div>

                      {/* 弹窗内容 */}
                      <div style={{
                        background: 'rgba(255,255,255,0.08)',
                        padding: 16,
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        <div style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: '#ffffff',
                          marginBottom: 16,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <span style={{ marginRight: 8 }}>🏷️</span>
                          {selected.name}
                        </div>

                        <Space direction="vertical" size={12} style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#d9d9d9', fontSize: 14 }}>类型：</span>
                            <Tag color={typeConf(selected.type).color} style={{ fontSize: 12 }}>
                              {typeConf(selected.type).text}
                            </Tag>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#d9d9d9', fontSize: 14 }}>状态：</span>
                            <Tag color={statusConf(selected.status).color} style={{ fontSize: 12 }}>
                              {statusConf(selected.status).text}
                            </Tag>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#d9d9d9', fontSize: 14 }}>IP地址：</span>
                            <code style={{
                              background: 'rgba(0,0,0,0.3)',
                              padding: '2px 6px',
                              borderRadius: 4,
                              fontSize: 12,
                              color: '#40a9ff'
                            }}>
                              {selected.ip}
                            </code>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#d9d9d9', fontSize: 14 }}>信号强度：</span>
                            <Tag
                              color={selected.rssi>-60?'green':selected.rssi>-75?'orange':'red'}
                              style={{ fontSize: 12 }}
                            >
                              📶 {selected.rssi} dBm
                            </Tag>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#d9d9d9', fontSize: 14 }}>工作频率：</span>
                            <Tag
                              color={selected.frequency >= 6000 ? 'gold' : selected.frequency >= 5000 ? 'green' : 'cyan'}
                              style={{ fontSize: 12 }}
                            >
                              📡 {formatFrequency(selected.frequency)}
                            </Tag>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#d9d9d9', fontSize: 14 }}>连接数：</span>
                            <Tag color="blue" style={{ fontSize: 12 }}>
                              🔗 {selected.links.length} 个
                            </Tag>
                          </div>

                          {selected.links.length > 0 && (
                            <div>
                              <div style={{ color: '#d9d9d9', fontSize: 14, marginBottom: 8 }}>相邻节点：</div>
                              <div style={{
                                background: 'rgba(0,0,0,0.2)',
                                padding: 12,
                                borderRadius: 6,
                                border: '1px solid rgba(255,255,255,0.1)'
                              }}>
                                <Space wrap size={[6, 6]}>
                                  {selected.links.map(id => {
                                    const neighbor = nodes.find(n => n.id === id)
                                    return neighbor ? (
                                      <Tag
                                        key={id}
                                        color={typeConf(neighbor.type).color}
                                        style={{ cursor: 'pointer', fontSize: 11 }}
                                        onClick={() => {
                                          setSelected(neighbor)
                                        }}
                                      >
                                        {neighbor.name}
                                      </Tag>
                                    ) : null
                                  })}
                                </Space>
                              </div>
                            </div>
                          )}
                        </Space>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </Card>
          </div>
        </Col>
      </Row>


    </div>
  )
}

export default TopologyManagement

