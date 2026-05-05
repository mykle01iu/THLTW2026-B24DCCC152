import { useEffect, useMemo, useState } from "react";
import {
  Layout, Menu, Card, Row, Col, Statistic, Button, Modal, Form,
  Input, DatePicker, Select, Tag, Table, Space, message, Badge, 
  Progress, Avatar
} from "antd";
import {
  PlusOutlined, CheckCircleTwoTone, ClockCircleTwoTone, ExclamationCircleTwoTone,
  EditOutlined, DeleteOutlined, ProjectOutlined, TableOutlined, 
  DashboardOutlined, SearchOutlined, FireOutlined, UserOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import styled from "styled-components";

const { Header, Content, Sider } = Layout;

const StyledCard = styled(Card)<any>`
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  }
`;

const KanbanColumn = styled.div<any>`
  background: #f4f5f7;
  border-radius: 16px;
  padding: 16px;
  min-height: 75vh;
  border: 1px solid #e1e4e8;
`;

const TaskCard = styled.div<any>`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border-left: 4px solid #1890ff;
  cursor: grab;
  &:active { cursor: grabbing; }
`;

type Status = "todo" | "doing" | "done";
type Priority = "Cao" | "Trung bình" | "Thấp";

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  priority: Priority;
  status: Status;
}

const STORAGE_KEY = "PRO_TASK_MANAGER_FINAL";

export default function ProfessionalTaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState("dashboard");
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<string | undefined>(undefined);

  useEffect(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) setTasks(JSON.parse(data));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const doneCount = tasks.filter(t => t.status === "done").length;
    const overdueCount = tasks.filter(t => dayjs(t.deadline).isBefore(dayjs(), 'day') && t.status !== "done").length;
    const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0;
    return { total, doneCount, overdueCount, percent };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => 
      t.title.toLowerCase().includes(search.toLowerCase()) &&
      (!filterPriority || t.priority === filterPriority)
    );
  }, [tasks, search, filterPriority]);

  const openModal = (task?: Task) => {
    setEditing(task || null);
    setVisible(true);
    if (task) {
      form.setFieldsValue({ ...task, deadline: dayjs(task.deadline) });
    } else {
      form.resetFields();
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const taskData: Task = {
        id: editing?.id || `task-${Date.now()}`,
        ...values,
        deadline: values.deadline.format("YYYY-MM-DD"),
        status: editing?.status || "todo",
      };

      setTasks(prev => editing 
        ? prev.map(t => t.id === editing.id ? taskData : t)
        : [taskData, ...prev]
      );
      setVisible(false);
      message.success(editing ? "Đã cập nhật công việc!" : "Đã thêm công việc mới!");
    } catch (err) {
      console.error("Validate failed:", err);
    }
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    message.warning("Đã xóa công việc");
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    setTasks(prev => prev.map(t => 
      t.id === draggableId ? { ...t, status: destination.droppableId as Status } : t
    ));
  };

  const getPriorityColor = (p: Priority) => {
    if (p === "Cao") return "#ff4d4f";
    if (p === "Trung bình") return "#faad14";
    return "#52c41a";
  };

  const columns = [
    { title: "Tên công việc", dataIndex: "title", key: "title", render: (text: string) => <b style={{ color: '#1890ff' }}>{text}</b> },
    { title: "Hạn chót", dataIndex: "deadline", key: "deadline" },
    { title: "Độ ưu tiên", dataIndex: "priority", key: "priority", render: (p: Priority) => <Tag color={getPriorityColor(p)}>{p}</Tag> },
    { title: "Trạng thái", dataIndex: "status", key: "status", render: (s: Status) => <Tag color={s === "done" ? "green" : "blue"}>{s.toUpperCase()}</Tag> },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: Task) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} type="link" />
          <Button icon={<DeleteOutlined />} onClick={() => deleteTask(record.id)} type="link" danger />
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0" theme="light" style={{ boxShadow: "2px 0 8px rgba(0,0,0,0.05)" }}>
        <div style={{ padding: "24px", textAlign: "center" }}>
          <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff', marginBottom: 12 }} />
          <h3 style={{ margin: 0 }}>Work Station</h3>
          <Tag color="green">Premium</Tag>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[view]}
          onClick={(e) => setView(e.key)}
          items={[
            { key: "dashboard", icon: <DashboardOutlined />, label: "Tổng quan" },
            { key: "kanban", icon: <ProjectOutlined />, label: "Bảng Kanban" },
            { key: "list", icon: <TableOutlined />, label: "Danh sách" },
          ]}
        />
        <div style={{ padding: '20px', marginTop: 'auto' }}>
          <div style={{ marginBottom: 8, fontSize: 12 }}>Tiến độ chung</div>
          <Progress percent={stats.percent} size="small" status="active" />
        </div>
      </Sider>

      <Layout>
        <Header style={{ background: "#fff", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            Quản Lý Task <Badge count={stats.total} style={{ backgroundColor: '#1890ff' }} offset={[10, -5]} />
          </div>
          <Space>
            <Input 
              prefix={<SearchOutlined />} 
              placeholder="Tìm nhanh..." 
              onChange={e => setSearch(e.target.value)}
              style={{ width: 200, borderRadius: 20 }}
            />
            <Button type="primary" shape="round" icon={<PlusOutlined />} onClick={() => openModal()}>
              Thêm Task
            </Button>
          </Space>
        </Header>

        <Content style={{ padding: "24px" }}>
          {view === "dashboard" && (
            <Row gutter={[16, 16]}>
              <Col span={8}><StyledCard><Statistic title="Đang thực hiện" value={stats.total - stats.doneCount} prefix={<ClockCircleTwoTone />} /></StyledCard></Col>
              <Col span={8}><StyledCard><Statistic title="Hoàn thành" value={stats.doneCount} prefix={<CheckCircleTwoTone twoToneColor="#52c41a" />} /></StyledCard></Col>
              <Col span={8}><StyledCard><Statistic title="Quá hạn" value={stats.overdueCount} prefix={<ExclamationCircleTwoTone twoToneColor="#ff4d4f" />} /></StyledCard></Col>
              <Col span={24}>
                <StyledCard title="Công việc gần đây">
                  <Table dataSource={filteredTasks.slice(0, 5)} columns={columns.slice(0, 4)} pagination={false} rowKey="id" />
                </StyledCard>
              </Col>
            </Row>
          )}

          {view === "kanban" && (
            <DragDropContext onDragEnd={onDragEnd}>
              <Row gutter={16}>
                {(["todo", "doing", "done"] as Status[]).map(status => (
                  <Col span={8} key={status}>
                    <KanbanColumn>
                      <h4 style={{ marginBottom: 16, textTransform: 'uppercase', color: '#666' }}>
                        {status === "todo" ? "Chờ làm" : status === "doing" ? "Đang làm" : "✅ Xong"}
                      </h4>
                      <Droppable droppableId={status}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: 400 }}>
                            {tasks.filter(t => t.status === status).map((task, index) => (
                              <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(prov) => (
                                  <TaskCard
                                    ref={prov.innerRef}
                                    {...prov.draggableProps}
                                    {...prov.dragHandleProps}
                                    style={{
                                      ...prov.draggableProps.style,
                                      borderLeftColor: getPriorityColor(task.priority) 
                                    }}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                      <b>{task.title}</b>
                                      <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openModal(task)} />
                                    </div>
                                    <p style={{ fontSize: 12, color: '#888', margin: '8px 0' }}>{task.description}</p>
                                    <Tag color={getPriorityColor(task.priority)} icon={<FireOutlined />}>{task.priority}</Tag>
                                    <div style={{ fontSize: 11, marginTop: 8, color: '#aaa' }}>Hạn: {task.deadline}</div>
                                  </TaskCard>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </KanbanColumn>
                  </Col>
                ))}
              </Row>
            </DragDropContext>
          )}

          {view === "list" && (
            <StyledCard>
              <div style={{ marginBottom: 16 }}>
                <Select placeholder="Lọc mức độ" allowClear style={{ width: 150 }} onChange={setFilterPriority}>
                  <Select.Option value="Cao">Cao</Select.Option>
                  <Select.Option value="Trung bình">Trung bình</Select.Option>
                  <Select.Option value="Thấp">Thấp</Select.Option>
                </Select>
              </div>
              <Table rowKey="id" columns={columns} dataSource={filteredTasks} />
            </StyledCard>
          )}
        </Content>
      </Layout>

      <Modal
        title={editing ? "Cập nhật Task" : "Tạo Task mới"}
        visible={visible}
        onOk={handleSave}
        onCancel={() => setVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Cần nhập tên task!' }]}>
            <Input placeholder="Tên công việc..." />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea placeholder="Chi tiết công việc..." rows={3} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="deadline" label="Hạn chót" rules={[{ required: true }]}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Độ ưu tiên" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="Cao">Cao</Select.Option>
                  <Select.Option value="Trung bình">Trung bình</Select.Option>
                  <Select.Option value="Thấp">Thấp</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Layout>
  );
}