import React, { useEffect, useState } from "react";
import {
    Table,
    Input,
    Select,
    Button,
    Modal,
    Form,
    InputNumber,
    Space,
    Tag,
    message,
    Card,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

type Status = "Đang mở" | "Đã kết thúc" | "Tạm dừng";

interface Course {
    id: number;
    name: string;
    teacher: string;
    students: number;
    status: Status;
    description: string;
}

const fakeCourses: Course[] = [
    {
        id: 1,
        name: "Học nấu ăn với Chef Hải",
        teacher: "Nguyễn Văn Hải",
        students: 25,
        status: "Đang mở",
        description: "<b>Học nấu ăn cho công việc nội trợ của bạn</b>",
    },
    {
        id: 2,
        name: "NodeJS nâng cao",
        teacher: "Trần Công Chất",
        students: 0,
        status: "Tạm dừng",
        description: "Backend chuyên sâu",
    },
    {
        id: 3,
        name: "UI/UX Design",
        teacher: "Lê Quốc Đại",
        students: 40,
        status: "Đã kết thúc",
        description: "Thiết kế giao diện",
    },
];

const teachers = ["Nguyễn Văn Hải", "Trần Công Chất", "Lê Quốc Đại"];

const KTGK: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [search, setSearch] = useState("");
    const [debounce, setDebounce] = useState("");
    const [filterTeacher, setFilterTeacher] = useState<string>();
    const [filterStatus, setFilterStatus] = useState<string>();
    const [sort, setSort] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<Course | null>(null);
    const [form] = Form.useForm();

    // LOAD DATA
    useEffect(() => {
        setCourses(fakeCourses);
    }, []);

    // DEBOUNCE SEARCH
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebounce(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // FILTER
    const filtered = courses
        .filter((c) =>
            c.name.toLowerCase().includes(debounce.toLowerCase())
        )
        .filter((c) =>
            filterTeacher ? c.teacher === filterTeacher : true
        )
        .filter((c) =>
            filterStatus ? c.status === filterStatus : true
        )
        .sort((a, b) =>
            sort ? b.students - a.students : 0
        );

    // OPEN MODAL
    const openModal = (course?: Course) => {
        setIsModalOpen(true);

        if (course) {
            setEditing(course);
            form.setFieldsValue(course);
        } else {
            setEditing(null);
            form.resetFields();
        }
    };

    // SUBMIT FORM
    const onFinish = (values: any) => {
        const isDuplicate = courses.some(
            (c) =>
                c.name === values.name &&
                c.id !== editing?.id
        );

        if (isDuplicate) {
            message.error("Tên bị trùng");
            return;
        }

        if (editing) {
            setCourses((prev) =>
                prev.map((c) =>
                    c.id === editing.id
                        ? { ...editing, ...values }
                        : c
                )
            );
            message.success("Cập nhật OK");
        } else {
            setCourses((prev) => [
                ...prev,
                { id: Date.now(), ...values },
            ]);
            message.success("Thêm OK");
        }

        setIsModalOpen(false);
    };

    // DELETE
    const handleDelete = (course: Course) => {
        if (course.students > 0) {
            message.error("Không thể xóa (đã có HV)");
            return;
        }

        Modal.confirm({
            title: "Xóa khóa học?",
            onOk() {
                setCourses((prev) =>
                    prev.filter((c) => c.id !== course.id)
                );
                message.success("Đã xóa");
            },
        });
    };

    // TABLE
    const columns = [
        { title: "ID", dataIndex: "id", width: 70 },
        { title: "Tên", dataIndex: "name" },
        { title: "GV", dataIndex: "teacher" },
        { title: "HV", dataIndex: "students" },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: (s: Status) => {
                const color =
                    s === "Đang mở"
                        ? "green"
                        : s === "Đã kết thúc"
                            ? "red"
                            : "orange";
                return <Tag color={color}>{s}</Tag>;
            },
        },
        {
            title: "Action",
            render: (_: any, record: Course) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => openModal(record)}
                    />
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <Card title="Quản lý khóa học" style={{ margin: 20 }}>
            {/* TOOLBAR */}
            <Space style={{ marginBottom: 16 }}>
                <Input
                    placeholder="Search..."
                    onChange={(e) => setSearch(e.target.value)}
                />

                <Select
                    placeholder="GV"
                    allowClear
                    style={{ width: 150 }}
                    onChange={(v) => setFilterTeacher(v)}
                >
                    {teachers.map((t) => (
                        <Option key={t} value={t}>
                            {t}
                        </Option>
                    ))}
                </Select>

                <Select
                    placeholder="Trạng thái"
                    allowClear
                    style={{ width: 150 }}
                    onChange={(v) => setFilterStatus(v)}
                >
                    <Option value="Đang mở">Đang mở</Option>
                    <Option value="Đã kết thúc">Đã kết thúc</Option>
                    <Option value="Tạm dừng">Tạm dừng</Option>
                </Select>

                <Button onClick={() => setSort(!sort)}>
                    Sort HV
                </Button>

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => openModal()}
                >
                    Thêm
                </Button>
            </Space>

            {/* TABLE */}
            <Table
                rowKey="id"
                dataSource={filtered}
                columns={columns}
                pagination={{ pageSize: 5 }}
            />

            {/* MODAL */}
            <Modal
                title={editing ? "Sửa khóa học" : "Thêm khóa học"}
                visible={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        name="name"
                        label="Tên"
                        rules={[
                            { required: true, message: "Không được trống" },
                            { max: 100 },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="teacher"
                        label="GV"
                        rules={[{ required: true }]}
                    >
                        <Select>
                            {teachers.map((t) => (
                                <Option key={t} value={t}>
                                    {t}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="students" label="HV">
                        <InputNumber style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <TextArea />
                    </Form.Item>

                    <Form.Item name="status" label="Trạng thái">
                        <Select>
                            <Option value="Đang mở">Đang mở</Option>
                            <Option value="Đã kết thúc">Đã kết thúc</Option>
                            <Option value="Tạm dừng">Tạm dừng</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default KTGK;