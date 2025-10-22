import React, { useState, useEffect } from 'react';
import { Table, Input, Card, Space, Tag, Button, Row, Col, Tooltip } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './StaffSeller.scss';

const StaffReturn = () => {
  const [loading, setLoading] = useState(false);
  const [returns, setReturns] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  });

  const navigate = useNavigate();

  // 🧩 Cột mới của bảng
  const columns = [
    {
      title: 'Người Mua',
      dataIndex: ['buyerId', 'fullName'],
      key: 'buyer',
      align: 'center',
      width: '25%',
    },
    {
      title: 'Tên Cửa Hàng',
      dataIndex: ['shopId', 'shopName'],
      key: 'shop',
      align: 'center',
      width: '25%',
      render: (shopName) => shopName || '—' // Nếu null thì hiển thị gạch ngang
    },
    {
      title: 'Lý Do Hoàn Trả',
      dataIndex: 'reasonDetail',
      key: 'reasonDetail',
      align: 'center',
      width: '30%',
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: '15%',
      render: (status) => {
        let color = 'default';
        switch (status) {
          case 'REQUESTED': color = 'gold'; break;
          case 'APPROVED': color = 'green'; break;
          case 'PICKUP_SCHEDULED': color = 'purple'; break;
          case 'REJECTED': color = 'red'; break;
          default: color = 'default';
        }
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Hành Động',
      key: 'action',
      align: 'center',
      width: '10%',
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="text"
            style={{ color: '#1cbcd1ff', fontSize: '20px' }}
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          />
        </Tooltip>
      ),
    },
  ];

  const handleViewDetails = (record) => {
    navigate(`/staff/returns/${record._id}`);
  };

  const handleTableChange = (newPagination) => {
    fetchReturns({
      pagination: newPagination,
      searchText,
      skipLoading: false
    });
  };

  const handleSearch = () => {
    fetchReturns({
      pagination: { ...pagination, current: 1 },
      searchText,
      skipLoading: false
    });
  };

  // 🧠 Gọi API lấy dữ liệu
  const fetchReturns = async (params = {}) => {
    if (!params.skipLoading) setLoading(true);

    try {
      const res = await axios.get(`http://localhost:9999/staff/returns`);
      const allReturns = res.data.data || [];

      const searchText = params.searchText || '';
      const filteredData = searchText
        ? allReturns.filter(item =>
            item.buyerId?.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.shopId?.shopName?.toLowerCase().includes(searchText.toLowerCase())
          )
        : allReturns;

      const currentPage = params.pagination?.current || pagination.current;
      const pageSize = params.pagination?.pageSize || pagination.pageSize;

      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      setReturns(paginatedData);
      setPagination(prev => ({
        ...prev,
        current: currentPage,
        pageSize: pageSize,
        total: filteredData.length
      }));
    } catch (error) {
      console.error('Error fetching return list:', error);
      toast.error('Không thể tải danh sách yêu cầu hoàn trả.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns({
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
            <h2 className="table-title">Danh Sách Yêu Cầu Hoàn Trả</h2>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} className="search-row">
          <Col flex="auto">
            <Input
              placeholder="Tìm theo người mua hoặc cửa hàng"
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
                Tìm kiếm
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={returns}
          rowKey={record => record._id}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          className="user-table"
        />
      </Card>
    </div>
  );
};

export default StaffReturn;
