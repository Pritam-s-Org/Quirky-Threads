import { useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn("Stopping page load after 60 seconds");
      window.stop();
    }, 30000);

    window.addEventListener("load", () => clearTimeout(timeout));

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("load", () => clearTimeout(timeout));
    };
  }, []);

  return (
    <Col>
      <Header />
      <main className="py-6">
        <Row className="mx-0 px-0">
          <Outlet />
        </Row>
      </main>
      <Footer />
      <ToastContainer />
    </Col>
  );
}

export default App;
