import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Table, OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';
import styled from 'styled-components';
import { FaDownload, FaCalendar, FaChartLine, FaCheckCircle, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const EarningsWrapper = styled.div`
  .summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .chart-container {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const StatBox = styled(Card)`
  border: none;
  background: linear-gradient(135deg, ${props => props.gradient || '#e3f2fd'} 0%, ${props => props.gradient2 || '#bbdefb'} 100%);
  border-radius: 8px;
  text-align: center;
  
  .card-body {
    padding: 1.5rem;
  }

  .stat-value {
    font-size: 1.8rem;
    font-weight: 700;
    color: #1976d2;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    font-size: 0.85rem;
    color: #555;
    font-weight: 500;
  }
`;

const earningsData = [
  { date: '01/01', earnings: 450000, completedOrders: 5 },
  { date: '02/01', earnings: 520000, completedOrders: 6 },
  { date: '03/01', earnings: 480000, completedOrders: 5 },
  { date: '04/01', earnings: 610000, completedOrders: 7 },
  { date: '05/01', earnings: 750000, completedOrders: 8 },
  { date: '06/01', earnings: 680000, completedOrders: 7 },
  { date: '07/01', earnings: 820000, completedOrders: 9 },
];

const transactionData = [
  {
    id: '1',
    date: '2025-01-21',
    orderId: 'ORD-001',
    customerName: 'Nguyễn Văn A',
    amount: 720000,
    shippingFee: 30000,
    bonus: 5000,
    total: 35000,
    status: 'COMPLETED'
  },
  {
    id: '2',
    date: '2025-01-21',
    orderId: 'ORD-002',
    customerName: 'Trần Thị B',
    amount: 950000,
    shippingFee: 25000,
    bonus: 0,
    total: 25000,
    status: 'COMPLETED'
  },
  {
    id: '3',
    date: '2025-01-20',
    orderId: 'ORD-003',
    customerName: 'Lê Văn C',
    amount: 1200000,
    shippingFee: 40000,
    bonus: 10000,
    total: 50000,
    status: 'COMPLETED'
  },
  {
    id: '4',
    date: '2025-01-20',
    orderId: 'ORD-004',
    customerName: 'Phạm Thị D',
    amount: 580000,
    shippingFee: 20000,
    bonus: 0,
    total: 20000,
    status: 'PENDING'
  }
];

function Earnings({ userId }) {
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2025-01-31');
  const [transactions, setTransactions] = useState(transactionData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load earnings data based on date range
    loadEarnings();
  }, [startDate, endDate]);

  const loadEarnings = async () => {
    try {
      setLoading(true);
      // API call here
      // const response = await shipperService.getEarnings(userId, startDate, endDate);
      // setTransactions(response.data);
      
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoading(false);
    } catch (error) {
      console.error('Error loading earnings:', error);
      toast.error('Không thể tải dữ liệu thu nhập');
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    try {
      // Create CSV
      const headers = ['Ngày', 'Mã đơn', 'Khách hàng', 'Giá trị đơn', 'Phí ship', 'Thưởng', 'Tổng cộng', 'Trạng thái'];
      const rows = transactions.map(t => [
        t.date,
        t.orderId,
        t.customerName,
        t.amount,
        t.shippingFee,
        t.bonus,
        t.total,
        t.status === 'COMPLETED' ? 'Hoàn thành' : 'Chờ xử lý'
      ]);

      let csv = headers.join(',') + '\n';
      rows.forEach(row => {
        csv += row.join(',') + '\n';
      });

      // Download
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
      element.setAttribute('download', `earnings_${startDate}_to_${endDate}.csv`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast.success('Xuất báo cáo thành công');
    } catch (error) {
      toast.error('Lỗi khi xuất báo cáo');
    }
  };

  // Calculate totals
  const totalEarnings = transactions.reduce((sum, t) => sum + t.total, 0);
  const completedOrders = transactions.filter(t => t.status === 'COMPLETED').length;
  const pendingAmount = transactions
    .filter(t => t.status === 'PENDING')
    .reduce((sum, t) => sum + t.total, 0);
  const avgPerOrder = completedOrders > 0 ? totalEarnings / completedOrders : 0;

  const renderStatusBadge = (status) => {
    return status === 'COMPLETED' ? (
      <Badge bg="success">Hoàn thành</Badge>
    ) : (
      <Badge bg="warning">Chờ xử lý</Badge>
    );
  };

  return (
    <EarningsWrapper>
      <div className="mb-4">
        <h2 className="mb-4">📊 Quản lý thu nhập</h2>

        {/* Filter */}
        <Card className="mb-4">
          <Card.Body>
            <Row className="g-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Từ ngày</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Đến ngày</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>&nbsp;</Form.Label>
                  <div>
                    <Button 
                      variant="primary" 
                      className="me-2"
                      onClick={loadEarnings}
                    >
                      <FaCalendar className="me-2" />
                      Tìm kiếm
                    </Button>
                    <Button 
                      variant="outline-success"
                      onClick={handleExportReport}
                    >
                      <FaDownload className="me-2" />
                      Xuất báo cáo
                    </Button>
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Summary Stats */}
        <div className="summary-cards">
          <StatBox gradient="#e3f2fd" gradient2="#bbdefb">
            <div className="card-body">
              <div className="stat-value" style={{ color: '#1976d2' }}>
                {totalEarnings.toLocaleString()}
              </div>
              <div className="stat-label">Tổng thu nhập</div>
              <small className="text-muted">VND</small>
            </div>
          </StatBox>

          <StatBox gradient="#e8f5e8" gradient2="#c8e6c8">
            <div className="card-body">
              <div className="stat-value" style={{ color: '#2e7d32' }}>
                {completedOrders}
              </div>
              <div className="stat-label">Đơn hoàn thành</div>
            </div>
          </StatBox>

          <StatBox gradient="#fff3e0" gradient2="#ffe0b2">
            <div className="card-body">
              <div className="stat-value" style={{ color: '#f57c00' }}>
                {avgPerOrder.toLocaleString()}
              </div>
              <div className="stat-label">Thu nhập trung bình/đơn</div>
              <small className="text-muted">VND</small>
            </div>
          </StatBox>

          <StatBox gradient="#f3e5f5" gradient2="#e1bee7">
            <div className="card-body">
              <div className="stat-value" style={{ color: '#7b1fa2' }}>
                {pendingAmount.toLocaleString()}
              </div>
              <div className="stat-label">Chờ thanh toán</div>
              <small className="text-muted">VND</small>
            </div>
          </StatBox>
        </div>

        {/* Charts */}
        <div className="chart-container">
          <h5 className="mb-3">📈 Biểu đồ thu nhập</h5>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip formatter={(value) => `${value.toLocaleString()} VND`} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="earnings" 
                stroke="#1976d2" 
                name="Thu nhập (VND)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h5 className="mb-3">📊 Biểu đồ số đơn hoàn thành</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip />
              <Legend />
              <Bar dataKey="completedOrders" fill="#2e7d32" name="Số đơn hoàn thành" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">💰 Chi tiết giao dịch</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Mã đơn hàng</th>
                  <th>Khách hàng</th>
                  <th>Giá trị đơn hàng</th>
                  <th>Phí giao hàng</th>
                  <th>Thưởng</th>
                  <th>Tổng cộng</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      Không có dữ liệu giao dịch
                    </td>
                  </tr>
                ) : (
                  transactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td>{transaction.date}</td>
                      <td>
                        <strong>{transaction.orderId}</strong>
                      </td>
                      <td>{transaction.customerName}</td>
                      <td>{transaction.amount.toLocaleString()} VND</td>
                      <td>
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip>
                              Phí cơ bản giao hàng
                            </Tooltip>
                          }
                        >
                          <span>{transaction.shippingFee.toLocaleString()} VND</span>
                        </OverlayTrigger>
                      </td>
                      <td>
                        {transaction.bonus > 0 ? (
                          <span className="text-success">+{transaction.bonus.toLocaleString()} VND</span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <strong style={{ color: '#1976d2', fontSize: '1.1rem' }}>
                          {transaction.total.toLocaleString()} VND
                        </strong>
                      </td>
                      <td>{renderStatusBadge(transaction.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </EarningsWrapper>
  );
}

export default Earnings;
