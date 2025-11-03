import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Upload,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import orderService from "../services/orderService";

const { Option } = Select;

const ConfirmPage = () => {
  const user = useMemo(() => { try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; } }, []);
  const { state } = useLocation();
  const selectedIds = state?.selectedIds || [];
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [countReturn, setCountReturn] = useState(0);
  const navigate = useNavigate();

  const orderId = state?.orderId;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await orderService.getOrderById(orderId);
        setOrder(res);
        const res1 = await axios.get(`http://localhost:9999/return/count-return/${user?._id || user?.id}`)
        setCountReturn(res1.data.count)
      } catch (err) {
        message.error("Lấy thông tin đơn hàng thất bại");
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

const handleSubmit = async (values) => {
  if (!order) return;

  try {
    const selectedItems = order._doc.items.filter((item) =>
      selectedIds.includes(item.productId)
    );

    // values.requestedResolution === "REFUND"
    //       ? values.refundMethod
    //       : null

    //  Chuẩn bị mảng record hoàn hàng (chỉ dữ liệu text/json)
    const returnRecords = selectedItems.map((item) => ({
      rmaCode: `RMA_${Date.now()}_${item.productId}`,
      orderId: order._doc._id,
      buyerId: order._doc.buyerInfo.userId,
      // shopId: "SHOP_ID_123",
      reasonCode: values.reasonCode,
      reasonDetail: values.reasonDetail || "",
      requestedResolution: values.requestedResolution || 'REFUND',
      refundMethod: "ORIGINAL",
      shippingFee:  countReturn === 0 ? 0 : countReturn === 1 ? 20000 : 40000,
      returnMethod: values.returnMethod,
      pickupAddress: {
        recipientName: order._doc.shippingAddress.recipientName,
        phoneNumber: order._doc.shippingAddress.phoneNumber,
        fullAddress: order._doc.shippingAddress.fullAddress,
      },
      dropoff:
        values.returnMethod === "DROP_OFF"
          ? {
              carrierCode: values.carrierCode,
              dropoffCode: values.dropoffCode,
              dropoffAddress: values.dropoffAddress,
            }
          : undefined,
      items: [
        {
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.priceAtPurchase,
        },
      ],
      status: "REQUESTED",
      statusEvents: [
        {
          status: "REQUESTED",
          at: new Date(),
          by: { type: "USER", id: order._doc.buyerInfo.userId },
          note: "Người mua yêu cầu hoàn hàng",
        },
      ],
      amounts: {
        subtotal: item.priceAtPurchase * item.quantity,
        shippingFee: 0,
        restockingFee: 0,
        refundTotal: item.priceAtPurchase * item.quantity,
        currency: "VND",
      },
    }));

    // Tạo FormData để gửi file + JSON
    const formData = new FormData();
    formData.append("data", JSON.stringify(returnRecords));

    // Thêm file minh chứng
    fileList.forEach((file) => {
      formData.append("files", file.originFileObj);
    });

    console.log(" Payload FormData gửi BE:", returnRecords, fileList);

    await axios.post("http://localhost:9999/return", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    message.success("Yêu cầu hoàn hàng đã được gửi thành công!");
    navigate('/orders')
  } catch (err) {
    console.error(err);
    message.error("Có lỗi khi gửi yêu cầu hoàn hàng");
  }
};


  if (loading) return <p>Đang tải...</p>;
  if (!order) return <p>Không có dữ liệu đơn hàng.</p>;

  const selectedItems = order._doc.items.filter((i) =>
    selectedIds.includes(i.productId)
  );

  return (
    <div style={{ padding: 40 }}>
      <h2>Yêu cầu hoàn hàng</h2>

      <Card title="Thông tin đơn hàng" style={{ marginBottom: 20 }}>
        <p>
          <b>Người mua:</b> {order._doc.buyerInfo.fullName}
        </p>
        <p>
          <b>Địa chỉ giao:</b> {order._doc.shippingAddress.fullAddress}
        </p>
        <p>
          <b>Phương thức thanh toán:</b> {order._doc.paymentInfo.method}
        </p>
      </Card>

      <Card title="Sản phẩm hoàn hàng" style={{ marginBottom: 20 }}>
        {selectedItems.map((item) => (
          <div
            key={item.productId}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 12,
              gap: 16,
            }}
          >
            <img
              src={item.thumbnailUrl}
              alt={item.productName}
              width={80}
              height={80}
              style={{ objectFit: "cover", borderRadius: 8 }}
            />
            <div>
              <b>{item.productName}</b>
              <p>Số lượng: {item.quantity}</p>
              <p>Giá: {item.priceAtPurchase.toLocaleString()}₫</p>
            </div>
          </div>
        ))}
      </Card>

      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="reasonCode"
          label="Lý do hoàn hàng"
          rules={[{ required: true, message: "Hãy chọn lý do" }]}
        >
          <Select placeholder="Chọn lý do">
            <Option value="DAMAGED_ITEM">Hàng bị hư hỏng</Option>
            <Option value="NOT_AS_DESCRIBED">Không giống mô tả</Option>
            <Option value="WRONG_ITEM">Gửi sai hàng</Option>
            <Option value="OTHER">Khác</Option>
          </Select>
        </Form.Item>

        <Form.Item name="reasonDetail" label="Chi tiết lý do">
          <Input.TextArea rows={3} placeholder="Nhập mô tả thêm (nếu có)" />
        </Form.Item>

        {/* <Form.Item
          name="requestedResolution"
          label="Yêu cầu xử lý"
          rules={[{ required: true, message: "Hãy chọn hướng xử lý" }]}
        >
          <Select placeholder="Chọn hướng xử lý">
            <Option value="REFUND">Hoàn tiền</Option>
            <Option value="REPLACE">Đổi hàng</Option>
            <Option value="REPAIR">Sửa chữa</Option>
          </Select>
        </Form.Item> */}

        {/* <Form.Item name="refundMethod" label="Phương thức hoàn tiền (nếu có)">
          <Select placeholder="Chọn phương thức hoàn tiền">
            <Option value="ORIGINAL">Theo phương thức ban đầu</Option>
            <Option value="MANUAL">Thủ công</Option>
          </Select>
        </Form.Item> */}

        <Form.Item
          name="returnMethod"
          label="Phương thức hoàn hàng"
          rules={[{ required: true, message: "Hãy chọn phương thức hoàn hàng" }]}
        >
          <Select placeholder="Chọn phương thức">
            <Option value="PICKUP">Nhân viên đến lấy</Option>
            <Option value="DROP_OFF">Tự gửi tại điểm</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Phí hoàn hàng (Chỉ miễn phí lần đầu hoàn hàng mỗi tháng)">
          <p style={{fontWeight: 700}}>{(countReturn === 0 ? 0 : countReturn === 1 ? 20000 : 40000).toLocaleString()} VND</p>
        </Form.Item>

        {/* 🟢 Upload evidences */}
        <Form.Item label="Minh chứng (hình ảnh / video)">
          <Upload
            multiple
            listType="picture"
            beforeUpload={() => false} // Không upload tự động
            fileList={fileList}
            onChange={({ fileList: newList }) => setFileList(newList)}
          >
            <Button icon={<UploadOutlined />}>Tải lên</Button>
          </Upload>
        </Form.Item>

        

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Gửi yêu cầu hoàn hàng
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ConfirmPage;
