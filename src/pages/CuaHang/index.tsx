import { Card, Row, Col, Button, Typography } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Meta } = Card;

const danhSachSanPham = [
  { id: 1, name: 'Laptop Gaming', price: '25.000.000đ', img: 'https://cdn.tgdd.vn/Files/2021/03/04/1332362/1_800x450.jpg' },
  { id: 2, name: 'Chuột không dây', price: '500.000đ', img: 'https://cdn.tgdd.vn/Products/Images/86/195376/chuot-khong-day-logitech-m170-den-thumb3-600x600.jpeg' },
  { id: 3, name: 'Bàn phím cơ', price: '1.200.000đ', img: 'https://via.placeholder.com/300' },
  { id: 4, name: 'Tai nghe chụp tai', price: '800.000đ', img: 'https://via.placeholder.com/300' },
];

const CuaHang = () => {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Khải Đinh Tech Shop</Title>
        <Button type="primary" icon={<ShoppingCartOutlined />}>
          Giỏ hàng (0)
        </Button>
      </div>

      <Row gutter={[20, 20]}>
        {danhSachSanPham.map((sp) => (
          <Col xs={24} sm={12} md={8} lg={6} key={sp.id}> 
          {/* xs: eXtra Small; sm: SMall; md: MeDium; lg: LarGe */}
            <Card
              hoverable
              cover={<img alt={sp.name} src={sp.img} style={{ height: 200, objectFit: 'cover' }} />}
              actions={[
                <Button type="text" key="add">Thêm vào giỏ</Button>,
                <Button type="primary" size="small" key="buy">Mua ngay</Button>
              ]}
            >
              <Meta title={sp.name} description={sp.price} />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CuaHang;