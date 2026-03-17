import { useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber } from "antd";

interface DichVu {
  id: number;
  ten: string;
  gia: number;
  thoiGian: number;
}

const dataMacDinh: DichVu[] = [
  { id: 1, ten: "Cắt tóc", gia: 69000, thoiGian: 30 },
  { id: 2, ten: "Tư vấn + Cắt + Tạo kiểu", gia: 89000, thoiGian: 40 },
  { id: 3, ten: "Cắt tóc + Gội đầu + Massage", gia: 250000, thoiGian: 60 },
  { id: 4, ten: "Massage đầu, cổ vai gáy", gia: 600000, thoiGian: 120 },
];

const DichVuPage = () => {
  const [data, setData] = useState<DichVu[]>(dataMacDinh);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    setData([...data, { id: Date.now(), ...values }]);
    setOpen(false);
    form.resetFields();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Thêm</Button>

      <Table
        rowKey="id"
        dataSource={data}
        columns={[
          { title: "Tên", dataIndex: "ten" },
          { title: "Giá", dataIndex: "gia" },
          { title: "Thời gian", dataIndex: "thoiGian" },
        ]}
      />

      <Modal visible={open} onCancel={() => setOpen(false)} onOk={() => form.submit()}>
        <Form form={form} onFinish={onFinish}>
          <Form.Item name="ten" label="Tên">
            <Input />
          </Form.Item>
          <Form.Item name="gia" label="Giá">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="thoiGian" label="Thời gian">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DichVuPage;