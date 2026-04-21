import { useState, useEffect } from "react";
import { Table, Card, Select, Rate, Input, Button, message } from "antd";

interface DanhGia {
  id: number;
  tenKhach: string;
  dichVu: string;
  nhanVien: string;
  sao: number;
  noiDung: string;
}

const getLichHen = () => {
  return JSON.parse(localStorage.getItem("lichHen") || "[]");
};

const DanhGiaPage = () => {
  const [dsDanhGia, setDsDanhGia] = useState<DanhGia[]>(() => {
    const data = localStorage.getItem("danhGia");
    return data ? JSON.parse(data) : [];
  });

  const [lichHoanThanh, setLichHoanThanh] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [sao, setSao] = useState(5);
  const [noiDung, setNoiDung] = useState("");

  useEffect(() => {
    localStorage.setItem("danhGia", JSON.stringify(dsDanhGia));
  }, [dsDanhGia]);

  useEffect(() => {
    const data = getLichHen();
    const done = data.filter((d: any) => d.trangThai === "Hoàn thành");
    setLichHoanThanh(done);
  }, []);

  const handleSubmit = () => {
    if (!selected) {
      message.error("Chọn khách trước!");
      return;
    }

    const newItem: DanhGia = {
      id: Date.now(),
      tenKhach: selected.tenKhach,
      dichVu: selected.dichVu,
      nhanVien: selected.nhanVien,
      sao,
      noiDung,
    };

    setDsDanhGia([...dsDanhGia, newItem]);
    setSelected(null);
    setSao(5);
    setNoiDung("");
    message.success("Đánh giá thành công!");
  };

  const columns = [
    { title: "Khách", dataIndex: "tenKhach" },
    { title: "Dịch vụ", dataIndex: "dichVu" },
    { title: "Nhân viên", dataIndex: "nhanVien" },
    {
      title: "Sao",
      render: (_: any, r: DanhGia) => <Rate disabled value={r.sao} />,
    },
    { title: "Nội dung", dataIndex: "noiDung" },
  ];

  return (
    <Card title="Đánh giá dịch vụ">
      {/* CHỌN KHÁCH */}
      <Select
        style={{ width: "100%", marginBottom: 10 }}
        placeholder="Chọn khách đã hoàn thành"
        value={selected?.id}
        onChange={(value) => {
          const item = lichHoanThanh.find((i) => i.id === value);
          setSelected(item);
        }}
        options={lichHoanThanh.map((l) => ({
          label: `${l.tenKhach} - ${l.dichVu}`,
          value: l.id,
        }))}
      />

      {/* CHỌN SAO */}
      <Rate value={sao} onChange={setSao} />

      {/* NỘI DUNG */}
      <Input.TextArea
        rows={3}
        placeholder="Nhập đánh giá..."
        value={noiDung}
        onChange={(e) => setNoiDung(e.target.value)}
        style={{ marginTop: 10 }}
      />

      <Button
        type="primary"
        onClick={handleSubmit}
        style={{ marginTop: 10 }}
      >
        Gửi đánh giá
      </Button>

      {/* TABLE */}
      <Table
        style={{ marginTop: 20 }}
        dataSource={dsDanhGia}
        columns={columns}
        rowKey="id"
      />
    </Card>
  );
};

export default DanhGiaPage;