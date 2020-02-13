import React from "react";
import { Link } from "react-router-dom";

const Top: React.FC = () => {
  return (
    <div>
      <h1>Top Page!</h1>
      <Link to="/about">about</Link>
    </div>
  )
}

export default Top;
