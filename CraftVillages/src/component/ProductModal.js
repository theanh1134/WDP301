import React, { useState } from "react";
import { Modal, Checkbox, List } from "antd";

const ProductModal = ({ open, products, onCancel, onConfirm, orderId }) => {
  const [checkedList, setCheckedList] = useState([]);

  const handleCheck = (id, checked) => {
    if (checked) {
      setCheckedList((prev) => [...prev, id]);
    } else {
      setCheckedList((prev) => prev.filter((x) => x !== id));
    }
  };

  const handleConfirm = () => {
    onConfirm(checkedList, orderId);
    setCheckedList([]); // reset sau khi xác nhận
  };

  return (
    <Modal
      title="Chọn sản phẩm"
      open={open}
      onCancel={onCancel}
      onOk={handleConfirm}
      okText="Xác nhận"
      cancelText="Hủy"
    >
      <List
        dataSource={products}
        renderItem={(p) => (
          <List.Item>
            <Checkbox
              checked={checkedList.includes(p.productId)}
              onChange={(e) => handleCheck(p.productId, e.target.checked)}
            >
              {p.productName}
            </Checkbox>
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default ProductModal;
