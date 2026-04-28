import React, { useState, useMemo } from 'react';
import {
  Tabs, Card, Row, Col, Statistic, Table, Button, Space, Input, Select,
  DatePicker, Popconfirm, Tag, Modal, Form, Drawer, Progress, Segmented,
  Timeline, InputNumber, message, Typography, Divider
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EditOutlined, FireOutlined,
  CalendarOutlined, TrophyOutlined, CheckCircleOutlined, SearchOutlined
} from '@ant-design/icons';
import moment from 'moment';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

// --- 1. ĐỊNH NGHĨA INTERFACE CHO TYPESCRIPT ---
interface Workout {
  id: number;
  date: string;
  type: string;
  duration: number;
  calories: number;
  notes: string;
  status: string;
}

interface HealthLog {
  id: number;
  date: string;
  weight: number;
  height: number;
  restingHR: number;
  sleep: number;
}

interface Goal {
  id: number;
  name: string;
  type: string;
  targetValue: number;
  currentValue: number;
  deadline: string;
  status: string;
}

interface Exercise {
  id: number;
  name: string;
  muscle: string;
  difficulty: string;
  description: string;
  caloriesPerHour: number;
}

// --- 2. DỮ LIỆU MẪU ---
const initialWorkouts: Workout[] = [
  { id: 1, date: '2026-04-25', type: 'Cardio', duration: 45, calories: 400, notes: 'Chạy bộ công viên', status: 'Hoàn thành' },
  { id: 2, date: '2026-04-26', type: 'Strength', duration: 60, calories: 350, notes: 'Đẩy ngực, kéo xô', status: 'Hoàn thành' },
  { id: 3, date: '2026-04-28', type: 'HIIT', duration: 30, calories: 450, notes: 'Tập tại nhà', status: 'Bỏ lỡ' },
];

const initialHealthLogs: HealthLog[] = [
  { id: 1, date: '2026-04-01', weight: 70, height: 175, restingHR: 65, sleep: 7 },
  { id: 2, date: '2026-04-15', weight: 69, height: 175, restingHR: 64, sleep: 8 },
  { id: 3, date: '2026-04-28', weight: 68.5, height: 175, restingHR: 62, sleep: 7.5 },
];

const initialGoals: Goal[] = [
  { id: 1, name: 'Giảm mỡ bụng', type: 'Giảm cân', targetValue: 65, currentValue: 68.5, deadline: '2026-06-01', status: 'Đang thực hiện' },
  { id: 2, name: 'Chạy 5km', type: 'Cải thiện sức bền', targetValue: 5, currentValue: 3, deadline: '2026-05-15', status: 'Đang thực hiện' },
  { id: 3, name: 'Tập đều đặn', type: 'Khác', targetValue: 100, currentValue: 100, deadline: '2026-04-01', status: 'Đã đạt' },
];

const initialExercises: Exercise[] = [
  { id: 1, name: 'Push Up', muscle: 'Chest', difficulty: 'Trung bình', description: 'Chống đẩy cơ bản, giữ thẳng lưng.', caloriesPerHour: 400 },
  { id: 2, name: 'Squat', muscle: 'Legs', difficulty: 'Dễ', description: 'Ngồi xổm, giữ lưng thẳng, gập gối 90 độ.', caloriesPerHour: 450 },
  { id: 3, name: 'Plank', muscle: 'Core', difficulty: 'Trung bình', description: 'Giữ cơ thể trên cẳng tay và mũi chân.', caloriesPerHour: 300 },
  { id: 4, name: 'Pull Up', muscle: 'Back', difficulty: 'Khó', description: 'Kéo xà đơn.', caloriesPerHour: 500 },
];

// --- 3. HÀM TIỆN ÍCH CÓ TYPE ---
const calculateBMI = (weight: number, height: number): string | number => {
  if (!weight || !height) return 0;
  const heightM = height / 100;
  return (weight / (heightM * heightM)).toFixed(2);
};

const getBMITag = (bmi: number) => {
  if (bmi < 18.5) return <Tag color="blue">Thiếu cân</Tag>;
  if (bmi <= 24.9) return <Tag color="green">Bình thường</Tag>;
  if (bmi <= 29.9) return <Tag color="gold">Thừa cân</Tag>;
  return <Tag color="red">Béo phì</Tag>;
};

// --- COMPONENT CHÍNH ---
const TH08: React.FC = () => {
  // --- STATES CÓ TYPE ---
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts);
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>(initialHealthLogs);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [exercises] = useState<Exercise[]>(initialExercises);

  const [workoutSearch, setWorkoutSearch] = useState<string>('');
  const [workoutFilterType, setWorkoutFilterType] = useState<string>('All');

  const [goalStatusFilter, setGoalStatusFilter] = useState<string>('Tất cả');
  const [exerciseSearch, setExerciseSearch] = useState<string>('');
  const [exerciseMuscleFilter, setExerciseMuscleFilter] = useState<string>('All');

  const [isWorkoutModalVisible, setIsWorkoutModalVisible] = useState<boolean>(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  const [isHealthModalVisible, setIsHealthModalVisible] = useState<boolean>(false);
  const [editingHealth, setEditingHealth] = useState<HealthLog | null>(null);

  const [isGoalDrawerVisible, setIsGoalDrawerVisible] = useState<boolean>(false);

  const [exerciseDetailModal, setExerciseDetailModal] = useState<Exercise | null>(null);

  const [workoutForm] = Form.useForm();
  const [healthForm] = Form.useForm();
  const [goalForm] = Form.useForm();

  // --- THỐNG KÊ DASHBOARD ---
  const dashboardStats = useMemo(() => {
    const totalSessions = workouts.length;
    const totalCalories = workouts.reduce((sum, w) => sum + (w.status === 'Hoàn thành' ? w.calories : 0), 0);
    const completedGoals = goals.filter(g => g.status === 'Đã đạt').length;
    const goalCompletionRate = goals.length ? Math.round((completedGoals / goals.length) * 100) : 0;

    const barChartData = [
      { name: 'Tuần 1', sessions: workouts.filter(w => moment(w.date).date() <= 7).length },
      { name: 'Tuần 2', sessions: workouts.filter(w => moment(w.date).date() > 7 && moment(w.date).date() <= 14).length },
      { name: 'Tuần 3', sessions: workouts.filter(w => moment(w.date).date() > 14 && moment(w.date).date() <= 21).length },
      { name: 'Tuần 4', sessions: workouts.filter(w => moment(w.date).date() > 21).length },
    ];

    const maxSessions = Math.max(...barChartData.map(d => d.sessions), 1); // Tránh chia cho 0

    const lineChartData = [...healthLogs].sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf());

    return { totalSessions, totalCalories, streak: 3, goalCompletionRate, barChartData, maxSessions, lineChartData };
  }, [workouts, healthLogs, goals]);

  // --- HANDLERS ---
  const handleSaveWorkout = (values: any) => {
    const newWorkout: Workout = {
      ...values,
      date: values.date.format('YYYY-MM-DD'),
      id: editingWorkout ? editingWorkout.id : Date.now(),
    };
    if (editingWorkout) {
      setWorkouts(workouts.map(w => w.id === newWorkout.id ? newWorkout : w));
      message.success('Cập nhật buổi tập thành công!');
    } else {
      setWorkouts([newWorkout, ...workouts]);
      message.success('Thêm buổi tập thành công!');
    }
    setIsWorkoutModalVisible(false);
    workoutForm.resetFields();
  };

  const deleteWorkout = (id: number) => {
    setWorkouts(workouts.filter(w => w.id !== id));
    message.success('Đã xóa buổi tập');
  };

  const openWorkoutModal = (record: Workout | null = null) => {
    setEditingWorkout(record);
    if (record) {
      workoutForm.setFieldsValue({ ...record, date: moment(record.date, 'YYYY-MM-DD') });
    } else {
      workoutForm.resetFields();
    }
    setIsWorkoutModalVisible(true);
  };

  const handleSaveHealthLog = (values: any) => {
    const newLog: HealthLog = {
      ...values,
      date: values.date.format('YYYY-MM-DD'),
      id: editingHealth ? editingHealth.id : Date.now(),
    };
    if (editingHealth) {
      setHealthLogs(healthLogs.map(l => l.id === newLog.id ? newLog : l));
    } else {
      setHealthLogs([...healthLogs, newLog].sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf()));
    }
    setIsHealthModalVisible(false);
    healthForm.resetFields();
    message.success('Lưu chỉ số thành công!');
  };

  const deleteHealthLog = (id: number) => {
    setHealthLogs(healthLogs.filter(l => l.id !== id));
    message.success('Đã xóa chỉ số');
  };

  const handleSaveGoal = (values: any) => {
    const newGoal: Goal = {
      ...values,
      deadline: values.deadline.format('YYYY-MM-DD'),
      id: Date.now(),
      status: 'Đang thực hiện'
    };
    setGoals([...goals, newGoal]);
    setIsGoalDrawerVisible(false);
    goalForm.resetFields();
    message.success('Đã thêm mục tiêu mới');
  };

  const updateGoalProgress = (id: number, newVal: number | null) => {
    if (newVal === null) return;
    setGoals(goals.map(g => {
      if (g.id === id) {
        const updated = { ...g, currentValue: newVal };
        if (updated.currentValue >= updated.targetValue) updated.status = 'Đã đạt';
        return updated;
      }
      return g;
    }));
  };

  const deleteGoal = (id: number) => {
    setGoals(goals.filter(g => g.id !== id));
    message.success('Đã xóa mục tiêu');
  };

  // --- RENDERERS ---
  const renderDashboard = () => (
    <div className="dashboard-tab">
      <Row gutter={[16, 16]}>
        <Col span={6}><Card><Statistic title="Tổng buổi tập (Tháng)" value={dashboardStats.totalSessions} prefix={<CalendarOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Tổng Calo đã đốt" value={dashboardStats.totalCalories} suffix="kcal" prefix={<FireOutlined />} valueStyle={{ color: '#cf1322' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Streak (Ngày liên tiếp)" value={dashboardStats.streak} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#3f8600' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Mục tiêu hoàn thành" value={dashboardStats.goalCompletionRate} suffix="%" prefix={<TrophyOutlined />} valueStyle={{ color: '#1890ff' }} /></Card></Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="Số buổi tập theo tuần (Thay thế Biểu đồ cột)">
            {dashboardStats.barChartData.map(d => (
              <div key={d.name} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text>{d.name}</Text>
                  <Text type="secondary">{d.sessions} buổi</Text>
                </div>
                <Progress percent={Math.round((d.sessions / dashboardStats.maxSessions) * 100)} showInfo={false} strokeColor="#1890ff" />
              </div>
            ))}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Thay đổi cân nặng (Thay thế Biểu đồ đường)">
            <Timeline>
              {dashboardStats.lineChartData.map((log) => (
                <Timeline.Item key={log.id} color="green">
                  {log.date} - Cân nặng: <Text strong style={{ color: '#52c41a' }}>{log.weight} kg</Text> (BMI: {calculateBMI(log.weight, log.height)})
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>
      <Card title="Hoạt động gần đây (Timeline)" style={{ marginTop: 24 }}>
        <Timeline>
          {workouts.slice(0, 5).map(w => (
            <Timeline.Item key={w.id} color={w.status === 'Hoàn thành' ? 'green' : 'red'}>
              <Text strong>{w.date}</Text> - {w.type} ({w.duration} phút) - {w.notes || 'Không có ghi chú'}
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    </div>
  );

  const renderWorkoutLog = () => {
    const filteredWorkouts = workouts.filter(w => {
      const matchSearch = w.notes.toLowerCase().includes(workoutSearch.toLowerCase()) || w.type.toLowerCase().includes(workoutSearch.toLowerCase());
      const matchType = workoutFilterType === 'All' || w.type === workoutFilterType;
      return matchSearch && matchType;
    });

    const columns: ColumnsType<Workout> = [
      { title: 'Ngày tập', dataIndex: 'date', key: 'date' },
      { title: 'Loại bài tập', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color="geekblue">{t}</Tag> },
      { title: 'Thời lượng (p)', dataIndex: 'duration', key: 'duration' },
      { title: 'Calo đốt', dataIndex: 'calories', key: 'calories' },
      { title: 'Ghi chú', dataIndex: 'notes', key: 'notes' },
      { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'Hoàn thành' ? 'success' : 'error'}>{s}</Tag> },
      {
        title: 'Thao tác', key: 'action',
        render: (_: any, record: Workout) => (
          <Space>
            <Button type="link" icon={<EditOutlined />} onClick={() => openWorkoutModal(record)}>Sửa</Button>
            <Popconfirm title="Xóa buổi tập này?" onConfirm={() => deleteWorkout(record.id)}>
              <Button type="link" danger icon={<DeleteOutlined />}>Xóa</Button>
            </Popconfirm>
          </Space>
        )
      }
    ];

    return (
      <div>
        <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Input placeholder="Tìm kiếm bài tập..." prefix={<SearchOutlined />} onChange={e => setWorkoutSearch(e.target.value)} />
            <Select defaultValue="All" style={{ width: 150 }} onChange={(val) => setWorkoutFilterType(val as string)}>
              <Option value="All">Tất cả thể loại</Option><Option value="Cardio">Cardio</Option><Option value="Strength">Strength</Option>
              <Option value="Yoga">Yoga</Option><Option value="HIIT">HIIT</Option><Option value="Other">Khác</Option>
            </Select>
            <RangePicker />
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openWorkoutModal(null)}>Thêm buổi tập</Button>
        </Space>
        <Table columns={columns} dataSource={filteredWorkouts} rowKey="id" />

        <Modal title={editingWorkout ? "Sửa buổi tập" : "Thêm buổi tập mới"} visible={isWorkoutModalVisible} onCancel={() => setIsWorkoutModalVisible(false)} onOk={() => workoutForm.submit()}>
          <Form form={workoutForm} layout="vertical" onFinish={handleSaveWorkout}>
            <Form.Item name="date" label="Ngày tập" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="type" label="Loại bài tập" rules={[{ required: true }]}>
              <Select><Option value="Cardio">Cardio</Option><Option value="Strength">Strength</Option><Option value="Yoga">Yoga</Option><Option value="HIIT">HIIT</Option><Option value="Other">Other</Option></Select>
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="duration" label="Thời lượng (phút)" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="calories" label="Calo" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
              <Select><Option value="Hoàn thành">Hoàn thành</Option><Option value="Bỏ lỡ">Bỏ lỡ</Option></Select>
            </Form.Item>
            <Form.Item name="notes" label="Ghi chú"><TextArea rows={3} /></Form.Item>
          </Form>
        </Modal>
      </div>
    );
  };

  const renderHealthLog = () => {
    const columns: ColumnsType<HealthLog> = [
      { title: 'Ngày', dataIndex: 'date', key: 'date' },
      { title: 'Cân nặng (kg)', dataIndex: 'weight', key: 'weight' },
      { title: 'Chiều cao (cm)', dataIndex: 'height', key: 'height' },
      {
        title: 'BMI', key: 'bmi',
        render: (_: any, record: HealthLog) => {
          const bmi = Number(calculateBMI(record.weight, record.height));
          return <Space>{bmi} {getBMITag(bmi)}</Space>;
        }
      },
      { title: 'Nhịp tim nghỉ (bpm)', dataIndex: 'restingHR', key: 'restingHR' },
      { title: 'Giờ ngủ', dataIndex: 'sleep', key: 'sleep' },
      {
        title: 'Thao tác', key: 'action',
        render: (_: any, record: HealthLog) => (
          <Space>
            <Button type="link" icon={<EditOutlined />} onClick={() => {
              setEditingHealth(record);
              healthForm.setFieldsValue({ ...record, date: moment(record.date, 'YYYY-MM-DD') });
              setIsHealthModalVisible(true);
            }}>Sửa</Button>
            <Popconfirm title="Xóa chỉ số này?" onConfirm={() => deleteHealthLog(record.id)}>
              <Button type="link" danger icon={<DeleteOutlined />}>Xóa</Button>
            </Popconfirm>
          </Space>
        )
      }
    ];

    return (
      <div>
        <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }} onClick={() => { setEditingHealth(null); healthForm.resetFields(); setIsHealthModalVisible(true); }}>
          Thêm chỉ số sức khỏe
        </Button>
        <Table columns={columns} dataSource={healthLogs} rowKey="id" />

        <Modal title={editingHealth ? "Cập nhật chỉ số" : "Thêm chỉ số sức khỏe"} visible={isHealthModalVisible} onCancel={() => setIsHealthModalVisible(false)} onOk={() => healthForm.submit()}>
          <Form form={healthForm} layout="vertical" onFinish={handleSaveHealthLog}>
            <Form.Item name="date" label="Ngày ghi nhận" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="weight" label="Cân nặng (kg)" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="height" label="Chiều cao (cm)" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="restingHR" label="Nhịp tim lúc nghỉ (bpm)"><InputNumber min={30} style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="sleep" label="Giờ ngủ"><InputNumber min={0} step={0.5} style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
          </Form>
        </Modal>
      </div>
    );
  };

  const renderGoals = () => {
    const filteredGoals = goalStatusFilter === 'Tất cả' ? goals : goals.filter(g => g.status === goalStatusFilter);

    return (
      <div>
        <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Segmented options={['Tất cả', 'Đang thực hiện', 'Đã đạt', 'Đã hủy']} value={goalStatusFilter} onChange={(val) => setGoalStatusFilter(val.toString())} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsGoalDrawerVisible(true)}>Thêm mục tiêu</Button>
        </Space>
        <Row gutter={[16, 16]}>
          {filteredGoals.map(goal => {
            const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
            return (
              <Col span={8} key={goal.id}>
                <Card 
                  title={goal.name} 
                  extra={<Tag color={goal.status === 'Đã đạt' ? 'success' : goal.status === 'Đang thực hiện' ? 'processing' : 'error'}>{goal.status}</Tag>}
                  actions={[<Popconfirm title="Xóa mục tiêu?" onConfirm={() => deleteGoal(goal.id)}><Button type="text" danger icon={<DeleteOutlined />}>Xóa</Button></Popconfirm>]}
                >
                  <p><Text type="secondary">Loại: </Text> <Tag>{goal.type}</Tag></p>
                  <p><Text type="secondary">Deadline: </Text> {goal.deadline}</p>
                  <p><Text type="secondary">Tiến độ:</Text> {goal.currentValue} / {goal.targetValue}</p>
                  <Progress percent={percent} status={percent === 100 ? 'success' : 'active'} />
                  <Divider style={{ margin: '12px 0' }} />
                  <Space><Text>Cập nhật hiện tại:</Text><InputNumber min={0} value={goal.currentValue} onChange={(val) => updateGoalProgress(goal.id, val)} /></Space>
                </Card>
              </Col>
            );
          })}
        </Row>

        <Drawer title="Thêm mục tiêu mới" width={400} onClose={() => setIsGoalDrawerVisible(false)} visible={isGoalDrawerVisible} extra={<Button type="primary" onClick={() => goalForm.submit()}>Lưu</Button>}>
          <Form form={goalForm} layout="vertical" onFinish={handleSaveGoal}>
            <Form.Item name="name" label="Tên mục tiêu" rules={[{ required: true }]}><Input placeholder="VD: Giảm 5kg" /></Form.Item>
            <Form.Item name="type" label="Loại mục tiêu" rules={[{ required: true }]}><Select><Option value="Giảm cân">Giảm cân</Option><Option value="Tăng cơ">Tăng cơ</Option><Option value="Cải thiện sức bền">Cải thiện sức bền</Option><Option value="Khác">Khác</Option></Select></Form.Item>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="currentValue" label="Giá trị hiện tại" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="targetValue" label="Mục tiêu" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Form.Item name="deadline" label="Deadline" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
          </Form>
        </Drawer>
      </div>
    );
  };

  const renderExerciseLibrary = () => {
    const filteredExercises = exercises.filter(ex => {
      const matchSearch = ex.name.toLowerCase().includes(exerciseSearch.toLowerCase());
      const matchType = exerciseMuscleFilter === 'All' || ex.muscle === exerciseMuscleFilter;
      return matchSearch && matchType;
    });

    return (
      <div>
        <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Input placeholder="Tìm bài tập..." prefix={<SearchOutlined />} onChange={e => setExerciseSearch(e.target.value)} />
            <Select defaultValue="All" style={{ width: 150 }} onChange={(val) => setExerciseMuscleFilter(val as string)}>
              <Option value="All">Tất cả nhóm cơ</Option><Option value="Chest">Chest (Ngực)</Option><Option value="Back">Back (Lưng)</Option>
              <Option value="Legs">Legs (Chân)</Option><Option value="Shoulders">Shoulders (Vai)</Option>
              <Option value="Arms">Arms (Tay)</Option><Option value="Core">Core (Bụng)</Option><Option value="Full Body">Full Body</Option>
            </Select>
          </Space>
          <Button type="primary" icon={<PlusOutlined />}>Thêm bài tập</Button>
        </Space>

        <Row gutter={[16, 16]}>
          {filteredExercises.map(ex => (
            <Col span={8} key={ex.id}>
              <Card hoverable title={ex.name} extra={<Tag color={ex.difficulty === 'Dễ' ? 'green' : ex.difficulty === 'Trung bình' ? 'orange' : 'red'}>{ex.difficulty}</Tag>} onClick={() => setExerciseDetailModal(ex)}>
                <p><Text strong>Nhóm cơ:</Text> <Tag>{ex.muscle}</Tag></p>
                <p><Text strong>Calo đốt (~1h):</Text> {ex.caloriesPerHour} kcal</p>
                <p style={{ color: 'gray', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.description}</p>
              </Card>
            </Col>
          ))}
        </Row>

        <Modal title="Hướng dẫn thực hiện" visible={!!exerciseDetailModal} onCancel={() => setExerciseDetailModal(null)} footer={[<Button key="close" onClick={() => setExerciseDetailModal(null)}>Đóng</Button>]}>
          {exerciseDetailModal && (
            <div>
              <Title level={4}>{exerciseDetailModal.name}</Title>
              <p><Tag color="blue">{exerciseDetailModal.muscle}</Tag> <Tag color={exerciseDetailModal.difficulty === 'Dễ' ? 'green' : exerciseDetailModal.difficulty === 'Trung bình' ? 'orange' : 'red'}>{exerciseDetailModal.difficulty}</Tag></p>
              <Divider />
              <p><Text strong>Mô tả chi tiết:</Text></p>
              <p>{exerciseDetailModal.description}</p>
              <p><Text strong>Năng lượng tiêu hao:</Text> ~{exerciseDetailModal.caloriesPerHour} calo/giờ</p>
            </div>
          )}
        </Modal>
      </div>
    );
  };

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#f0f2f5' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>Ứng Dụng Theo Dõi Sức Khỏe & Thể Dục</Title>
      <Card>
        <Tabs defaultActiveKey="1" size="large">
          <Tabs.TabPane tab="1. Dashboard" key="1">{renderDashboard()}</Tabs.TabPane>
          <Tabs.TabPane tab="2. Nhật ký tập luyện" key="2">{renderWorkoutLog()}</Tabs.TabPane>
          <Tabs.TabPane tab="3. Nhật ký chỉ số sức khỏe" key="3">{renderHealthLog()}</Tabs.TabPane>
          <Tabs.TabPane tab="4. Quản lý mục tiêu" key="4">{renderGoals()}</Tabs.TabPane>
          <Tabs.TabPane tab="5. Thư viện bài tập" key="5">{renderExerciseLibrary()}</Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default TH08;