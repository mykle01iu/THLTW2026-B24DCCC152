import React, { useState } from 'react';
import {
  Card, Tabs, Table, Button, Form, Input, Select, 
  DatePicker, Space, Divider, Typography, message, 
  Tag, InputNumber, Descriptions, Alert, Row, Col, 
  Statistic, Drawer, Popconfirm, Tooltip
} from 'antd';
import {
  PlusOutlined, SearchOutlined, SettingOutlined, 
  FileDoneOutlined, BookOutlined, IdcardOutlined,
  DeleteOutlined, EyeOutlined, CheckCircleOutlined,
  TrophyOutlined, UserOutlined, FileTextOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

/** --- ĐỊNH NGHĨA KIỂU DỮ LIỆU --- **/
interface CauHinhTruong { id: string; tenTruong: string; kieuDuLieu: 'String' | 'Number' | 'Date'; }
interface QuyetDinh { id: string; soQD: string; ngayBanHanh: string; trichYeu: string; idSoVanBang: string; tongLuotTraCuu: number; }
interface SoVanBang { id: string; tenSo: string; nam: number; soVaoSoHienTai: number; }
interface VanBang { id: string; soHieu: string; soVaoSo: number; maSinhVien: string; hoTen: string; ngaySinh: string; idQuyetDinh: string; duLieuPhu: Record<string, any>; }

const TH04: React.FC = () => {
  /** --- STATE HỆ THỐNG MẪU --- **/
  const [dsSoVanBang, setDsSoVanBang] = useState<SoVanBang[]>([{ id: 'S2026', tenSo: 'Sổ văn bằng năm 2026', nam: 2026, soVaoSoHienTai: 125 }]);
  const [dsQuyetDinh, setDsQuyetDinh] = useState<QuyetDinh[]>([
    { id: 'QD01', soQD: '1024/QĐ-PTIT', ngayBanHanh: '2026-03-20', trichYeu: 'Công nhận tốt nghiệp hệ Chính quy', idSoVanBang: 'S2026', tongLuotTraCuu: 42 }
  ]);
  const [dsCauHinh, setDsCauHinh] = useState<CauHinhTruong[]>([
    { id: 'dt', tenTruong: 'Dân tộc', kieuDuLieu: 'String' },
    { id: 'ns', tenTruong: 'Nơi sinh', kieuDuLieu: 'String' },
    { id: 'dtb', tenTruong: 'Điểm trung bình', kieuDuLieu: 'Number' },
    { id: 'xl', tenTruong: 'Xếp loại', kieuDuLieu: 'String' }
  ]);
  const [dsVanBang, setDsVanBang] = useState<VanBang[]>([
    { id: 'VB01', soHieu: 'A00125', soVaoSo: 125, maSinhVien: 'B21DCCN001', hoTen: 'Hoàng Đình Khải', ngaySinh: '01/01/2004', idQuyetDinh: 'QD01', duLieuPhu: { dt: 'Kinh', ns: 'Hà Nội', dtb: 3.6, xl: 'Giỏi' } }
  ]);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [ketQuaTraCuu, setKetQuaTraCuu] = useState<VanBang | null>(null);

  const [formVB] = Form.useForm();
  const [formCauHinh] = Form.useForm();
  const [formTraCuu] = Form.useForm();

  /** --- LOGIC NGHIỆP VỤ --- **/

  // 1. Tab 1: Cấp văn bằng mới
  const handleCapBang = (values: any): void => {
    const qd = dsQuyetDinh.find(q => q.id === values.idQuyetDinh);
    const soVB = dsSoVanBang.find(s => s.id === qd?.idSoVanBang);
    
    if (!soVB) {
      message.error("Lỗi hệ thống: Không xác định được sổ văn bằng!");
      return;
    }

    const soVaoSoMoi = soVB.soVaoSoHienTai + 1;
    const vbMoi: VanBang = {
      id: `VB${Date.now()}`,
      soHieu: values.soHieu,
      soVaoSo: soVaoSoMoi,
      maSinhVien: values.maSinhVien,
      hoTen: values.hoTen,
      ngaySinh: values.ngaySinh.format('DD/MM/YYYY'),
      idQuyetDinh: values.idQuyetDinh,
      duLieuPhu: values.duLieuPhu || {},
    };

    setDsVanBang([vbMoi, ...dsVanBang]);
    setDsSoVanBang(prev => prev.map(s => s.id === soVB.id ? { ...s, soVaoSoHienTai: soVaoSoMoi } : s));
    setIsDrawerOpen(false);
    formVB.resetFields();
    message.success({ content: `Đã cấp bằng thành công! Số vào sổ: ${soVaoSoMoi}`, icon: <CheckCircleOutlined /> });
  };

  // Xóa văn bằng
  const handleXoaBang = (id: string): void => {
    setDsVanBang(dsVanBang.filter(vb => vb.id !== id));
    message.success("Đã xóa văn bằng khỏi hệ thống");
  };

  // 2. Tab 2: Xử lý Thêm/Xóa cấu hình phụ lục
  const handleThemCauHinh = (values: any): void => {
    const isExist = dsCauHinh.find(c => c.tenTruong.toLowerCase() === values.tenTruong.toLowerCase());
    if (isExist) {
      message.error("Trường thông tin này đã tồn tại!");
      return;
    }
    
    setDsCauHinh([...dsCauHinh, { id: `field_${Date.now()}`, ...values }]);
    formCauHinh.resetFields();
    message.success("Đã thêm cấu hình mới. Form nhập liệu đã được cập nhật.");
  };

  const handleXoaCauHinh = (id: string): void => {
    setDsCauHinh(dsCauHinh.filter(c => c.id !== id));
    message.success("Đã xóa trường cấu hình");
  };

  // 3. Tab 3: Tra cứu văn bằng
  const handleTraCuu = (values: any): void => {
    const keys = Object.keys(values).filter(k => values[k]);
    if (keys.length < 2) {
      message.warning("Bảo mật: Yêu cầu nhập ít nhất 2 tham số để tra cứu (VD: Mã SV và Họ tên)");
      return;
    }

    const match = dsVanBang.find(vb => 
      (values.soHieu && vb.soHieu === values.soHieu) ||
      (values.maSinhVien && vb.maSinhVien === values.maSinhVien) ||
      (values.hoTen && vb.hoTen.toLowerCase().includes(values.hoTen.toLowerCase()))
    );

    if (match) {
      setDsQuyetDinh(prev => prev.map(q => q.id === match.idQuyetDinh ? { ...q, tongLuotTraCuu: q.tongLuotTraCuu + 1 } : q));
      setKetQuaTraCuu(match);
      message.success("Xác thực thành công! Đã tìm thấy văn bằng.");
    } else {
      setKetQuaTraCuu(null);
      message.error("Không tìm thấy dữ liệu khớp trên hệ thống PTIT.");
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      
      {/* KHU VỰC THỐNG KÊ (DASHBOARD TỔNG QUAN) */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic title="Tổng số Văn bằng đã cấp" value={dsVanBang.length} prefix={<TrophyOutlined style={{color: '#faad14'}} />} valueStyle={{ color: '#faad14', fontWeight: 'bold' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic title="Quyết định Tốt nghiệp" value={dsQuyetDinh.length} prefix={<FileTextOutlined style={{color: '#1890ff'}} />} valueStyle={{ color: '#1890ff', fontWeight: 'bold' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Statistic title="Tổng lượt tra cứu hệ thống" value={dsQuyetDinh.reduce((sum, q) => sum + q.tongLuotTraCuu, 0)} prefix={<SearchOutlined style={{color: '#52c41a'}}/>} valueStyle={{ color: '#52c41a', fontWeight: 'bold' }} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={3} style={{ margin: 0, color: '#001529' }}><BookOutlined /> HỆ THỐNG QUẢN LÝ SỔ VĂN BẰNG (S-LINK)</Title>
            <Text type="secondary">Phân hệ chuyên viên Quản lý - Học viện Công nghệ Bưu chính Viễn thông</Text>
          </div>
          
          <Tabs defaultActiveKey="1" size="large">
            
            {/* TAB 1: DANH SÁCH VÀ CẤP BẰNG */}
            <TabPane tab={<span><FileDoneOutlined /> Quản lý văn bằng</span>} key="1">
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Input.Search placeholder="Tìm nhanh theo Họ tên / MSV..." style={{ width: 300 }} allowClear />
                <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setIsDrawerOpen(true)}>
                  Cấp văn bằng mới
                </Button>
              </div>
              <Table 
                dataSource={dsVanBang} 
                rowKey="id"
                pagination={{ pageSize: 5 }}
                columns={[
                  { title: 'Số hiệu', dataIndex: 'soHieu', key: 'soHieu', render: t => <strong>{t}</strong> },
                  { title: 'Số vào sổ', dataIndex: 'soVaoSo', key: 'soVaoSo', render: (val) => <Tag color="volcano">{val}</Tag> },
                  { title: 'Mã SV', dataIndex: 'maSinhVien', key: 'maSinhVien', render: t => <Tag color="blue">{t}</Tag> },
                  { title: 'Họ và tên', dataIndex: 'hoTen', key: 'hoTen' },
                  { title: 'Ngày sinh', dataIndex: 'ngaySinh', key: 'ngaySinh' },
                  { 
                    title: 'Thao tác', 
                    align: 'center',
                    render: (_, record) => (
                      <Space>
                        <Tooltip title="Xem chi tiết"><Button type="text" icon={<EyeOutlined style={{color: '#1890ff'}} />} /></Tooltip>
                        <Popconfirm title="Bạn có chắc chắn muốn xóa văn bằng này?" onConfirm={() => handleXoaBang(record.id)}>
                          <Tooltip title="Xóa"><Button type="text" danger icon={<DeleteOutlined />} /></Tooltip>
                        </Popconfirm>
                      </Space>
                    ) 
                  },
                ]}
              />
            </TabPane>

            {/* TAB 2: CẤU HÌNH PHỤ LỤC */}
            <TabPane tab={<span><SettingOutlined /> Cấu hình phụ lục</span>} key="2">
              <Row gutter={24}>
                <Col span={8}>
                  <Card title="Thêm trường thông tin mới" size="small" style={{ background: '#fafafa' }}>
                    <Form form={formCauHinh} layout="vertical" onFinish={handleThemCauHinh}>
                      <Form.Item label="Tên trường (VD: Xếp hạng)" name="tenTruong" rules={[{ required: true, message: 'Vui lòng nhập tên trường' }]}>
                        <Input placeholder="Nhập tên trường thông tin" />
                      </Form.Item>
                      <Form.Item label="Kiểu dữ liệu" name="kieuDuLieu" initialValue="String">
                        <Select>
                          <Select.Option value="String">Văn bản (String)</Select.Option>
                          <Select.Option value="Number">Số (Number)</Select.Option>
                          <Select.Option value="Date">Ngày tháng (Date)</Select.Option>
                        </Select>
                      </Form.Item>
                      <Button type="primary" block icon={<PlusOutlined />} htmlType="submit">Lưu cấu hình</Button>
                    </Form>
                  </Card>
                </Col>
                <Col span={16}>
                  <Table 
                    dataSource={dsCauHinh}
                    rowKey="id"
                    pagination={false}
                    columns={[
                      { title: 'Tên trường thông tin', dataIndex: 'tenTruong', render: t => <b>{t}</b> },
                      { 
                        title: 'Kiểu dữ liệu hệ thống', 
                        dataIndex: 'kieuDuLieu', 
                        render: (t) => <Tag color={t==='String'?'blue':t==='Number'?'cyan':'purple'}>{t}</Tag> 
                      },
                      { 
                        title: 'Thao tác', 
                        align: 'center',
                        render: (_, record) => (
                          <Popconfirm title="Xóa trường này có thể ảnh hưởng đến form nhập liệu?" onConfirm={() => handleXoaCauHinh(record.id)}>
                            <Button type="link" danger icon={<DeleteOutlined />}>Gỡ bỏ</Button>
                          </Popconfirm>
                        ) 
                      }
                    ]}
                  />
                </Col>
              </Row>
            </TabPane>

            {/* TAB 3: TRA CỨU */}
            <TabPane tab={<span><SearchOutlined /> Tra cứu văn bằng</span>} key="3">
              <Row gutter={24} justify="center">
                <Col span={20}>
                  <Card style={{ background: '#fafafa', borderColor: '#d9d9d9' }}>
                    <Form form={formTraCuu} layout="vertical" onFinish={handleTraCuu}>
                      <Row gutter={16}>
                        <Col span={8}><Form.Item label="Số hiệu văn bằng" name="soHieu"><Input prefix={<IdcardOutlined />} placeholder="Nhập số hiệu..." size="large" /></Form.Item></Col>
                        <Col span={8}><Form.Item label="Mã sinh viên" name="maSinhVien"><Input prefix={<UserOutlined />} placeholder="Nhập mã sinh viên..." size="large" /></Form.Item></Col>
                        <Col span={8}><Form.Item label="Họ tên sinh viên" name="hoTen"><Input placeholder="Nhập họ và tên..." size="large" /></Form.Item></Col>
                      </Row>
                      <Alert message="Lưu ý: Để đảm bảo bảo mật, người dùng cần cung cấp chính xác ít nhất 02 thông tin để tra cứu." type="info" showIcon style={{ marginBottom: 16 }} />
                      <div style={{ textAlign: 'center' }}>
                        <Button type="primary" size="large" icon={<SearchOutlined />} htmlType="submit" style={{ width: 200 }}>TRA CỨU VĂN BẰNG</Button>
                      </div>
                    </Form>
                  </Card>
                </Col>
              </Row>

              {ketQuaTraCuu && (
                <Row justify="center" style={{ marginTop: 32 }}>
                  <Col span={16}>
                    {/* GIAO DIỆN PHÔI BẰNG ẢO */}
                    <Card style={{ border: '2px solid #cf1322', borderRadius: 8, background: '#fff1f0', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 20, right: 20, opacity: 0.1, fontSize: 100 }}><TrophyOutlined /></div>
                      <Title level={4} style={{ textAlign: 'center', color: '#cf1322', textTransform: 'uppercase' }}>Học viện Công nghệ Bưu chính Viễn thông</Title>
                      <Divider style={{ borderColor: '#cf1322' }} />
                      <Descriptions title="THÔNG TIN CHI TIẾT VĂN BẰNG" column={2} labelStyle={{ fontWeight: 'bold' }}>
                        <Descriptions.Item label="Họ và tên sinh viên"><Text strong style={{ fontSize: 16, color: '#1890ff' }}>{ketQuaTraCuu.hoTen}</Text></Descriptions.Item>
                        <Descriptions.Item label="Mã sinh viên">{ketQuaTraCuu.maSinhVien}</Descriptions.Item>
                        <Descriptions.Item label="Ngày sinh">{ketQuaTraCuu.ngaySinh}</Descriptions.Item>
                        <Descriptions.Item label="Số hiệu văn bằng"><Tag color="red">{ketQuaTraCuu.soHieu}</Tag></Descriptions.Item>
                        <Descriptions.Item label="Số vào sổ">{ketQuaTraCuu.soVaoSo}</Descriptions.Item>
                        <Descriptions.Item label="Quyết định TN">{dsQuyetDinh.find(q=>q.id===ketQuaTraCuu.idQuyetDinh)?.soQD}</Descriptions.Item>
                        {/* Render dữ liệu phụ động */}
                        {dsCauHinh.map(c => (
                          <Descriptions.Item key={c.id} label={c.tenTruong}>
                            {ketQuaTraCuu.duLieuPhu[c.id] ? <Text strong>{String(ketQuaTraCuu.duLieuPhu[c.id])}</Text> : <Text type="secondary">---</Text>}
                          </Descriptions.Item>
                        ))}
                      </Descriptions>
                    </Card>
                  </Col>
                </Row>
              )}
            </TabPane>
          </Tabs>
        </Space>
      </Card>

      {/* DRAWER: FORM CẤP BẰNG XỊN SÒ */}
      <Drawer
        title={<span style={{ fontSize: 18 }}><IdcardOutlined /> CẤP VĂN BẰNG MỚI</span>}
        width={720}
        onClose={() => setIsDrawerOpen(false)}
        visible={isDrawerOpen}
        bodyStyle={{ paddingBottom: 80 }}
        extra={
          <Space>
            <Button onClick={() => setIsDrawerOpen(false)}>Hủy</Button>
            <Button onClick={() => formVB.submit()} type="primary" icon={<CheckCircleOutlined />}>Lưu & Cấp bằng</Button>
          </Space>
        }
      >
        <Form form={formVB} layout="vertical" onFinish={handleCapBang} requiredMark="optional">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label={<b>Quyết định Tốt nghiệp</b>} name="idQuyetDinh" rules={[{ required: true, message: 'Bắt buộc chọn quyết định' }]}>
                <Select placeholder="-- Chọn quyết định tốt nghiệp --" size="large">
                  {dsQuyetDinh.map(q => <Select.Option key={q.id} value={q.id}>{q.soQD} - {q.trichYeu}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ borderColor: '#1890ff' }}><Text type="secondary">I. THÔNG TIN ĐỊNH DANH BẰNG</Text></Divider>
          <Row gutter={16}>
            <Col span={12}><Form.Item label="Số hiệu văn bằng" name="soHieu" rules={[{ required: true, message: 'Nhập số hiệu' }]}><Input size="large" placeholder="VD: B00123" /></Form.Item></Col>
            <Col span={12}>
              <Form.Item label={<span>Số vào sổ <Tooltip title="Số này hệ thống tự động sinh theo sổ hiện hành"><Alert message="Auto-Increment" type="success" style={{display:'inline-flex', padding: '0 8px', marginLeft: 8}} /></Tooltip></span>}>
                <Input size="large" value="[Hệ thống tự động tăng]" disabled style={{ background: '#f5f5f5', color: '#000' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ borderColor: '#1890ff' }}><Text type="secondary">II. THÔNG TIN SINH VIÊN</Text></Divider>
          <Row gutter={16}>
            <Col span={12}><Form.Item label="Mã sinh viên" name="maSinhVien" rules={[{ required: true, message: 'Nhập MSV' }]}><Input size="large" placeholder="B21DCCN..." /></Form.Item></Col>
            <Col span={12}><Form.Item label="Họ và tên" name="hoTen" rules={[{ required: true, message: 'Nhập họ tên' }]}><Input size="large" placeholder="Nguyễn Văn A" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item label="Ngày sinh" name="ngaySinh" rules={[{ required: true, message: 'Chọn ngày sinh' }]}><DatePicker size="large" style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" /></Form.Item></Col>
          </Row>

          {dsCauHinh.length > 0 && (
            <>
              <Divider orientation="left" style={{ borderColor: '#1890ff' }}><Text type="secondary">III. THÔNG TIN PHỤ LỤC BẰNG (CẤU HÌNH ĐỘNG)</Text></Divider>
              <Row gutter={16}>
                {dsCauHinh.map(c => (
                  <Col span={12} key={c.id}>
                    <Form.Item label={c.tenTruong} name={['duLieuPhu', c.id]}>
                      {c.kieuDuLieu === 'Date' ? <DatePicker size="large" style={{ width: '100%' }} format="DD/MM/YYYY" placeholder={`Chọn ${c.tenTruong.toLowerCase()}`} />
                       : c.kieuDuLieu === 'Number' ? <InputNumber size="large" style={{ width: '100%' }} placeholder={`Nhập số cho ${c.tenTruong.toLowerCase()}`} />
                       : <Input size="large" placeholder={`Nhập ${c.tenTruong.toLowerCase()}...`} />}
                    </Form.Item>
                  </Col>
                ))}
              </Row>
            </>
          )}
        </Form>
      </Drawer>
    </div>
  );
};

export default TH04;