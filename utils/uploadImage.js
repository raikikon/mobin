const axios = require("axios");
const FormData = require("form-data");

const uploadImageToHost = async (fileBuffer, fileName) => {
  try {
    const formData = new FormData();
    formData.append("image", fileBuffer, fileName);

    const response = await axios.post(
      `${process.env.IMAGE_HOST_URL}?key=${process.env.IMAGE_HOST_API_KEY}`,
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    return response.data.data.url;
  } catch (error) {
    console.error("Image Upload Error:", error.message);
    throw new Error("Image upload failed");
  }
};

module.exports = uploadImageToHost;