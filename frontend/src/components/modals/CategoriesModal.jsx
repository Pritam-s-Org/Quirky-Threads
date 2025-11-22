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
  refetchHandle,
  errorHandle
}) => {
  const [allCategories, setAllCategories] = useState(categoryList);
  const [newCategory, setNewCategory] = useState("");

  useEffect(()=>{
    errorHandle ? toast.warning("Unable to fetch all categories from database, please retry.") : refetchHandle();
  }, [refetchHandle, errorHandle])

  const handleToggleCategory = (category) => {
    if (productCategories?.includes(category)) {
      setProductCategories(productCategories.filter((c) => c !== category));
    } else {
      if (productCategories.length > 5) {
        return toast.warning("You cannot added more than 5 categories for a particular product.")
      }
      setProductCategories([...productCategories, category]);
    }
  };

  const handleAddCategory = () => {
    const formatted = newCategory.trim().toLowerCase();

    if (allCategories.includes(formatted)) {
      return toast.warning("Category already exist, try something new.");
    } else if (productCategories.length >= 5) {
      return toast.warning("You cannot added more than 5 categories for a particular product.")
    } else if (newCategory.length > 20 || newCategory.length <= 3){
      return toast.warning("Please use characherts more than 3 but less than 21")
    }

    setAllCategories((prev) => [formatted, ...prev]);
    setProductCategories((prev) => [formatted, ...prev]);
    setNewCategory("");
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Manage Categories</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        Categories for This Product ({productCategories.length}/5)
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
              variant="warning"
            />
          ))}
        </div>
        <hr />
        All Existing Categories (including newly added)
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
                disabled={productCategories.length >=5 }
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
          onChange={(e) => setNewCategory(e.target.value?.toLowerCase())}
        />
        <Button variant="warning" onClick={handleAddCategory} disabled={!newCategory.trim()}>
          Add
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CategoriesModal
