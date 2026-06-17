const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: "db8phgmgy",
  api_key: "467621549829274",
  api_secret: "xsLHwdlFl4MLNvpBBjqLnds-9do",
  secure: true
});

cloudinary.uploader.upload("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", 
  { folder: "test_folder" }, 
  function(error, result) {
    if (error) {
        console.error("Cloudinary Error:", error);
    } else {
        console.log("Success:", result.secure_url);
    }
  });
