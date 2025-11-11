import React, { useState } from "react";
import { Modal, Checkbox, List } from "antd";
import { getImageUrl } from "../utils/imageHelper";

const ProductModal = ({ open, products, onCancel, onConfirm, orderId, returnids }) => {
  const [checkedList, setCheckedList] = useState([]);

  const handleCheck = (id, checked) => {
    if (checked) {
      setCheckedList((prev) => [...prev, id]);
    } else {
      setCheckedList((prev) => prev.filter((x) => x !== id));
    }
  };

  function isIdInList(list, id) {
        if (!Array.isArray(list)) return false;
        return list.some(item => String(item.productId) === String(id));
    }

  const handleConfirm = () => {
    if(checkedList.length < 1 ) {
      alert("Hãy chọn ít nhất 1 sản phẩm")
      return
    }
    onConfirm(checkedList, orderId);
    setCheckedList([]); // reset sau khi xác nhận
  };

  const handleCancel = () => {
    setCheckedList([]); // reset khi hủy
    onCancel();
  };

  return (
    <Modal
      title="Chọn sản phẩm"
      open={open}
      onCancel={onCancel}
      onOk={handleConfirm}
      okText="Xác nhận"
      cancelText="Hủy"
      width={600}
    >
      <List
        dataSource={products}
        renderItem={(p) => {
          if(isIdInList(returnids, p.productId)) return null;
          return(
          <List.Item style={{ padding: '12px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '12px' }}>
              <Checkbox
                checked={checkedList.includes(p.productId)}
                onChange={(e) => handleCheck(p.productId, e.target.checked)}
              />
              {p.thumbnailUrl ? (
                <img
                  src={getImageUrl(p.thumbnailUrl)}
                  alt={p.productName}
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #e8e8e8'
                  }}
                  onError={(e) => {
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
              ) : (
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '8px',
                  border: '1px solid #e8e8e8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f5',
                  color: '#bbb',
                  fontSize: '12px'
                }}>
                  No Image
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                  {p.productName}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  Số lượng: {p.quantity} | Giá: {(p.priceAtPurchase || 0).toLocaleString()} VND
                </div>
              </div>
            </div>
          </List.Item>
        )}}
      />
    </Modal>
  );
};

export default ProductModal;
