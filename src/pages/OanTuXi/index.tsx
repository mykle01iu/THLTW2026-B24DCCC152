import { useState } from "react";
import {
    Card, Button, List, Space, Typography, Tag
} from 'antd';

const {Title, Text} = Typography;

const luaChon = ['Kéo', 'Búa', 'Bao'];

interface LichSuChoi {
    nguoiChoi: string;
    mayTinh: string;
    ketQua: string;
}

const OanTuXi = () => {
    const [lichSu, setLichSu] = useState<LichSuChoi[]>([]);

    const choiGame = (luaChonNguoiChoi : string) => {
        const random = Math.floor(Math.random() *  3);
        const luaChonMay = luaChon[random];

        let ketQua = "";

        if (luaChonNguoiChoi === luaChonMay) {
            ketQua = "Hòa";
        } 
        else if (
            (luaChonNguoiChoi === "Kéo" && luaChonMay === "Bao") ||
            (luaChonNguoiChoi === "Bao" && luaChonMay === "Búa") ||
            (luaChonNguoiChoi === "Búa" && luaChonMay === "Kéo")
        ) { ketQua = "Thắng";}
        else {
            ketQua = "Thua";
        }

        const vanMoi : LichSuChoi = {
            nguoiChoi: luaChonNguoiChoi,
            mayTinh: luaChonMay,
            ketQua: ketQua,
        };
        
        setLichSu([vanMoi, ...lichSu]);
    };

    return (
        <Card>
            <Title level={3}>
                Trò chơi Oẳn Tù Xì 
                <br/>
                Hãy đưa ra lựa chọn của bạn
            </Title>
            

            <Space style={{ marginBottom: 20}}>
                {luaChon.map((item) => (
                    <Button key={item} type="primary" onClick={() => choiGame(item)}>{item}</Button>
                ))}
            </Space>

            <Title level={4}>Lịch sử trận đấu</Title>

            <List
                bordered
                dataSource={lichSu}
                renderItem={(item) => (
                    <List.Item>
                        <Space>
                            <Text>Người chơi: {item.nguoiChoi}</Text>
                            <Text>Máy: {item.mayTinh}</Text>

                            {item.ketQua === "Thắng" && <Tag color="green">Thắng</Tag>}
                            {item.ketQua === "Hòa" && <Tag color="orange">Hòa</Tag>}
                            {item.ketQua === "Thua" && <Tag color="red">Thua</Tag>}
                        </Space>
                    </List.Item>
                )}
            />
        </Card>
    )
}

export default OanTuXi