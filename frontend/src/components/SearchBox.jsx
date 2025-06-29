import React, {useState} from 'react'
import { Form, Button } from "react-bootstrap"
import { FaSearch } from "react-icons/fa"
import { useNavigate, useParams } from "react-router-dom"

const SearchBox = () => {
  const navigate = useNavigate()
  const { keyword: urlKeyword } = useParams()
  const [keyword, setKeyword] = useState(urlKeyword || "")

  const submitHandler = e =>{
    e.preventDefault()
    if(keyword.trim()){
      setKeyword("")
      navigate(`/search/${keyword}`)
    }else{
      navigate("/")
    }
  }

  return (
    <Form onSubmit={submitHandler} className="d-flex">
      <Form.Control
        type="text"
        name="q"
        onChange={ e => setKeyword(e.target.value)}
        value={keyword}
        placeholder="Search Products..."
        className="mr-sm-2 ml-sm-5"
      />
      <Button type="submit" variant="outline-light" className="p-2 mx-2 d-flex"><FaSearch className="me-1 my-auto" /><b> Search</b></Button>
    </Form>
  )
}

export default SearchBox
