import { Row, Col, Modal, Button } from "react-bootstrap"
import { Link, useParams } from "react-router-dom";
import Product from "../components/Product";
import Message from "../components/Message.jsx";
import Paginate from "../components/Paginate.jsx";
import ProductCarousel from "../components/ProductCarousel.jsx";
import Meta from "../components/Meta.jsx"
import { useGetProductsQuery } from "../slicers/productApiSlice.js";
import usePWAInstall from "../components/usePWAInstall.jsx";
import { useEffect, useState } from "react";

const HomeScreen = () => {
  const { pageNumber, keyword } = useParams()
  const { data, isLoading, error } = useGetProductsQuery({ keyword, pageNumber })
  const { isInstalled, canInstall, promptInstall } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isInstalled && canInstall) {
      setShowModal(true); // show popup on homepage load
    }
  }, [isInstalled, canInstall]);

  const handleInstall = async () => {
    const result = await promptInstall();
    console.log("Install result:", result?.outcome);
    setShowModal(false);
  };

  return (
    <>
      <Meta title={"Quirky-Threads"} />
      {!keyword ? <ProductCarousel /> :
        <Link to="/" className="btn btn-light mb-4">Go Back</Link>
      }
      {isLoading ? (
        <h2>Please Wait...</h2>
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : <>
        <h1>Latest Products</h1>
        <Row>
          {data.products.map((product) => (
            <Col key={product._id} xs={6} sm={6} md={6} lg={4} xl={3}>
              <Product product={product} />
            </Col>
          ))}
        </Row>
        <Paginate pages={data.pages} page={data.page} keyword={keyword ? keyword : ""} />
        {/* <Row className="row-category">
          <h3 className="text-center">Categories</h3>
          <hr />
          {data.products.map((product) => (
            <Col key={product.category} sm={4} md={3} lg={2} xl={2} style={{ textAlign: "center" }}>
              <Link className="btn btn-outline-dark my-3 px-2 rounded fixed-height link-category" to={`/category/${product.category}`}>
                <h4 className="my-2">{product.category}</h4>
              </Link>
            </Col>
          ))}
          <hr />
        </Row> */}
      </>}
      <Modal show={showModal} onHide={() => setShowModal(false)} top>
        <Modal.Body>
          <h4>Install our app and enjoy:</h4>
          <ul className="mb-0">
            <li>Faster loading and smoother experience</li>
            <li>Works even when you’re offline</li>
            <li>Ultra-lightweight — takes only ~1 MB of space</li>
          </ul>
        </Modal.Body>
        <Modal.Footer className="justify-content-center border-0">
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            Maybe Later
          </Button>
          <Button variant="warning" onClick={handleInstall}>
            <b>Install Now</b>
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default HomeScreen