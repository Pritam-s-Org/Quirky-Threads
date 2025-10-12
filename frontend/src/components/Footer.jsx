import React from 'react'
import { Container, Row, Col }from 'react-bootstrap'
import { FaInstagram, FaFacebook, FaWhatsapp, FaFacebookMessenger, FaInstagramSquare, FaEnvelope, FaTwitter, FaPinterest } from 'react-icons/fa'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  return (
   <footer className="bg-warning text-light pt-5 pb-3 mt-5">
      <Container>
        <Row className="gy-4">
          {/* Brand / About */}
          <Col md={3} sm={6}>
            <h4 className="fw-bold text-lg-start text-center mb-0">Quirky Threads</h4>
            <p className="fw-semibold text-secondary text-light mb-3 text-lg-start text-center">
              Wear Your Story
            </p>
            <p className="small text-secondary text-light text-lg-start text-center">
              Where creativity meets comfort. Explore fashion that fits your
              mood and makes you stand out effortlessly.
            </p>
          </Col>

          {/* Contacts */}
          <Col md={3} sm={6}>
            <h4 className="fw-semibold mb-3 text-center">Contact Us</h4>
            <div className="d-flex gap-3 justify-content-center">
              <a 
                href="https://m.me/quirkythreadsIN?text=Hello%20👋%20I'm%20reaching%20out%20from%20the%20Quirky%20Threads%20website.%20I’d%20love%20to%20know%20more%20about%20your%20latest%20collections!" 
                className="text-light fs-5"><FaFacebookMessenger className="bi bi-facebook" />
              </a>
              <a 
                href="https://wa.me/918100643812?text=Hello%20👋%20I'm%20reaching%20out%20from%20the%20Quirky%20Threads%20website.%20I’d%20love%20to%20know%20more%20about%20your%20latest%20collections!" 
                className="text-light fs-5"><FaWhatsapp className="bi bi-whatsapp" />
              </a>
              <a 
                href="https://www.instagram.com/direct/t/17842871496034714/" className="text-light fs-5"><FaInstagramSquare className="bi bi-instagram" />
              </a>
              <a href="mailto:quirkythreadsindia@gmail.com" className="text-light fs-5"><FaEnvelope className="fa-regular bi bi-email" /></a>
            </div>
          </Col>
          {/* Follow */}
          <Col md={3} sm={6}>
            <h4 className="fw-semibold mb-3 text-center">Follow Us</h4>
            <div className="d-flex gap-3 justify-content-center">
              <a href="https://instagram.com/quirkythreadsin" className="text-light fs-5"><FaInstagram className="bi bi-instagram" /></a>
              <a href="https://facebook.com/quirkythreadsin" className="text-light fs-5"><FaFacebook className="bi bi-facebook" /></a>
              <a href="https://twitter.com" className="text-light fs-5"><FaTwitter className="bi bi-twitter-x" /></a>
              <a href="https://pinterest.com" className="text-light fs-5"><FaPinterest className="bi bi-pinterest" /></a>
            </div>
          </Col>

          {/* Policies */}
          <Col md={3} sm={6}>
            <h4 className="fw-semibold mb-3 text-end text-lg-end text-center">Policies</h4>
            <ul className="list-unstyled text-end text-lg-end text-center">
              <li>
                <a 
                  href="https://merchant.razorpay.com/policy/QOOTXJJxewhLUb/privacy" 
                  className="text-light text-decoration-none small "
                  target="_blank"
                  rel="noopener noreferrer"
                >Privacy Policy</a>
              </li>
              <li>
                <a 
                  href="https://merchant.razorpay.com/policy/QOOTXJJxewhLUb/terms" 
                  className="text-light text-decoration-none small"
                  target="_blank"
                  rel="noopener noreferrer"
                >Terms and Conditions</a>
              </li>
              <li>
                <a 
                  href="https://merchant.razorpay.com/policy/QOOTXJJxewhLUb/refund" 
                  className="text-light text-decoration-none small"
                  target="_blank"
                  rel="noopener noreferrer"
                >Cancellation & Refund</a>
              </li>
              <li>
                <a 
                  href="https://merchant.razorpay.com/policy/QOOTXJJxewhLUb/shipping" 
                  className="text-light text-decoration-none small"
                  target="_blank"
                  rel="noopener noreferrer"
                >Shipping & Delivery</a>
              </li>
            </ul>
          </Col>
        </Row>

        {/* Divider */}
        <hr className="border-warning mt-4" />

        {/* Bottom Text */}
        <div className="text-center small text-secondary text-light">
          &copy; {currentYear} Quirky Threads. All Rights Reserved.
        </div>
      </Container>
    </footer>
  )

}

export default Footer
