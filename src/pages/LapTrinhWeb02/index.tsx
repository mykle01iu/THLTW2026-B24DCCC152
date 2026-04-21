import { useState } from "react";
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    message,
    Popconfirm,
    Tag,    
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

const LapTrinhWeb02 = () => {
    const [sanPham, setSanPham] = useState([
        { id: 1, name: "Laptop Dell XPS 13", category: 'Laptop', price: 25000000, quantity: 10 },
        { id: 2, name: "iPhone 15 Pro Max", category: 'Điện thoại', price: 30000000, quantity: 15 },
        { id: 3, name: "Samsung Galaxy S24", category: 'Điện thoại', price: 22000000, quantity: 20 },
        { id: 4, name: "iPad Air M2", category: 'Máy tính bảng', price: 18000000, quantity: 12 },
        { id: 5, name: "MacBook Air M3", category: 'Laptop', price: 28000000, quantity: 8 },
        { id: 6, name: 'AirPods Pro 2', category: 'Phụ kiện', price: 6000000, quantity: 0 },
        { id: 7, name: 'Samsung Galaxy Tab S9', category: 'Máy tính bảng', price: 15000000, quantity: 7 },
        { id: 8, name: 'Logitech MX Master 3', category: 'Phụ kiện', price: 2500000, quantity: 25 }, 
    ]);

    const [open, setOpen] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const sanPhamHienThi = sanPham.filter((item) =>
        item.name.toLowerCase().includes(keyword.toLowerCase())
    );

    const handleDelete = (id) => {
        setSanPham(sanPham.filter((item) => item.id !== id));
        message.success("Xóa sản phẩm thành công");
    };

    const onFinish = (values) => {
        setSanPham([
            ...sanPham,
            {
                id: Date.now(),
                name: values.name,
                category: values.category,
                price: values.price,
                quantity: values.quantity,
            },
        ]);
        message.success("Thêm sản phẩm thành công");
        setOpen(false);
    };

    const columns = [
        {
            title: "STT",
            render: (_, __, index) => index + 1 + (currentPage - 1) * 5 ,
        },
        {
            title: "Tên sản phẩm",
            dataIndex: "name",
        },
        {
            title: "Loại",
            dataIndex: "category",
        },
        {
            title: "Giá",
            dataIndex: "price",
            render: (price) => price.toLocaleString("vi-VN") + " đ",
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
        },
        {
            title: "Trạng thái",
            render: (_, record) => {
                if(record.quantity > 10) {
                    return <Tag color="green">Còn hàng</Tag>
                }
                if(record.quantity >= 1 && record.quantity <= 10) {
                    return <Tag color="yellow">Sắp hết</Tag>
                }
                else {
                    return <Tag color="red">Hết hàng</Tag>
                }
            }
        },
        {
            title: "Thao tác",
            render: (_, record) => (
                <Popconfirm
                    title="Bạn có chắc muốn xóa?"
                    onConfirm={() => handleDelete(record.id)}
                >
                    <Button danger>Xóa</Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Input.Search
                placeholder="Tìm kiếm sản phẩm"
                style={{ width: 300, marginBottom: 10 }}
                onChange={(e) => setKeyword(e.target.value)}
            />

            <Button
                type="primary"
                style={{ marginLeft: 10, marginBottom: 10 }}
                onClick={() => setOpen(true)}
                icon={<PlusOutlined/>}
            >
                Thêm sản phẩm
            </Button>

            <Table
                columns={columns}
                dataSource={sanPhamHienThi}
                rowKey="id"
                pagination={{pageSize: 5, onChange: (page) => setCurrentPage(page)}}
            />  

            <Modal
                title="Thêm sản phẩm"
                visible={open}
                onCancel={() => setOpen(false)}
                footer={null}
            >
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label="Tên sản phẩm"
                        name="name"
                        rules={[{ required: true, message: "Hãy nhập tên sản phẩm" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Loại"
                        name="category"
                        rules={[{required: true, message: "Hãy nhập loại sản phẩm"}]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        label="Giá"
                        name="price"
                        rules={[{ required: true, message: "Hãy nhập giá" }]}
                    >
                        <InputNumber min={1} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        label="Số lượng"
                        name="quantity"
                        rules={[{ required: true, message: "Hãy nhập số lượng" }]}
                    >
                        <InputNumber min={1} style={{ width: "100%" }} />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block>
                        Thêm
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default LapTrinhWeb02;
