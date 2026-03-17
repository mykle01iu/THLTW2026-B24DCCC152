import { Tabs, Card } from "antd";
import NhanVien from "./NhanVien";
import DichVu from "./DichVu";
import LichHen from "./LichHen";
import DanhGia from "./DanhGia";
import ThongKe from "./ThongKe";

const { TabPane } = Tabs;

const QuanLy = () => {
  return (
    <Card title="Quản lý tiệm tóc">
      <Tabs defaultActiveKey="1">
        <TabPane tab="Nhân viên" key="1">
          <NhanVien />
        </TabPane>

        <TabPane tab="Dịch vụ" key="2">
          <DichVu />
        </TabPane>

        <TabPane tab="Lịch hẹn" key="3">
          <LichHen />
        </TabPane>

        <TabPane tab="Đánh giá" key="4">
          <DanhGia />
        </TabPane>

        <TabPane tab="Thống kê" key="5">
          <ThongKe />
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default QuanLy;