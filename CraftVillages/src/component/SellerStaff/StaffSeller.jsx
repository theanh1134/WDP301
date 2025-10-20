import React, { useState, useEffect } from 'react';
import { Table, Input, Card, Space, Tag, Button, Row, Col, Tooltip, Dropdown, message } from 'antd';
import { SearchOutlined, UserAddOutlined, FileExcelOutlined, EyeOutlined, EditOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import './StaffSeller.scss';
import { useNavigate } from 'react-router-dom';

const USER_ROLES = ['Lecturer', 'Student', 'Manager'];

const StaffSeller = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const navigate = useNavigate();

  // Fake data for demonstration
  const fakeUsers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Student',
      status: 'active',
      joinedDate: '2025-01-15',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'Lecturer',
      status: 'inactive',
      joinedDate: '2025-02-20',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.j@example.com',
      role: 'Admin',
      status: 'active',
      joinedDate: '2025-03-10',
    },
    {
      id: 4,
      name: 'Sarah Williams',
      email: 'sarah.w@example.com',
      role: 'Manager',
      status: 'active',
      joinedDate: '2025-03-15',
    },
    {
      id: 5,
      name: 'Alex Brown',
      email: 'alex.b@example.com',
      role: 'Student',
      status: 'inactive',
      joinedDate: '2025-04-01',
    },
    {
      id: 6,
      name: 'Emily Davis',
      email: 'emily.d@example.com',
      role: 'Student',
      status: 'active',
      joinedDate: '2025-04-15',
    },
    {
      id: 7,
      name: 'Chris Wilson',
      email: 'chris.w@example.com',
      role: 'Lecturer',
      status: 'active',
      joinedDate: '2025-05-01',
    },
    {
      id: 8,
      name: 'Lisa Anderson',
      email: 'lisa.a@example.com',
      role: 'Student',
      status: 'active',
      joinedDate: '2025-05-10',
    },
    {
      id: 9,
      name: 'David Taylor',
      email: 'david.t@example.com',
      role: 'Student',
      status: 'inactive',
      joinedDate: '2025-06-01',
    },
    {
      id: 10,
      name: 'Emma Miller',
      email: 'emma.m@example.com',
      role: 'Lecturer',
      status: 'active',
      joinedDate: '2025-06-15',
    },
    {
      id: 11,
      name: 'James Wilson',
      email: 'james.w@example.com',
      role: 'Student',
      status: 'active',
      joinedDate: '2025-07-01',
    },
    {
      id: 12,
      name: 'Olivia Moore',
      email: 'olivia.m@example.com',
      role: 'Student',
      status: 'active',
      joinedDate: '2025-07-15',
    }
  ];

  // Column definitions for the table
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      align: 'center',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '25%',
      align: 'center',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: '12%',
      align: 'center',
      render: (role) => (
        <Tag color={role === 'Lecturer' ? 'blue' : role === 'Student' ? 'green': role === 'Admin'? 'red' :'orange'}>
          {role}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      align: 'center',
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'error'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Joined Date',
      dataIndex: 'joinedDate',
      key: 'joinedDate',
      width: '15%',
      align: 'center',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '15%',
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button type="text" style={{ color: '#1cbcd1ff', fontSize:'20px' }}  icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
          </Tooltip>
          <Dropdown
            menu={{
              items: USER_ROLES
                .filter(role => role !== record.role) // Remove current role
                .map(role => ({
                  key: role,
                  label: `Change to ${role}`,
                  onClick: () => handleRoleChange(record, role)
                }))
            }}
            trigger={['click']}
          >
            <Tooltip title="Change Role">
              <Button type="text" style={{ color: '#d3b119ff', fontSize:'20px' }} icon={<EditOutlined />} />
            </Tooltip>
          </Dropdown>
          {record.status === 'active' ? (
            <Tooltip title="Ban User">
              <Button 
                type="text" 
                danger
                style={{  fontSize:'20px'  }} 
                icon={<LockOutlined />} 
                onClick={() => handleBan(record)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Unban User">
              <Button 
                type="text"
                style={{ color: '#52c41a', fontSize:'20px'  }} 
                icon={<UnlockOutlined />}
                onClick={() => handleUnban(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const handleViewDetails = (record) => {
    console.log('detail')
  };

  const handleRoleChange = (record, newRole) => {
    // TODO: Implement API call here
    const updatedUser = { ...record, role: newRole };
    setUsers(users.map(user => user.id === record.id ? updatedUser : user));
    message.success(`Changed ${record.name}'s role to ${newRole}`);
  };

  const handleBan = (record) => {
    console.log('Ban user:', record);
    // TODO: Implement API call here
    const updatedUser = { ...record, status: 'inactive' };
    setUsers(users.map(user => user.id === record.id ? updatedUser : user));
  };

  const handleUnban = (record) => {
    console.log('Unban user:', record);
    // TODO: Implement API call here
    const updatedUser = { ...record, status: 'active' };
    setUsers(users.map(user => user.id === record.id ? updatedUser : user));
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
    // Function to process and filter users
    const getFilteredUsers = (searchText, currentPage, pageSize) => {
      // First, filter by search text
      let filteredData = searchText 
        ? fakeUsers.filter(user => 
            user.name.toLowerCase().includes(searchText.toLowerCase()) ||
            user.email.toLowerCase().includes(searchText.toLowerCase())
          )
        : [...fakeUsers];

      // Calculate pagination
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      // Return paginated result and total
      return {
        data: filteredData.slice(startIndex, endIndex),
        total: filteredData.length
      };
    };
    if (!params.skipLoading) {
      setLoading(true);
    }
    
    try {
      // Simulating API call with setTimeout
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get current pagination values
      const currentPage = params.pagination?.current || pagination.current;
      const pageSize = params.pagination?.pageSize || pagination.pageSize;
      
      // Filter and paginate users
      const { data, total } = getFilteredUsers(params.searchText, currentPage, pageSize);
      
      // Update users list
      setUsers(data);
      
      // Update pagination
      setPagination(prev => ({
        ...prev,
        current: currentPage,
        pageSize: pageSize,
        total: total
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
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
            <h2 className="table-title">Sellers Management</h2>
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
          dataSource={users}
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