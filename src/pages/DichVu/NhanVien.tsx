import { useState } from "react";
import { Table, Button, Modal, Form, Input, Select } from "antd";

interface NhanVien {
  id: number;
  ten: string;
  gioiTinh: string;
  vaiTro: string;
  gioBatDau: string;
  gioKetThuc: string;
  gioiHanKhach: number;
}

const dataMacDinh: NhanVien[] = [
  {
    id: 1,
    ten: "Anh Tuấn",
    gioiTinh: "Nam",
    vaiTro: "Cắt tóc",
    gioBatDau: "08:00",
    gioKetThuc: "16:00",
    gioiHanKhach: 10,
  },
    {
    id: 2,
    ten: "Anh Hùng",
    gioiTinh: "Nam",
    vaiTro: "Cắt tóc",
    gioBatDau: "09:00",
    gioKetThuc: "17:00",
    gioiHanKhach: 10,
  },
    {
    id: 3,
    ten: "Anh Nam",
    gioiTinh: "Nam",
    vaiTro: "Cắt tóc",
    gioBatDau: "13:00",
    gioKetThuc: "21:00",
    gioiHanKhach: 10,
  },
    {
    id: 4,
    ten: "Vân Anh",
    gioiTinh: "Nữ",
    vaiTro: "Gội đầu & Massage",
    gioBatDau: "08:00",
    gioKetThuc: "20:00",
    gioiHanKhach: 10,
  },
    {
    id: 5,
    ten: "Châu Anh",
    gioiTinh: "Nữ",
    vaiTro: "Gội đầu & Massage",
    gioBatDau: "08:00",
    gioKetThuc: "20:00",
    gioiHanKhach: 10,
  },
];

const NhanVienPage = () => {
  const [data, setData] = useState<NhanVien[]>(dataMacDinh);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    setData([
      ...data,
      { id: Date.now(), ...values, gioiHanKhach: 10 },
    ]);
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
          { title: "Giới tính", dataIndex: "gioiTinh" },
          { title: "Vai trò", dataIndex: "vaiTro" },
          {
            title: "Giờ làm",
            render: (r) => `${r.gioBatDau} - ${r.gioKetThuc}`,
          },
        ]}
      />

      <Modal visible={open} onCancel={() => setOpen(false)} onOk={() => form.submit()}>
        <Form form={form} onFinish={onFinish}>
          <Form.Item name="ten" label="Tên">
            <Input />
          </Form.Item>

          <Form.Item name="gioiTinh" label="Giới tính">
            <Select>
              <Select.Option value="Nam">Nam</Select.Option>
              <Select.Option value="Nữ">Nữ</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="vaiTro" label="Vai trò">
            <Select>
              <Select.Option value="Cắt tóc">Cắt tóc</Select.Option>
              <Select.Option value="Gội đầu">Gội đầu</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="gioBatDau" label="Giờ bắt đầu">
            <Input />
          </Form.Item>

          <Form.Item name="gioKetThuc" label="Giờ kết thúc">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default NhanVienPage;