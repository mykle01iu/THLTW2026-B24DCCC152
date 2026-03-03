import { useState } from "react"
import {
    Card,
    Button,
    InputNumber,
    Typography,
    Space

} from 'antd'

const {Title, Text} = Typography;
const TroChoi = () => {
        const [soBatKi, setSoBatKi] = useState<number>(
            Math.floor(Math.random() * 100) + 1
        );
        const [doan, setDoan] = useState<number | null>(null);
        const [tbao, setTbao] = useState<string>("");
        const [luot, setLuot] = useState<number>(0);

        const luotToiDa = 10;

        const nguoiDoan = () => {
            if (doan === null) {
                setTbao("Vui lòng đoán số!");
                return;
            }

            if (luot >= luotToiDa) {
                setTbao(`Bạn đã đoán tối đa số lượt thử, số đúng là ${soBatKi}`);
                return;
            }

            const luotMoi = luot + 1;
            setLuot(luotMoi);

            if(doan === soBatKi) {
                setTbao("Bạn đã đoán đúng, xin chúc mừng");
            }
            else if (doan < soBatKi) {
                setTbao("Số cần đoán lớn hơn số bạn đã chọn");
            }
            else if (doan > soBatKi) {
                setTbao("Số cần đoán nhỏ hơn số bạn đã chọn");
            }
            if (luotMoi === luotToiDa && doan !== soBatKi) {
                setTbao(`Đã hết lượt đoán, số chính xác là ${soBatKi}`);
            }

            setDoan(null);
        };

        const resetGame = () => {
            setSoBatKi(Math.floor(Math.random() * 100) + 1);
            setDoan(null);
            setTbao("");
            setLuot(0);
        };

        return (
            <div style={{display: "flex", justifyContent: "center", margin: "136"}}>
                <Card style={{ width: 400}}>
                    <Title level={3} style={{textAlign:"center"}}>
                        Đoán số cùng Jeemzz
                    </Title>

                    <Text>Bạn có thể đoán bất kỳ 1 số từ 01 - 100 (tối đa có 10 lượt chơi)</Text>

                    <Space direction="vertical" style={{width: "100%", marginTop: 20}}>
                        <InputNumber
                            style={{ width:"100%"}}
                            min={1}
                            max={100}
                            value={doan}
                            onChange={(value => setDoan(value))}
                            placeholder="Nhập số bạn đoán"
                        />

                        <Button type="primary" onClick={nguoiDoan}>
                            Tôi sẽ đoán là nó
                        </Button>

                        <Button onClick={resetGame}>
                            Cho chơi lại nào
                        </Button>

                        <Text strong>
                            Lượt đã dùng: {luot}/{luotToiDa}
                        </Text>

                        {tbao && (
                            <Text type="danger">
                                {tbao}
                            </Text>
                        )}
                    </Space>
                </Card>
            </div>
        )
};

export default TroChoi