import { useEffect, useState } from "react";
import { Row, Col, Modal, Button } from "react-bootstrap"
import { Link, useParams } from "react-router-dom";
import Product from "../components/Product";
import Message from "../components/Message.jsx";
import ProductCarousel from "../components/ProductCarousel.jsx";
import Meta from "../components/Meta.jsx"
import { useGetProductsQuery } from "../slicers/productApiSlice.js";
import usePWAInstall from "../components/usePWAInstall.jsx";
import "../assetes/styles/homepage.css"

const HomeScreen = () => {
  const { keyword } = useParams();

  const [showModal, setShowModal] = useState(false);
  
  const { data: latestData, isLoading: latestDataload, error: latestDataError } = useGetProductsQuery({ keyword: "Latest" }) 
  const { data: featuredData, isLoading: featuredDataLoad, error: featuredDataError } = useGetProductsQuery({ keyword: "Featured" }) 
  const { isInstalled, canInstall, promptInstall } = usePWAInstall();

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
      {latestDataload ? (
        <h2>Please Wait...</h2>
      ) : latestDataError ? (
        <Message variant="danger">
          {latestDataError?.data?.message || latestDataError.error}
        </Message>
      ) : <>
        <Col className="d-flex flex-column align-items-center">
          <h1>Latest Products</h1>
          <p className="text-center">Products That Are Added Recently To Our Stock<br />Grab Them Before Others</p>
        </Col>
        <Row className="mx-0 px-0 px-sm-0 px-md-4 px-xl-6">
          {latestData?.products?.map((product) => (
            <Col key={product._id} xs={6} sm={6} md={6} lg={4} xl={3} className="p-0">
              <Product product={product} />
            </Col>
          ))}
        </Row>
        <Col><h5>More..</h5></Col>
        {/* <Paginate pages={data.pages} page={data.page} keyword={keyword ? keyword : ""} /> */}
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
      <Row id="banner" className="mx-0">
        <h4>Super Duper Dhamaka Sale</h4>
        <h2>Up to <span>50% off</span> on All T-Shirts</h2>
        <Button>Explore More</Button>
      </Row>
      <hr />
      <Col className="d-flex flex-column align-items-center mt-4">
        <h1>Featured Products</h1>
        <p className="text-center">Products That Are Most Favourite of Our Customers<br />Make One of Them For Yours</p>
      </Col>
      {featuredDataError ? (
        <Message variant="danger">
          {featuredDataError?.data?.message || latestDataError.error}
        </Message>
      ) : featuredDataLoad ? (
        <h2>Please Wait...</h2>
      ) : <Row className="mx-0 px-0 px-sm-0 px-md-4 px-xl-6">
          {featuredData?.products?.map((product) => (
            <Col key={product._id} xs={6} sm={6} md={6} lg={4} xl={3} className="p-0">
              <Product product={product} />
            </Col>
          ))}
        </Row>
      }
        {/* <Row className="mx-0 px-0 px-sm-0 px-md-4 px-xl-6">
          {data.products.map((product) => (
            <Col key={product._id} xs={6} sm={6} md={6} lg={4} xl={3} className="p-0">
              <Product product={product} />
            </Col>
          ))}
        </Row>
        <Paginate pages={data.pages} page={data.page} keyword={keyword ? keyword : ""} /> */}
        <hr />
      <Col>
        <Row className="justify-content-center">
          <Col className="half-banner" id="banner-box1" xs={10} sm={10} md={10} lg={5} xl={5}>
            <h4>Crazy Deals</h4>
            <h2>Buy 1 get 1 free</h2>
            <p>The cool tees are on sale</p>
            <Button variant="outline-light hover-popup-animation" className="transparent"><b>Explore</b></Button>
          </Col>
          <Col className="half-banner" id="banner-box2" xs={10} sm={10} md={10} lg={5} xl={5}>
            <h4>Durga Puja & Diwali</h4>
            <h2>Upcoming designes</h2>
            <p>You find the best designes here</p>
            <Button variant="outline-light hover-popup-animation" className="transparent"><b>Collection</b></Button>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col className="one-third-banner hover-popup-animation" id="banner-box3" xs={10} sm={5} md={5} lg={3} xl={3}>
            <Link to={`/category/seasonal/page/1`}>
              <h2>SEASONAL SALE</h2>
              <h3>Monsoon Collection - FLAT 20% OFF</h3>
            </Link>
          </Col>
          <Col className="one-third-banner hover-popup-animation" id="banner-box4" xs={10} sm={5} md={5} lg={3} xl={3}>
            <Link to={`/category/cartoon/page/1`}>
              <h2>CARTOON DESIGN</h2>
              <h3>Best for your kids</h3>
            </Link>
          </Col>
          <Col 
            className="one-third-banner hover-popup-animation" 
            id="banner-box5" 
            xs={10} sm={5} md={5} lg={3} xl={3}
          >
            <Link to={`/category/new/page/1`}>
              <h2>NEW COLLECTION</h2>
              <h3>Super Trendy Prints</h3>
            </Link>
          </Col>
        </Row>
      </Col>
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