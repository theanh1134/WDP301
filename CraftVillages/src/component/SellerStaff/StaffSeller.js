import React, { useState, useEffect } from 'react';
import { Table, Input, Card, Space, Tag, Button, Row, Col, Tooltip,  } from 'antd';
import { SearchOutlined,  EyeOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import './StaffSeller.scss';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const StaffSeller = () => {
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });

  const navigate = useNavigate();

  // Column definitions for the table
  const columns = [
    {
      title: 'Tên Cửa Hàng',
      dataIndex: 'shopName',
      key: 'name',
      width: '20%',
      align: 'center',
    },
    {
      title: 'Email',
      dataIndex: ['sellerId', 'email'],
      key: 'email',
      width: '20%',
      align: 'center',
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: ['sellerId', 'phoneNumber'],
      key: 'role',
      width: '15%',
      align: 'center',
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: '12%',
      align: 'center',
      render: (isActive) => (
        <Tag color={isActive !== null && isActive ? 'success' : 'error'}>
          {isActive !== null && isActive ? 'Hoạt động': 'Đã khóa'}
        </Tag>
      ),
    },
    {
      title: 'Ngày Gia Nhập',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '15%',
      align: 'center',
    },
    {
      title: 'Hành Động',
      key: 'actions',
      width: '10%',
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button type="text" style={{ color: '#1cbcd1ff', fontSize:'20px' }}  icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
          </Tooltip>
          {record.isActive !== null && record.isActive ? (
            <Tooltip title="Ban Seller">
              <Button 
                type="text" 
                danger
                style={{  fontSize:'20px'  }} 
                icon={<LockOutlined />} 
                onClick={() => handleToggleActive(record)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Unban Seller">
              <Button 
                type="text"
                style={{ color: '#52c41a', fontSize:'20px'  }} 
                icon={<UnlockOutlined />}
                onClick={() => handleToggleActive(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const handleViewDetails = (record) => {
    navigate(`/staff/${record._id}`)
  };

const handleToggleActive = async (record) => {
  console.log('Toggle active for:', record);
  console.log('Toggle active for:', record._id);

  // Đảo trạng thái isActive
  const updatedUser = { ...record, isActive: !record.isActive };

  await axios.patch(`http://localhost:9999/staff/shops/${record._id}/toggle`)
  toast.success(record.isActive ? 'Khóa cửa hàng thành công':'Mở khóa cửa hàng thành công');
  // Cập nhật lại state users
  setShops(prevUsers =>
    prevUsers.map(user =>
      user._id === record._id ? updatedUser : user
    )
  );
};

  const handleTableChange = (newPagination) => {
    fetchUsers({
      pagination: newPagination,
      searchText,
      skipLoading: false
    });
  };

  const handleSearch = () => {
    fetchUsers({
      pagination: { ...pagination, current: 1 },
      searchText,
      skipLoading: false
    });
  };

  // Function to fetch users (to be replaced with actual API call)
const fetchUsers = async (params = {}) => {
  if (!params.skipLoading) {
    setLoading(true);
  }

  try {
    // Lấy danh sách shop từ API
    const res = await axios.get(`http://localhost:9999/staff/shops`);
    const allShops = res.data.data || [];

    // Lọc theo searchText nếu có
    const searchText = params.searchText || '';
    const filteredData = searchText
      ? allShops.filter(shop =>
          shop.shopName.toLowerCase().includes(searchText.toLowerCase()) ||
          shop.sellerId?.email?.toLowerCase().includes(searchText.toLowerCase())
        )
      : allShops;

    // Lấy thông tin phân trang hiện tại
    const currentPage = params.pagination?.current || pagination.current;
    const pageSize = params.pagination?.pageSize || pagination.pageSize;

    // Cắt dữ liệu theo trang
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Cập nhật state
    setShops(paginatedData);
    setPagination(prev => ({
      ...prev,
      current: currentPage,
      pageSize: pageSize,
      total: filteredData.length
    }));
  } catch (error) {
    console.error('Error fetching shops:', error);
  } finally {
    setLoading(false);
  }
};

  // Initial fetch and search effect
  useEffect(() => {
    fetchUsers({
      pagination,
      searchText,
      skipLoading: true
    });
  }, []);

  return (
    <div className="user-admin-container">
      <Card className="user-admin-card">
        <Row justify="space-between" align="middle" className="header-row">
          <Col>
            <h2 className="table-title">Sellers List</h2>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} className="search-row">
          <Col flex="auto">
            <Input
              placeholder="Search by name or email"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col>
            <Space>
              <Button type="primary" onClick={handleSearch}>
                Search
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={shops}
          rowKey={record => record.id}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          className="user-table"
        />
      </Card>
    </div>
  );
};

export default StaffSeller;