import React, { useState, useMemo } from 'react';
import {
  Layout, Menu, Card, Row, Col, Input, Select, Tag, Button,
  Table, Progress, Alert, Statistic, Empty, Typography,
  Avatar, Space, Modal, Form, InputNumber, Divider, Slider, Rate, Tabs, Popconfirm, Upload, notification
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EnvironmentOutlined,
  WalletOutlined, SettingOutlined, SearchOutlined,
  DashboardOutlined, CalendarOutlined, CheckCircleOutlined,
  UploadOutlined, EditOutlined, FireOutlined, ArrowUpOutlined, ArrowDownOutlined,
  EyeOutlined
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// ==========================================
// 1. INTERFACES & TYPES
// ==========================================
interface Costs {
  food: number;
  stay: number;
  travel: number;
}

interface Destination {
  id: string;
  name: string;
  type: string;
  rating: number;
  image: string;
  desc: string;
  visitTime: number; 
  costs: Costs;
}

interface PlanItem extends Destination {
  uid: string;
  day: number;
}

// ==========================================
// 2. MOCK DATA
// ==========================================
const INITIAL_DESTINATIONS: Destination[] = [
  {
    id: 'd1', name: 'Vịnh Hạ Long', type: 'Biển', rating: 4.8, 
    image: 'https://www.dulichhalong.net/wp-content/uploads/2020/07/Vinh-Ha-Long-Quang-Ninh.jpg',
    desc: 'Di sản thiên nhiên thế giới, trải nghiệm du thuyền 5 sao ngắm hoàng hôn tuyệt đẹp trên vịnh.', visitTime: 4,
    costs: { food: 500000, stay: 1500000, travel: 500000 }
  },
  {
    id: 'd2', name: 'Phố Cổ Hội An', type: 'Thành phố', rating: 4.5, 
    image: 'https://dulichbandonghanh.com/wp-content/uploads/2023/03/Hoian-dem-2.gif    ',
    desc: 'Đô thị cổ xưa, thưởng thức cao lầu, dạo bước trên những con phố rợp bóng đèn lồng thơ mộng.', visitTime: 3,
    costs: { food: 300000, stay: 800000, travel: 100000 }
  },
  {
    id: 'd3', name: 'Fansipan Sapa', type: 'Núi', rating: 4.7, 
    image: 'https://booking.muongthanh.com/upload_images/images/H%60/dinh-nui-fansipan.jpg',
    desc: 'Chinh phục nóc nhà Đông Dương bằng cáp treo, săn mây trên đỉnh núi hùng vĩ.', visitTime: 5,
    costs: { food: 400000, stay: 1000000, travel: 800000 }
  },
  {
    id: 'd4', name: 'Vinpearl Phú Quốc', type: 'Biển', rating: 4.6, 
    image: 'https://hethongvinpearlresort.com/img_data/images/combo-vinpearl-phu-quoc.jpg',
    desc: 'Tổ hợp vui chơi giải trí hàng đầu với công viên nước, safari và bãi biển xanh ngắt.', visitTime: 6,
    costs: { food: 800000, stay: 2000000, travel: 700000 }
  },
  {
    id: 'd5', name: 'Đà Lạt', type: 'Núi', rating: 4.6, 
    image: 'https://hoadalattravel.vn/wp-content/uploads/2024/09/da-lat.jpeg',
    desc: 'Thành phố ngàn hoa, tận hưởng không khí mát mẻ quanh năm và những quán cafe cực chill.', visitTime: 4,
    costs: { food: 400000, stay: 900000, travel: 200000 }
  }
];

const getDestTotal = (dest: Destination) => dest.costs.food + dest.costs.stay + dest.costs.travel;

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
const TH06: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [destinations, setDestinations] = useState<Destination[]>(INITIAL_DESTINATIONS);
  
  // --- States: Home (Explore) ---
  const [searchText, setSearchText] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(5000000);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('default');
  
  // States: Modal Chi Tiết & Modal Thêm Lịch
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedDestDetail, setSelectedDestDetail] = useState<Destination | null>(null);
  
  const [isDayModalVisible, setIsDayModalVisible] = useState(false);
  const [selectedDestToAdd, setSelectedDestToAdd] = useState<Destination | null>(null);
  const [selectedDayToAdd, setSelectedDayToAdd] = useState<number>(1);

  // --- States: Planner & Budget ---
  const [itinerary, setItinerary] = useState<PlanItem[]>([]);
  const [budgetLimit, setBudgetLimit] = useState<number>(10000000);
  
  // --- States: Admin ---
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<Destination | null>(null);
  const [form] = Form.useForm();

  // ==========================================
  // LOGIC
  // ==========================================
  const stats = useMemo(() => {
    let totalTime = 0, totalFood = 0, totalStay = 0, totalTravel = 0;
    itinerary.forEach(item => {
      totalTime += item.visitTime;
      totalFood += item.costs.food;
      totalStay += item.costs.stay;
      totalTravel += item.costs.travel;
    });
    return { totalTime, totalFood, totalStay, totalTravel, totalSpent: totalFood + totalStay + totalTravel };
  }, [itinerary]);

  const budgetDistribution = useMemo(() => {
    if (stats.totalSpent === 0) return [];
    return [
      { name: 'Ăn uống', value: stats.totalFood, percent: (stats.totalFood / stats.totalSpent) * 100, color: '#ff4d4f' },
      { name: 'Lưu trú', value: stats.totalStay, percent: (stats.totalStay / stats.totalSpent) * 100, color: '#1890ff' },
      { name: 'Di chuyển', value: stats.totalTravel, percent: (stats.totalTravel / stats.totalSpent) * 100, color: '#52c41a' },
    ];
  }, [stats]);

  const daysInPlan = useMemo(() => {
    const maxDay = itinerary.length > 0 ? Math.max(...itinerary.map(i => i.day)) : 1;
    return Array.from({ length: Math.max(3, maxDay + 1) }, (_, i) => i + 1);
  }, [itinerary]);

  // ==========================================
  // ACTIONS
  // ==========================================
  const handleShowDetail = (dest: Destination) => {
    setSelectedDestDetail(dest);
    setIsDetailModalVisible(true);
  };

  const handleOpenAddModal = (dest: Destination) => {
    setSelectedDestToAdd(dest);
    setIsDayModalVisible(true);
    setIsDetailModalVisible(false); // Đóng modal chi tiết nếu đang mở
  };

  const handleConfirmAddToPlan = () => {
    if (selectedDestToAdd) {
      setItinerary([...itinerary, { ...selectedDestToAdd, uid: `plan_${Date.now()}`, day: selectedDayToAdd }]);
      
      // UX Tốt: Thông báo góc màn hình chỉ rõ nơi lưu
      notification.success({
        message: 'Đã lưu vào lịch trình!',
        description: `Địa điểm ${selectedDestToAdd.name} đã được thêm vào Ngày ${selectedDayToAdd}. Hãy mở menu "Tạo lịch trình du lịch" để xem tổng chi phí.`,
        placement: 'bottomRight',
        duration: 4,
      });
      
      setIsDayModalVisible(false);
    }
  };

  const handleRemoveFromPlan = (uid: string) => {
    setItinerary(itinerary.filter(i => i.uid !== uid));
    notification.info({ message: 'Đã xóa điểm đến', placement: 'bottomRight', duration: 2 });
  };

  const handleMovePlanItem = (index: number, direction: 'up' | 'down', day: number) => {
    const dayItems = itinerary.filter(i => i.day === day);
    const newItinerary = [...itinerary];
    if (direction === 'up' && index > 0) {
      const globalIdx1 = itinerary.findIndex(i => i.uid === dayItems[index].uid);
      const globalIdx2 = itinerary.findIndex(i => i.uid === dayItems[index - 1].uid);
      [newItinerary[globalIdx1], newItinerary[globalIdx2]] = [newItinerary[globalIdx2], newItinerary[globalIdx1]];
    } else if (direction === 'down' && index < dayItems.length - 1) {
      const globalIdx1 = itinerary.findIndex(i => i.uid === dayItems[index].uid);
      const globalIdx2 = itinerary.findIndex(i => i.uid === dayItems[index + 1].uid);
      [newItinerary[globalIdx1], newItinerary[globalIdx2]] = [newItinerary[globalIdx2], newItinerary[globalIdx1]];
    }
    setItinerary(newItinerary);
  };

  const handleAdminSubmit = (values: any) => {
    const formattedCosts: Costs = { food: values.food, stay: values.stay, travel: values.travel };
    const newDest: Destination = {
      id: editingDest ? editingDest.id : `d_${Date.now()}`,
      name: values.name, type: values.type, rating: values.rating || 5,
      image: 'https://picsum.photos/800/500?random=' + Math.random(),
      desc: values.desc, visitTime: values.visitTime, costs: formattedCosts
    };

    if (editingDest) {
      setDestinations(destinations.map(d => d.id === editingDest.id ? newDest : d));
      notification.success({ message: "Cập nhật thành công!", placement: 'bottomRight' });
    } else {
      setDestinations([newDest, ...destinations]);
      notification.success({ message: "Đã thêm điểm đến mới!", placement: 'bottomRight' });
    }
    setIsAdminModalOpen(false);
    form.resetFields();
  };

  const handleDeleteDest = (id: string) => {
    setDestinations(destinations.filter(d => d.id !== id));
    setItinerary(itinerary.filter(i => i.id !== id));
    notification.success({ message: "Đã xóa hoàn toàn", placement: 'bottomRight' });
  };

  // ==========================================
  // RENDER: TRANG CHỦ
  // ==========================================
  const renderHome = () => {
    let filteredList = destinations.filter(d => {
      const passName = d.name.toLowerCase().includes(searchText.toLowerCase());
      const passType = filterType === 'All' || d.type === filterType;
      const passPrice = getDestTotal(d) <= maxPrice;
      const passRating = d.rating >= minRating;
      return passName && passType && passPrice && passRating;
    });

    if (sortBy === 'price_asc') filteredList.sort((a, b) => getDestTotal(a) - getDestTotal(b));
    if (sortBy === 'price_desc') filteredList.sort((a, b) => getDestTotal(b) - getDestTotal(a));
    if (sortBy === 'rating_desc') filteredList.sort((a, b) => b.rating - a.rating);

    return (
      <div style={{ padding: '24px' }}>
        {/* Bộ lọc */}
        <Card style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={6}><Input placeholder="Tìm kiếm..." prefix={<SearchOutlined />} onChange={e => setSearchText(e.target.value)} /></Col>
            <Col xs={24} md={4}>
              <Select defaultValue="All" style={{ width: '100%' }} onChange={setFilterType}>
                <Option value="All">Tất cả loại hình</Option><Option value="Biển">Biển</Option><Option value="Núi">Núi</Option><Option value="Thành phố">Thành phố</Option>
              </Select>
            </Col>
            <Col xs={24} md={6}>
               <Text type="secondary">Mức giá tối đa: {maxPrice.toLocaleString()}đ</Text>
               <Slider min={500000} max={10000000} step={500000} value={maxPrice} onChange={setMaxPrice} />
            </Col>
            <Col xs={24} md={4}>
               <Select defaultValue="default" style={{ width: '100%' }} onChange={setSortBy}>
                  <Option value="default">Sắp xếp mặc định</Option><Option value="price_asc">Giá tăng dần</Option>
                  <Option value="price_desc">Giá giảm dần</Option><Option value="rating_desc">Đánh giá cao nhất</Option>
               </Select>
            </Col>
            <Col xs={24} md={4}><Text type="secondary">Đánh giá từ:</Text><Rate allowHalf value={minRating} onChange={setMinRating} style={{ display: 'block' }} /></Col>
          </Row>
        </Card>

        {/* Danh sách thẻ */}
        <Row gutter={[24, 24]}>
          {filteredList.map(item => (
            <Col xs={24} sm={12} lg={8} xl={6} key={item.id}>
              <Card
                hoverable
                style={{ borderRadius: 12, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
                bodyStyle={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}
                cover={
                  <div 
                    style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden' }} 
                    onClick={() => handleShowDetail(item)}
                    title="Nhấn để xem chi tiết"
                  >
                    {/* Đã tăng height ảnh lên 260px */}
                    <img alt={item.name} src={item.image} style={{ height: 260, width: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} className="card-img-zoom" />
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.1)' }} />
                    <Tag color="gold" style={{ position: 'absolute', top: 12, right: 12, fontWeight: 'bold', fontSize: 14, padding: '4px 8px' }}>⭐ {item.rating}</Tag>
                    <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
                       <Tag color={item.type === 'Biển' ? 'blue' : item.type === 'Núi' ? 'green' : 'orange'}>{item.type}</Tag>
                    </div>
                  </div>
                }
              >
                <div style={{ flex: 1 }}>
                  <Title level={5} style={{ margin: '0 0 8px 0', fontSize: 18 }}>{item.name}</Title>
                  <Text type="danger" strong style={{ fontSize: 20, display: 'block', marginBottom: 12 }}>
                    {getDestTotal(item).toLocaleString()} VNĐ
                  </Text>
                  <Paragraph type="secondary" ellipsis={{ rows: 2 }}>{item.desc}</Paragraph>
                </div>
                {/* Nút bấm được làm full viền ngang, rõ ràng */}
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={(e) => { e.stopPropagation(); handleOpenAddModal(item); }} 
                  style={{ width: '100%', height: 40, borderRadius: 8, fontSize: 15, marginTop: 'auto' }}
                >
                  Thêm Lịch Trình
                </Button>
              </Card>
            </Col>
          ))}
          {filteredList.length === 0 && <Col span={24}><Empty description="Không tìm thấy điểm đến phù hợp" /></Col>}
        </Row>

        {/* Modal Xem Chi Tiết Điểm Đến */}
        <Modal
          title={<span style={{ fontSize: 20 }}>{selectedDestDetail?.name}</span>}
          visible={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          width={700}
          footer={[
            <Button key="back" onClick={() => setIsDetailModalVisible(false)} size="large">Đóng</Button>,
            <Button key="submit" type="primary" size="large" icon={<PlusOutlined />} onClick={() => handleOpenAddModal(selectedDestDetail!)}>
              Chọn đi địa điểm này
            </Button>,
          ]}
        >
          {selectedDestDetail && (
            <div>
              <img src={selectedDestDetail.image} alt={selectedDestDetail.name} style={{ width: '100%', height: 350, objectFit: 'cover', borderRadius: 12, marginBottom: 20 }} />
              <Space size="large" style={{ marginBottom: 16 }}>
                <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>{selectedDestDetail.type}</Tag>
                <Text strong style={{ fontSize: 16 }}><FireOutlined style={{ color: '#faad14' }}/> Đánh giá: {selectedDestDetail.rating}/5</Text>
                <Text strong style={{ fontSize: 16 }}><CalendarOutlined /> Thời gian: {selectedDestDetail.visitTime} giờ</Text>
              </Space>
              <Paragraph style={{ fontSize: 16, lineHeight: 1.6 }}>{selectedDestDetail.desc}</Paragraph>
              <Divider orientation="left">Bóc tách chi phí</Divider>
              <Row gutter={16} style={{ textAlign: 'center' }}>
                <Col span={8}>
                  <Card size="small" style={{ background: '#fff1f0', textAlign: 'center', borderColor: '#ffa39e' }}>
                    <Statistic title="Ăn uống" value={selectedDestDetail.costs.food} suffix="đ" valueStyle={{ color: '#cf1322', fontSize: 18 }} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" style={{ background: '#e6f7ff', textAlign: 'center', borderColor: '#91d5ff' }}>
                    <Statistic title="Lưu trú" value={selectedDestDetail.costs.stay} suffix="đ" valueStyle={{ color: '#096dd9', fontSize: 18 }} />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" style={{ background: '#f6ffed', textAlign: 'center', borderColor: '#b7eb8f' }}>
                    <Statistic title="Di chuyển" value={selectedDestDetail.costs.travel} suffix="đ" valueStyle={{ color: '#389e0d', fontSize: 18 }} />
                  </Card>
                </Col>
              </Row>
              <div style={{ textAlign: 'right', marginTop: 16 }}>
                <Text style={{ fontSize: 18 }}>Tổng cộng: </Text>
                <Text type="danger" strong style={{ fontSize: 24 }}>{getDestTotal(selectedDestDetail).toLocaleString()} VNĐ</Text>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal Chọn Ngày Thêm */}
        <Modal title="Lưu vào lịch trình cá nhân" visible={isDayModalVisible} onCancel={() => setIsDayModalVisible(false)} onOk={handleConfirmAddToPlan} okText="Xác nhận lưu">
          <Text style={{ fontSize: 16 }}>Bạn muốn đi <Text strong type="warning">{selectedDestToAdd?.name}</Text> vào ngày thứ mấy?</Text>
          <div style={{ marginTop: 20 }}>
            <Select style={{ width: '100%', height: 40 }} value={selectedDayToAdd} onChange={setSelectedDayToAdd}>
              {daysInPlan.map(day => <Option key={day} value={day}>Lịch trình: Ngày thứ {day}</Option>)}
            </Select>
          </div>
        </Modal>
      </div>
    );
  };

  // ==========================================
  // RENDER: PLANNER & ADMIN (Giữ nguyên cấu trúc xịn xò)
  // ==========================================
  const renderPlanner = () => (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={15}>
          <Card title={<Space><CalendarOutlined /> Lịch trình du lịch</Space>} style={{ borderRadius: 12 }}>
            <Tabs defaultActiveKey="1" type="card">
              {daysInPlan.map(day => {
                const dayItems = itinerary.filter(i => i.day === day);
                const dayCost = dayItems.reduce((sum, item) => sum + getDestTotal(item), 0);
                const dayTime = dayItems.reduce((sum, item) => sum + item.visitTime, 0);

                return (
                  <TabPane tab={`Ngày ${day}`} key={day}>
                    <div style={{ marginBottom: 16, background: '#f6ffed', padding: '12px', borderRadius: 8 }}>
                      <Text strong>Tổng chi phí ngày: <Text type="danger">{dayCost.toLocaleString()}đ</Text> | Tổng thời gian: {dayTime} giờ</Text>
                    </div>
                    {dayItems.length === 0 ? <Empty description={`Ngày ${day} chưa có điểm đến. Hãy quay lại trang chủ để thêm!`} /> : (
                      <Table
                        dataSource={dayItems}
                        rowKey="uid"
                        pagination={false}
                        columns={[
                          { title: 'STT', render: (_, __, index) => index + 1, width: 50 },
                          { title: 'Địa điểm', dataIndex: 'name', render: (t, r) => <Space><Avatar src={r.image} shape="square" />{t}</Space> },
                          { title: 'TG', dataIndex: 'visitTime', render: v => `${v}h` },
                          { title: 'Chi phí', render: (_, rec) => <Text strong>{getDestTotal(rec).toLocaleString()}đ</Text> },
                          { 
                            title: 'Thao tác', 
                            render: (_, rec, index) => (
                              <Space>
                                <Button size="small" icon={<ArrowUpOutlined />} onClick={() => handleMovePlanItem(index, 'up', day)} disabled={index === 0} />
                                <Button size="small" icon={<ArrowDownOutlined />} onClick={() => handleMovePlanItem(index, 'down', day)} disabled={index === dayItems.length - 1} />
                                <Popconfirm title="Bỏ điểm đến này?" onConfirm={() => handleRemoveFromPlan(rec.uid)}>
                                  <Button size="small" danger icon={<DeleteOutlined />} />
                                </Popconfirm>
                              </Space>
                            ) 
                          }
                        ]}
                      />
                    )}
                  </TabPane>
                );
              })}
            </Tabs>
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Card title={<Space><WalletOutlined /> Quản lý ngân sách</Space>} style={{ borderRadius: 12 }}>
             <div style={{ marginBottom: 16 }}>
                <Text type="secondary">Hạn mức chi tiêu (VNĐ): </Text>
                <InputNumber style={{ width: 150 }} value={budgetLimit} onChange={(val) => setBudgetLimit(val || 0)} step={1000000} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
             </div>
            <Statistic title="Tổng đã chi tiêu" value={stats.totalSpent} suffix={`/ ${budgetLimit.toLocaleString()}đ`} valueStyle={{ color: stats.totalSpent > budgetLimit ? '#cf1322' : '#3f8600', fontSize: 28, fontWeight: 'bold' }} />
            <Progress percent={Math.min(100, Math.round((stats.totalSpent / budgetLimit) * 100))} status={stats.totalSpent > budgetLimit ? "exception" : "active"} strokeWidth={14} style={{ margin: '12px 0' }} />
            {stats.totalSpent > budgetLimit && <Alert message={<Text strong type="danger">Cảnh báo: Vượt ngân sách!</Text>} description={`Đang vượt quá ${(stats.totalSpent - budgetLimit).toLocaleString()} VNĐ.`} type="error" showIcon style={{ marginBottom: 24 }} />}
            <Divider orientation="left">Phân bổ chi tiêu</Divider>
            {stats.totalSpent > 0 ? (
              <div>
                <div style={{ display: 'flex', height: 20, borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
                  {budgetDistribution.map(item => <div key={item.name} style={{ width: `${item.percent}%`, backgroundColor: item.color }} title={`${item.name}: ${item.percent.toFixed(1)}%`} />)}
                </div>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {budgetDistribution.map(item => (
                    <li key={item.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Space><span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: item.color, display: 'inline-block' }} /> <Text>{item.name}</Text></Space>
                      <Space><Text type="secondary">{item.percent.toFixed(1)}%</Text> <Text strong>{item.value.toLocaleString()}đ</Text></Space>
                    </li>
                  ))}
                </ul>
              </div>
            ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có chi phí" />}
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderAdmin = () => {
    return (
      <div style={{ padding: '24px' }}>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}><Card style={{ background: '#e6f7ff', borderRadius: 12 }}><Statistic title="Tổng điểm đến" value={destinations.length} prefix={<EnvironmentOutlined />} /></Card></Col>
          <Col span={6}><Card style={{ background: '#f6ffed', borderRadius: 12 }}><Statistic title="Lượt lịch trình tạo ra" value={itinerary.length} prefix={<CheckCircleOutlined />} /></Card></Col>
          <Col span={6}><Card style={{ background: '#fffbe6', borderRadius: 12 }}><Statistic title="Điểm đến Hot" value="Phú Quốc" prefix={<FireOutlined style={{ color: '#faad14' }} />} /></Card></Col>
          <Col span={6}><Card style={{ background: '#fff1f0', borderRadius: 12 }}><Statistic title="Doanh thu dự kiến" value={destinations.reduce((s, d) => s + getDestTotal(d), 0)} suffix="đ" valueStyle={{ fontSize: 18 }} /></Card></Col>
        </Row>
        <Card title="Quản lý Dữ liệu" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingDest(null); form.resetFields(); setIsAdminModalOpen(true); }}>Thêm địa điểm</Button>} style={{ borderRadius: 12 }}>
          <Table 
            dataSource={destinations} rowKey="id" scroll={{ x: 1000 }}
            columns={[
              { title: 'Ảnh', dataIndex: 'image', render: (src) => <Avatar src={src} shape="square" size="large" /> },
              { title: 'Tên', dataIndex: 'name', render: t => <Text strong>{t}</Text> },
              { title: 'Loại', dataIndex: 'type', render: t => <Tag color="blue">{t}</Tag> },
              { title: 'Tổng Chi', render: (_, r) => <Text type="danger" strong>{getDestTotal(r).toLocaleString()}đ</Text> },
              { 
                title: 'Hành động', fixed: 'right',
                render: (_, rec) => (
                  <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingDest(rec); form.setFieldsValue({ ...rec, food: rec.costs.food, stay: rec.costs.stay, travel: rec.costs.travel }); setIsAdminModalOpen(true); }} />
                    <Popconfirm title="Xóa?" onConfirm={() => handleDeleteDest(rec.id)}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>
                  </Space>
                ) 
              }
            ]}
          />
        </Card>
        <Modal title={editingDest ? "Sửa địa điểm" : "Thêm mới"} visible={isAdminModalOpen} onCancel={() => setIsAdminModalOpen(false)} onOk={() => form.submit()} width={700}>
          <Form form={form} layout="vertical" onFinish={handleAdminSubmit}>
            <Row gutter={16}>
              <Col span={16}><Form.Item name="name" label="Tên" rules={[{ required: true }]}><Input /></Form.Item></Col>
              <Col span={8}><Form.Item name="type" label="Loại" rules={[{ required: true }]}><Select><Option value="Biển">Biển</Option><Option value="Núi">Núi</Option><Option value="Thành phố">Thành phố</Option></Select></Form.Item></Col>
            </Row>
            <Form.Item name="desc" label="Mô tả"><Input.TextArea rows={2} /></Form.Item>
            <Row gutter={16}>
              <Col span={6}><Form.Item name="visitTime" label="Giờ"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={6}><Form.Item name="food" label="Ăn uống"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={6}><Form.Item name="stay" label="Lưu trú"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={6}><Form.Item name="travel" label="Di chuyển"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
          </Form>
        </Modal>
      </div>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{` .card-img-zoom:hover { transform: scale(1.05); } `}</style>
      <Sider width={260} theme="light" style={{ borderRight: '1px solid #e8e8e8', position: 'fixed', height: '100vh', left: 0 }}>
        <div style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <Title level={3} style={{ color: '#1890ff', margin: 0 }}>S-LINK TRAVEL</Title>
        </div>
        <Menu mode="inline" selectedKeys={[currentTab]} onClick={({ key }) => setCurrentTab(key)} style={{ padding: '16px 0', borderRight: 0, fontSize: 15 }}>
          <Menu.Item key="home" icon={<DashboardOutlined />}>Khám phá điểm đến</Menu.Item>
          <Menu.Item key="planner" icon={<CalendarOutlined />}>
            Tạo lịch trình 
            {itinerary.length > 0 && <Tag color="error" style={{ marginLeft: 10, borderRadius: 10 }}>{itinerary.length}</Tag>}
          </Menu.Item>
          <Menu.Item key="admin" icon={<SettingOutlined />}>Quản lý hệ thống</Menu.Item>
        </Menu>
        <div style={{ position: 'absolute', bottom: 20, width: '100%', padding: '0 20px' }}>
          <div style={{ background: '#e6f7ff', padding: '12px 16px', borderRadius: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Sinh viên thực hiện:</Text><br/>
            <Text strong style={{ fontSize: 15, color: '#0050b3' }}>Hoàng Đình Khải</Text>
          </div>
        </div>
      </Sider>

      <Layout style={{ marginLeft: 260 }}>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', zIndex: 1 }}>
          <Title level={4} style={{ margin: 0, color: '#262626' }}>
            {currentTab === 'home' ? 'Trang chủ' : currentTab === 'planner' ? 'Kế hoạch của bạn' : 'Quản trị viên'}
          </Title>
          <Space size="large">
            <Button type="primary" shape="round" icon={<WalletOutlined />} onClick={() => setCurrentTab('planner')}>
              Đã chọn: {itinerary.length} địa điểm
            </Button>
            <Avatar style={{ backgroundColor: '#1890ff' }} size="large">K</Avatar>
          </Space>
        </Header>
        <Content style={{ background: '#f5f7fa', minHeight: 'calc(100vh - 64px)' }}>
          {currentTab === 'home' && renderHome()}
          {currentTab === 'planner' && renderPlanner()}
          {currentTab === 'admin' && renderAdmin()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default TH06;