import React, { useState, useMemo } from 'react';
import {
  Card, Tabs, Table, Button, Form, Input, Select, Space, 
  Typography, message, Tag, Row, Col, Statistic, 
  Modal, Drawer, Popconfirm, Tooltip, Checkbox, Badge, Upload, Divider
} from 'antd';
import {
  TeamOutlined, FormOutlined, BarChartOutlined, CheckCircleOutlined,
  CloseCircleOutlined, DeleteOutlined, EditOutlined, HistoryOutlined, 
  SwapOutlined, SafetyCertificateOutlined, UploadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

/** --- ĐỊNH NGHĨA KIỂU DỮ LIỆU --- **/
interface Club {
  id: string;
  avatar: string;
  name: string;
  foundedDate: string;
  description: string;
  president: string;
  isActive: boolean;
}

interface ActionHistory {
  time: string;
  action: 'Approved' | 'Rejected';
  reason?: string;
}

type AppStatus = 'Pending' | 'Approved' | 'Rejected';

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  address: string;
  skills: string;
  clubId: string;
  reason: string;
  status: AppStatus;
  rejectReason?: string;
  history: ActionHistory[];
}

const TH05: React.FC = () => {
  /** --- STATE HỆ THỐNG MẪU --- **/
  const [clubs, setClubs] = useState<Club[]>([
    { id: 'C1', avatar: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png', name: 'CLB Lập trình Web', foundedDate: '15/08/2015', description: '<strong>Môi trường đào tạo Fullstack Developer</strong>', president: 'Nguyễn Văn A', isActive: true },
    { id: 'C2', avatar: 'https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg', name: 'CLB Bóng đá', foundedDate: '01/01/2020', description: '<em>Nơi giao lưu thể thao, rèn luyện sức khỏe</em>', president: 'Trần Văn B', isActive: true },
    { id: 'C3', avatar: 'https://gw.alipayobjects.com/zos/antfincdn/Z5c7iqcbHQ/peijian.svg', name: 'CLB Âm nhạc', foundedDate: '20/11/2010', description: 'Phát triển tài năng nghệ thuật', president: 'Lê Thị C', isActive: false },
  ]);

  const [applications, setApplications] = useState<Application[]>([
    { id: 'A1', fullName: 'Phạm Văn D', email: 'd@gmail.com', phone: '0987654321', gender: 'Nam', address: 'Hà Nội', skills: 'ReactJS, NodeJS', clubId: 'C1', reason: 'Muốn học hỏi code', status: 'Pending', history: [] },
    { id: 'A2', fullName: 'Hoàng Thị E', email: 'e@gmail.com', phone: '0123456789', gender: 'Nữ', address: 'Hà Nội', skills: 'Hát, Nhảy', clubId: 'C3', reason: 'Đam mê nghệ thuật', status: 'Approved', history: [{ time: '10:00 24/03/2026', action: 'Approved' }] },
    { id: 'A3', fullName: 'Vũ Văn F', email: 'f@gmail.com', phone: '0111222333', gender: 'Nam', address: 'Hà Nam', skills: 'Chưa có', clubId: 'C1', reason: 'Thích code', status: 'Rejected', rejectReason: 'Chưa đủ kinh nghiệm', history: [{ time: '09:00 24/03/2026', action: 'Rejected', reason: 'Chưa đủ kinh nghiệm' }] },
  ]);

  // States UI
  const [isClubDrawerVisible, setIsClubDrawerVisible] = useState(false);
  const [editingClubId, setEditingClubId] = useState<string | null>(null);
  
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [changeClubModalVisible, setChangeClubModalVisible] = useState(false);

  const [selectedAppKeys, setSelectedAppKeys] = useState<React.Key[]>([]);
  const [currentAppId, setCurrentAppId] = useState<string | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<ActionHistory[]>([]);
  
  const [formClub] = Form.useForm();
  const [formReject] = Form.useForm();
  const [formChangeClub] = Form.useForm();

  /** --- HÀM HỖ TRỢ UPLOAD FILE --- **/
  const normFile = (e: any) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  /** --- LOGIC 1: QUẢN LÝ CÂU LẠC BỘ --- **/
  
  const handleOpenAddClub = () => {
    setEditingClubId(null);
    formClub.resetFields();
    setIsClubDrawerVisible(true);
  };

  const handleOpenEditClub = (record: Club) => {
    setEditingClubId(record.id);
    formClub.setFieldsValue({
      name: record.name,
      president: record.president,
      description: record.description,
      isActive: record.isActive,
      avatar: [{ uid: '-1', name: 'image.png', status: 'done', url: record.avatar }]
    });
    setIsClubDrawerVisible(true);
  };

  const handleSaveClub = async (values: any): Promise<void> => {
    let avatarBase64 = ''; 

    if (values.avatar && values.avatar.length > 0) {
      const fileObj = values.avatar[0].originFileObj;
      if (fileObj) {
        avatarBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(fileObj);
          reader.onload = () => resolve(reader.result as string);
        });
      } else {
        avatarBase64 = values.avatar[0].url;
      }
    }

    if (editingClubId) {
      setClubs(prev => prev.map(c => c.id === editingClubId ? {
        ...c,
        name: values.name,
        president: values.president,
        description: values.description || '',
        isActive: values.isActive || false,
        avatar: avatarBase64 || c.avatar 
      } : c));
      message.success('Đã cập nhật thông tin Câu lạc bộ!');
    } else {
      const newClub: Club = {
        id: `C${Date.now()}`,
        avatar: avatarBase64 || 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png',
        name: values.name,
        foundedDate: new Date().toLocaleDateString('vi-VN'),
        description: values.description || '',
        president: values.president,
        isActive: values.isActive || false,
      };
      setClubs([...clubs, newClub]);
      message.success('Đã thêm mới Câu lạc bộ!');
    }

    setIsClubDrawerVisible(false);
    setEditingClubId(null);
    formClub.resetFields();
  };

  const handleDeleteClub = (id: string): void => {
    setClubs(clubs.filter(c => c.id !== id));
    message.success('Đã xóa câu lạc bộ');
  };

  /** --- LOGIC 2 & 3: QUẢN LÝ ĐƠN VÀ THÀNH VIÊN --- **/
  const rowSelection = {
    selectedRowKeys: selectedAppKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => setSelectedAppKeys(newSelectedRowKeys),
  };

  const processApproval = (ids: string[], isApprove: boolean, reason?: string): void => {
    const now = new Date().toLocaleString('vi-VN');
    setApplications(prev => prev.map(app => {
      if (ids.includes(app.id)) {
        const newHistory: ActionHistory = { 
          time: now, 
          action: isApprove ? 'Approved' : 'Rejected', 
          reason: isApprove ? undefined : reason 
        };
        return {
          ...app,
          status: isApprove ? 'Approved' : 'Rejected',
          rejectReason: isApprove ? undefined : reason,
          history: [...app.history, newHistory]
        };
      }
      return app;
    }));
    
    setSelectedAppKeys([]);
    if (!isApprove) setRejectModalVisible(false);
    formReject.resetFields();
    message.success(`Đã ${isApprove ? 'duyệt' : 'từ chối'} ${ids.length} đơn đăng ký!`);
  };

  const handleBatchApprove = (): void => {
    if (selectedAppKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 đơn!');
      return;
    }
    processApproval(selectedAppKeys as string[], true);
  };

  const handleOpenBatchReject = (): void => {
    if (selectedAppKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 đơn!');
      return;
    }
    setCurrentAppId('BATCH');
    setRejectModalVisible(true);
  };

  const submitReject = (values: any): void => {
    if (currentAppId === 'BATCH') {
      processApproval(selectedAppKeys as string[], false, values.reason);
    } else if (currentAppId) {
      processApproval([currentAppId], false, values.reason);
    }
  };

  const showHistory = (history: ActionHistory[]): void => {
    setSelectedHistory(history);
    setHistoryModalVisible(true);
  };

  const approvedMembers = applications.filter(a => a.status === 'Approved');

  const handleChangeClubSubmit = (values: any): void => {
    setApplications(prev => prev.map(app => 
      selectedAppKeys.includes(app.id) ? { ...app, clubId: values.newClubId } : app
    ));
    setChangeClubModalVisible(false);
    setSelectedAppKeys([]);
    formChangeClub.resetFields();
    message.success(`Đã chuyển sinh hoạt cho ${selectedAppKeys.length} thành viên!`);
  };

  /** --- LOGIC 4: BÁO CÁO THỐNG KÊ --- **/
  const stats = useMemo(() => {
    let pending = 0, approved = 0, rejected = 0;
    applications.forEach(a => {
      if (a.status === 'Pending') pending++;
      if (a.status === 'Approved') approved++;
      if (a.status === 'Rejected') rejected++;
    });

    const chartData = clubs.map(club => {
      const clubApps = applications.filter(a => a.clubId === club.id);
      return {
        name: club.name,
        pending: clubApps.filter(a => a.status === 'Pending').length,
        approved: clubApps.filter(a => a.status === 'Approved').length,
        rejected: clubApps.filter(a => a.status === 'Rejected').length,
        total: clubApps.length
      };
    });

    const maxTotal = Math.max(...chartData.map(d => d.total), 1);

    return { pending, approved, rejected, chartData, maxTotal };
  }, [applications, clubs]);

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={3} style={{ margin: 0, color: '#b5272d' }}><SafetyCertificateOutlined /> HỆ THỐNG QUẢN LÝ CÂU LẠC BỘ</Title>
            <Text type="secondary">Phân hệ Quản lý Đoàn Thanh Niên</Text>
          </div>
          
          <Tabs defaultActiveKey="1" size="large">
            
            {/* TAB 1: DANH SÁCH CÂU LẠC BỘ */}
            <TabPane tab={<span><TeamOutlined /> Danh sách CLB</span>} key="1">
              <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <Button type="primary" onClick={handleOpenAddClub}>Thêm mới CLB</Button>
              </div>
              <Table 
                dataSource={clubs} 
                rowKey="id"
                columns={[
                  { 
                    title: 'Ảnh', 
                    dataIndex: 'avatar', 
                    render: (imgUrl) => <img src={imgUrl} alt="avatar" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #d9d9d9' }} /> 
                  },
                  { title: 'Tên câu lạc bộ', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
                  { title: 'Ngày thành lập', dataIndex: 'foundedDate' },
                  { title: 'Mô tả', dataIndex: 'description', render: t => <div dangerouslySetInnerHTML={{__html: t}} /> },
                  { title: 'Chủ nhiệm', dataIndex: 'president' },
                  { title: 'Hoạt động', dataIndex: 'isActive', render: t => t ? <Tag color="green">Có</Tag> : <Tag color="red">Không</Tag> },
                  { 
                    title: 'Thao tác', 
                    render: (_, record) => (
                      <Space>
                        <Tooltip title="Chỉnh sửa">
                           <Button type="link" icon={<EditOutlined />} onClick={() => handleOpenEditClub(record)} />
                        </Tooltip>
                        <Popconfirm title="Xóa CLB này?" onConfirm={() => handleDeleteClub(record.id)}>
                          <Tooltip title="Xóa">
                            <Button type="link" danger icon={<DeleteOutlined />} />
                          </Tooltip>
                        </Popconfirm>
                      </Space>
                    ) 
                  },
                ]}
              />
            </TabPane>

            {/* TAB 2: QUẢN LÝ ĐƠN ĐĂNG KÝ */}
            <TabPane tab={<span><FormOutlined /> Quản lý Đơn đăng ký</span>} key="2">
              <div style={{ marginBottom: 16, background: '#e6f7ff', padding: 12, borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
                <Space>
                  <Text strong>Thao tác hàng loạt ({selectedAppKeys.length} đơn):</Text>
                  <Button type="primary" style={{ background: '#52c41a', borderColor: '#52c41a' }} icon={<CheckCircleOutlined />} onClick={handleBatchApprove}>
                    Duyệt các đơn đã chọn
                  </Button>
                  <Button type="primary" danger icon={<CloseCircleOutlined />} onClick={handleOpenBatchReject}>
                    Từ chối các đơn đã chọn
                  </Button>
                </Space>
              </div>

              <Table 
                rowSelection={rowSelection}
                dataSource={applications} 
                rowKey="id"
                columns={[
                  { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName', sorter: (a,b)=>a.fullName.localeCompare(b.fullName) },
                  { title: 'Email', dataIndex: 'email' },
                  { title: 'CLB ứng tuyển', dataIndex: 'clubId', render: id => clubs.find(c => c.id === id)?.name },
                  { title: 'Lý do', dataIndex: 'reason' },
                  { 
                    title: 'Trạng thái', 
                    dataIndex: 'status',
                    render: (t, record) => (
                      <Space>
                        {t === 'Pending' && <Badge status="processing" text="Pending" />}
                        {t === 'Approved' && <Badge status="success" text="Approved" />}
                        {t === 'Rejected' && <Tooltip title={record.rejectReason}><Badge status="error" text="Rejected" /></Tooltip>}
                      </Space>
                    )
                  },
                  { 
                    title: 'Thao tác', 
                    align: 'center',
                    render: (_, record) => (
                      <Space>
                        {record.status === 'Pending' && (
                          <>
                            <Tooltip title="Duyệt đơn"><Button type="text" style={{color: '#52c41a'}} icon={<CheckCircleOutlined />} onClick={() => processApproval([record.id], true)} /></Tooltip>
                            <Tooltip title="Từ chối"><Button type="text" danger icon={<CloseCircleOutlined />} onClick={() => { setCurrentAppId(record.id); setRejectModalVisible(true); }} /></Tooltip>
                          </>
                        )}
                        <Tooltip title="Lịch sử duyệt"><Button type="text" icon={<HistoryOutlined />} onClick={() => showHistory(record.history)} /></Tooltip>
                      </Space>
                    ) 
                  },
                ]}
              />
            </TabPane>

            {/* TAB 3: QUẢN LÝ THÀNH VIÊN */}
            <TabPane tab={<span><TeamOutlined /> Quản lý Thành viên</span>} key="3">
              <div style={{ marginBottom: 16 }}>
                <Button 
                  type="primary" 
                  icon={<SwapOutlined />} 
                  disabled={selectedAppKeys.length === 0}
                  onClick={() => setChangeClubModalVisible(true)}
                >
                  Chuyển CLB cho {selectedAppKeys.length} thành viên đã chọn
                </Button>
              </div>
              <Table 
                rowSelection={rowSelection}
                dataSource={approvedMembers} 
                rowKey="id"
                columns={[
                  { title: 'Họ tên', dataIndex: 'fullName' },
                  { title: 'Email', dataIndex: 'email' },
                  { title: 'SĐT', dataIndex: 'phone' },
                  { title: 'Đang sinh hoạt tại', dataIndex: 'clubId', render: id => <Tag color="blue">{clubs.find(c => c.id === id)?.name}</Tag> },
                  { title: 'Sở trường', dataIndex: 'skills' },
                ]}
              />
            </TabPane>

            {/* TAB 4: BÁO CÁO THỐNG KÊ */}
            <TabPane tab={<span><BarChartOutlined /> Báo cáo thống kê</span>} key="4">
              <Row gutter={16} style={{ marginBottom: 32 }}>
                <Col span={6}><Card><Statistic title="Tổng số CLB" value={clubs.length} valueStyle={{ color: '#1890ff' }} /></Card></Col>
                <Col span={6}><Card><Statistic title="Đơn Chờ duyệt (Pending)" value={stats.pending} valueStyle={{ color: '#faad14' }} /></Card></Col>
                <Col span={6}><Card><Statistic title="Đơn Đã duyệt (Approved)" value={stats.approved} valueStyle={{ color: '#52c41a' }} /></Card></Col>
                <Col span={6}><Card><Statistic title="Đơn Từ chối (Rejected)" value={stats.rejected} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
              </Row>

              <Card title="BIỂU ĐỒ SỐ LƯỢNG ĐƠN ĐĂNG KÝ THEO CÂU LẠC BỘ">
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: 300, borderBottom: '2px solid #ccc', paddingBottom: 10 }}>
                  {stats.chartData.map((data, index) => (
                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20%' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', height: 250, width: '100%', justifyContent: 'center', gap: 4 }}>
                        <Tooltip title={`Pending: ${data.pending}`}>
                          <div style={{ width: 20, background: '#faad14', height: `${(data.pending / stats.maxTotal) * 100}%`, transition: 'height 0.3s' }} />
                        </Tooltip>
                        <Tooltip title={`Approved: ${data.approved}`}>
                          <div style={{ width: 20, background: '#52c41a', height: `${(data.approved / stats.maxTotal) * 100}%`, transition: 'height 0.3s' }} />
                        </Tooltip>
                        <Tooltip title={`Rejected: ${data.rejected}`}>
                          <div style={{ width: 20, background: '#ff4d4f', height: `${(data.rejected / stats.maxTotal) * 100}%`, transition: 'height 0.3s' }} />
                        </Tooltip>
                      </div>
                      <Text strong style={{ marginTop: 12, textAlign: 'center', height: 40, display: 'block' }}>{data.name}</Text>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 20 }}>
                  <Badge color="#faad14" text="Pending" />
                  <Badge color="#52c41a" text="Approved" />
                  <Badge color="#ff4d4f" text="Rejected" />
                </div>
              </Card>
            </TabPane>
          </Tabs>
        </Space>
      </Card>

      {/* DRAWER: THÊM / SỬA CÂU LẠC BỘ */}
      <Drawer 
        title={editingClubId ? "Chỉnh sửa Câu lạc bộ" : "Thêm mới Câu lạc bộ"} 
        width={500} 
        visible={isClubDrawerVisible} 
        onClose={() => {
          setIsClubDrawerVisible(false);
          setEditingClubId(null);
        }} 
      >
        <Form form={formClub} layout="vertical" onFinish={handleSaveClub}>
          <Form.Item label="Ảnh đại diện" name="avatar" valuePropName="fileList" getValueFromEvent={normFile}>
            <Upload 
              name="logo" 
              listType="picture" 
              beforeUpload={() => false} 
              maxCount={1}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Bấm để tải ảnh lên (Tối đa 1 ảnh)</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="name" label="Tên Câu lạc bộ" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="president" label="Chủ nhiệm" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả (Hỗ trợ HTML)"><TextArea rows={4} placeholder="<strong>Ví dụ</strong>" /></Form.Item>
          <Form.Item name="isActive" valuePropName="checked"><Checkbox>Hoạt động</Checkbox></Form.Item>
          
          <Divider />
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              {editingClubId ? "Cập nhật thông tin" : "Lưu Câu lạc bộ"}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      {/* MODAL: TỪ CHỐI ĐƠN CÓ LÝ DO */}
      <Modal title="Xác nhận Từ chối" visible={rejectModalVisible} onCancel={() => setRejectModalVisible(false)} onOk={() => formReject.submit()} okText="Xác nhận từ chối" okButtonProps={{ danger: true }}>
        <Form form={formReject} layout="vertical" onFinish={submitReject}>
          <Form.Item name="reason" label="Lý do từ chối (Bắt buộc)" rules={[{ required: true, message: 'Vui lòng nhập lý do để lưu lịch sử!' }]}>
            <TextArea rows={3} placeholder="Ví dụ: Không đủ kỹ năng chuyên môn..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL: LỊCH SỬ THAO TÁC */}
      <Modal title="Lịch sử xử lý đơn" visible={historyModalVisible} onCancel={() => setHistoryModalVisible(false)} footer={null}>
        {selectedHistory.length === 0 ? <Text type="secondary">Chưa có thao tác nào.</Text> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {selectedHistory.map((h, i) => (
              <Card key={i} size="small" style={{ borderLeft: `4px solid ${h.action === 'Approved' ? '#52c41a' : '#ff4d4f'}` }}>
                <Text type="secondary">{h.time}</Text><br/>
                <Text strong>Hành động: </Text> <Tag color={h.action === 'Approved' ? 'success' : 'error'}>{h.action}</Tag><br/>
                {h.reason && <><Text strong>Lý do: </Text> <Text type="danger">{h.reason}</Text></>}
              </Card>
            ))}
          </div>
        )}
      </Modal>

      {/* MODAL: CHUYỂN CLB CHO THÀNH VIÊN */}
      <Modal title={`Chuyển CLB cho ${selectedAppKeys.length} thành viên`} visible={changeClubModalVisible} onCancel={() => setChangeClubModalVisible(false)} onOk={() => formChangeClub.submit()} okText="Xác nhận chuyển">
        <Form form={formChangeClub} layout="vertical" onFinish={handleChangeClubSubmit}>
          <Form.Item name="newClubId" label="Chọn Câu lạc bộ muốn chuyển đến" rules={[{ required: true }]}>
            <Select>
              {clubs.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
};

export default TH05;