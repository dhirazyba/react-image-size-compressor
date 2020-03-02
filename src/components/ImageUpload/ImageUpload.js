import React, { useState, useRef, useEffect } from "react";

import "./ImageUpload.scss";

const ImageUpload = (props) => {
  const imageInputRef = useRef();
  const [file, setFile] = useState("");
  const [fileName, setFileName] = useState("No File Choosen");
  const [result, setResult] = useState("");

  useEffect(() => {
    if (file !== "") {
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = e => {
        let result = {
          name: file.name,
          type: file.type,
          size: Math.round(file.size / 1000) + " kB",
          base64: e.target.result,
          file: file
        };
        setResult(result);
      };
    }
  }, [file]);

  useEffect(() => {
    if (result !== "") {
      drawImage(result.base64)
    }
  }, [result]);

  const buildFile = (base64, name) => {
    return new File([base64], name);
  };

  const drawImage = (imgUrl) => {
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");
    let img = new Image();
    img.src = imgUrl;
    img.onload = () => {
        canvas.setAttribute("width", img.width);
        canvas.setAttribute("height", img.height);
        context.drawImage(img, 0, 0, img.width, img.height);
        const IMAGE_QUALITY = 0.5;
        let base64 = canvas.toDataURL("image/jpeg", IMAGE_QUALITY);
        let fileName = result.file.name;
        let lastDot = fileName.lastIndexOf(".");
        fileName = fileName.substr(0, lastDot) + ".jpeg";
        let imgObj = {
            original: result,
            compressed: {
                base64: base64,
                name: fileName,
                file: buildFile(base64, fileName),
                size: "",
                type: ""
            } 
        };
        imgObj.compressed.size =  Math.round(imgObj.compressed.file.size / 1000) + " kB";
        imgObj.compressed.type = "image/jpeg";
        props.afterCompression(imgObj);
    }
  }

  const imageUploadHandler = e => {
    setFile(e.target.files[0]);
    setFileName(e.target.files[0].name);
  };

  return (
    <div className="input-container">
      <input
        className="file-input"
        type="file"
        ref={imageInputRef}
        onChange={imageUploadHandler}
      />
      {fileName}
      <div className="spacer"></div>
      <button
        className="browse-btn"
        onClick={() => {
          imageInputRef.current.click();
        }}
      >
        Browse
      </button>
    </div>
  );
};

export default ImageUpload;
