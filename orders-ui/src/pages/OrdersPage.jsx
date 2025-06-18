import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./OrdersPage.css";

const PAGE_SIZE = 5;

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [vehicleMapping, setVehicleMapping] = useState({});

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8000/orders");
      setOrders(res.data);
      setFilteredOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders", err);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    let filtered = orders;

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        order =>
          order.name.toLowerCase().includes(term) ||
          order.customer.toLowerCase().includes(term)
      );
    }

    if (priceFilter === "lt200") filtered = filtered.filter(order => order.price < 200);
    if (priceFilter === "btw200and1000") filtered = filtered.filter(order => order.price >= 200 && order.price <= 1000);
    if (priceFilter === "gt1000") filtered = filtered.filter(order => order.price > 1000);

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, searchTerm, priceFilter]);

  useEffect(() => {
    const vehicles = {};
    let vehicleId = 1;
    let currentWeight = 0;
    let currentOrders = [];

    for (const order of filteredOrders) {
      const weight = order.weight || 5;

      if (currentWeight + weight > 30) {
        vehicles[`Vehicle-${vehicleId}`] = [...currentOrders];
        vehicleId++;
        currentOrders = [order];
        currentWeight = weight;
      } else {
        currentOrders.push(order);
        currentWeight += weight;
      }
    }

    if (currentOrders.length > 0) {
      vehicles[`Vehicle-${vehicleId}`] = [...currentOrders];
    }

    setVehicleMapping(vehicles);
  }, [filteredOrders]);

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePriceFilter = (e) => {
    setPriceFilter(e.target.value);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="container">
      <h1>📦 Orders</h1>

      <div className="search-filter">
        <input
          type="text"
          placeholder="Search by name or customer"
          value={searchTerm}
          onChange={handleSearch}
        />
        <select value={priceFilter} onChange={handlePriceFilter}>
          <option value="">All Prices</option>
          <option value="lt200">Below ₹200</option>
          <option value="btw200and1000">₹200 - ₹1000</option>
          <option value="gt1000">Above ₹1000</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Customer</th>
            <th>Price (₹)</th>
            <th>Weight (kg)</th>
          </tr>
        </thead>
        <tbody>
          {paginatedOrders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.name}</td>
              <td>{order.customer}</td>
              <td>{order.price}</td>
              <td>{order.weight}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button disabled={currentPage === 1} onClick={handlePrevPage}>⬅ Prev</button>
        <span>Page {currentPage}</span>
        <button disabled={currentPage === totalPages} onClick={handleNextPage}>Next ➡</button>
      </div>

      <h2 className="vehicle-mapping-title">🚚 Vehicle Mapping</h2>
      <div className="vehicle-list">
        {Object.entries(vehicleMapping).map(([vehicle, orders]) => (
          <div className="vehicle" key={vehicle}>
            <h3>{vehicle}</h3>
            <ul>
              {orders.map(order => (
                <li key={order.id}>{order.name} — {order.weight}kg</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrdersPage;
