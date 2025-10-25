import React from 'react'
import { Pagination } from "react-bootstrap"
import { Link } from "react-router-dom"

const Paginate = ({ pages, page, keyword, category }) => {
  return (
    pages > 1 && (
      <Pagination>
        {[...Array(pages).keys()].map(x => (
          <Pagination.Item
            as={Link}
            key={x + 1}
            to={
              keyword
              ? `/search/${keyword}/page/${x + 1}`
              : category && `/category/${category}/page/${x + 1}`
            }
            active={x + 1 === (page || 1 )}
          >{x + 1}</Pagination.Item>
        ))}
      </Pagination>
    )
  )
}

export default Paginate
