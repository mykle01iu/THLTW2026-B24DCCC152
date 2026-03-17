import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  TimePicker,
  Input,
  message,
  Tag,
  Card,
} from "antd";

interface LichHen {
  id: number;
  tenKhach: string;
  sdt: string;
  dichVu: string;
  nhanVien: string;
  ngay: string;
  gio: string;
  trangThai: string;
  gia: number;
}

const role = "admin";

const danhSachNhanVien = [
  { ten: "Anh Tuấn", vaiTro: "cat" },
  { ten: "Anh Hùng", vaiTro: "cat" },
  { ten: "Anh Nam", vaiTro: "cat" },
  { ten: "Vân Anh", vaiTro: "massage" },
  { ten: "Châu Anh", vaiTro: "massage" },
];

const danhSachDichVu = [
  { ten: "Cắt tóc", loai: "cat", gia: 69000 },
  { ten: "Tư vấn + cắt + tạo kiểu", loai: "massage", gia: 89000 },
  { ten: "Cắt + Gội đậu +  Massage", loai: "combo", gia: 250000 },
  { ten: "Massage đầu, cổ vai gáy", loai: "massage", gia: 600000},
];

const LichHenPage = () => {
  const [ds, setDs] = useState<LichHen[]>(() => {
    const data = localStorage.getItem("lichHen");
    return data ? JSON.parse(data) : [];
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LichHen | null>(null);
  const [form] = Form.useForm();
  const [loaiDV, setLoaiDV] = useState("");

  useEffect(() => {
    localStorage.setItem("lichHen", JSON.stringify(ds));
  }, [ds]);

  const nvCat = danhSachNhanVien.filter((n) => n.vaiTro === "cat");
  const nvMassage = danhSachNhanVien.filter((n) => n.vaiTro === "massage");

  const kiemTraTrung = (nv: string, ngay: string, gio: string) => {
    return ds.some(
      (i) =>
        i.nhanVien.includes(nv) &&
        i.ngay === ngay &&
        i.gio === gio &&
        i.trangThai !== "Hủy"
    );
  };

  const demSoKhach = (nv: string, ngay: string) => {
    return ds.filter(
      (i) =>
        i.nhanVien.includes(nv) &&
        i.ngay === ngay &&
        i.trangThai !== "Hủy"
    ).length;
  };

  const checkGioLam = (gio: string) => {
    const h = parseInt(gio.split(":")[0]);
    return h >= 8 && h <= 17;
  };

  const themLich = () => {
    form.validateFields().then((values) => {
      const ngay = values.ngay.format("YYYY-MM-DD");
      const gio = values.gio.format("HH:mm");

      if (!checkGioLam(gio)) {
        message.error("Chỉ đặt từ 8h - 17h");
        return;
      }

      let nhanVien = "";
      let gia = 0;

      const dv = danhSachDichVu.find((d) => d.loai === loaiDV);
      gia = dv?.gia || 0;

      if (loaiDV === "cat") {
        if (demSoKhach(values.nhanVienCat, ngay) >= 10) {
          message.error("NV đã đủ 10 khách");
          return;
        }
        if (kiemTraTrung(values.nhanVienCat, ngay, gio)) {
          message.error("Trùng lịch");
          return;
        }
        nhanVien = values.nhanVienCat;
      }

      if (loaiDV === "massage") {
        if (demSoKhach(values.nhanVienMassage, ngay) >= 10) {
          message.error("NV đã đủ 10 khách");
          return;
        }
        if (kiemTraTrung(values.nhanVienMassage, ngay, gio)) {
          message.error("Trùng lịch");
          return;
        }
        nhanVien = values.nhanVienMassage;
      }

      if (loaiDV === "combo") {
        if (
          demSoKhach(values.nhanVienCat, ngay) >= 10 ||
          demSoKhach(values.nhanVienMassage, ngay) >= 10
        ) {
          message.error("NV đã đủ khách");
          return;
        }

        if (
          kiemTraTrung(values.nhanVienCat, ngay, gio) ||
          kiemTraTrung(values.nhanVienMassage, ngay, gio)
        ) {
          message.error("Trùng lịch");
          return;
        }

        nhanVien = `${values.nhanVienCat} + ${values.nhanVienMassage}`;
      }

      if (editing) {
        // UPDATE
        const newData = ds.map((i) =>
          i.id === editing.id
            ? {
                ...i,
                tenKhach: values.tenKhach,
                sdt: values.sdt,
                nhanVien,
                ngay,
                gio,
              }
            : i
        );

        setDs(newData);
        setEditing(null);
        message.success("Cập nhật thành công!");
      } else {
        // ADD
        const newItem: LichHen = {
          id: Date.now(),
          tenKhach: values.tenKhach,
          sdt: values.sdt,
          dichVu: dv?.ten || "",
          nhanVien,
          ngay,
          gio,
          trangThai: "Chờ duyệt",
          gia,
        };

        setDs([...ds, newItem]);
        message.success("Thêm thành công!");
      }

      setOpen(false);
      form.resetFields();
    });
  };

  const capNhat = (id: number, trangThai: string) => {
    if (role !== "admin") return;
    setDs(ds.map((i) => (i.id === id ? { ...i, trangThai } : i)));
  };

  const xoaLich = (id: number) => {
    setDs(ds.filter((i) => i.id !== id));
    message.success("Đã xóa!");
  };

  const suaLich = (record: LichHen) => {
    if (record.trangThai === "Hoàn thành") {
      message.error("Không được sửa!");
      return;
    }

    setEditing(record);
    setOpen(true);

    form.setFieldsValue({
      tenKhach: record.tenKhach,
      sdt: record.sdt,
    });
  };

  const columns = [
    { title: "Khách", dataIndex: "tenKhach" },
    { title: "Dịch vụ", dataIndex: "dichVu" },
    { title: "Nhân viên", dataIndex: "nhanVien" },
    { title: "Ngày", dataIndex: "ngay" },
    { title: "Giờ", dataIndex: "gio" },
    {
      title: "Trạng thái",
      render: (_: any, r: LichHen) => <Tag>{r.trangThai}</Tag>,
    },
    {
      title: "Hành động",
      render: (_: any, r: LichHen) => (
        <>
          <Button onClick={() => capNhat(r.id, "Xác nhận")}>✔</Button>
          <Button onClick={() => capNhat(r.id, "Hoàn thành")}>✓</Button>
          <Button danger onClick={() => capNhat(r.id, "Hủy")}>✖</Button>

          <Button onClick={() => suaLich(r)}>Sửa</Button>

          <Button danger onClick={() => xoaLich(r.id)}>
            Xóa
          </Button>
        </>
      ),
    },
  ];

  return (
    <Card title="Lịch hẹn">
      <Button onClick={() => setOpen(true)}>Đặt lịch</Button>

      <Table dataSource={ds} columns={columns} rowKey="id" />

      <Modal
        visible={open}
        onOk={themLich}
        onCancel={() => {
          setOpen(false);
          setEditing(null);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="tenKhach" label="Tên khách" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="sdt" label="SĐT" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="dichVu" label="Dịch vụ">
            <Select
              onChange={(v) => setLoaiDV(v)}
              options={danhSachDichVu.map((d) => ({
                label: d.ten,
                value: d.loai,
              }))}
            />
          </Form.Item>

          <Form.Item name="ngay" label="Ngày">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="gio" label="Giờ">
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default LichHenPage;