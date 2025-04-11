import React, { useState, useEffect } from "react";
import ProductService from "../../services/product.service";
import Card from "../../components/Card";
import { useSearchParams } from "react-router";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [sortOption, setSortOption] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchParams, setSearchParams] = useSearchParams();
  const [itemPerPage, setItemPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const categoryQuery = searchParams.get("category") || "all";
  const itemsPerPageQuery = searchParams.get("itemsPerPage") || 8;

  useEffect(() => {
    setSelectedCategory(categoryQuery);
    setItemPerPage(Number(itemsPerPageQuery));
  }, [categoryQuery, itemsPerPageQuery]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await ProductService.getAllProducts();
        if (response?.data) {
          setProducts(response.data);
          setFilteredItems(response.data);
          setCategories([
            "all",
            ...new Set(response.data.map((item) => item.category)),
          ]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
        setFilteredItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filterItem = (category) => {
    const filtered =
      category === "all"
        ? products
        : products.filter((item) => item.category === category);
    setFilteredItems(filtered);
    handleSortChange(sortOption, filtered);
    setSearchParams({ category });
    setSelectedCategory(category);
  };

  const handleSortChange = (option, items = []) => {
    setSortOption(option);
    let sortedItems = [...items];
    switch (option) {
      case "a-z":
        sortedItems.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "z-a":
        sortedItems.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "low-to-high":
        sortedItems.sort((a, b) => a.price - b.price);
        break;
      case "high-to-low":
        sortedItems.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }
    setFilteredItems(sortedItems);
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemPerPage;
  const indexOfFirstItem = indexOfLastItem - itemPerPage;
  const currentItems = filteredItems?.slice(indexOfFirstItem, indexOfLastItem) || [];

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!filteredItems || filteredItems.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">ไม่พบสินค้า</h2>
        <p className="text-gray-600">กรุณาลองค้นหาด้วยคำอื่น</p>
      </div>
    );
  }

  return (
    <div className="section-container">
      <div className="flex flex-col md:flex-row flex-wrap md:justify-between items-center space-y-3 mb-8">
        {/* Filter */}
        <div className="flex flex-row justify-start md:items-center md:gap-8 gap-4 flex-wrap">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`${
                selectedCategory === category ? "bg-red text-white" : "bg-gray-200"
              } px-4 py-2 rounded-full`}
              onClick={() => filterItem(category)}
            >
              <p className="capitalize">{category}</p>
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex justify-end mb-4 rounded-sm">
          <div className="bg-black p-2">
            <select
              name="sortOption"
              id="sortOption"
              className="bg-black text-white px-2 rounded-sm"
              onChange={(e) => handleSortChange(e.target.value, filteredItems)}
              value={sortOption}
            >
              <option value="default">Default</option>
              <option value="a-z">A-Z</option>
              <option value="z-a">Z-A</option>
              <option value="low-to-high">Low-to-High</option>
              <option value="high-to-low">High-to-Low</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4 w-full">
          {currentItems.map((item, index) => (
            <Card item={item} key={item._id || index} />
          ))}
        </div>
      </div>

      {/* Pagination */}
      {filteredItems.length > itemPerPage && (
        <div className="flex flex-row items-center justify-center my-8 flex-wrap gap-2">
          {Array.from({
            length: Math.ceil(filteredItems.length / itemPerPage),
          }).map((_, index) => (
            <button
              key={index}
              className={`${
                currentPage === index + 1 ? "bg-red text-white" : "bg-gray-200"
              } px-4 py-2 rounded-full`}
              onClick={() => paginate(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
