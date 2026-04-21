import { useState, useEffect } from "react";
import {
    Card,
    Input,
    Button,
    List,
    Space,
    InputNumber,
    Typography,
    Tag,
    message,
    Divider,
} from "antd";

const { Title, Text } = Typography;

interface Subject {
    id: number;
    name: string;
    hours: number;
    target: number;
}

const QuanLyMonHoc = () => {
    const [monHoc, setMonHoc] = useState<Subject[]>([]);
    const [monHocMoi, setMonHocMoi] = useState<string>("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [tenDangSua, setTenDangSua] = useState<string>("");
    const [tongMucTieu, setTongMucTieu] = useState<number>(50);

    useEffect(() => {
        const data = localStorage.getItem("monHoc");
        const totalTarget = localStorage.getItem("tongMucTieu");

        if (data) setMonHoc(JSON.parse(data));
        if (totalTarget) setTongMucTieu(Number(totalTarget));
    }, []);

    useEffect(() => {
        localStorage.setItem("monHoc", JSON.stringify(monHoc));
        localStorage.setItem("tongMucTieu", tongMucTieu.toString());
    }, [monHoc, tongMucTieu]);

    const themMonHoc = () => {
        if (!monHocMoi.trim()) {
            message.warning("Vui lòng nhập tên môn học");
            return;
        }

        const newItem: Subject = {
            id: Date.now(),
            name: monHocMoi,
            hours: 0,
            target: 10,
        };

        setMonHoc([...monHoc, newItem]);
        setMonHocMoi("");
    };

    const xoaMonHoc = (id: number) => {
        setMonHoc(monHoc.filter((item) => item.id !== id));
    };

    const updateGio = (id: number, value: number | null) => {
        setMonHoc(
            monHoc.map((item) =>
                item.id === id ? { ...item, hours: value || 0 } : item
            )
        );
    };

    const updateMucTieu = (id: number, value: number | null) => {
        setMonHoc(
            monHoc.map((item) =>
                item.id === id ? { ...item, target: value || 0 } : item
            )
        );
    };

    const batDauSua = (item: Subject) => {
        setEditingId(item.id);
        setTenDangSua(item.name);
    };

    const luuSua = (id: number) => {
        setMonHoc(
            monHoc.map((item) =>
                item.id === id ? { ...item, name: tenDangSua } : item
            )
        );
        setEditingId(null);
    };

    const tongGio = monHoc.reduce((sum, item) => sum + item.hours, 0);

    return (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 50 }}>
            <Card style={{ width: 750 }}>
                <Title level={3}>Quản Lý Tiến Độ Học Tập</Title>

                <Space style={{ marginBottom: 20 }}>
                    <Input
                        placeholder="Nhập tên môn học"
                        value={monHocMoi}
                        onChange={(e) => setMonHocMoi(e.target.value)}
                    />
                    <Button type="primary" onClick={themMonHoc}>
                        Thêm
                    </Button>
                </Space>

                <List
                    bordered
                    dataSource={monHoc}
                    renderItem={(item) => {
                        const completed = item.hours >= item.target;

                        return (
                            <List.Item
                                actions={[
                                    <Button onClick={() => batDauSua(item)}>
                                        Sửa
                                    </Button>,
                                    <Button danger onClick={() => xoaMonHoc(item.id)}>
                                        Xóa
                                    </Button>,
                                ]}
                            >
                                <Space direction="vertical" style={{ width: "100%" }}>
                                    {editingId === item.id ? (
                                        <Space>
                                            <Input
                                                value={tenDangSua}
                                                onChange={(e) =>
                                                    setTenDangSua(e.target.value)
                                                }
                                            />
                                            <Button
                                                type="primary"
                                                onClick={() => luuSua(item.id)}
                                            >
                                                Lưu
                                            </Button>
                                        </Space>
                                    ) : (
                                        <Text strong>{item.name}</Text>
                                    )}

                                    <Space>
                                        <Text>Giờ đã học:</Text>
                                        <InputNumber
                                            min={0}
                                            value={item.hours}
                                            onChange={(value) =>
                                                updateGio(item.id, value)
                                            }
                                        />
                                    </Space>

                                    <Space>
                                        <Text>Mục tiêu tháng:</Text>
                                        <InputNumber
                                            min={0}
                                            value={item.target}
                                            onChange={(value) =>
                                                updateMucTieu(item.id, value)
                                            }
                                        />
                                    </Space>

                                    {completed ? (
                                        <Tag color="green">Đã đạt mục tiêu</Tag>
                                    ) : (
                                        <Tag color="red">Chưa đạt</Tag>
                                    )}
                                </Space>
                            </List.Item>
                        );
                    }}
                />

                <Divider />

                <Title level={4}>Mục tiêu tổng tháng</Title>

                <Space>
                    <Text>Tổng mục tiêu:</Text>
                    <InputNumber
                        min={0}
                        value={tongMucTieu}
                        onChange={(value) => setTongMucTieu(value || 0)}
                    />
                </Space>

                <div style={{ marginTop: 10 }}>
                    <Text strong>Tổng giờ đã học: {tongGio}</Text>
                </div>

                {tongGio >= tongMucTieu ? (
                    <Tag color="green" style={{ marginTop: 10 }}>
                        Đã đạt mục tiêu tháng 
                    </Tag>
                ) : (
                    <Tag color="red" style={{ marginTop: 10 }}>
                        Chưa đạt mục tiêu tháng
                    </Tag>
                )}
            </Card>
        </div>
    );
};

export default QuanLyMonHoc;