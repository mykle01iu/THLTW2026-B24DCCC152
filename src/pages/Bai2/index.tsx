import { useState } from "react";
import {
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Card,
  Space,
} from "antd";

const { TabPane } = Tabs;

const mucDoList = ["Dễ", "Trung bình", "Khó", "Rất khó"];

interface KhoiKienThuc {
  id: number;
  ten: string;
}

interface MonHoc {
  ma: string;
  ten: string;
  tinChi: number;
}

interface CauHoi {
  id: number;
  monHoc: string;
  noiDung: string;
  mucDo: string;
  khoiKienThuc: string;
}

const Bai2 = () => {
  const [khoi, setKhoi] = useState<KhoiKienThuc[]>([]);
  const [monHoc, setMonHoc] = useState<MonHoc[]>([]);
  const [cauHoi, setCauHoi] = useState<CauHoi[]>([]);
  const [deThi, setDeThi] = useState<CauHoi[]>([]);

  const [visible, setVisible] = useState(false);
  const [loaiModal, setLoaiModal] = useState("");
  const [form] = Form.useForm();

  const moModal = (loai: string) => {
    setLoaiModal(loai);
    setVisible(true);
  };

  const themDuLieu = (values: any) => {
    if (loaiModal === "khoi") {
      setKhoi([...khoi, { id: Date.now(), ten: values.ten }]);
    }

    if (loaiModal === "mon") {
      setMonHoc([...monHoc, values]);
    }

    if (loaiModal === "cauhoi") {
      setCauHoi([...cauHoi, { id: Date.now(), ...values }]);
    }

    setVisible(false);
    form.resetFields();
  };

  const taoDe = () => {
    const de = cauHoi.slice(0, 5);
    setDeThi(de);
  };

  return (
    <Card title="Ngân hàng câu hỏi">
      <Tabs defaultActiveKey="1">

        <TabPane tab="Khối kiến thức" key="1">
          <Button type="primary" onClick={() => moModal("khoi")}>
            Thêm
          </Button>

          <Table
            rowKey="id"
            dataSource={khoi}
            columns={[
              { title: "ID", dataIndex: "id" },
              { title: "Tên khối", dataIndex: "ten" },
            ]}
          />
        </TabPane>

        <TabPane tab="Môn học" key="2">
          <Button type="primary" onClick={() => moModal("mon")}>
            Thêm
          </Button>

          <Table
            rowKey="ma"
            dataSource={monHoc}
            columns={[
              { title: "Mã môn", dataIndex: "ma" },
              { title: "Tên môn", dataIndex: "ten" },
              { title: "Tín chỉ", dataIndex: "tinChi" },
            ]}
          />
        </TabPane>

        <TabPane tab="Câu hỏi" key="3">
          <Button type="primary" onClick={() => moModal("cauhoi")}>
            Thêm
          </Button>

          <Table
            rowKey="id"
            dataSource={cauHoi}
            columns={[
              { title: "ID", dataIndex: "id" },
              { title: "Môn học", dataIndex: "monHoc" },
              { title: "Nội dung", dataIndex: "noiDung" },
              { title: "Mức độ", dataIndex: "mucDo" },
              { title: "Khối kiến thức", dataIndex: "khoiKienThuc" },
            ]}
          />
        </TabPane>

        <TabPane tab="Tạo đề thi" key="4">
          <Button type="primary" onClick={taoDe}>
            Tạo đề
          </Button>

          <Space direction="vertical" style={{ marginTop: 20 }}>
            {deThi.map((c, i) => (
              <Card key={i}>
                Câu {i + 1}: {c.noiDung} ({c.mucDo})
              </Card>
            ))}
          </Space>
        </TabPane>

      </Tabs>

      <Modal
        visible={visible}
        title="Thêm dữ liệu"
        onCancel={() => setVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={themDuLieu} layout="vertical">

          {loaiModal === "khoi" && (
            <Form.Item
              name="ten"
              label="Tên khối kiến thức"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          )}

          {loaiModal === "mon" && (
            <>
              <Form.Item
                name="ma"
                label="Mã môn"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="ten"
                label="Tên môn"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item name="tinChi" label="Tín chỉ">
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </>
          )}

          {loaiModal === "cauhoi" && (
            <>
              <Form.Item name="monHoc" label="Môn học">
                <Input />
              </Form.Item>

              <Form.Item name="noiDung" label="Nội dung">
                <Input />
              </Form.Item>

              <Form.Item name="mucDo" label="Mức độ">
                <Select>
                  {mucDoList.map((m) => (
                    <Select.Option key={m} value={m}>
                      {m}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="khoiKienThuc" label="Khối kiến thức">
                <Input />
              </Form.Item>
            </>
          )}

        </Form>
      </Modal>
    </Card>
  );
};

export default Bai2;