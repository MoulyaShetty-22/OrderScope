// src/services/orderService.js
const API_URL = "http://localhost:5000/orders";

export async function fetchOrders() {
  const response = await fetch(API_URL);
  const data = await response.json();
  return data;
}
