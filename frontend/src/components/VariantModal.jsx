import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";

const VariantModal = ({ show, handleClose, variant, handleUpdate }) => {
  const [variantName, setVariantName] = useState(variant?.variantName || "");
  const [sizes, setSizes] = useState(variant?.sizes || []);

  useEffect(() => {
    setVariantName(variant?.variantName || "");
    setSizes(variant?.sizes || []);
  }, [variant]);

  const handleSizeChange = (index, field, value) => {
    const updated = [...sizes];
    updated[index][field] = value;
    setSizes(updated);
  };

  const onUpdate = () => {
    handleUpdate({ ...variant, name: variantName, sizes });
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Variant : {variantName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>

        <Row className="mb-3">
        {sizes.map((item, index) => (
          <Row key={index} className="align-items-center mb-2">
            <Col>
              <Form.Control
                placeholder="Size"
                value={item.size}
                onChange={(e) => handleSizeChange(index, "size", e.target.value.toUpperCase())}
              />
            </Col>
            <Col>
              <Form.Control
                placeholder="Stock"
                type="number"
                value={item.stock}
                onChange={(e) => handleSizeChange(index, "stock", e.target.value)}
              />
            </Col>
            <Col xs="auto">
              <Button variant="danger" className="btn-sm mx-1 my-2" onClick={() => setSizes(sizes.filter((_, i) => i !== index))}>
                <FaTrash color="white" />
              </Button>
            </Col>
          </Row>
        ))}
        </Row>
        <Button variant="outline-primary" onClick={()=>setSizes([...sizes, { size: "", stock: "" }])}>
          Add Size
        </Button>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={onUpdate}>
          Update
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VariantModal;
