import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Card, Row, Col, Space, Tag, Button, Badge, Statistic, List, Avatar, Progress, Switch, Select, Input, Segmented, Tooltip } from 'antd'
import {
  VideoCameraOutlined, SettingOutlined, PlayCircleOutlined, PauseCircleOutlined,
  FullscreenOutlined, SoundOutlined, AudioMutedOutlined, AlertOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, CloseCircleOutlined, CameraOutlined, MonitorOutlined,
  AppstoreOutlined, ProfileOutlined
} from '@ant-design/icons'

type CameraStatus = 'online' | 'offline' | 'warning'
interface Camera { id: string; name: string; location: string; status: CameraStatus; resolution: string; fps: number; recording: boolean; stream?: string }

const cardStyle = { background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,21,41,.08)', border: '1px solid #f0f0f0' }
const compactCardStyle = { ...cardStyle, marginBottom: 12 }
const headerCardStyle = { ...cardStyle, marginBottom: 8 }

const initialCameras: Camera[] = [
  { id: 'c1', name: '主入口监控', location: '大厅入口', status: 'online',  resolution: '1920x1080', fps: 30, recording: true,  stream: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
  { id: 'c2', name: '办公区域监控', location: '办公区A', status: 'online',  resolution: '1920x1080', fps: 25, recording: false, stream: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 'c3', name: '服务器机房',   location: '机房B区',   status: 'online',  resolution: '2560x1440', fps: 30, recording: true },
  { id: 'c4', name: '地下停车场',   location: 'B2层',     status: 'offline', resolution: '1920x1080', fps: 0,  recording: false },
  { id: 'c5', name: '会议室监控',   location: '会议室301', status: 'online',  resolution: '1920x1080', fps: 30, recording: false },
  { id: 'c6', name: '安全通道',     location: '紧急出口',   status: 'warning', resolution: '1280x720',  fps: 15, recording: true  },
]

const statusConf = (s: CameraStatus) => s === 'online'
  ? { color: '#52c41a', text: '在线', badge: 'success' as const, icon: <CheckCircleOutlined /> }
  : s === 'offline'
  ? { color: '#ff4d4f', text: '离线', badge: 'error' as const, icon: <CloseCircleOutlined /> }
  : { color: '#faad14', text: '异常', badge: 'warning' as const, icon: <ExclamationCircleOutlined /> }

const VideoMonitoring: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>(initialCameras)
  const [selectedId, setSelectedId] = useState<string>('c1')
  const [muted, setMuted] = useState<boolean>(false)
  const [now, setNow] = useState<Date>(new Date())
  const [keyword, setKeyword] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<'all'|CameraStatus>('all')
  const [layout, setLayout] = useState<'single'|'quad'>('single')
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerBoxRef = useRef<HTMLDivElement>(null)

  const current = useMemo(() => cameras.find(c => c.id === selectedId), [cameras, selectedId])

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])

  // 模拟实时状态更新
  useEffect(() => {
    const t = setInterval(() => {
      setCameras(prev => {
        const idx = Math.floor(Math.random() * prev.length)
        const c = prev[idx]
        const rand = Math.random()
        const next: Camera = {
          ...c,
          status: rand < 0.05 ? 'offline' : rand < 0.15 ? 'warning' : 'online',
          fps: c.status === 'offline' ? 0 : Math.max(12, Math.min(35, c.fps + (Math.random() > 0.5 ? 1 : -1)))
        }
        const copy = [...prev]; copy[idx] = next; return copy
      })
    }, 5000)
    return () => clearInterval(t)
  }, [])

  const stats = useMemo(() => {
    const online = cameras.filter(c => c.status === 'online').length
    const offline = cameras.filter(c => c.status === 'offline').length
    const warning = cameras.filter(c => c.status === 'warning').length
    const recording = cameras.filter(c => c.recording).length
    return { online, offline, warning, recording, total: cameras.length }
  }, [cameras])

  const toggleRecording = () => setCameras(prev => prev.map(c => c.id === selectedId ? { ...c, recording: !c.recording } : c))
  const handlePlay = () => videoRef.current?.play()
  const handlePause = () => videoRef.current?.pause()
  const toggleMute = () => setMuted(m => !m)
  const goFullscreen = () => playerBoxRef.current?.requestFullscreen?.()

  return (
    <div style={{ background: 'transparent', padding: '0 4px' }}>
      {/* 紧凑型标题栏 */}
      <Card style={headerCardStyle} bodyStyle={{ padding: '12px 16px' }}>
        <Row align="middle" justify="space-between" gutter={[12,8]}>
          <Col flex="auto">
            <Space size={12}>
              <VideoCameraOutlined style={{ fontSize: 20, color: '#1890ff' }} />
              <div>
                <h3 style={{ margin: 0, color: '#262626', fontSize: 16, fontWeight: 600 }}>视频监控中心</h3>
                <div style={{ color: '#8c8c8c', fontSize: 11, marginTop: 2 }}>{now.toLocaleString('zh-CN')}</div>
              </div>
            </Space>
          </Col>
          <Col>
            <Space wrap size={8}>
              <Input.Search allowClear placeholder="搜索摄像头" onSearch={setKeyword} style={{ width: 180 }} size="small" />
              <Select size="small" value={statusFilter} style={{ width: 100 }} onChange={v=>setStatusFilter(v as any)}
                options={[{label:'全部', value:'all'},{label:'在线',value:'online'},{label:'离线',value:'offline'},{label:'异常',value:'warning'}]} />
              <Segmented size="small" options={[{label:'单画面', value:'single', icon:<ProfileOutlined/>},{label:'四宫格', value:'quad', icon:<AppstoreOutlined/>}]} value={layout} onChange={(v)=>setLayout(v as any)} />
              <Tag color={current?.recording ? 'red' : 'default'} style={{ margin: 0 }}>{current?.recording ? 'REC' : '未录制'}</Tag>
              <Button icon={<SettingOutlined />} size="small">设置</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 紧凑型统计面板 */}
      <Card style={compactCardStyle} bodyStyle={{ padding: '12px 16px' }}>
        <Row gutter={[16,0]}>
          {[{t:'在线',v:stats.online,c:'#52c41a'},{t:'录制',v:stats.recording,c:'#1890ff'},{t:'离线',v:stats.offline,c:'#ff4d4f'},{t:'异常',v:stats.warning,c:'#faad14'}].map((s,i)=> (
            <Col xs={12} sm={6} key={i}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: s.c, lineHeight: 1.2 }}>
                  {s.v}<span style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 400 }}>/{stats.total}</span>
                </div>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>{s.t}</div>
                <Progress
                  percent={Math.round((s.v/(stats.total||1))*100)}
                  size="small"
                  showInfo={false}
                  style={{ marginTop: 4 }}
                  strokeColor={s.c}
                />
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      <Row gutter={[12,12]}>
        {/* 优化的摄像头列表 */}
        <Col xs={24} lg={7}>
          <Card
            style={compactCardStyle}
            title={<Space size={8}><CameraOutlined style={{ fontSize: 14 }}/>摄像头列表<Badge count={stats.online} showZero size="small"/></Space>}
            bodyStyle={{ padding: '8px 0' }}
            headStyle={{ padding: '8px 16px', minHeight: 'auto' }}
          >
            <List
              size="small"
              dataSource={cameras.filter(c=> (statusFilter==='all'||c.status===statusFilter) && (!keyword || c.name.includes(keyword) || c.location.includes(keyword)))}
              renderItem={cam => {
                const sc = statusConf(cam.status)
                return (
                  <List.Item
                    onClick={()=>setSelectedId(cam.id)}
                    style={{
                      cursor:'pointer',
                      background:selectedId===cam.id?'#e6f7ff':'transparent',
                      borderRadius:4,
                      padding:'6px 16px',
                      margin: '0 8px 4px 8px',
                      border: selectedId===cam.id ? '1px solid #91d5ff' : '1px solid transparent'
                    }}
                  >
                    <List.Item.Meta
                      avatar={<Badge status={sc.badge} dot size="small"><Avatar size="small" icon={<VideoCameraOutlined/>}/></Badge>}
                      title={
                        <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>
                          <Space size={4}>
                            {cam.name}
                            {cam.recording && <Tag color="red" style={{ fontSize: 10, padding: '0 4px', lineHeight: '16px' }}>REC</Tag>}
                          </Space>
                        </div>
                      }
                      description={
                        <div style={{ fontSize: 11, lineHeight: 1.2, marginTop: 2 }}>
                          <div style={{color:'#8c8c8c', marginBottom: 2}}>{cam.location}</div>
                          <Space size={4} wrap>
                            <Tag color={sc.color} style={{ fontSize: 10, padding: '0 4px', lineHeight: '16px' }}>{sc.text}</Tag>
                            <Tag style={{ fontSize: 10, padding: '0 4px', lineHeight: '16px' }}>{cam.resolution}</Tag>
                            {cam.status==='online' && <Tag style={{ fontSize: 10, padding: '0 4px', lineHeight: '16px' }}>{cam.fps}fps</Tag>}
                          </Space>
                        </div>
                      }
                    />
                  </List.Item>
                )
              }}
            />
          </Card>
        </Col>

        {/* 优化的视频播放区域 */}
        <Col xs={24} lg={17}>
          <Space direction="vertical" size={8} style={{ width:'100%' }}>
            <Card
              style={compactCardStyle}
              title={
                <Space size={8}>
                  <MonitorOutlined style={{ fontSize: 14 }}/>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{current?.name || '选择摄像头'}</span>
                  <Select
                    size="small"
                    value={selectedId}
                    onChange={setSelectedId}
                    style={{ width: 160, fontSize: 12 }}
                    options={cameras.map(c=>({value:c.id,label:c.name}))}
                  />
                </Space>
              }
              extra={
                <Space size={4}>
                  <Button size="small" icon={<PlayCircleOutlined/>} onClick={handlePlay}>播放</Button>
                  <Button size="small" icon={<PauseCircleOutlined/>} onClick={handlePause}>暂停</Button>
                  <Button size="small" icon={<FullscreenOutlined/>} onClick={goFullscreen}>全屏</Button>
                </Space>
              }
              bodyStyle={{ padding: 8 }}
              headStyle={{ padding: '8px 16px', minHeight: 'auto' }}
            >
              <div ref={playerBoxRef} style={{ width:'100%', height: layout==='single'? 'calc(100vh - 320px)' : 'calc(100vh - 280px)', minHeight: 360, background:'#000', borderRadius:4, position:'relative', padding: layout==='single'? 0 : 8 }}>
                {layout==='single' ? (
                  <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {current?.status==='online' ? (
                      current?.stream ? (
                        <video ref={videoRef} src={current.stream} style={{ width:'100%', height:'100%', objectFit:'cover' }} muted={muted} controls />
                      ) : (
                        <div style={{ color:'#fff', textAlign:'center' }}>
                          <VideoCameraOutlined style={{ fontSize:48, marginBottom:16 }} />
                          <div>实时视频流</div>
                          <div style={{ fontSize:12, opacity:.7, marginTop:8 }}>{current?.resolution} @ {current?.fps}fps</div>
                        </div>
                      )
                    ) : (
                      <div style={{ color:'#8c8c8c', textAlign:'center' }}>
                        <AlertOutlined style={{ fontSize:48, marginBottom:16 }} />
                        <div>摄像头离线或异常</div>
                      </div>
                    )}
                    {current?.recording && <div style={{ position:'absolute', top:16, right:16, background:'rgba(255,77,79,.9)', color:'#fff', padding:'2px 8px', borderRadius:4, fontSize:12 }}>REC 录制中</div>}
                  </div>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gridTemplateRows:'1fr 1fr', gap:8, height:'100%' }}>
                    {cameras.slice(0,4).map(cam => (
                      <div key={cam.id} style={{ position:'relative', background:'#111', borderRadius:4, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {cam.status==='online' ? (
                          <div style={{ color:'#fff', textAlign:'center' }}>
                            <VideoCameraOutlined style={{ fontSize:32, marginBottom:8 }} />
                            <div style={{ fontSize:12, opacity:.7 }}>{cam.name}</div>
                          </div>
                        ) : (
                          <div style={{ color:'#666', textAlign:'center' }}>
                            <AlertOutlined style={{ fontSize:28, marginBottom:8 }} />
                            <div style={{ fontSize:12 }}>离线/异常</div>
                          </div>
                        )}
                        <div style={{ position:'absolute', left:8, top:8, color:'#fff', fontSize:12, background:'rgba(0,0,0,.25)', padding:'2px 6px', borderRadius:4 }}>{cam.name}</div>
                        <div style={{ position:'absolute', right:8, bottom:8 }}>
                          <Space>
                            <Tooltip title="切换到此摄像头"><Button size="small" onClick={()=>{ setSelectedId(cam.id); setLayout('single') }}>查看</Button></Tooltip>
                          </Space>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <Card
              style={compactCardStyle}
              title={<Space size={8}><SettingOutlined style={{ fontSize: 14 }}/>控制面板</Space>}
              bodyStyle={{ padding: '12px 16px' }}
              headStyle={{ padding: '8px 16px', minHeight: 'auto' }}
            >
              <Row gutter={[16,8]} align="middle">
                <Col xs={24} sm={14}>
                  <Space size={12} wrap>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: '#8c8c8c' }}>录制:</span>
                      <Switch
                        size="small"
                        checked={!!current?.recording}
                        onChange={toggleRecording}
                        checkedChildren="ON"
                        unCheckedChildren="OFF"
                      />
                    </div>
                    <Space size={6}>
                      <Button size="small" icon={<PlayCircleOutlined/>} type="primary" onClick={handlePlay}>播放</Button>
                      <Button size="small" icon={<PauseCircleOutlined/>} onClick={handlePause}>暂停</Button>
                      <Button size="small" icon={muted ? <AudioMutedOutlined/> : <SoundOutlined/>} onClick={toggleMute}>
                        {muted?'取消静音':'静音'}
                      </Button>
                    </Space>
                  </Space>
                </Col>
                <Col xs={24} sm={10}>
                  {current && (
                    <div style={{ fontSize: 11, color: '#8c8c8c', lineHeight: 1.4 }}>
                      <div><strong>位置:</strong> {current.location}</div>
                      <div><strong>分辨率:</strong> {current.resolution} | <strong>帧率:</strong> {current.fps}fps</div>
                      <div><strong>状态:</strong> <span style={{ color: statusConf(current.status).color }}>{statusConf(current.status).text}</span></div>
                    </div>
                  )}
                </Col>
              </Row>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  )
}

export default VideoMonitoring
