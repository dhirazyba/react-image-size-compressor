import React, { useState, useRef, useEffect } from "react";

import "./ImageUpload.scss";

const ImageUpload = props => {
  const imageInputRef = useRef();
  const [file, setFile] = useState("");
  const [fileName, setFileName] = useState("No File Choosen");
  const [result, setResult] = useState("");
  const [srcOrientation, setSrcOrientation] = useState("");

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
      getOrientation(file, function(orientation) {
        setSrcOrientation(orientation);
      });
    }
  }, [result]);

  useEffect(() => {
    if (srcOrientation !== "") {
      drawImage(result.base64);
    }
  }, [srcOrientation]);

  const buildFile = (base64, name) => {
    return new File([base64], name);
  };

  const getOrientation = (file, callback) => {
    var reader = new FileReader();
    reader.onload = function(e) {
      var view = new DataView(e.target.result);
      if (view.getUint16(0, false) != 0xffd8) {
        return callback(-2);
      }
      var length = view.byteLength,
        offset = 2;
      while (offset < length) {
        if (view.getUint16(offset + 2, false) <= 8) return callback(-1);
        var marker = view.getUint16(offset, false);
        offset += 2;
        if (marker == 0xffe1) {
          if (view.getUint32((offset += 2), false) != 0x45786966) {
            return callback(-1);
          }

          var little = view.getUint16((offset += 6), false) == 0x4949;
          offset += view.getUint32(offset + 4, little);
          var tags = view.getUint16(offset, little);
          offset += 2;
          for (var i = 0; i < tags; i++) {
            if (view.getUint16(offset + i * 12, little) == 0x0112) {
              return callback(view.getUint16(offset + i * 12 + 8, little));
            }
          }
        } else if ((marker & 0xff00) != 0xff00) {
          break;
        } else {
          offset += view.getUint16(offset, false);
        }
      }
      return callback(-1);
    };
    reader.readAsArrayBuffer(file);
  };

  const drawImage = imgUrl => {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    let img = new Image();
    img.src = imgUrl;
    img.onload = () => {
      console.log('Orientation', srcOrientation)
      // set proper canvas dimensions before transform & export
      if (srcOrientation > 4 && srcOrientation < 9) {
        canvas.setAttribute('width', img.naturalHeight)
        canvas.setAttribute('height', img.naturalWidth)
        ctx.translate(canvas.width/2,canvas.width/2);
        // rotate the canvas to the specified degrees
        ctx.rotate(90*Math.PI/180);
        // ctx.drawImage(img, 90, 0,  width, height);
        ctx.drawImage(img,-img.height/2,-img.height/2);
        ctx.restore();
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
      }
      // canvas.setAttribute("width", img.width);
      // canvas.setAttribute("height", img.height);
      // context.drawImage(img, 0, 0, img.width, img.height);
      const IMAGE_QUALITY = 0.3;
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
      imgObj.compressed.size =
        Math.round(imgObj.compressed.file.size / 1000) + " kB";
      imgObj.compressed.type = "image/jpeg";
      props.afterCompression(imgObj);
    };
  };

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
