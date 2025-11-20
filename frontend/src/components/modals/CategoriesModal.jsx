import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import Loader from "../Loader";

const CategoriesModal = ({ 
  show,
  handleClose, 
  productCategories, 
  setProductCategories, 
  categoryList, 
  loadingHandle,
  errorHandle
}) => {
  const [allCategories, setAllCategories] = useState(categoryList);
  const [newCategory, setNewCategory] = useState("");

  useEffect(()=>{
    errorHandle && toast.warning("Unable to fetch all categories from database, please retry.")
  }, [errorHandle])

  const handleToggleCategory = (category) => {
    if (productCategories.includes(category)) {
      setProductCategories(productCategories.filter((c) => c !== category));
    } else {
      setProductCategories([...productCategories, category]);
    }
  };

  const handleAddCategory = () => {
    const formatted = newCategory.trim().toLowerCase();

    if (!newCategory.trim()) return;
    if (allCategories.includes(formatted)) {
      toast.warning("Category already exists.");
      return;
    };

    setAllCategories((prev) => [...prev, formatted]);
    setProductCategories((prev) => [...prev, formatted]);
    setNewCategory("");
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Manage Categories</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        Recently Used Categories
        <div className="d-flex flex-wrap gap-3">
          {productCategories?.map((cat, index) => (
            <Form.Check
              key={index}
              type="checkbox"
              id={`cat-${index}`}
              checked={productCategories.includes(cat)}
              onChange={() => handleToggleCategory(cat)}
              label={cat}
              className="me-3 mb-2"
            />
          ))}
        </div>
        <hr />
        List Of Categories
        {loadingHandle ? (
            <Loader size={50} />
        ) : (
          <div className="d-flex flex-wrap gap-3">
            {allCategories?.map((cat, index) => (
              <Form.Check
                key={index}
                type="checkbox"
                id={`cat-${index}`}
                checked={productCategories.includes(cat)}
                onChange={() => handleToggleCategory(cat)}
                label={cat}
                className="me-3 mb-2"
              />
            ))}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="d-flex gap-2 justtify-content-center">
        <Form.Control
          type="text"
          placeholder="Add custom category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <Button variant="primary" onClick={handleAddCategory}>
          Add
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CategoriesModal
