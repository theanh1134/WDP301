import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Table, OverlayTrigger, Tooltip, Badge, Spinner } from 'react-bootstrap';
import styled from 'styled-components';
import { FaDownload, FaCalendar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import shipperService from '../../services/shipperService';

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

function Earnings({ userId }) {
  // Get current month date range
  const getCurrentMonthRange = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0]
    };
  };
  
  const currentMonth = getCurrentMonthRange();
  const [startDate, setStartDate] = useState(currentMonth.start);
  const [endDate, setEndDate] = useState(currentMonth.end);
  const [selectedMonth, setSelectedMonth] = useState('current');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(earningsData);
  const [summary, setSummary] = useState({
    totalEarnings: 0,
    totalBonus: 0,
    totalDeductions: 0
  });

  useEffect(() => {
    // Load earnings data based on date range
    if (userId) {
      loadEarnings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, userId]);

  const getMonthDateRange = (monthOffset) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    let month, year;
    
    switch(monthOffset) {
      case 'current':
        month = currentMonth;
        year = currentYear;
        break;
      case 'previous':
        month = currentMonth - 1;
        year = currentYear;
        if (month < 0) {
          month = 11;
          year -= 1;
        }
        break;
      case 'last3':
        // Return first day of 3 months ago to today
        const threeMonthsAgo = new Date(currentYear, currentMonth - 2, 1);
        return {
          start: threeMonthsAgo.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      case 'last6':
        // Return first day of 6 months ago to today
        const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);
        return {
          start: sixMonthsAgo.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        };
      default:
        month = currentMonth;
        year = currentYear;
    }
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0]
    };
  };

  const handleMonthFilter = (monthOffset) => {
    const { start, end } = getMonthDateRange(monthOffset);
    setStartDate(start);
    setEndDate(end);
    setSelectedMonth(monthOffset);
  };

  const loadEarnings = async () => {
    try {
      setLoading(true);
      console.log('Loading earnings for userId:', userId, 'from', startDate, 'to', endDate);
      
      const response = await shipperService.getEarnings(userId, startDate, endDate);
      console.log('Earnings response:', response);
      
      if (response && response.success) {
        // Set transactions data
        const earningsRecords = response.data || [];
        console.log('Earnings records count:', earningsRecords.length);
        console.log('Raw earnings records:', earningsRecords);
        
        // Transform API data to match table format
        const transformedTransactions = earningsRecords.map(record => {
          console.log('Processing record:', record);
          console.log('orderId data:', record.orderId);
          console.log('returnId data:', record.returnId);
          console.log('shipmentId data:', record.shipmentId);
          
          // Get order reference - prioritize direct orderId, then shipmentId.orderId
          const orderRef = record.orderId || record.shipmentId?.orderId;
          const returnRef = record.returnId || record.shipmentId?.returnId;
          
          // Get order ID from multiple possible sources
          const orderId = orderRef?.orderNumber || 
                         orderRef?._id || 
                         returnRef?.rmaCode ||
                         returnRef?._id ||
                         record._id ||
                         'N/A';
          
          // Get customer name
          const customerName = orderRef?.shippingAddress?.recipientName || 
                              orderRef?.buyerInfo?.fullName || 
                              returnRef?.buyerId?.fullName ||
                              'Khách hàng';
          
          // Get amount - try multiple paths
          let amount = 0;
          if (orderRef) {
            amount = orderRef.finalAmount || orderRef.subtotal || 0;
            console.log('Amount from orderRef:', amount);
          } else if (returnRef) {
            amount = returnRef.amounts?.refundTotal || 0;
            console.log('Amount from returnRef:', amount);
          }
          
          return {
            id: record._id,
            date: new Date(record.date || record.createdAt).toLocaleDateString('vi-VN'),
            orderId: orderId,
            customerName: customerName,
            amount: amount,
            shippingFee: record.earnings?.baseFee || record.earnings?.total || 0,
            bonus: record.earnings?.bonus || 0,
            total: record.earnings?.total || 0,
            status: record.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING'
          };
        });
        
        console.log('Transformed transactions:', transformedTransactions);
        setTransactions(transformedTransactions);
        
        // Set summary data
        if (response.summary) {
          setSummary({
            totalEarnings: response.summary.totalEarnings || 0,
            totalBonus: response.summary.totalBonus || 0,
            totalDeductions: response.summary.totalDeductions || 0
          });
        }
        
        // Generate chart data from earnings records
        const chartDataMap = new Map();
        earningsRecords.forEach(record => {
          const date = new Date(record.date || record.createdAt);
          const dateKey = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!chartDataMap.has(dateKey)) {
            chartDataMap.set(dateKey, {
              date: dateKey,
              earnings: 0,
              completedOrders: 0
            });
          }
          
          const dayData = chartDataMap.get(dateKey);
          dayData.earnings += record.earnings?.total || 0;
          if (record.status === 'COMPLETED') {
            dayData.completedOrders += 1;
          }
        });
        
        const generatedChartData = Array.from(chartDataMap.values()).sort((a, b) => {
          const [dayA, monthA] = a.date.split('/');
          const [dayB, monthB] = b.date.split('/');
          return new Date(2025, parseInt(monthA) - 1, parseInt(dayA)) - 
                 new Date(2025, parseInt(monthB) - 1, parseInt(dayB));
        });
        
        console.log('Generated chart data:', generatedChartData);
        
        if (generatedChartData.length > 0) {
          setChartData(generatedChartData);
        }
        
      } else {
        console.error('Failed to load earnings:', response?.message);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error loading earnings:', error);
      toast.error('Không thể tải dữ liệu thu nhập');
      setTransactions([]);
    } finally {
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

  // Calculate totals from actual data IN THE SELECTED DATE RANGE
  const totalEarnings = summary.totalEarnings || transactions.reduce((sum, t) => sum + t.total, 0);
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
            {/* Month Quick Filter */}
            <div className="mb-3 pb-3 border-bottom">
              <Form.Label className="mb-2">Lọc theo tháng</Form.Label>
              <div className="d-flex gap-2 flex-wrap">
                <Button 
                  variant={selectedMonth === 'current' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => handleMonthFilter('current')}
                >
                  Tháng này
                </Button>
                <Button 
                  variant={selectedMonth === 'previous' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => handleMonthFilter('previous')}
                >
                  Tháng trước
                </Button>
                <Button 
                  variant={selectedMonth === 'last3' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => handleMonthFilter('last3')}
                >
                  3 tháng gần đây
                </Button>
                <Button 
                  variant={selectedMonth === 'last6' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => handleMonthFilter('last6')}
                >
                  6 tháng gần đây
                </Button>
              </div>
            </div>

            {/* Custom Date Range Filter */}
            <Row className="g-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Từ ngày</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setSelectedMonth('custom');
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Đến ngày</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setSelectedMonth('custom');
                    }}
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
        <div className="mb-3">
          <small className="text-muted">
            📅 Hiển thị dữ liệu từ <strong>{new Date(startDate).toLocaleDateString('vi-VN')}</strong> đến <strong>{new Date(endDate).toLocaleDateString('vi-VN')}</strong>
          </small>
        </div>
        <div className="summary-cards">
          <StatBox gradient="#e3f2fd" gradient2="#bbdefb">
            <div className="card-body">
              <div className="stat-value" style={{ color: '#1976d2' }}>
                {Math.round(totalEarnings).toLocaleString('vi-VN')}
              </div>
              <div className="stat-label">Tổng thu nhập</div>
              <small className="text-muted">Trong khoảng thời gian đã chọn</small>
            </div>
          </StatBox>

          <StatBox gradient="#e8f5e8" gradient2="#c8e6c8">
            <div className="card-body">
              <div className="stat-value" style={{ color: '#2e7d32' }}>
                {completedOrders}
              </div>
              <div className="stat-label">Đơn hoàn thành</div>
              <small className="text-muted">Trong khoảng thời gian đã chọn</small>
            </div>
          </StatBox>

          <StatBox gradient="#fff3e0" gradient2="#ffe0b2">
            <div className="card-body">
              <div className="stat-value" style={{ color: '#f57c00' }}>
                {Math.round(avgPerOrder).toLocaleString('vi-VN')}
              </div>
              <div className="stat-label">Thu nhập trung bình/đơn</div>
              <small className="text-muted">Trong khoảng thời gian đã chọn</small>
            </div>
          </StatBox>
        </div>

        {/* Charts */}
        <div className="chart-container">
          <h5 className="mb-3">📈 Biểu đồ thu nhập</h5>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">Không có dữ liệu biểu đồ</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
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
          )}
        </div>

        <div className="chart-container">
          <h5 className="mb-3">📊 Biểu đồ số đơn hoàn thành</h5>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">Không có dữ liệu biểu đồ</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <ChartTooltip />
                <Legend />
                <Bar dataKey="completedOrders" fill="#2e7d32" name="Số đơn hoàn thành" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">💰 Chi tiết giao dịch</h5>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Đang tải dữ liệu giao dịch...</p>
            </div>
          ) : (
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
                        Không có dữ liệu giao dịch trong khoảng thời gian này
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
          )}
        </Card.Body>
      </Card>
    </EarningsWrapper>
  );
}

export default Earnings;
