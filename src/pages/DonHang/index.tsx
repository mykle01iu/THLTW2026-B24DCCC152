import { useState } from "react";
import {
    Button,
    Form,
    Input,
    InputNumber,
    Modal,
    Select,
    Table,
    Tag,
    message,
} from 'antd';



const DonHang = () => {
    const [form] = Form.useForm();
    const [open, setOpen] = useState(false);
    const [chiTiet, setChiTiet] =  useState<any>(null);
    


    return (
        <>
            <h1>Hoàng Đình Khải</h1>
        </>
    )
}

export default DonHang