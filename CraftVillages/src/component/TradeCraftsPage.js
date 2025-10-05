import React from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { FaSearch, FaClock, FaTag, FaUser } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import { createGlobalStyle } from 'styled-components';
import Product_1 from '../assets/images/Product_1.jpg';
import Product_2 from '../assets/images/Product_2.png';
import Product_3 from '../assets/images/Product_3.jpg';
import Prouduct_4 from '../assets/images/Prouduct_4.jpg';
import Prouduct_5 from '../assets/images/Prouduct_5.jpg';
import Header from './Header';
import Footer from './Footer';

// Global styles sử dụng styled-components
const GlobalStyle = createGlobalStyle`
  /* Blog Page Styles */
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #333;
    background-color: #f8f9fa;
  }

  .read-more {
    color: #b8860b;
    font-weight: 500;
  }

  .read-more:hover {
    color: #a67a09;
    text-decoration: underline !important;
  }

  .sidebar-title {
    font-weight: 600;
    position: relative;
    padding-bottom: 10px;
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
  }

  .sidebar-title::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 50px;
    height: 2px;
    background-color: #b8860b;
  }

  .categories-list li {
    padding: 8px 0;
    border-bottom: 1px solid #eee;
    transition: all 0.3s;
  }

  .categories-list li:hover {
    padding-left: 5px;
  }

  .categories-list a {
    color: #555;
    transition: all 0.3s;
  }

  .categories-list a:hover {
    color: #b8860b;
  }

  .badge {
    border-radius: 50px;
    padding: 4px 8px;
    font-weight: 500;
    background-color: #f0f0f0 !important;
    color: #777 !important;
  }

  .recent-post img {
    border-radius: 4px;
    transition: transform 0.3s;
  }

  .recent-post:hover img {
    transform: scale(1.05);
  }

  .recent-post h6 {
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .recent-post a:hover {
    color: #b8860b !important;
  }

  .pagination .page-link {
    color: #333;
    border-color: #ddd;
    margin: 0 3px;
    border-radius: 4px;
  }

  .pagination .page-item.active .page-link {
    background-color: #b8860b;
    border-color: #b8860b;
    color: white;
  }

  .pagination .page-link:hover {
    background-color: #f0f0f0;
    color: #b8860b;
  }

  /* Card styling */
  .card {
    transition: all 0.3s;
    margin-bottom: 30px;
  }

  .card-img {
    border-radius: 8px;
    margin-bottom: 15px;
  }

  .card-title {
    font-size: 1.5rem;
    font-weight: 600;
  }

  .post-meta {
    margin-bottom: 15px;
    font-size: 0.85rem;
  }

  /* Media queries */
  @media (max-width: 992px) {
    .col-lg-8 {
      margin-bottom: 40px;
    }
  }
`;

const TradeCraftsPage = () => {
    return (
        <>
            <GlobalStyle />
            <Header />
            <Container className="py-4">
                <Row>
                    <Col lg={8}>
                        {/* Đồ Gốm Article */}
                        <article className="mb-5">
                            <Card className="border-0">
                                <Card.Img
                                    src={Product_1}
                                    alt="Đồ gốm truyền thống Việt Nam"
                                />
                                <Card.Body className="px-0">
                                    <div className="post-meta mb-2">
                                        <small className="text-muted me-3">
                                            <FaUser className="me-1" /> Admin
                                        </small>
                                        <small className="text-muted me-3">
                                            <FaClock className="me-1" /> 14/04/2023
                                        </small>
                                        <small className="text-muted">
                                            <FaTag className="me-1" /> The Anh
                                        </small>
                                    </div>
                                    <Card.Title as="h2" className="mb-3">Đồ gốm</Card.Title>
                                    <Card.Text>
                                        Đồ gốm được sản xuất bằng cách đóng khuôn rồi đem đi nung ở nhiệt độ từ khoảng 800 độ C trở lên. Gốm được làm từ đất sét trộn với các loại phụ gia khác, trải qua nhiều công đoạn như nhào nặn, tạo hình, sấy khô, tráng men, nung. Đây là những sản phẩm gốm sứ rất đẹp và tinh xảo...
                                    </Card.Text>
                                    <Button variant="link" className="text-decoration-none p-0 read-more">Xem thêm</Button>
                                </Card.Body>
                            </Card>
                        </article>

                        {/* Lụa Sản Xuất Article */}
                        <article className="mb-5">
                            <Card className="border-0">
                                <Card.Img
                                    src={Product_2}
                                    alt="Lụa truyền thống Việt Nam"
                                />
                                <Card.Body className="px-0">
                                    <div className="post-meta mb-2">
                                        <small className="text-muted me-3">
                                            <FaUser className="me-1" /> Admin
                                        </small>
                                        <small className="text-muted me-3">
                                            <FaClock className="me-1" /> 12/04/2023
                                        </small>
                                        <small className="text-muted">
                                            <FaTag className="me-1" /> Craft/Textiles
                                        </small>
                                    </div>
                                    <Card.Title as="h2" className="mb-3">Lụa Sản Xuất Theo Phương Thức Truyền Thống</Card.Title>
                                    <Card.Text>
                                        Lụa là một loại vải được sản xuất từ các sợi protein tự nhiên, một số loại trong đó có thể được dệt thành vải. Loại phổ biến nhất là lụa tằm, được sản xuất từ những chiếc kén của ấu trùng tằm nuôi, và dưới một số hình thức, được gọi là tơ tằm. Quá trình đó được tiến hành bằng cách nhúng kén còn sống vào nước sôi, kéo các đầu của sợi tơ và quấn khoảng 3 đến 8 sợi tơ cùng một lúc lên một guồng quay. Kết quả của quá trình này là các sợi tơ liên tục được tạo ra từ nhiều kén. Kể từ khi xuất hiện, lụa đã trở thành một loại hàng hóa phổ biến trên toàn thế giới và còn được sử dụng rộng rãi đến ngày nay...
                                    </Card.Text>
                                    <Button variant="link" className="text-decoration-none p-0 read-more">Xem thêm</Button>
                                </Card.Body>
                            </Card>
                        </article>

                        {/* Mây Tre Article */}
                        <article className="mb-5">
                            <Card className="border-0">
                                <Card.Img
                                    src={Product_3}
                                    alt="Mây tre đan thủ công"
                                />
                                <Card.Body className="px-0">
                                    <div className="post-meta mb-2">
                                        <small className="text-muted me-3">
                                            <FaUser className="me-1" /> Admin
                                        </small>
                                        <small className="text-muted me-3">
                                            <FaClock className="me-1" /> 10/04/2023
                                        </small>
                                        <small className="text-muted">
                                            <FaTag className="me-1" /> The Anh
                                        </small>
                                    </div>
                                    <Card.Title as="h2" className="mb-3">Mây Tre Nứa Là Thủ Công Mỹ Nghệ</Card.Title>
                                    <Card.Text>
                                        Mây tre đan là một sản phẩm thủ công mỹ nghệ truyền thống nổi tiếng ở nhiều vùng quê Việt Nam. Nguyên liệu chính, như tên gọi, là mây, tre, nứa. Những sản phẩm được đan bằng mây tre nứa thường rất đẹp, chắc chắn và có tính ứng dụng cao. Có rất nhiều dạng sản phẩm như bàn ghế, giỏ, túi xách, hộp đựng đồ, khung tranh, kệ để đồ...Đặc biệt, đây là nghề truyền thống của nhiều làng nghề ở Việt Nam, tạo công ăn việc làm cho nhiều người dân...
                                    </Card.Text>
                                    <Button variant="link" className="text-decoration-none p-0 read-more">Xem thêm</Button>
                                </Card.Body>
                            </Card>
                        </article>

                        {/* Pagination */}
                        <div className="pagination-container d-flex justify-content-center mt-5">
                            <ul className="pagination">
                                <li className="page-item active">
                                    <a className="page-link" href="#">1</a>
                                </li>
                                <li className="page-item">
                                    <a className="page-link" href="#">2</a>
                                </li>
                                <li className="page-item">
                                    <a className="page-link" href="#">3</a>
                                </li>
                                <li className="page-item">
                                    <a className="page-link" href="#">Next</a>
                                </li>
                            </ul>
                        </div>
                    </Col>

                    <Col lg={4}>
                        {/* Search Form */}
                        <div className="mb-5">
                            <InputGroup>
                                <Form.Control
                                    placeholder="Search..."
                                    aria-label="Search"
                                />
                                <Button variant="outline-secondary">
                                    <FaSearch />
                                </Button>
                            </InputGroup>
                        </div>

                        {/* Categories */}
                        <div className="mb-5">
                            <h5 className="mb-3 sidebar-title">Thể loại</h5>
                            <ul className="list-unstyled categories-list">
                                <li className="d-flex justify-content-between mb-2">
                                    <a href="#" className="text-decoration-none text-dark">Thủ công mỹ nghệ</a>
                                    <span className="badge bg-light text-dark">3</span>
                                </li>
                                <li className="d-flex justify-content-between mb-2">
                                    <a href="#" className="text-decoration-none text-dark">Tranh vẽ</a>
                                    <span className="badge bg-light text-dark">4</span>
                                </li>
                                <li className="d-flex justify-content-between mb-2">
                                    <a href="#" className="text-decoration-none text-dark">Lụa thủ công</a>
                                    <span className="badge bg-light text-dark">7</span>
                                </li>
                                <li className="d-flex justify-content-between mb-2">
                                    <a href="#" className="text-decoration-none text-dark">Nón lá</a>
                                    <span className="badge bg-light text-dark">1</span>
                                </li>
                                <li className="d-flex justify-content-between mb-2">
                                    <a href="#" className="text-decoration-none text-dark">Gốm</a>
                                    <span className="badge bg-light text-dark">5</span>
                                </li>
                            </ul>
                        </div>

                        {/* Recent Posts */}
                        <div className="mb-5">
                            <h5 className="mb-4 sidebar-title">Bài viết gần đây</h5>

                            <div className="recent-post d-flex mb-3">
                                <div className="recent-post-img me-3">
                                    <img src={Prouduct_4} alt="Recent post" className="img-fluid" style={{ width: "80px", height: "60px", objectFit: "cover" }} />
                                </div>
                                <div>
                                    <h6 className="mb-1"><a href="#" className="text-decoration-none text-dark">Gương để bàn với thiết kế hiện đại</a></h6>
                                    <small className="text-muted">12/07/2023</small>
                                </div>
                            </div>

                            <div className="recent-post d-flex mb-3">
                                <div className="recent-post-img me-3">
                                    <img src={Prouduct_5} alt="Recent post" className="img-fluid" style={{ width: "80px", height: "60px", objectFit: "cover" }} />
                                </div>
                                <div>
                                    <h6 className="mb-1"><a href="#" className="text-decoration-none text-dark">Handmade jewelry pieces that look wow</a></h6>
                                    <small className="text-muted">09/07/2023</small>
                                </div>
                            </div>

                            <div className="recent-post d-flex mb-3">
                                <div className="recent-post-img me-3">
                                    <img src={Product_1} alt="Recent post" className="img-fluid" style={{ width: "80px", height: "60px", objectFit: "cover" }} />
                                </div>
                                <div>
                                    <h6 className="mb-1"><a href="#" className="text-decoration-none text-dark">Modern homes in minimal style</a></h6>
                                    <small className="text-muted">05/07/2023</small>
                                </div>
                            </div>

                            <div className="recent-post d-flex mb-3">
                                <div className="recent-post-img me-3">
                                    <img src={Product_2} alt="Recent post" className="img-fluid" style={{ width: "80px", height: "60px", objectFit: "cover" }} />
                                </div>
                                <div>
                                    <h6 className="mb-1"><a href="#" className="text-decoration-none text-dark">Colorful office decoration ideas</a></h6>
                                    <small className="text-muted">01/07/2023</small>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container >
            <Footer />
        </>
    );
};

export default TradeCraftsPage;