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

const cardStyle = { background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,21,41,.08)', border: '1px solid #f0f0f0', marginBottom: 16 }

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
    <div style={{ background: 'transparent' }}>
      {/* 标题 */}
      <Card style={cardStyle}>
        <Row align="middle" justify="space-between" gutter={[8,8]}>
          <Col flex="auto">
            <Space>
              <VideoCameraOutlined style={{ fontSize: 22, color: '#1890ff' }} />
              <div>
                <h2 style={{ margin: 0, color: '#262626' }}>视频监控中心</h2>
                <div style={{ color: '#8c8c8c', fontSize: 12 }}>时间：{now.toLocaleString('zh-CN')}</div>
              </div>
            </Space>
          </Col>
          <Col>
            <Space wrap>
              <Input.Search allowClear placeholder="搜索摄像头" onSearch={setKeyword} style={{ width: 200 }} />
              <Select size="middle" value={statusFilter} style={{ width: 120 }} onChange={v=>setStatusFilter(v as any)}
                options={[{label:'全部', value:'all'},{label:'在线',value:'online'},{label:'离线',value:'offline'},{label:'异常',value:'warning'}]} />
              <Segmented options={[{label:'单画面', value:'single', icon:<ProfileOutlined/>},{label:'四宫格', value:'quad', icon:<AppstoreOutlined/>}]} value={layout} onChange={(v)=>setLayout(v as any)} />
              <Tag color={current?.recording ? 'red' : 'default'}>{current?.recording ? 'REC 录制中' : '未录制'}</Tag>
              <Button icon={<SettingOutlined />}>系统设置</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 统计 */}
      <Row gutter={[16,16]} style={{ marginBottom: 16 }}>
        {[{t:'在线摄像头',v:stats.online,c:'#52c41a'},{t:'录制中',v:stats.recording,c:'#1890ff'},{t:'离线设备',v:stats.offline,c:'#ff4d4f'},{t:'异常设备',v:stats.warning,c:'#faad14'}].map((s,i)=> (
          <Col xs={12} sm={6} key={i}>
            <Card style={cardStyle}>
              <Statistic title={s.t} value={s.v} suffix={`/ ${stats.total}`} valueStyle={{ color: s.c }} />
              <Progress percent={Math.round((s.v/(stats.total||1))*100)} size="small" showInfo={false} style={{ marginTop: 8 }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16,16]}>
        {/* 摄像头列表 */}
        <Col xs={24} lg={8}>
          <Card style={cardStyle} title={<Space><CameraOutlined/>摄像头列表<Badge count={stats.online} showZero/></Space>}>
            <List
              dataSource={cameras.filter(c=> (statusFilter==='all'||c.status===statusFilter) && (!keyword || c.name.includes(keyword) || c.location.includes(keyword)))}
              renderItem={cam => {
                const sc = statusConf(cam.status)
                return (
                  <List.Item onClick={()=>setSelectedId(cam.id)} style={{ cursor:'pointer', background:selectedId===cam.id?'#f0f8ff':'transparent', borderRadius:4, padding:8 }}>
                    <List.Item.Meta
                      avatar={<Badge status={sc.badge} dot><Avatar icon={<VideoCameraOutlined/>}/></Badge>}
                      title={<Space size={8}>{cam.name}{cam.recording && <Tag color="red">REC</Tag>}</Space>}
                      description={<Space size={6} wrap>
                        <span style={{color:'#8c8c8c'}}>{cam.location}</span>
                        <Tag color={sc.color}>{sc.text}</Tag>
                        <Tag>{cam.resolution}</Tag>
                        {cam.status==='online' && <Tag>{cam.fps}fps</Tag>}
                      </Space>}
                    />
                  </List.Item>
                )
              }}
            />
          </Card>
        </Col>

        {/* 右侧：视频与控制 */}
        <Col xs={24} lg={16}>
          <Space direction="vertical" size="middle" style={{ width:'100%' }}>
            <Card style={cardStyle}
              title={<Space><MonitorOutlined/>{current?.name || '选择摄像头'}<Select size="small" value={selectedId} onChange={setSelectedId} style={{ width: 200 }} options={cameras.map(c=>({value:c.id,label:c.name}))}/></Space>}
              extra={<Space><Button icon={<PlayCircleOutlined/>} onClick={handlePlay}>播放</Button><Button icon={<PauseCircleOutlined/>} onClick={handlePause}>暂停</Button><Button icon={<FullscreenOutlined/>} onClick={goFullscreen}>全屏</Button></Space>}>
              <div ref={playerBoxRef} style={{ width:'100%', height: layout==='single'? 400 : 460, background:'#000', borderRadius:4, position:'relative', padding: layout==='single'? 0 : 8 }}>
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

            <Card style={cardStyle} title={<Space><SettingOutlined/>控制面板</Space>}>
              <Row gutter={[16,16]}>
                <Col xs={24} sm={12}>
                  <Space direction="vertical">
                    <div><span style={{ marginRight:8 }}>录制控制:</span><Switch checked={!!current?.recording} onChange={toggleRecording} checkedChildren="录制中" unCheckedChildren="已停止" /></div>
                    <Space>
                      <Button icon={<PlayCircleOutlined/>} type="primary" onClick={handlePlay}>播放</Button>
                      <Button icon={<PauseCircleOutlined/>} onClick={handlePause}>暂停</Button>
                      <Button icon={muted ? <AudioMutedOutlined/> : <SoundOutlined/>} onClick={toggleMute}>{muted?'取消静音':'静音'}</Button>
                    </Space>
                  </Space>
                </Col>
                <Col xs={24} sm={12}>
                  <Space direction="vertical">
                    <div style={{ color:'#8c8c8c' }}>摄像头信息</div>
                    {current && <div style={{ fontSize:12, color:'#8c8c8c' }}>
                      <div>位置：{current.location}</div>
                      <div>分辨率：{current.resolution}</div>
                      <div>帧率：{current.fps}fps</div>
                      <div>状态：{statusConf(current.status).text}</div>
                    </div>}
                  </Space>
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
