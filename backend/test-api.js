import axios from "axios";

const testAPI = async () => {
  try {
    console.log("Testing API endpoints...");

    // Test 1: Check if server is running
    console.log("\n1. Testing server connection...");
    const testResponse = await axios.get(
      "http://localhost:5000/api/v1/order/test"
    );
    console.log("✅ Test route works:", testResponse.data);

    // Test 2: Check if create-from-cart route exists (should return 401 due to no auth)
    console.log("\n2. Testing create-from-cart route...");
    try {
      const orderResponse = await axios.post(
        "http://localhost:5000/api/v1/order/create-from-cart",
        {}
      );
      console.log("❌ Unexpected success:", orderResponse.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(
          "✅ Route exists but requires authentication (401 Unauthorized)"
        );
      } else if (error.response?.status === 404) {
        console.log("❌ Route not found (404)");
      } else {
        console.log(
          "❌ Unexpected error:",
          error.response?.status,
          error.response?.data
        );
      }
    }
  } catch (error) {
    console.error("❌ Server connection failed:", error.message);
  }
};

testAPI();
