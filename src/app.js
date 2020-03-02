import React, { useState } from "react";

import ImageUpload from "./components/ImageUpload/ImageUpload";
import "./app.scss";

const App = () => {

  const [originalImage, setOriginalImage] = useState("");
  const [compressedImage, setCompressedImage] = useState("");

 const getData = (obj) => {
  setOriginalImage(obj.original);
  setCompressedImage(obj.compressed);
  }
  
    return (
        <div className = "app">
            <ImageUpload afterCompression = {getData}/>
            <div className = "size-info-container">
              Original Image Size: {originalImage.size}
            </div>
            <div className = "size-info-container">
              Compressed Image Size: {compressedImage.size}
            </div>
            <img src = {compressedImage !== "" ? compressedImage.base64 : null} />
        </div>
    );
  
}

export default App;