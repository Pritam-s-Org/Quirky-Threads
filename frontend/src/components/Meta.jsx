import React from 'react'
import { Helmet } from "react-helmet-async";

const Meta = ({title, description, keywords}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
    </Helmet>
  )
}

Meta.defaultProps = {
  title: "Quirky Threads",
  description: "Quirky Threads: The one stop e-commerce fashion shop that is available all over the India.",
  keywords: "fashion, buy t-shirts, branded product in best price"
}

export default Meta
