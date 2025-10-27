import React, { useEffect, useState } from 'react';
import { Card, Descriptions, Divider, Typography, Table, Button, Space, message, Image } from 'antd';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title } = Typography;

const ShopDetailPage = () => {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  // 🟩 Giả lập API gọi thật (bạn có thể thay bằng endpoint thật)
  useEffect(() => {
    const fetchShopDetail = async () => {
      setLoading(true);
      console.log(id)
      try {
        // Ví dụ: GET /api/shops/:id
        const res = await axios.get(`http://localhost:9999/staff/shops/${id}`);
        console.log(res)
        setShop(res.data.data);
      } catch (error) {
        console.error(error);
        message.error('Không thể tải dữ liệu cửa hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchShopDetail();
  }, [id]);

  if (!shop) return <p style={{ textAlign: 'center', marginTop: 50 }}>Đang tải dữ liệu...</p>;

  // 🟦 Cấu hình bảng sản phẩm
  const productColumns = [
    {
      title: 'Giá (VNĐ)',
      dataIndex: 'images',
      key: ['products', 'images'],
      align: 'center',
       render: (images) => {
        // Kiểm tra xem có ảnh không
        console.log(images)
        if (images && images.length > 0) {
          return (
            <Image
              preview={false}
              src={images[0].url} // lấy ảnh đầu tiên
              width={150}
              height={100}
              style={{ objectFit: 'cover', borderRadius: '8px' }}
            />
          );
        }
        return <span>Không có ảnh</span>;
      },
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productName',
      key: ['products', 'productName'],
      align: 'center',
    },
    {
      title: 'Giá (VNĐ)',
      dataIndex: 'sellingPrice',
      key: ['products', 'sellingPrice'],
      align: 'center',
      render: (price) => price.toLocaleString('vi-VN') + "VND",
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: ['products', 'description'],
      align: 'center',
      ellipsis: true,
    },
  ];

  return (
    <div style={{ margin: '0 auto' }}>
      <button onClick={() => navigate('/staff-seller')} style={{
        background: 'none',
        border: 'none'
      }}><ArrowLeftOutlined /> Quay lại trang danh sách</button>

      {/* ================= Thông tin cửa hàng ================= */}
      <Card
        title={<Title level={3}>{shop.shopName}</Title>}
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          padding: '20px',
        }}
      >
        <Descriptions column={1} bordered size="middle">
          <Descriptions.Item label="Tên cửa hàng">{shop.shopName}</Descriptions.Item>
          {/* <Descriptions.Item label="Địa chỉ">{shop.address}</Descriptions.Item> */}
          <Descriptions.Item label="Mô tả">{shop.description || 'Không có mô tả'}</Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {new Date(shop.createdAt).toLocaleString('vi-VN')}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* ================= Thông tin người bán ================= */}
        <Title level={4}>Thông tin người bán</Title>
        <Descriptions column={1} bordered size="middle">
          <Descriptions.Item label="Họ và tên">{shop.sellerId?.fullName || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Email">{shop.sellerId?.email || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{shop.sellerId?.phoneNumber || 'N/A'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* ================= Danh sách sản phẩm ================= */}
      <Divider />
      <Card
        title={<Title level={4}>Danh sách sản phẩm</Title>}
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          marginTop: 20,
          padding: 20,
        }}
      >
        <Table
          rowKey="_id"
          columns={productColumns}
          dataSource={shop.products || []}
          loading={loading}
          pagination={{ pageSize: 5 }}
          locale={{ emptyText: 'Không có sản phẩm nào' }}
        />
      </Card>
    </div>
  );
};

export default ShopDetailPage;
