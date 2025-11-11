import React, { useEffect, useState } from "react";
import { Card, Descriptions, Table, Tag, Button, Image, Space, Typography } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import axios from "axios";
import { toast } from "react-toastify";
import { useStaffNotification } from "../../contexts/StaffNotificationContext";

const { Title } = Typography;

const ReturnDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [returnData, setReturnData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { refreshPendingCount } = useStaffNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:9999/staff/returns/${id}`);
        console.log("Return detail:", res.data.data);
        setReturnData(res.data.data);
      } catch (error) {
        console.error("Failed to fetch return detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const approveReturn = async () => {
    const res = await axios.patch(`http://localhost:9999/staff/returns/${id}/approve`);
    console.log(res)
    toast.success('Chấp nhận hoàn hàng thành công!')
    refreshPendingCount(); // Update badge count
    navigate(-1)
}

const rejectReturn = async () => {
    const res = await axios.patch(`http://localhost:9999/staff/returns/${id}/reject`);
    console.log(res)
    toast.success('Từ chối hoàn hàng thành công!')
    refreshPendingCount(); // Update badge count
    navigate(-1)
  }

  const getVietnameseStatus = (status) => {
    switch (status) {
      case "REQUESTED":
        return "Đang chờ duyệt";
      case "APPROVED":
        return "Đã chấp nhận";
      case "SHIPPED":
        return "Đang hoàn hàng";
      case "RETURNED":
        return "Đã hoàn hàng";
      case "REJECTED":
        return "Đã từ chối";
      default:
        return status;
    }
  };

  const columns = [
    {
      title: "Ảnh sản phẩm",
      dataIndex: ["productId", "images"],
      key: "images",
      render: (images) => (
        <Image
          src={images?.[0]?.url}
          alt="product"
          width={80}
          height={80}
          style={{ objectFit: "cover", borderRadius: 8 }}
        />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "Giá bán (VNĐ)",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (price) => price?.toLocaleString(),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Thành tiền",
      key: "total",
      render: (_, record) =>
        (record.unitPrice * record.quantity).toLocaleString(),
    },
  ];


  if (loading) return <p>Đang tải...</p>;
  if (!returnData) return <p>Không tìm thấy dữ liệu.</p>;

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Header */}
        <Space align="center" style={{ marginBottom: 8 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Quay lại
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            Chi tiết đơn hoàn hàng
          </Title>
        </Space>

        {/* Thông tin đơn hoàn */}
        <Card title="Thông tin đơn hoàn hàng" bordered={false}>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Mã đơn hoàn">
              {returnData.rmaCode}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag
                color={
                  returnData.status === "APPROVED"
                    ? "green"
                    : returnData.status === "REJECTED"
                    ? "red"
                    : "blue"
                }
              >
                {getVietnameseStatus(returnData.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Cửa hàng">
              {returnData.shopId?.shopName}
            </Descriptions.Item>
            <Descriptions.Item label="Người mua">
              {returnData.buyerId?.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Chi tiết lý do" span={2}>
              {returnData.reasonDetail}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Danh sách sản phẩm */}
        <Card title="Sản phẩm hoàn trả" bordered={false}>
          <Table
            columns={columns}
            dataSource={returnData.items}
            rowKey="_id"
            pagination={false}
          />
        </Card>

        {/* Hiển thị hình ảnh bằng chứng */}
        {returnData.evidences && returnData.evidences.length > 0 && (
          <Card title="Hình ảnh bằng chứng" bordered={false}>
            <Space wrap>
              {returnData.evidences.map((evidence) => (
                <Image
                  key={evidence._id}
                  src={`http://localhost:9999${evidence.url}`}
                  alt="Evidence"
                  width={150}
                  height={150}
                  style={{ objectFit: "cover", borderRadius: 8 }}
                />
              ))}
            </Space>
          </Card>
        )}


        {/* Hành động */}
        <Space>
          <Button type="primary" disabled={returnData.status !== "REQUESTED"} onClick={approveReturn}>
            Duyệt hoàn hàng
          </Button>
          <Button danger disabled={returnData.status !== "REQUESTED"} onClick={rejectReturn}>
            Từ chối hoàn hàng
          </Button>
        </Space>
      </Space>
    </div>
  );
};

export default ReturnDetailPage;
