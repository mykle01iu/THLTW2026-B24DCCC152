import { Card } from "antd";

const ThongKe = () => {
  const data = JSON.parse(localStorage.getItem("lichHen") || "[]");

  const tongLich = data.length;

  const doanhThu = data
    .filter((d: any) => d.trangThai === "Hoàn thành")
    .reduce((sum: number, d: any) => sum + d.gia, 0);

  return (
    <Card title="Thống kê">
      <p>Tổng lịch: {tongLich}</p>
      <p>Doanh thu: {doanhThu.toLocaleString()} VND</p>
    </Card>
  );
};

export default ThongKe;